import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CollectionCard } from './collection-card.entity';

export enum CollectionVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
}

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.collections, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CollectionVisibility,
    default: CollectionVisibility.PRIVATE,
  })
  visibility: CollectionVisibility;

  @Column({ nullable: true })
  colorTheme: string; // Ej: "blue", "red", "gold"

  @Column({ nullable: true })
  icon: string; // Ej: "pokeball", "star"

  @Column({ type: 'jsonb', nullable: true, default: {} })
  settings: Record<string, any>; // Ej: { autoUpdatePrices: true, showFoilSeparately: true }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CollectionCard, (collectionCard) => collectionCard.collection)
  collectionCards: CollectionCard[];
}
