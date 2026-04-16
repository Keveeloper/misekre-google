import { Controller, Post, Body, Get, Param, Header, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { FinancialControlService } from './financial-control.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { encode } from '@toon-format/toon';
import { CategoryType } from './entities/category.entity';

@Controller('financial-control')
export class FinancialControlController {
  constructor(private readonly financialControlService: FinancialControlService) {}

  @Post('transaction')
  @Header('Content-Type', 'text/plain')
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Res({ passthrough: true }) res: Response) {
    try {
      const data = await this.financialControlService.createTransaction(createTransactionDto);
      const cleanData = { id: data.id, amount: Number(data.amount), type: data.type, date: data.date };
      return encode(JSON.parse(JSON.stringify(cleanData)));
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST);
      return encode({ error: true, message: error.message });
    }
  }

  @Get('transactions/:telegramId')
  @Header('Content-Type', 'text/plain')
  async getTransactions(@Param('telegramId') telegramId: string, @Res({ passthrough: true }) res: Response) {
    try {
      const data = await this.financialControlService.getTransactionsByTelegramId(telegramId);
      const cleanData = data.map(tx => ({ id: tx.id, amount: Number(tx.amount), type: tx.type, date: tx.date }));
      return encode(JSON.parse(JSON.stringify(cleanData)));
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND);
      return encode({ error: true, message: error.message || 'User not found' });
    }
  }

  @Get('transactions/:telegramId/date/:date')
  @Header('Content-Type', 'text/plain')
  async getTransactionsByDate(
    @Param('telegramId') telegramId: string,
    @Param('date') date: string,
    @Query('type') type: CategoryType | undefined,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const data = await this.financialControlService.getTransactionsByDate(telegramId, date, type);
      const cleanData = data.map(tx => ({ id: tx.id, amount: Number(tx.amount), type: tx.type, date: tx.date }));
      return encode(JSON.parse(JSON.stringify(cleanData)));
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND);
      return encode({ error: true, message: error.message || 'Error fetching transactions' });
    }
  }
}
