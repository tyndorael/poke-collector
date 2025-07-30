import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { CardsService } from './cards.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { SearchCardsDto } from './dto/search-cards.dto';

@ApiTags('🃏 Pokemon Cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all cards with optional filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit of results per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by card name',
  })
  @ApiQuery({
    name: 'set',
    required: false,
    type: String,
    description: 'Filter by set name or ID',
  })
  @ApiQuery({
    name: 'rarity',
    required: false,
    type: String,
    description: 'Filter by rarity (e.g., Common, Rare, Holo Rare)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by type (e.g., Electric, Fire)',
  })
  @ApiQuery({
    name: 'supertype',
    required: false,
    type: String,
    description: 'Filter by supertype (e.g., Pokémon, Trainer, Energy)',
  })
  @ApiResponse({ status: 200, description: 'Card List' })
  async findAll(@Query() filterDto: GetCardsFilterDto) {
    return this.cardsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card details by ID' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card details' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search cards with advanced filters' })
  @ApiBody({
    type: SearchCardsDto,
    description: 'Search filters and sorting options for cards',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results for cards based on filters and sorting options.',
  })
  async searchCards(@Body() searchCardsDto: SearchCardsDto) {
    return this.cardsService.searchCards(searchCardsDto);
  }

  @Get(':id/prices')
  @ApiOperation({
    summary: 'Get prices of a card from external API or cache',
  })
  @ApiParam({ name: 'id', description: 'card id' })
  @ApiResponse({ status: 200, description: 'card prices' })
  @ApiResponse({
    status: 404,
    description: 'card prices not found or not available',
  })
  async getCardPrices(@Param('id') id: string) {
    return this.cardsService.getCardPrices(id);
  }

  @Get(':id/prices/history')
  @ApiOperation({ summary: 'Get price history of a card' })
  @ApiParam({ name: 'id', description: 'ID of the card' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back for price history (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Price history of the card',
  })
  async getCardPriceHistory(@Param('id') id: string, @Query('days') days?: number) {
    return this.cardsService.getCardPriceHistory(id, days);
  }

  @Post(':id/prices/refresh')
  @ApiOperation({ summary: 'Refresh prices of a card from external API' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({
    status: 200,
    description: 'Prices refreshed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found or prices not available.',
  })
  async refreshCardPrices(@Param('id') id: string) {
    return this.cardsService.refreshCardPrices(id);
  }

  @Post('sync-all')
  @ApiOperation({
    summary: 'Manually trigger synchronization of all cards from the source API',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync card started. This may take a while.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async syncAllCardsManually() {
    await this.cardsService.syncAllCards();
    return { message: 'Sync card started. This may take a while' };
  }

  @Post('prices/clear-cache')
  @ApiOperation({
    summary: 'Clear the prices cache for all cards',
  })
  @ApiResponse({
    status: 200,
    description: 'Prices cache cleared successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async clearPricesCache() {
    await this.cardsService.clearPricesCache();
    return { message: 'Prices cache cleared successfully.' };
  }
}
