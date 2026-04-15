import { Controller, Post, Body, Get, Param, Header } from '@nestjs/common';
import { FinancialControlService } from './financial-control.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { encode } from '@toon-format/toon';

@Controller('financial-control')
export class FinancialControlController {
  constructor(private readonly financialControlService: FinancialControlService) {}

  @Post('transaction')
  @Header('Content-Type', 'text/plain')
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    const data = await this.financialControlService.createTransaction(createTransactionDto);
    return encode(JSON.parse(JSON.stringify(data)));
  }

  @Get('transactions/:telegramId')
  @Header('Content-Type', 'text/plain')
  async getTransactions(@Param('telegramId') telegramId: string) {
    const data = await this.financialControlService.getTransactionsByTelegramId(telegramId);
    return encode(JSON.parse(JSON.stringify(data)));
  }
}
