import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { PokemonCard } from './card.entity';

@Entity('card_prices')
export class CardPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardId: string;

  @ManyToOne(() => PokemonCard, (card) => card.prices, { onDelete: 'CASCADE' })
  card: PokemonCard;

  // TCG Player prices
  // types: normal, holofoil, reverseHolofoil, 1stEditionHolofoil and 1stEditionNormal.
  // documentation: https://docs.pokemontcg.io/api-reference/cards/card-object/#tcgplayer-hash

  // Normal prices
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerNormalMarket: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerNormalLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerNormalMid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerNormalHigh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerNormalDirectLow: number;

  // Holofoil prices
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerHolofoilMarket: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerHolofoilLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerHolofoilMid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerHolofoilHigh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerHolofoilDirectLow: number;

  // Reverse Holofoil prices
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerReverseHolofoilMarket: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerReverseHolofoilLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerReverseHolofoilMid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerReverseHolofoilHigh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerReverseHolofoilDirectLow: number;

  // 1st Edition Normal prices
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionNormalMarket: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionNormalLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionNormalMid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionNormalHigh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionNormalDirectLow: number;

  // 1st Edition Holofoil prices
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionHolofoilMarket: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionHolofoilLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionHolofoilMid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionHolofoilHigh: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tcgplayerFirstEditionHolofoilDirectLow: number;

  // Cardmarket prices (Cardmarket is a European marketplace)
  // documentation: https://docs.pokemontcg.io/api-reference/cards/card-object/#cardmarket-hash

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketAvg1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketAvg7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketAvg30: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketTrend: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cardmarketSuggestedPrice: number;

  @CreateDateColumn()
  createdAt: Date; // Timestamp for when the price was created
}
