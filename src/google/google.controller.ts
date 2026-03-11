import {
  Controller,
  Get,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { ConfigService } from '@nestjs/config';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
  ) {}

  @Get('login')
  login() {
    return { url: this.googleService.getAuthUrl() };
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokens = await this.googleService.getTokens(code);
    console.log('--- COPIA ESTO Y GUÁRDALO ---');
    console.log(JSON.stringify(tokens, null, 2));
    return {
      message: 'Tokens generados, revisa la consola de VS Code',
      tokens,
    };
  }

  @Get('events')
  async getEvents(@Headers('x-api-key') apiKey: string) {
    const SECRET_KEY = this.configService.get<string>('MISEKRE_API_KEY');
    if (apiKey !== SECRET_KEY) {
      throw new UnauthorizedException(
        'No tienes permiso para ver esto, perrito.',
      );
    }
    return await this.googleService.getCalendarEvents();
  }
}
