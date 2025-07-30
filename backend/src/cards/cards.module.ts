import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonCard } from './entities/card.entity';
import { CardPrice } from './entities/card-price.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [HttpModule, RedisModule, ConfigModule, TypeOrmModule.forFeature([PokemonCard, CardPrice]), ScheduleModule],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
