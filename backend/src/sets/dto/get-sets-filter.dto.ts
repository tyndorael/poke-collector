import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumberString, IsIn, ValidateNested } from 'class-validator';

class SetSortDto {
  @ApiProperty({ description: 'Sort by field', example: 'releaseDate' })
  @IsString()
  @IsIn(['name', 'releaseDate'])
  field: string;

  @ApiProperty({ description: 'Sort order', example: 'ASC' })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}
export class GetSetsFilterDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Results limit per page', example: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ description: 'Buscar por nombre de set', example: 'Base Set' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por serie (ej: Sword & Shield)', example: 'Sword & Shield' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional({ type: SetSortDto, description: 'Sort by release date', example: 'asc' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetSortDto)
  sort?: SetSortDto;
}
