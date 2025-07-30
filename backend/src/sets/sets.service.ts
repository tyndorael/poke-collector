import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import TCGdex from '@tcgdex/sdk';

import { PokemonSet } from './entities/set.entity';
import { GetSetsFilterDto } from './dto/get-sets-filter.dto';
import { PokemonCard } from '../cards/entities/card.entity';
import { CollectionCard } from '../collections/entities/collection-card.entity';

@Injectable()
export class SetsService {
  private readonly logger = new Logger(SetsService.name);
  private readonly tcgdexClient: TCGdex;

  constructor(
    @InjectRepository(PokemonSet)
    private setsRepository: Repository<PokemonSet>,
    @InjectRepository(PokemonCard)
    private cardsRepository: Repository<PokemonCard>,
    @InjectRepository(CollectionCard)
    private collectionCardsRepository: Repository<CollectionCard>,
    private configService: ConfigService,
  ) {
    this.tcgdexClient = new TCGdex();
  }

  private getApiKey(): string | undefined {
    return this.configService.get<string>('POKEMONTCG_API_KEY');
  }

  // Sync all sets from the TCG Dex API
  // This method fetches all sets and saves them to the database
  // It handles pagination and ensures all sets are stored
  // It should be called periodically to keep the sets up to date
  async syncAllSets(): Promise<void> {
    this.logger.log('Starting synchronization of sets from the TCG Dex API...');

    const allSets = await this.tcgdexClient.fetchSets();

    if (allSets) {
      this.logger.log(`Total sets fetched: ${allSets.length}`);
      const setsToSave = allSets.map(async (setData) => {
        const setDataFromTcgdex = await this.tcgdexClient.fetch('sets', setData.id);
        const set = new PokemonSet();
        set.id = setData.id;
        set.name = setData.name;

        if (setDataFromTcgdex) {
          set.series = setDataFromTcgdex.serie.id;
          set.printedTotal = setData.cardCount.official;
          set.total = setData.cardCount.total;
          set.releaseDate = setDataFromTcgdex.releaseDate ? new Date(setDataFromTcgdex.releaseDate) : new Date();
          set.symbolUrl = setDataFromTcgdex.symbol ? `${setDataFromTcgdex.symbol}.webp` : '';
          set.logoUrl = setDataFromTcgdex.logo ? `${setDataFromTcgdex.logo}.webp` : '';
        }
        return set;
      });
      await this.setsRepository.upsert(await Promise.all(setsToSave), ['id']);
    }
    this.logger.log('Synchronization of sets completed successfully.');
  }

  // Find all sets with optional filtering
  async findAll(
    filterDto: GetSetsFilterDto,
  ): Promise<{ sets: PokemonSet[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, series } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.setsRepository.createQueryBuilder('set');

    if (search) {
      queryBuilder.andWhere('LOWER(set.name) LIKE LOWER(:search)', { search: `%${search}%` });
    }
    if (series) {
      queryBuilder.andWhere('LOWER(set.series) = LOWER(:series)', { series });
    }
    queryBuilder.andWhere('set.series != :tcgp', { tcgp: 'tcgp' }); // Exclude sets from the TCGP series
    queryBuilder.orderBy('set.releaseDate', 'DESC');

    const [sets, total] = await queryBuilder.take(limit).skip(skip).getManyAndCount();

    return { sets, total, page, limit };
  }

  // Get a single set by ID
  async findOne(id: string): Promise<PokemonSet> {
    const set = await this.setsRepository.findOne({ where: { id } });
    if (!set) {
      throw new NotFoundException(`Set with ID "${id}" not found`);
    }
    return set;
  }

  // Get all cards in a set with pagination
  async getSetCards(
    setId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ cards: PokemonCard[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [cards, total] = await this.cardsRepository.findAndCount({
      where: { setId },
      take: limit,
      skip: skip,
      order: { number: 'ASC' }, // Sort by card number within the set
    });
    return { cards, total, page, limit };
  }

  // Get set completion stats for a user
  async getSetCompletionStats(
    setId: string,
    userId: string,
  ): Promise<{
    setId: string;
    setName: string;
    totalCardsInSet: number;
    collectedUniqueCount: number;
    completionPercentage: number;
  }> {
    const set = await this.setsRepository.findOne({ where: { id: setId } });
    if (!set) {
      throw new NotFoundException(`Set with ID "${setId}" not found`);
    }

    const totalCardsInSet = set.printedTotal;

    const collectedCards = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .leftJoinAndSelect('collectionCard.card', 'card')
      .leftJoin('collectionCard.collection', 'collection')
      .where('collection.userId = :userId', { userId })
      .andWhere('card.setId = :setId', { setId })
      .select('DISTINCT card.id')
      .getMany();

    const uniqueCollectedCardIds = new Set(collectedCards.map((cc) => cc.card.id));
    const collectedUniqueCount = uniqueCollectedCardIds.size;

    const completionPercentage = totalCardsInSet > 0 ? (collectedUniqueCount / totalCardsInSet) * 100 : 0;

    return {
      setId: set.id,
      setName: set.name,
      totalCardsInSet,
      collectedUniqueCount,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
    };
  }
}
