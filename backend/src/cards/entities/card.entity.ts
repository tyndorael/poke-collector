import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CardPrice } from './card-price.entity';
import { CollectionCard } from '../../collections/entities/collection-card.entity';

@Entity('cards')
export class PokemonCard {
  @PrimaryColumn()
  id: string; // Card ID, usually a unique identifier from the source API

  @Column()
  name: string;

  @Column({ nullable: true })
  nationalPokedexNumber: number;

  @Column({ nullable: true })
  imageUrl: string; // Image URL for the card

  @Column({ nullable: true })
  smallImageUrl: string;

  @Column({ nullable: true })
  largeImageUrl: string;

  @Column({ nullable: true })
  supertype: string; // Pokémon, Trainer, Energy

  @Column({ nullable: true })
  subtype: string; // Basic, Stage 1, VMAX, Supporter, etc.

  @Column({ nullable: true })
  evolveFrom: string; // Name of the card this card evolves from, if applicable

  @Column('simple-array', { nullable: true })
  types: string[]; // Electric, Fire, Water, etc.

  @Column({ nullable: true })
  hp: string;

  @Column('simple-array', { nullable: true })
  retreatCost: string[];

  @Column({ nullable: true })
  number: string; // Card number in the set (e.g., 1/102)

  @Column({ nullable: true })
  artist: string;

  @Column({ nullable: true })
  rarity: string;

  @Column({ nullable: true })
  flavorText: string;

  @Column({ nullable: true })
  setId: string; // Set ID (e.g., base-set, sword-shield)

  @Column({ nullable: true })
  setName: string; // Set name (e.g., Base Set, Sword & Shield)

  @Column({ nullable: true })
  setSeries: string; // Set series (e.g., Kanto, Johto)

  @Column({ nullable: true })
  setTotalCards: number; // Total number of cards in the set (excluding secrets)

  @Column({ nullable: true })
  setPrintedTotal: number; // Total number of printed cards in the set (including secrets)

  @Column({ nullable: true })
  setReleaseDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  abilities: Record<string, any>[]; // Card abilities, if any

  @Column({ type: 'jsonb', nullable: true })
  attacks: Record<string, any>[]; // Card attacks, if any

  @Column({ type: 'jsonb', nullable: true })
  weaknesses: Record<string, any>[]; // Weaknesses of the card

  @Column({ type: 'jsonb', nullable: true })
  resistances: Record<string, any>[]; // Resistances of the card

  @Column({ type: 'jsonb', nullable: true })
  legalities: Record<string, any>; // Legalities of the card in different formats (e.g., Standard, Expanded)

  @Column({ nullable: true })
  regulationMark: string; // Regulation mark for the card (e.g., D, F)

  @Column({ type: 'jsonb', nullable: true })
  variants: Record<string, any>; // Variants of the card (e.g., holo, reverse holo)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CardPrice, (cardPrice) => cardPrice.card)
  prices: CardPrice[];

  @OneToMany(() => CollectionCard, (collectionCard) => collectionCard.card)
  collectionCards: CollectionCard[];
}
