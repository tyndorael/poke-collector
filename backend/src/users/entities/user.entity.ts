import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Collection } from '../../collections/entities/collection.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  locale: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  settings: Record<string, any>; // User settings as a JSON object

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];
}
