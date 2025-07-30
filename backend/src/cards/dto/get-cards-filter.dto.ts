import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetCardsFilterDto {
  @ApiPropertyOptional({ description: 'Page Number', example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Result by page', example: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search by card name',
    example: 'Pikachu',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by set name or id',
    example: 'base-set',
  })
  @IsOptional()
  @IsString()
  set?: string;

  @ApiPropertyOptional({
    description: 'Filter by rarity (ex: Common, Rare, Holo Rare)',
    example: 'Rare',
  })
  @IsOptional()
  @IsString()
  rarity?: string;

  @ApiPropertyOptional({
    description: 'Filter by type (ej: Electric, Fire)',
    example: 'Electric',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by supertype (e.g: Pokémon, Trainer, Energy)',
    example: 'Pokémon',
  })
  @IsOptional()
  @IsString()
  supertype?: string;
}
