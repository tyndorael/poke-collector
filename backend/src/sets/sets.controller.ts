import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SetsService } from './sets.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GetSetsFilterDto } from './dto/get-sets-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('📦 Pokemon Sets')
@Controller('sets')
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sets' })
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
    description: 'Search by set name',
  })
  @ApiQuery({
    name: 'series',
    required: false,
    type: String,
    description: 'Filter by series (e.g., Sword & Shield, Sun & Moon)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'sort by release date',
  })
  @ApiResponse({ status: 200, description: 'Sets list' })
  async findAll(@Query() filterDto: GetSetsFilterDto) {
    return this.setsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a set by ID' })
  @ApiParam({ name: 'id', description: 'ID of the set' })
  @ApiResponse({ status: 200, description: 'Set details' })
  @ApiResponse({ status: 404, description: 'Set not found' })
  async findOne(@Param('id') id: string) {
    return this.setsService.findOne(id);
  }

  @Get(':id/cards')
  @ApiOperation({ summary: 'Get all cards in a set' })
  @ApiParam({ name: 'id', description: 'ID of the set' })
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
  @ApiResponse({ status: 200, description: 'Cards in set' })
  async getSetCards(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.setsService.getSetCards(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/completion')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get set completion stats for a user',
  })
  @ApiParam({ name: 'id', description: 'ID del set' })
  @ApiResponse({
    status: 200,
    description: 'Set completion stats for the user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Set not found' })
  async getSetCompletionStats(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.setsService.getSetCompletionStats(id, req.user.userId);
  }

  @Post('sync-all')
  @ApiOperation({
    summary: 'Manually trigger synchronization of all sets from the source API',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync card started. This may take a while.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async syncAllCardsManually() {
    await this.setsService.syncAllSets();
    return { message: 'Sync set started. This may take a while' };
  }
}
