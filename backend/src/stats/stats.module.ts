import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Collection } from '../collections/entities/collection.entity';
import { CollectionCard } from '../collections/entities/collection-card.entity';
import { PokemonSet } from '../sets/entities/set.entity';
import { CardsModule } from '../cards/cards.module';
import { SetsModule } from '../sets/sets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionCard, PokemonSet]), CardsModule, SetsModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
