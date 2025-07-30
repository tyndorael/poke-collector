import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SetsService } from './sets.service';
import { SetsController } from './sets.controller';
import { PokemonSet } from './entities/set.entity';
import { CardsModule } from '../cards/cards.module';
import { CollectionCard } from '../collections/entities/collection-card.entity';

@Module({
  imports: [HttpModule, ConfigModule, TypeOrmModule.forFeature([PokemonSet, CollectionCard]), CardsModule],
  providers: [SetsService],
  controllers: [SetsController],
  exports: [SetsService],
})
export class SetsModule {}
