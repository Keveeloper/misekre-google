import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialControlService } from './financial-control.service';
import { FinancialControlController } from './financial-control.controller';
import { Transaction } from './entities/transaction.entity';
import { Category } from './entities/category.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Category]),
    UsersModule, // Importing to use findOrCreate logic
  ],
  controllers: [FinancialControlController],
  providers: [FinancialControlService],
})
export class FinancialControlModule {}
