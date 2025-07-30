// src/users/dto/user-stats.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of collections owned by the user' })
  totalCollections: number;

  @ApiProperty({ description: 'Total number of cards (regular + foil) across all user collections' })
  totalCardsOwned: number;

  @ApiProperty({ description: 'Total number of unique cards (by card ID) across all user collections' })
  totalUniqueCardsOwned: number;

  @ApiProperty({ description: 'Number of Pokémon sets the user has completed 100%' })
  setsCompletedCount: number;

  @ApiProperty({ description: 'Number of Pokémon sets where the user owns at least one card, but not 100% completion' })
  setsInProgressCount: number;

  @ApiProperty({
    description: 'Overall completion percentage of the user (unique cards owned / total unique cards in the database)',
  })
  overallCompletionPercentage: number;
}
