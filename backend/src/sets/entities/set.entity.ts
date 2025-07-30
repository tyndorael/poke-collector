import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pokemon_sets')
export class PokemonSet {
  @PrimaryColumn()
  id: string; // ID del set (ej: swsh1)

  @Column()
  name: string;

  @Column({ nullable: true })
  series: string;

  @Column({ nullable: true })
  printedTotal: number; // Total printed cards (includes secrets)

  @Column({ nullable: true })
  total: number; // Total cards in the set (without secrets)

  @Column({ nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  symbolUrl: string; // URL of the set symbol

  @Column({ nullable: true })
  logoUrl: string; // URL of the set logo

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
