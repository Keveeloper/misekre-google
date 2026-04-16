import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Category, CategoryType } from './entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class FinancialControlService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly usersService: UsersService,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { telegramId, amount, type, date, categoryName } = createTransactionDto;

    const user = await this.usersService.findOrCreate(telegramId);

    let category = await this.categoryRepository.findOne({ where: { name: categoryName, type } });
    if (!category) {
      category = this.categoryRepository.create({ name: categoryName, type });
      await this.categoryRepository.save(category);
    }

    const transaction = this.transactionRepository.create({
      amount,
      type,
      date: new Date(date.substring(0, 10) + 'T12:00:00Z'),
      user,
      category,
    });

    return this.transactionRepository.save(transaction);
  }

  async getTransactionsByTelegramId(telegramId: string) {
    const user = await this.usersService.findByTelegramId(telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transactionRepository.find({
      where: { user: { id: user.id } },
      order: { date: 'DESC' },
    });
  }

  async getTransactionsByDate(telegramId: string, searchDate: string, type?: CategoryType) {
    const user = await this.usersService.findByTelegramId(telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryDate = new Date(searchDate.substring(0, 10) + 'T12:00:00Z');

    const whereClause: any = {
      user: { id: user.id },
      date: queryDate,
    };

    if (type) {
      whereClause.type = type;
    }

    return this.transactionRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }
}
