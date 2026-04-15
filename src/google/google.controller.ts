import {
  Controller,
  Get,
  Query,
  Headers,
  UnauthorizedException,
  Post,
  Body,
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

  // Recuerda importar Post y Body arriba:
  // import { Controller, Get, Post, Body, Query, Headers, UnauthorizedException } from '@nestjs/common';

  @Post('events')
  async createEvent(
    @Headers('x-api-key') apiKey: string,
    @Body() body: { summary: string; startTime: string; endTime: string },
  ) {
    const SECRET_KEY = this.configService.get<string>('MISEKRE_API_KEY');

    if (apiKey !== SECRET_KEY) {
      throw new UnauthorizedException(
        'No tienes permiso para ver esto, perrito.',
      );
    }

    if (!body.summary || !body.startTime || !body.endTime) {
      return {
        status: 'error',
        message: 'Faltan datos (summary, startTime, endTime)',
      };
    }

    return await this.googleService.createCalendarEvent(
      body.summary,
      body.startTime,
      body.endTime,
    );
  }
}
