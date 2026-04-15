import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { CategoryType } from '../entities/category.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  categoryName: string;
}
