import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserStatsDto } from '../users/dto/user-stats.dto';
import { Collection } from '../collections/entities/collection.entity';
import { CollectionCard } from '../collections/entities/collection-card.entity';
import { PokemonSet } from '../sets/entities/set.entity';
import { CardsService } from '../cards/cards.service';
import { SetsService } from '../sets/sets.service';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionCard)
    private collectionCardsRepository: Repository<CollectionCard>,
    @InjectRepository(PokemonSet)
    private pokemonSetRepository: Repository<PokemonSet>,
    private cardsService: CardsService,
    private setsService: SetsService,
  ) {}

  /**
   * Retrieves detailed statistics for the user's dashboard.
   * @param userId The ID of the user.
   * @returns A UserStatsDto object with the statistics.
   */
  async getUserDashboardStats(userId: string): Promise<UserStatsDto> {
    const totalCollections = await this.collectionsRepository.count({ where: { userId } });

    const totalQuantityResult = await this.collectionCardsRepository
      .createQueryBuilder('cc')
      .leftJoin('cc.collection', 'c')
      .select('SUM(cc.normalQuantity)', 'totalNormalQuantity')
      .addSelect('SUM(cc.holoQuantity)', 'totalHoloQuantity')
      .addSelect('SUM(cc.reverseQuantity)', 'totalReverseQuantity')
      .addSelect('SUM(cc.firstEditionQuantity)', 'totalFirstEditionQuantity')
      .addSelect('SUM(cc.wPromoQuantity)', 'totalWPromoQuantity')
      .where('c.userId = :userId', { userId })
      .getRawOne<{
        totalNormalQuantity: string;
        totalHoloQuantity: string;
        totalReverseQuantity: string;
        totalFirstEditionQuantity: string;
        totalWPromoQuantity: string;
      }>();

    const totalCardsOwned =
      parseInt(totalQuantityResult?.totalNormalQuantity || '0', 10) +
      parseInt(totalQuantityResult?.totalHoloQuantity || '0', 10) +
      parseInt(totalQuantityResult?.totalReverseQuantity || '0', 10) +
      parseInt(totalQuantityResult?.totalFirstEditionQuantity || '0', 10) +
      parseInt(totalQuantityResult?.totalWPromoQuantity || '0', 10);

    const totalUniqueCardsResult = await this.collectionCardsRepository
      .createQueryBuilder('cc')
      .leftJoin('cc.collection', 'c')
      .select('COUNT(DISTINCT cc.cardId)', 'count')
      .where('c.userId = :userId', { userId })
      .getRawOne<{ count: string }>();
    const totalUniqueCardsOwned = parseInt(totalUniqueCardsResult?.count || '0', 10);

    const allSets = await this.pokemonSetRepository.find();
    let setsCompletedCount = 0;
    let setsInProgressCount = 0;

    for (const set of allSets) {
      const setCompletionStats = await this.setsService.getSetCompletionStats(set.id, userId);
      if (setCompletionStats.completionPercentage === 100) {
        setsCompletedCount++;
      }
      if (setCompletionStats.collectedUniqueCount > 0 && setCompletionStats.completionPercentage < 100) {
        setsInProgressCount++;
      }
    }

    // 6. Overall completion percentage (user's unique cards vs. all unique cards in the database)
    // Get the total number of cards in the DB to calculate a global percentage
    const totalCardsInDbResult = await this.cardsService.findAll({ page: 1, limit: 1 }); // We only need the total count
    const totalCardsInDb = totalCardsInDbResult.total;

    const overallCompletionPercentage = totalCardsInDb > 0 ? (totalUniqueCardsOwned / totalCardsInDb) * 100 : 0;

    return {
      totalCollections,
      totalCardsOwned,
      totalUniqueCardsOwned,
      setsCompletedCount,
      setsInProgressCount,
      overallCompletionPercentage: parseFloat(overallCompletionPercentage.toFixed(2)),
    };
  }
}
