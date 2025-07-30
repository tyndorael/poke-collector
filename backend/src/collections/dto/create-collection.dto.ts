import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { CollectionVisibility } from '../entities/collection.entity';

export class CreateCollectionDto {
  @ApiProperty({
    example: 'My main collection',
    description: 'Collection name',
  })
  @IsString({ message: 'Collection name needs to be a string' })
  @IsNotEmpty({ message: 'Collection name is required' })
  name: string;

  @ApiPropertyOptional({
    example: 'Favorite Pokémon cards collection',
    description: 'Collection description',
  })
  @IsOptional()
  @IsString({ message: 'Collection description needs to be a string' })
  description?: string;

  @ApiPropertyOptional({
    example: CollectionVisibility.PRIVATE,
    enum: CollectionVisibility,
    description: 'Collection visibility',
  })
  @IsOptional()
  @IsEnum(CollectionVisibility, {
    message: 'Collection visibility must be a valid enum value',
  })
  visibility?: CollectionVisibility;

  @ApiPropertyOptional({
    example: 'blue',
    description: 'Color theme of the collection',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Color theme needs to be a string' })
  colorTheme?: string;

  @ApiPropertyOptional({
    example: 'pokeball',
    description: 'Collection icon',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Collection icon needs to be a string' })
  icon?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Collection settings',
    nullable: true,
  })
  @IsOptional()
  settings?: Record<string, any>;
}
