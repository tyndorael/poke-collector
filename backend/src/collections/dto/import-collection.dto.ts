import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ImportCollectionDto {
  @ApiProperty({
    description: 'Whether to overwrite existing cards in the collection',
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  overwrite?: boolean = false;

  @ApiProperty({
    description: 'Format of the import file',
    default: 'csv',
    required: false,
  })
  @IsOptional()
  @IsString()
  format?: string = 'csv';
}
