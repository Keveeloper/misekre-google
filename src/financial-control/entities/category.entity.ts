import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Transaction } from './transaction.entity';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

@Entity('categories')
@Unique(['name', 'type'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
