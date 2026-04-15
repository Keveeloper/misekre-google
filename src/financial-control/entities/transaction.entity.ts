import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category, CategoryType } from './category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => User, (user) => user.transactions, { eager: true, nullable: false })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions, { eager: true, nullable: false })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
