import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection } from './entities/collection.entity';
import { CollectionCard } from './entities/collection-card.entity';
import { CardsModule } from '../cards/cards.module';
import { SetsModule } from '../sets/sets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionCard]), CardsModule, SetsModule],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
