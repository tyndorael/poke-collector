import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString, Min } from 'class-validator';
import { CardCondition } from '../entities/collection-card.entity';

export class AddCardToCollectionDto {
  @ApiProperty({ example: 'swsh1-1', description: 'Card ID' })
  @IsString({ message: 'Card ID needs to be a string' })
  @IsNotEmpty({ message: 'Card ID is required' })
  cardId: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Normal Card quantity',
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Normal quantity must be a number' })
  @Min(0, { message: 'Normal quantity cannot be negative' })
  normalQuantity?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Foil card quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Holo card quantity needs to be a number' })
  @Min(0, { message: 'Holo card number needs to be greater than zero' })
  holoQuantity?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Reverse card quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reverse card quantity needs to be a number' })
  @Min(0, { message: 'Reverse card number needs to be greater than zero' })
  reverseQuantity?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'First edition card quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'First edition card quantity needs to be a number' })
  @Min(0, { message: 'First edition card number needs to be greater than zero' })
  firstEditionQuantity?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'W Promo card quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'W Promo card quantity needs to be a number' })
  @Min(0, { message: 'W Promo card number needs to be greater than zero' })
  wPromoQuantity?: number;

  @ApiPropertyOptional({
    example: 15.99,
    description: 'Purchase card price',
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Purchase card price needs to be a number' })
  @Min(0, { message: 'Purchase card price needs to be greater than zero' })
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: CardCondition.NEAR_MINT,
    enum: CardCondition,
    description: 'Card condition',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(CardCondition, {
    message: 'Card condition must be a valid enum value',
  })
  condition?: CardCondition;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Card language',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Card language needs to be a string' })
  language?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'If card is graded',
    nullable: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is graded needs to be a boolean' })
  isGraded?: boolean;

  @ApiPropertyOptional({
    example: 'PSA',
    description: 'Grade company (if applies)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Grade company needs to be a string' })
  gradeCompany?: string;

  @ApiPropertyOptional({
    example: 'PSA 10',
    description: 'Grade value (if applies)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Grade value needs to be a string' })
  gradeValue?: string;

  @ApiPropertyOptional({
    example: 'This is a rare card with special abilities.',
    description: 'Card notes or additional information',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Card notes needs to be a string' })
  notes?: string;

  @ApiPropertyOptional({
    example: '2023-12-01',
    description: 'Card adquisition date',
    nullable: true,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Card adquisition needs to be a valid Date string' })
  acquiredDate?: Date;
}
