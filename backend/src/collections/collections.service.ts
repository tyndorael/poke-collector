import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

import { Collection } from './entities/collection.entity';
import { CollectionCard } from './entities/collection-card.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCardToCollectionDto } from './dto/add-card-to-collection.dto';
import { UpdateCollectionCardDto } from './dto/update-collection-card.dto';
import { ImportCollectionDto } from './dto/import-collection.dto';
import { CardsService } from '../cards/cards.service';
import { SetsService } from '../sets/sets.service';
import { CardCondition } from './entities/collection-card.entity';

interface CsvRow {
  'Card ID'?: string;
  'Card Name'?: string;
  'Set Name'?: string;
  Quantity?: string;
  'Quantity Foil'?: string;
  'Quantity Reverse'?: string;
  'Quantity First Edition'?: string;
  'Quantity W Promo'?: string;
  'Purchase Price'?: string;
  Condition?: string;
  Language?: string;
  'Is Graded'?: string;
  'Grade Company'?: string;
  'Grade Value'?: string;
  Notes?: string;
  'Acquired Date'?: string;
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionCard)
    private collectionCardsRepository: Repository<CollectionCard>,
    private cardsService: CardsService,
    private setsService: SetsService,
  ) {}

  // Get all collections of the authenticated user with pagination
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const [collections, total] = await this.collectionsRepository.findAndCount({
      where: { userId },
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
    });
    return { collections, total, page, limit };
  }

  // Create a new collection for the authenticated user
  async create(userId: string, createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const collection = this.collectionsRepository.create({
      ...createCollectionDto,
      userId,
    });
    return this.collectionsRepository.save(collection);
  }

  // Get a single collection by ID for the authenticated user
  async findOne(id: string, userId: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id, userId },
    });
    if (!collection) {
      throw new NotFoundException(`Collection with ID "${id}" not found or does not belong to the user.`);
    }
    return collection;
  }

  // Update a collection for the authenticated user
  async update(id: string, userId: string, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.collectionsRepository.preload({
      id,
      ...updateCollectionDto,
    });
    if (!collection || collection.userId !== userId) {
      throw new NotFoundException(`Collection with ID "${id}" not found or does not belong to user.`);
    }
    return this.collectionsRepository.save(collection);
  }

  // Remove a collection
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.collectionsRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Collection with ID "${id}" not found or does not belong to user.`);
    }
  }

  // Get cards from a collection
  async getCollectionCards(
    collectionId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
    setId?: string,
  ): Promise<{
    collectionCards: CollectionCard[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const skip = (page - 1) * limit;
    const queryBuilder = this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .leftJoinAndSelect('collectionCard.card', 'card')
      .where('collectionCard.collectionId = :collectionId', { collectionId });

    if (setId) {
      queryBuilder.andWhere('card.setId = :setId', { setId });
    }

    const [collectionCards, total] = await queryBuilder.take(limit).skip(skip).getManyAndCount();

    return { collectionCards, total, page, limit };
  }

  // Add card to a collection
  async addCardToCollection(
    collectionId: string,
    userId: string,
    addCardDto: AddCardToCollectionDto,
  ): Promise<CollectionCard> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    // Verify that the card exists in the cards database
    const card = await this.cardsService.findOne(addCardDto.cardId);
    if (!card) {
      throw new NotFoundException(`Card with ID "${addCardDto.cardId}" not found.`);
    }

    // Check if the card already exists in the collection to update it instead of creating a new entry
    let collectionCard = await this.collectionCardsRepository.findOne({
      where: { collectionId, cardId: addCardDto.cardId },
    });

    if (collectionCard) {
      // Update quantities if the card already exists
      collectionCard.normalQuantity = (collectionCard.normalQuantity || 0) + (addCardDto.normalQuantity || 0);
      collectionCard.holoQuantity = (collectionCard.holoQuantity || 0) + (addCardDto.holoQuantity || 0);
      collectionCard.reverseQuantity = (collectionCard.reverseQuantity || 0) + (addCardDto.reverseQuantity || 0);
      collectionCard.firstEditionQuantity =
        (collectionCard.firstEditionQuantity || 0) + (addCardDto.firstEditionQuantity || 0);
      collectionCard.wPromoQuantity = (collectionCard.wPromoQuantity || 0) + (addCardDto.wPromoQuantity || 0);
      collectionCard.purchasePrice = addCardDto.purchasePrice || collectionCard.purchasePrice;
      collectionCard.condition = addCardDto.condition || collectionCard.condition;
      collectionCard.language = addCardDto.language || collectionCard.language;
      collectionCard.isGraded = addCardDto.isGraded !== undefined ? addCardDto.isGraded : collectionCard.isGraded;
      collectionCard.gradeCompany = addCardDto.gradeCompany || collectionCard.gradeCompany;
      collectionCard.gradeValue = addCardDto.gradeValue || collectionCard.gradeValue;
      collectionCard.notes = addCardDto.notes || collectionCard.notes;
      collectionCard.acquiredDate = addCardDto.acquiredDate || collectionCard.acquiredDate;
    } else {
      // Create new entry if the card doesn't exist in the collection
      collectionCard = this.collectionCardsRepository.create({
        collectionId,
        cardId: addCardDto.cardId,
        normalQuantity: addCardDto.normalQuantity || 1,
        holoQuantity: addCardDto.holoQuantity || 0,
        reverseQuantity: addCardDto.reverseQuantity || 0,
        firstEditionQuantity: addCardDto.firstEditionQuantity || 0,
        wPromoQuantity: addCardDto.wPromoQuantity || 0,
        purchasePrice: addCardDto.purchasePrice,
        condition: addCardDto.condition,
        language: addCardDto.language,
        isGraded: addCardDto.isGraded,
        gradeCompany: addCardDto.gradeCompany,
        gradeValue: addCardDto.gradeValue,
        notes: addCardDto.notes,
        acquiredDate: addCardDto.acquiredDate,
      });
    }

    // Automatically fill in the card's set (already in the Card entity)
    // No need to do anything here, since the relationship with Card already gives us the setId and setName.

    return this.collectionCardsRepository.save(collectionCard);
  }

  // Update card in collection
  async updateCardInCollection(
    collectionId: string,
    cardId: string,
    userId: string,
    updateCardDto: UpdateCollectionCardDto,
  ): Promise<CollectionCard> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const collectionCard = await this.collectionCardsRepository.findOne({
      where: { collectionId, cardId },
    });

    if (!collectionCard) {
      throw new NotFoundException(`Card with ID "${cardId}" not found in collection "${collectionId}".`);
    }

    // Update fields
    Object.assign(collectionCard, updateCardDto);

    return this.collectionCardsRepository.save(collectionCard);
  }

  // Remove card from collection
  async removeCardFromCollection(collectionId: string, cardId: string, userId: string): Promise<void> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const result = await this.collectionCardsRepository.delete({
      collectionId,
      cardId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID "${cardId}" not found in collection "${collectionId}".`);
    }
  }

  // Get collection statistics
  async getCollectionStats(
    collectionId: string,
    userId: string,
  ): Promise<{
    totalCards: number;
    totalUniqueCards: number;
    totalNormalQuantity: number;
    totalHoloQuantity: number;
    totalReverseQuantity: number;
    totalFirstEditionQuantity: number;
    totalWPromoQuantity: number;
  }> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const totalCardsResult = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select(
        'SUM(collectionCard.normalQuantity + collectionCard.holoQuantity + collectionCard.reverseQuantity + collectionCard.firstEditionQuantity + collectionCard.wPromoQuantity)',
        'sum',
      )
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();
    const totalCards = totalCardsResult && totalCardsResult.sum ? parseInt(totalCardsResult.sum, 10) : 0;

    const totalUniqueCards = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('COUNT(DISTINCT collectionCard.cardId)', 'count')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ count: string }>();

    const totalNormalQuantity = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('SUM(collectionCard.normalQuantity)', 'sum')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();

    const totalHoloQuantity = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('SUM(collectionCard.holoQuantity)', 'sum')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();

    const totalReverseQuantity = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('SUM(collectionCard.reverseQuantity)', 'sum')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();

    const totalFirstEditionQuantity = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('SUM(collectionCard.firstEditionQuantity)', 'sum')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();

    const totalWPromoQuantity = await this.collectionCardsRepository
      .createQueryBuilder('collectionCard')
      .select('SUM(collectionCard.wPromoQuantity)', 'sum')
      .where('collectionCard.collectionId = :collectionId', { collectionId })
      .getRawOne<{ sum: string }>();

    return {
      totalCards: totalCards,
      totalUniqueCards: totalUniqueCards ? parseInt(totalUniqueCards.count, 10) : 0,
      totalNormalQuantity: totalNormalQuantity ? parseInt(totalNormalQuantity.sum, 10) || 0 : 0,
      totalHoloQuantity: totalHoloQuantity ? parseInt(totalHoloQuantity.sum, 10) || 0 : 0,
      totalReverseQuantity: totalReverseQuantity ? parseInt(totalReverseQuantity.sum, 10) || 0 : 0,
      totalFirstEditionQuantity: totalFirstEditionQuantity ? parseInt(totalFirstEditionQuantity.sum, 10) || 0 : 0,
      totalWPromoQuantity: totalWPromoQuantity ? parseInt(totalWPromoQuantity.sum, 10) || 0 : 0,
    };
  }

  // Get estimated value of the collection
  async getCollectionValue(
    collectionId: string,
    userId: string,
  ): Promise<{
    totalNormalValue: number;
    totalHolofoilValue: number;
    totalEstimatedValue: number;
    totalPurchasePrice: number;
    profitLoss: number;
    totalCards: number;
    totalUniqueCards: number;
    totalNormalQuantity: number;
    totalHoloQuantity: number;
    totalReverseQuantity: number;
    totalFirstEditionQuantity: number;
    totalWPromoQuantity: number;
    averagePurchasePrice: number;
  }> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const collectionCards = await this.collectionCardsRepository.find({
      where: { collectionId },
      relations: ['card'], // to access card prices
    });

    let totalNormalValue = 0;
    let totalHolofoilValue = 0;
    let totalPurchasePrice = 0;

    for (const cc of collectionCards) {
      if (cc.card) {
        const cardPrices = await this.cardsService.getCardPrices(cc.card.id);
        if (cardPrices) {
          totalNormalValue += cardPrices.tcgplayerNormalMarket
            ? cardPrices.tcgplayerNormalMarket * cc.normalQuantity
            : 0;
          totalHolofoilValue += cardPrices.tcgplayerHolofoilMarket
            ? cardPrices.tcgplayerHolofoilMarket * cc.holoQuantity
            : 0;
        }
      }
      if (cc.purchasePrice) {
        totalPurchasePrice += cc.purchasePrice * cc.normalQuantity;
      }
    }
    const totalEstimatedValue = totalNormalValue + totalHolofoilValue;
    return {
      totalNormalValue: parseFloat(totalNormalValue.toFixed(2)),
      totalEstimatedValue: parseFloat(totalEstimatedValue.toFixed(2)),
      totalPurchasePrice: parseFloat(totalPurchasePrice.toFixed(2)),
      profitLoss: parseFloat((totalEstimatedValue - totalPurchasePrice).toFixed(2)),
      totalHolofoilValue: parseFloat(totalHolofoilValue.toFixed(2)),
      totalCards: collectionCards.length,
      totalUniqueCards: new Set(collectionCards.map((cc) => cc.cardId)).size,
      totalNormalQuantity: collectionCards.reduce((sum, cc) => sum + (cc.normalQuantity || 0), 0),
      totalHoloQuantity: collectionCards.reduce((sum, cc) => sum + (cc.holoQuantity || 0), 0),
      totalReverseQuantity: collectionCards.reduce((sum, cc) => sum + (cc.reverseQuantity || 0), 0),
      totalFirstEditionQuantity: collectionCards.reduce((sum, cc) => sum + (cc.firstEditionQuantity || 0), 0),
      totalWPromoQuantity: collectionCards.reduce((sum, cc) => sum + (cc.wPromoQuantity || 0), 0),
      averagePurchasePrice:
        collectionCards.length > 0 ? parseFloat((totalPurchasePrice / collectionCards.length).toFixed(2)) : 0,
    };
  }

  // Import collection from CSV
  async importCollection(
    collectionId: string,
    userId: string,
    fileBuffer: Buffer,
    importOptions: ImportCollectionDto = {},
  ): Promise<{ imported: number; errors: string[] }> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const { overwrite = false, format = 'csv' } = importOptions;

    if (format !== 'csv') {
      throw new BadRequestException(`Import format "${format}" not supported.`);
    }

    const results: CsvRow[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data: CsvRow) => results.push(data))
        .on('end', () => {
          // Process data in a separate async function to avoid Promise<void> issues
          this.processImportData(results, collectionId, overwrite)
            .then((result) => {
              resolve({ imported: result.imported, errors: result.errors });
            })
            .catch((error) => {
              const errorMessage = error instanceof Error ? error.message : String(error);
              reject(new BadRequestException(`Processing error: ${errorMessage}`));
            });
        })
        .on('error', (error) => {
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        });
    });
  }

  private async processImportData(
    results: CsvRow[],
    collectionId: string,
    overwrite: boolean,
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 2; // +2 because CSV has header and is 1-indexed

      try {
        // Validate required fields
        if (!row['Card ID']) {
          errors.push(`Row ${rowNumber}: Missing Card ID`);
          continue;
        }

        const cardId = String(row['Card ID']).trim();

        // Check if card exists in our database
        const card = await this.cardsService.findOne(cardId);
        if (!card) {
          errors.push(`Row ${rowNumber}: Card with ID "${cardId}" not found`);
          continue;
        }

        // Check if card already exists in collection
        const existingCard = await this.collectionCardsRepository.findOne({
          where: { collectionId, cardId },
        });

        if (existingCard && !overwrite) {
          errors.push(
            `Row ${rowNumber}: Card "${cardId}" already exists in collection. Use overwrite option to replace.`,
          );
          continue;
        }

        // Parse numeric fields with defaults
        const normalQuantity = parseInt(String(row.Quantity || '0')) || 0;
        const holoQuantity = parseInt(String(row['Quantity Foil'] || '0')) || 0;
        const reverseQuantity = parseInt(String(row['Quantity Reverse'] || '0')) || 0;
        const firstEditionQuantity = parseInt(String(row['Quantity First Edition'] || '0')) || 0;
        const wPromoQuantity = parseInt(String(row['Quantity W Promo'] || '0')) || 0;
        const purchasePrice = parseFloat(String(row['Purchase Price'] || '0')) || undefined;
        const isGraded = String(row['Is Graded']) === 'true' || String(row['Is Graded']) === '1';
        const gradeValue = row['Grade Value'] ? String(row['Grade Value']).trim() : undefined;

        // Parse condition enum
        let condition: CardCondition | undefined = undefined;
        if (row.Condition) {
          const conditionStr = String(row.Condition).trim().toLowerCase().replace(/[\s-]/g, '_');
          // Convert to kebab-case to match enum values
          const normalizedCondition = conditionStr.replace(/_/g, '-');
          const validConditions = Object.values(CardCondition);
          if (validConditions.includes(normalizedCondition as CardCondition)) {
            condition = normalizedCondition as CardCondition;
          } else if (row.Condition.trim()) {
            errors.push(
              `Row ${rowNumber}: Invalid condition "${row.Condition}". Valid values: ${validConditions.join(', ')}`,
            );
          }
        }

        // Parse date field
        let acquiredDate: Date | undefined = undefined;
        if (row['Acquired Date'] && String(row['Acquired Date']).trim()) {
          acquiredDate = new Date(String(row['Acquired Date']).trim());
          if (isNaN(acquiredDate.getTime())) {
            acquiredDate = undefined;
            errors.push(`Row ${rowNumber}: Invalid date format for "Acquired Date"`);
          }
        }

        const cardData = {
          collectionId,
          cardId,
          normalQuantity,
          holoQuantity,
          reverseQuantity,
          firstEditionQuantity,
          wPromoQuantity,
          purchasePrice,
          condition,
          language: row.Language ? String(row.Language).trim() : undefined,
          isGraded,
          gradeCompany: row['Grade Company'] ? String(row['Grade Company']).trim() : undefined,
          gradeValue,
          notes: row.Notes ? String(row.Notes).trim() : undefined,
          acquiredDate,
        };

        if (existingCard && overwrite) {
          // Update existing card
          await this.collectionCardsRepository.update(existingCard.id, cardData);
        } else {
          // Create new card entry
          const newCard = this.collectionCardsRepository.create(cardData);
          await this.collectionCardsRepository.save(newCard);
        }

        imported++;
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${(error as Error).message}`);
      }
    }

    return { imported, errors };
  }

  // Export collection (e.g. to CSV)
  async exportCollection(collectionId: string, userId: string, format: string = 'csv'): Promise<string> {
    // Verify that the collection belongs to the user
    await this.findOne(collectionId, userId);

    const collectionCards = await this.collectionCardsRepository.find({
      where: { collectionId },
      relations: ['card'],
    });

    if (format === 'csv') {
      let csv =
        'Card ID,Card Name,Set Name,Quantity,Quantity Foil,Quantity Reverse,Quantity First Edition,Quantity W Promo,Purchase Price,Condition,Language,Is Graded,Grade Company,Grade Value,Notes,Acquired Date\n';
      for (const cc of collectionCards) {
        csv += `${cc.cardId},"${cc.card?.name || ''}","${cc.card?.setName || ''}",${cc.normalQuantity},${cc.holoQuantity},${cc.reverseQuantity},${cc.firstEditionQuantity},${cc.wPromoQuantity},${cc.purchasePrice || ''},${cc.condition || ''},${cc.language || ''},${cc.isGraded},"${cc.gradeCompany || ''}","${cc.gradeValue || ''}","${cc.notes || ''}",${cc.acquiredDate ? cc.acquiredDate.toISOString().split('T')[0] : ''}\n`;
      }
      return csv;
    } else {
      throw new BadRequestException(`Export format "${format}" not supported.`);
    }
  }
}
