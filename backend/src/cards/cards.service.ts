import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, Between } from 'typeorm';
import Redis from 'ioredis';
import * as _ from 'lodash';
import { lastValueFrom } from 'rxjs';
import TCGdex from '@tcgdex/sdk';
import { AxiosResponse } from 'axios';

import { PokemonCardResponseData } from './interfaces/pokemon-card-price.interface';
import { PokemonCard } from './entities/card.entity';
import { CardPrice } from './entities/card-price.entity';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { SearchCardsDto } from './dto/search-cards.dto';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);
  private readonly POKEMONTCG_API_BASE_URL = 'https://api.pokemontcg.io/v2';
  private readonly tcgdexClient: TCGdex;

  constructor(
    @InjectRepository(PokemonCard)
    private cardsRepository: Repository<PokemonCard>,
    @InjectRepository(CardPrice)
    private cardPricesRepository: Repository<CardPrice>,
    private httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
    private configService: ConfigService,
  ) {
    this.tcgdexClient = new TCGdex();
  }

  private getApiKey(): string | undefined {
    return this.configService.get<string>('POKEMONTCG_API_KEY');
  }

  // Sync all cards from the external API
  // This method will fetch all cards and store them in the database
  // It will also handle pagination and ensure that all cards are up-to-date
  // This method is intended to be run as a scheduled task
  // It will fetch cards from all sets using TCGdx
  async syncAllCards(): Promise<void> {
    this.logger.log('Starting synchronization of all cards from TCGdx...');

    try {
      // First, fetch all sets to get their cards
      const allSets = await this.tcgdexClient.fetchSets();

      if (!allSets || allSets.length === 0) {
        this.logger.warn('No sets found from TCGdx');
        return;
      }

      this.logger.log(`Found ${allSets.length} sets to sync cards from`);

      let totalCardsSynced = 0;

      // Process sets in batches to avoid overwhelming the API
      for (let i = 0; i < allSets.length; i++) {
        const set = allSets[i];

        try {
          this.logger.log(`Syncing cards from set: ${set.name} (${set.id}) - ${i + 1}/${allSets.length}`);

          // Fetch all cards from this set
          const cardsInSet = await this.tcgdexClient.fetchCards(set.id);

          if (!cardsInSet || cardsInSet.length === 0) {
            this.logger.log(`No cards found in set ${set.id}`);
            continue;
          }

          // Transform cards to match our entity structure
          const cardsToSave = await Promise.all(
            cardsInSet.map(async (cardData) => {
              // Fetch detailed card information
              const detailedCard = await this.tcgdexClient.card.get(`${set.id}-${cardData.localId}`);

              const card = new PokemonCard();
              card.id = `${set.id}-${parseInt(cardData.localId)}`;
              card.name = cardData.name;
              card.nationalPokedexNumber = detailedCard?.dexId?.[0] || 0;
              card.supertype = detailedCard?.category || '';
              card.subtype = detailedCard?.stage || '';
              card.types = detailedCard?.types || [];
              card.hp = detailedCard?.hp?.toString() || '';
              card.retreatCost = detailedCard?.retreat ? [detailedCard.retreat.toString()] : [];
              card.number = cardData.localId;
              card.artist = detailedCard?.illustrator || '';
              card.rarity = detailedCard?.rarity || '';
              card.flavorText = detailedCard?.description || '';
              card.regulationMark = detailedCard?.regulationMark || '';
              card.evolveFrom = detailedCard?.evolveFrom || '';
              card.setId = set.id;
              card.setName = set.name;

              // Get detailed set information for additional data
              const setDetails = await this.tcgdexClient.fetch('sets', set.id);
              card.setSeries = setDetails?.serie?.name || '';
              card.setTotalCards = set.cardCount?.total || 0;
              card.setPrintedTotal = set.cardCount?.official || 0;
              card.setReleaseDate = setDetails?.releaseDate ? new Date(setDetails.releaseDate) : new Date();

              card.abilities = detailedCard?.abilities || [];
              card.attacks = detailedCard?.attacks || [];
              card.weaknesses = detailedCard?.weaknesses || [];
              card.resistances = detailedCard?.resistances || [];
              card.legalities = detailedCard?.legal || {};
              card.variants = detailedCard?.variants || {};

              card.imageUrl = `https://assets.tcgdex.net/en/${setDetails?.serie.id}/${setDetails?.id}/${cardData.localId}/high.webp`;
              card.smallImageUrl = `https://assets.tcgdex.net/en/${setDetails?.serie.id}/${setDetails?.id}/${cardData.localId}/low.webp`;
              card.largeImageUrl = `https://assets.tcgdex.net/en/${setDetails?.serie.id}/${setDetails?.id}/${cardData.localId}/high.webp`;

              return card;
            }),
          );

          // Save cards in batch
          if (cardsToSave.length > 0) {
            await this.cardsRepository.upsert(cardsToSave, ['id']);
            totalCardsSynced += cardsToSave.length;
            this.logger.log(`Synced ${cardsToSave.length} cards from set ${set.name}`);
          }

          // Add a small delay between sets to be respectful to the API
          if (i < allSets.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          this.logger.error(
            `Error syncing cards from set ${set.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          continue; // Continue with next set even if one fails
        }
      }

      this.logger.log(`Synchronization completed successfully. Total cards synced: ${totalCardsSynced}`);
    } catch (error) {
      this.logger.error(
        `Error during card synchronization: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  // Scheduled task to sync cards daily
  @Cron(CronExpression.EVERY_DAY_AT_3AM) // Every day at 3 AM
  async handleCronSyncCards() {
    this.logger.debug('Called scheduled task to sync all cards');
    await this.syncAllCards();
  }

  // Get all cards with optional filters
  async findAll(
    filterDto: GetCardsFilterDto,
  ): Promise<{ cards: PokemonCard[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, set, rarity, type, supertype } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cardsRepository.createQueryBuilder('card');

    if (search) {
      queryBuilder.andWhere('LOWER(card.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }
    if (set) {
      queryBuilder.andWhere('LOWER(card.setName) LIKE LOWER(:set) OR LOWER(card.setId) LIKE LOWER(:set)', {
        set: `%${set}%`,
      });
    }
    if (rarity) {
      queryBuilder.andWhere('LOWER(card.rarity) = LOWER(:rarity)', { rarity });
    }
    if (type) {
      queryBuilder.andWhere('LOWER(:type) = LOWER(card.types)', {
        type: type.toLowerCase(),
      });
    }
    if (supertype) {
      queryBuilder.andWhere('LOWER(card.supertype) = LOWER(:supertype)', {
        supertype,
      });
    }

    const [cards, total] = await queryBuilder.take(limit).skip(skip).getManyAndCount();

    return { cards, total, page, limit };
  }

  // find card by ID
  async findOne(id: string): Promise<PokemonCard> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: {
        prices: true,
      },
    });

    if (!card) {
      this.logger.warn(`Card with ID ${id} not found`);
      throw new NotFoundException('Card not found');
    }

    this.logger.log(`Card found: ${card.name} (${card.id})`);

    return card;
  }

  // searchCards with advanced filters
  async searchCards(
    searchCardsDto: SearchCardsDto,
  ): Promise<{ cards: PokemonCard[]; total: number; page: number; limit: number }> {
    const { filters, sort, page = 1, limit = 20 } = searchCardsDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cardsRepository.createQueryBuilder('card');

    if (filters) {
      if (filters.name) {
        queryBuilder.andWhere('LOWER(card.name) LIKE LOWER(:name)', {
          name: `%${filters.name}%`,
        });
      }
      if (filters.sets && filters.sets.length > 0) {
        queryBuilder.andWhere('LOWER(card.setName) IN (:...sets) OR LOWER(card.setId) IN (:...sets)', {
          sets: filters.sets.map((s) => s.toLowerCase()),
        });
      }
      if (filters.types && filters.types.length > 0) {
        queryBuilder.andWhere('LOWER(card.types) LIKE LOWER(:types)', {
          types: filters.types.map((t) => t.toLowerCase()).toString(),
        });
      }
      if (filters.rarities && filters.rarities.length > 0) {
        queryBuilder.andWhere('LOWER(card.rarity) IN (:...rarities)', {
          rarities: filters.rarities.map((r) => r.toLowerCase()),
        });
      }
      if (filters.hpRange) {
        if (filters.hpRange.min) {
          queryBuilder.andWhere('CAST(card.hp AS INTEGER) >= :minHp', {
            minHp: filters.hpRange.min,
          });
        }
        if (filters.hpRange.max) {
          queryBuilder.andWhere('CAST(card.hp AS INTEGER) <= :maxHp', {
            maxHp: filters.hpRange.max,
          });
        }
      }
      if (filters.artist) {
        queryBuilder.andWhere('LOWER(card.artist) LIKE LOWER(:artist)', {
          artist: `%${filters.artist}%`,
        });
      }
      if (filters.hasAbilities !== undefined) {
        if (filters.hasAbilities) {
          queryBuilder.andWhere('card.abilities IS NOT NULL AND jsonb_array_length(card.abilities) > 0');
        } else {
          queryBuilder.andWhere('card.abilities IS NULL OR jsonb_array_length(card.abilities) = 0');
        }
      }
      if (filters.retreatCost) {
        if (filters.retreatCost.min) {
          queryBuilder.andWhere("ARRAY_LENGTH(STRING_TO_ARRAY(card.retreatCost, ','), 1) >= :minRetreat", {
            minRetreat: filters.retreatCost.min,
          });
        }
        if (filters.retreatCost.max) {
          queryBuilder.andWhere("ARRAY_LENGTH(STRING_TO_ARRAY(card.retreatCost, ','), 1) <= :maxRetreat", {
            maxRetreat: filters.retreatCost.max,
          });
        }
      }
    }

    if (sort) {
      queryBuilder.orderBy(`card.${sort.field}`, sort.order);
    }
    const [cards, total] = await queryBuilder.take(limit).skip(skip).getManyAndCount();

    return { cards, total, page, limit };
  }

  // Get prices of a card from external API or cache
  async getCardPrices(cardId: string): Promise<CardPrice | null> {
    const cacheKey = `card_prices:${cardId}`;
    const cachedPrices = await this.redis.get(cacheKey);

    if (cachedPrices) {
      this.logger.log(`Prices for card ${cardId} found in cache.`);
      return JSON.parse(cachedPrices) as CardPrice;
    }

    // If not found in cache, check the database
    const latestPrice = await this.cardPricesRepository.findOne({
      where: { cardId },
      order: { createdAt: 'DESC' },
    });

    if (latestPrice) {
      // Store in cache for some time
      await this.redis.set(cacheKey, JSON.stringify(latestPrice), 'EX', 3600); // Cache for 1 hour
      this.logger.log(`Prices for card ${cardId} found in database and cached.`);
      return latestPrice;
    }

    // If not found in DB, fetch from external API
    const prices = (await this.fetchCardPricesFromExternalApi(cardId)) as CardPrice | null;
    if (prices) {
      const newPriceEntry = this.cardPricesRepository.create({
        cardId,
        tcgplayerNormalMarket: _.get(prices, 'tcgplayerPrices.normal.market', 0),
        tcgplayerNormalLow: _.get(prices, 'tcgplayerPrices.normal.low', 0),
        tcgplayerNormalMid: _.get(prices, 'tcgplayerPrices.normal.mid', 0),
        tcgplayerNormalHigh: _.get(prices, 'tcgplayerPrices.normal.high', 0),
        tcgplayerNormalDirectLow: _.get(prices, 'tcgplayerPrices.normal.directLow', 0),
        tcgplayerHolofoilMarket: _.get(prices, 'tcgplayerPrices.holofoil.market', 0),
        tcgplayerHolofoilLow: _.get(prices, 'tcgplayerPrices.holofoil.low', 0),
        tcgplayerHolofoilMid: _.get(prices, 'tcgplayerPrices.holofoil.mid', 0),
        tcgplayerHolofoilHigh: _.get(prices, 'tcgplayerPrices.holofoil.high', 0),
        tcgplayerHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.holofoil.directLow', 0),
        tcgplayerReverseHolofoilMarket: _.get(prices, 'tcgplayerPrices.reverseHolofoil.market', 0),
        tcgplayerReverseHolofoilLow: _.get(prices, 'tcgplayerPrices.reverseHolofoil.low', 0),
        tcgplayerReverseHolofoilMid: _.get(prices, 'tcgplayerPrices.reverseHolofoil.mid', 0),
        tcgplayerReverseHolofoilHigh: _.get(prices, 'tcgplayerPrices.reverseHolofoil.high', 0),
        tcgplayerReverseHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.reverseHolofoil.directLow', 0),
        tcgplayerFirstEditionNormalMarket: _.get(prices, 'tcgplayerPrices.1stEdition.market', 0),
        tcgplayerFirstEditionNormalLow: _.get(prices, 'tcgplayerPrices.1stEdition.low', 0),
        tcgplayerFirstEditionNormalMid: _.get(prices, 'tcgplayerPrices.1stEdition.mid', 0),
        tcgplayerFirstEditionNormalHigh: _.get(prices, 'tcgplayerPrices.1stEdition.high', 0),
        tcgplayerFirstEditionNormalDirectLow: _.get(prices, 'tcgplayerPrices.1stEdition.directLow', 0),
        tcgplayerFirstEditionHolofoilMarket: _.get(prices, 'tcg playerPrices.firstEditionHolofoil.market', 0),
        tcgplayerFirstEditionHolofoilLow: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.low', 0),
        tcgplayerFirstEditionHolofoilMid: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.mid', 0),
        tcgplayerFirstEditionHolofoilHigh: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.high', 0),
        tcgplayerFirstEditionHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.directLow', 0),
        cardmarketAvg1: _.get(prices, 'cardmarketPrices.avg1', 0),
        cardmarketAvg7: _.get(prices, 'cardmarketPrices.avg7', 0),
        cardmarketAvg30: _.get(prices, 'cardmarketPrices.avg30', 0),
        cardmarketLow: _.get(prices, 'cardmarketPrices.lowPrice', 0),
        cardmarketTrend: _.get(prices, 'cardmarketPrices.trendPrice', 0),
        cardmarketSuggestedPrice: _.get(prices, 'cardmarketPrices.suggestedPrice', 0),
      });
      await this.cardPricesRepository.save(newPriceEntry);
      await this.redis.set(cacheKey, JSON.stringify(newPriceEntry), 'EX', 3600);
      this.logger.log(`Prices for card ${cardId} fetched from external API and saved.`);
      return newPriceEntry;
    }

    return null;
  }

  // Get price history of a card
  async getCardPriceHistory(cardId: string, days: number = 30): Promise<CardPrice[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return this.cardPricesRepository.find({
      where: {
        cardId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });
  }

  // Force refresh prices of a card
  async refreshCardPrices(cardId: string): Promise<CardPrice> {
    const prices = (await this.fetchCardPricesFromExternalApi(cardId)) as CardPrice | null;
    if (!prices) {
      throw new NotFoundException(`Not able to fetch prices for card with ID "${cardId}"`);
    }

    // Delete old prices from cache
    await this.redis.del(`card_prices:${cardId}`);

    const newPriceEntry = this.cardPricesRepository.create({
      cardId,
      tcgplayerNormalMarket: _.get(prices, 'tcgPlayerPrices.normal.market', 0),
      tcgplayerNormalLow: _.get(prices, 'tcgplayerPrices.normal.low', 0),
      tcgplayerNormalMid: _.get(prices, 'tcgplayerPrices.normal.mid', 0),
      tcgplayerNormalHigh: _.get(prices, 'tcgplayerPrices.normal.high', 0),
      tcgplayerNormalDirectLow: _.get(prices, 'tcgplayerPrices.normal.directLow', 0),
      tcgplayerHolofoilMarket: _.get(prices, 'tcgplayerPrices.holofoil.market', 0),
      tcgplayerHolofoilLow: _.get(prices, 'tcgplayerPrices.holofoil.low', 0),
      tcgplayerHolofoilMid: _.get(prices, 'tcgplayerPrices.holofoil.mid', 0),
      tcgplayerHolofoilHigh: _.get(prices, 'tcgplayerPrices.holofoil.high', 0),
      tcgplayerHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.holofoil.directLow', 0),
      tcgplayerReverseHolofoilMarket: _.get(prices, 'tcgplayerPrices.reverseHolofoil.market', 0),
      tcgplayerReverseHolofoilLow: _.get(prices, 'tcgplayerPrices.reverseHolofoil.low', 0),
      tcgplayerReverseHolofoilMid: _.get(prices, 'tcgplayerPrices.reverseHolofoil.mid', 0),
      tcgplayerReverseHolofoilHigh: _.get(prices, 'tcgplayerPrices.reverseHolofoil.high', 0),
      tcgplayerReverseHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.reverseHolofoil.directLow', 0),
      tcgplayerFirstEditionNormalMarket: _.get(prices, 'tcgplayerPrices.1stEdition.market', 0),
      tcgplayerFirstEditionNormalLow: _.get(prices, 'tcgplayerPrices.1stEdition.low', 0),
      tcgplayerFirstEditionNormalMid: _.get(prices, 'tcgplayerPrices.1stEdition.mid', 0),
      tcgplayerFirstEditionNormalHigh: _.get(prices, 'tcgplayerPrices.1stEdition.high', 0),
      tcgplayerFirstEditionNormalDirectLow: _.get(prices, 'tcgplayerPrices.1stEdition.directLow', 0),
      tcgplayerFirstEditionHolofoilMarket: _.get(prices, 'tcgplayerPrices.1stEdition.market', 0),
      tcgplayerFirstEditionHolofoilLow: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.low', 0),
      tcgplayerFirstEditionHolofoilMid: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.mid', 0),
      tcgplayerFirstEditionHolofoilHigh: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.high', 0),
      tcgplayerFirstEditionHolofoilDirectLow: _.get(prices, 'tcgplayerPrices.firstEditionHolofoil.directLow', 0),
      cardmarketAvg1: _.get(prices, 'cardmarketPrices.avg1', 0),
      cardmarketAvg7: _.get(prices, 'cardmarketPrices.avg7', 0),
      cardmarketAvg30: _.get(prices, 'cardmarketPrices.avg30', 0),
      cardmarketLow: _.get(prices, 'cardmarketPrices.lowPrice', 0),
      cardmarketTrend: _.get(prices, 'cardmarketPrices.trendPrice', 0),
      cardmarketSuggestedPrice: _.get(prices, 'cardmarketPrices.suggestedPrice', 0),
    });
    const savedPrice = await this.cardPricesRepository.save(newPriceEntry);
    await this.redis.set(`card_prices:${cardId}`, JSON.stringify(savedPrice), 'EX', 3600);
    this.logger.log(`Prices for card ${cardId} refreshed and saved.`);
    return savedPrice;
  }
  // Get prices from external API (PokemonTCG.io)
  private async fetchCardPricesFromExternalApi(cardId: string): Promise<any> {
    try {
      const response = await lastValueFrom<AxiosResponse<PokemonCardResponseData>>(
        this.httpService.get(`${this.POKEMONTCG_API_BASE_URL}/cards/${cardId}?select=id,name,tcgplayer,cardmarket`, {
          headers: { 'X-Api-Key': this.getApiKey() },
          timeout: 5000, // Set a timeout for the request
        }),
      );
      console.log(
        `Prices from external API for card ${response.data.data.name} (${cardId}):`,
        response.data.data.tcgplayer?.prices,
      );
      const tcgplayerPrices = response.data.data.tcgplayer?.prices || {};
      const cardmarketPrices = response.data.data.cardmarket?.prices || {};

      return {
        tcgplayerPrices,
        cardmarketPrices,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching prices for card ${cardId} from external API: ${errorMessage}`);
      return null;
    }
  }

  // Automated task to update popular card prices
  @Cron(CronExpression.EVERY_HOUR) // Every hour
  async handleCronUpdatePopularCardPrices() {
    this.logger.debug('Called scheduled task to update popular card prices');
    // Get the 10 most recent cards
    const recentCards = await this.cardsRepository.find({
      order: { createdAt: 'DESC' },
      take: 10, // Refreshing the 10 most recent cards
    });

    for (const card of recentCards) {
      try {
        await this.refreshCardPrices(card.id);
        this.logger.log(`Prices for card ${card.id} updated successfully.`);
      } catch (error) {
        this.logger.error(`Error updating prices for card ${card.id}:`, error instanceof Error ? error.message : error);
      }
    }
  }

  // Clear prices cache
  async clearPricesCache(): Promise<void> {
    const keys = await this.redis.keys('card_prices:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.log(`Cleared ${keys.length} price entries from cache.`);
    } else {
      this.logger.log('No price entries found in cache to clear.');
    }
  }
}
