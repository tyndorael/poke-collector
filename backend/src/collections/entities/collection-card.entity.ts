import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Collection } from './collection.entity';
import { PokemonCard } from '../../cards/entities/card.entity';

export enum CardCondition {
  MINT = 'mint',
  NEAR_MINT = 'near-mint',
  LIGHTLY_PLAYED = 'lightly-played',
  MODERATELY_PLAYED = 'moderately-played',
  HEAVILY_PLAYED = 'heavily-played',
  DAMAGED = 'damaged',
}

@Entity('collection_cards')
export class CollectionCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collectionId: string;

  @ManyToOne(() => Collection, (collection) => collection.collectionCards, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @Column()
  cardId: string;

  @ManyToOne(() => PokemonCard, (card) => card.collectionCards, {
    onDelete: 'CASCADE',
  })
  card: PokemonCard;

  @Column({ default: 1 })
  normalQuantity: number;

  @Column({ default: 0 })
  holoQuantity: number;

  @Column({ default: 0 })
  reverseQuantity: number;

  @Column({ default: 0 })
  firstEditionQuantity: number;

  @Column({ default: 0 })
  wPromoQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'enum', enum: CardCondition, nullable: true })
  condition: CardCondition;

  @Column({ nullable: true })
  language: string; // Ej: "en", "es", "jp"

  @Column({ default: false })
  isGraded: boolean; // if the card is graded

  @Column({ nullable: true })
  gradeCompany: string; // Ej: "PSA", "BGS"

  @Column({ nullable: true })
  gradeValue: string; // Ej: "PSA 10", "BGS 9.5"

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  acquiredDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
