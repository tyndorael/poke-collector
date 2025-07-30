import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class PriceRangeDto {
  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  max?: number;
}

class HpRangeDto {
  @ApiPropertyOptional({ description: 'Minimum HP' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum HP' })
  @IsOptional()
  @IsNumber()
  max?: number;
}

class RetreatCostRangeDto {
  @ApiPropertyOptional({ description: 'Minimum retreat cost' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum retreat cost' })
  @IsOptional()
  @IsNumber()
  max?: number;
}

class CardFiltersDto {
  @ApiPropertyOptional({ description: 'Card name to search for' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by set name' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sets?: string[];

  @ApiPropertyOptional({ description: 'Filter by card types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional({ description: 'Filter by card rarities' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rarities?: string[];

  @ApiPropertyOptional({ type: HpRangeDto, description: 'HP range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HpRangeDto)
  hpRange?: HpRangeDto;

  @ApiPropertyOptional({ type: PriceRangeDto, description: 'Price range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @ApiPropertyOptional({ description: 'Filter by artist' })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiPropertyOptional({ description: 'Filter by abilities' })
  @IsOptional()
  hasAbilities?: boolean;

  @ApiPropertyOptional({ type: RetreatCostRangeDto, description: 'Retreat cost range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RetreatCostRangeDto)
  retreatCost?: RetreatCostRangeDto;
}

class CardSortDto {
  @ApiProperty({ description: 'Sort by field', example: 'name' })
  @IsString()
  @IsIn(['name', 'hp', 'rarity', 'setReleaseDate']) // Add more fields if necessary
  field: string;

  @ApiProperty({ description: 'Sort order', example: 'ASC' })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}

export class SearchCardsDto {
  @ApiPropertyOptional({ type: CardFiltersDto, description: 'Search filters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardFiltersDto)
  filters?: CardFiltersDto;

  @ApiPropertyOptional({ type: CardSortDto, description: 'Sort order' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardSortDto)
  sort?: CardSortDto;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Limit by page', example: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
