import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FinancialControlService } from './financial-control.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('financial-control')
export class FinancialControlController {
  constructor(private readonly financialControlService: FinancialControlService) {}

  @Post('transaction')
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.financialControlService.createTransaction(createTransactionDto);
  }

  @Get('transactions/:telegramId')
  getTransactions(@Param('telegramId') telegramId: string) {
    return this.financialControlService.getTransactionsByTelegramId(telegramId);
  }
}
