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
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/tasks',
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

  // Lee los tokens desde google-tokens.json y los carga en el oauth2Client
  // (esto gestiona el refresh_token automáticamente).
  private loadCredentials() {
    const tokenPath = join(process.cwd(), 'google-tokens.json');
    if (!fs.existsSync(tokenPath)) {
      throw new Error(`Archivo de tokens no encontrado en: ${tokenPath}`);
    }
    const tokens = JSON.parse(
      fs.readFileSync(tokenPath, 'utf8'),
    ) as Credentials;
    this.oauth2Client.setCredentials(tokens);
  }

  // --- NUEVA FUNCIÓN PARA EVENTOS ---
  async getCalendarEvents() {
    try {
      this.loadCredentials();

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

  // --- NUEVA FUNCIÓN PARA CREAR EVENTOS ---
  async createCalendarEvent(
    summary: string,
    startTime: string,
    endTime: string,
  ) {
    try {
      this.loadCredentials();

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // Estructura del evento que exige Google
      const event = {
        summary: summary,
        start: {
          dateTime: startTime, // Formato esperado: '2026-03-14T10:00:00-05:00'
          timeZone: 'America/Bogota',
        },
        end: {
          dateTime: endTime,
          timeZone: 'America/Bogota',
        },
      };

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return {
        status: 'success',
        message: '¡Evento creado como un rey!',
        link: res.data.htmlLink,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error al crear evento:', errorMessage);
      return {
        status: 'error',
        message: 'Misekre no pudo agendar esto',
        details: errorMessage,
      };
    }
  }

  // --- NUEVA FUNCIÓN PARA OBTENER TAREAS ---
  async getTasks() {
    try {
      this.loadCredentials();

      const tasksApi = google.tasks({
        version: 'v1',
        auth: this.oauth2Client,
      });

      const res = await tasksApi.tasks.list({
        tasklist: '@default',
        maxResults: 20,
        showCompleted: false,
      });

      return res.data.items ?? [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error al obtener tareas:', errorMessage);
      return {
        status: 'error',
        message: 'No se pudieron cargar las tareas',
        details: errorMessage,
      };
    }
  }

  // --- NUEVA FUNCIÓN PARA CREAR TAREAS ---
  async createTask(title: string, notes?: string, due?: string) {
    try {
      this.loadCredentials();

      const tasksApi = google.tasks({
        version: 'v1',
        auth: this.oauth2Client,
      });

      // Google Tasks ignora la hora en `due`: solo almacena la fecha (medianoche UTC).
      const requestBody: { title: string; notes?: string; due?: string } = {
        title,
      };
      if (notes) requestBody.notes = notes;
      if (due) requestBody.due = due; // RFC3339, p.ej. '2026-07-15T00:00:00.000Z'

      const res = await tasksApi.tasks.insert({
        tasklist: '@default',
        requestBody,
      });

      return {
        status: 'success',
        message: '¡Tarea creada como un rey!',
        link: res.data.selfLink,
        id: res.data.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error al crear tarea:', errorMessage);
      return {
        status: 'error',
        message: 'Misekre no pudo crear la tarea',
        details: errorMessage,
      };
    }
  }
}
