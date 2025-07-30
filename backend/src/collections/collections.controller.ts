import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';

import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCardToCollectionDto } from './dto/add-card-to-collection.dto';
import { UpdateCollectionCardDto } from './dto/update-collection-card.dto';
import { ImportCollectionDto } from './dto/import-collection.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@ApiTags('🏆 Collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all collections of the authenticated user',
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
  @ApiResponse({ status: 200, description: 'Collections list' })
  async findAll(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.collectionsService.findAll(req.user.userId, page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiBody({ type: CreateCollectionDto })
  @ApiResponse({ status: 201, description: 'Collection created' })
  @ApiResponse({ status: 400, description: 'Invalid collection data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(req.user.userId, createCollectionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection details' })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string } }) {
    return this.collectionsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: UpdateCollectionDto })
  @ApiResponse({
    status: 200,
    description: 'Collection updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, req.user.userId, updateCollectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async remove(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string } }) {
    await this.collectionsService.remove(id, req.user.userId);
    return { message: 'Collection deleted successfully' };
  }

  @Get(':id/cards')
  @ApiOperation({ summary: 'Get cards from a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
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
    name: 'set',
    required: false,
    type: String,
    description: 'Filter by set name or ID',
  })
  @ApiResponse({ status: 200, description: 'Collection cards' })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCollectionCards(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('set') setId?: string,
  ) {
    return this.collectionsService.getCollectionCards(collectionId, req.user.userId, page, limit, setId);
  }

  @Post(':id/cards')
  @ApiOperation({ summary: 'Add card to a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({ type: AddCardToCollectionDto })
  @ApiResponse({
    status: 201,
    description: 'Card added to collection successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid card data' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addCardToCollection(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() addCardDto: AddCardToCollectionDto,
  ) {
    return this.collectionsService.addCardToCollection(collectionId, req.user.userId, addCardDto);
  }

  @Put(':collectionId/cards/:cardId')
  @ApiOperation({ summary: 'Update collection card' })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiParam({ name: 'cardId', description: 'Card ID' })
  @ApiBody({ type: UpdateCollectionCardDto })
  @ApiResponse({
    status: 200,
    description: 'Card updated in collection successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or card not found in collection',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCardInCollection(
    @Param('collectionId') collectionId: string,
    @Param('cardId') cardId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() updateCardDto: UpdateCollectionCardDto,
  ) {
    return this.collectionsService.updateCardInCollection(collectionId, cardId, req.user.userId, updateCardDto);
  }

  @Delete(':collectionId/cards/:cardId')
  @ApiOperation({ summary: 'Delete a card from collection' })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiParam({ name: 'cardId', description: 'Card ID' })
  @ApiResponse({
    status: 200,
    description: 'Card removed from collection successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or card not found in collection',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeCardFromCollection(
    @Param('collectionId') collectionId: string,
    @Param('cardId') cardId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    await this.collectionsService.removeCardFromCollection(collectionId, cardId, req.user.userId);
    return { message: 'Card removed successfully' };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get collection stats' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection stats' })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCollectionStats(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    return this.collectionsService.getCollectionStats(collectionId, req.user.userId);
  }

  @Get(':id/value')
  @ApiOperation({ summary: 'Get collection value' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection value' })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCollectionValue(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    return this.collectionsService.getCollectionValue(collectionId, req.user.userId);
  }

  @Get(':id/export')
  @ApiOperation({
    summary: 'Export collection to a file',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiQuery({
    name: 'format',
    required: false,
    type: String,
    description: 'Export format (e.g., csv, json)',
    example: 'csv',
  })
  @ApiResponse({
    status: 200,
    description: 'Collection exported successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid export format. Supported formats: csv, json',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportCollection(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Query('format') format?: string,
  ) {
    return this.collectionsService.exportCollection(collectionId, req.user.userId, format);
  }

  @Post(':id/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import cards to a collection from CSV file',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiBody({
    description: 'CSV file to import and optional parameters',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file to import',
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite existing cards',
          default: false,
        },
        format: {
          type: 'string',
          description: 'Import format (currently only csv supported)',
          default: 'csv',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import completed',
    schema: {
      type: 'object',
      properties: {
        imported: { type: 'number', description: 'Number of cards successfully imported' },
        errors: { type: 'array', items: { type: 'string' }, description: 'List of import errors' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or import data',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found or does not belong to user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importCollection(
    @Param('id') collectionId: string,
    @Request() req: ExpressRequest & { user: { userId: string } },
    @UploadedFile() file: MulterFile | undefined,
    @Body() importOptions: ImportCollectionDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('text/csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }

    return this.collectionsService.importCollection(collectionId, req.user.userId, file.buffer, importOptions);
  }
}
