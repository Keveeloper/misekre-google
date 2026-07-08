import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { encode } from '@toon-format/toon';
import { classifyError } from '../errors/error-classifier';

/**
 * Filtro global de excepciones. Captura CUALQUIER error no controlado, lo
 * clasifica en un formato estable y responde de forma consistente.
 *
 * Respeta el formato de cada módulo automáticamente:
 *  - Si la ruta ya fijó Content-Type text/plain (módulo financial-control con
 *    TOON), el error también se serializa en TOON.
 *  - En cualquier otro caso responde JSON.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { errorCode, message, status } = classifyError(exception);

    const payload = {
      status: 'error',
      errorCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Log estructurado: método, ruta, estado, código y stack si existe.
    this.logger.error(
      `${request.method} ${request.url} -> ${status} ${errorCode}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const contentType = response.getHeader('content-type');
    const wantsToon =
      typeof contentType === 'string' && contentType.includes('text/plain');

    if (wantsToon) {
      response.status(status).send(encode(payload));
    } else {
      response.status(status).json(payload);
    }
  }
}
