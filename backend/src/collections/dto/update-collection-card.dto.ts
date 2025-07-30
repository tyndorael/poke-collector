import { PartialType } from '@nestjs/swagger';
import { AddCardToCollectionDto } from './add-card-to-collection.dto';

export class UpdateCollectionCardDto extends PartialType(AddCardToCollectionDto) {}
