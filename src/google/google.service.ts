import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import * as fs from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleService {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/google/callback',
    );
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'email',
        'profile',
      ],
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // --- NUEVA FUNCIÓN PARA EVENTOS ---
  async getCalendarEvents() {
    try {
      // Intentamos leer el archivo de tokens desde la raíz del proyecto en Docker
      const tokenPath = join(process.cwd(), 'google-tokens.json');
      if (!fs.existsSync(tokenPath)) {
        throw new Error(`Archivo de tokens no encontrado en: ${tokenPath}`);
      }

      // leyendo y tipando los tokens para evitar la asignación `any`
      const tokens = JSON.parse(
        fs.readFileSync(tokenPath, 'utf8'),
      ) as Credentials;

      // Cargamos las credenciales (esto gestiona el refresh_token automáticamente)
      this.oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return res.data.items;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error al obtener eventos:', errorMessage);
      return {
        status: 'error',
        message: 'No se pudieron cargar los eventos',
        details: errorMessage,
      };
    }
  }
}
