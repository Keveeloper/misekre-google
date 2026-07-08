import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  classifyError,
  mapStatusToErrorCode,
} from '../../common/errors/error-classifier';
import { ErrorCode } from '../../common/errors/error-codes.enum';
import {
  TRACK_KPI_KEY,
  TrackKpiOptions,
} from '../decorators/track-kpi.decorator';
import {
  OPERATION_OUTCOME_EVENT,
  OperationOutcomeEvent,
} from '../events/operation-outcome.event';
import { KpiStatus } from '../kpi.enums';

interface SoftFailure {
  errorCode: ErrorCode;
  message: string;
}

/**
 * Observa el resultado de los handlers marcados con @TrackKpi y emite un
 * evento `operation.outcome` (éxito o fallo). Es puramente observacional:
 * con `tap` no modifica la respuesta y con `catchError` relanza el error tal
 * cual, así que NO cambia el comportamiento de los endpoints existentes.
 */
@Injectable()
export class KpiInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.get<TrackKpiOptions | undefined>(
      TRACK_KPI_KEY,
      context.getHandler(),
    );

    // Ruta no monitoreada: pasa de largo sin tocar nada.
    if (!options) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<{ statusCode: number }>();
    const start = Date.now();
    const telegramId = this.extractTelegramId(request);

    return next.handle().pipe(
      tap((value) => {
        // El handler retornó normalmente, pero podría ser un "soft error".
        const soft = this.detectSoftFailure(value, response.statusCode);
        if (soft) {
          this.emit(options, KpiStatus.FAILURE, start, telegramId, soft);
        } else {
          this.emit(options, KpiStatus.SUCCESS, start, telegramId);
        }
      }),
      catchError((err: unknown) => {
        const { errorCode, message } = classifyError(err);
        this.emit(options, KpiStatus.FAILURE, start, telegramId, {
          errorCode,
          message,
        });
        // Relanzamos intacto: el filtro global arma la respuesta.
        return throwError(() => err);
      }),
    );
  }

  /** Detecta fallos que el handler devolvió como valor (sin lanzar). */
  private detectSoftFailure(
    value: unknown,
    statusCode: number,
  ): SoftFailure | null {
    // 1) financial-control fija status 400/404 en errores controlados.
    if (statusCode >= 400) {
      return {
        errorCode: mapStatusToErrorCode(statusCode),
        message: `HTTP ${statusCode}`,
      };
    }

    // 2) google devuelve { status:'error' } o { error:true } con HTTP 200.
    if (value && typeof value === 'object') {
      const obj = value as {
        status?: string;
        error?: boolean;
        message?: string;
        details?: string;
      };
      if (obj.status === 'error' || obj.error === true) {
        const reason = obj.details || obj.message || 'Error';
        // Reusamos la clasificación heurística (detecta token expirado, etc.).
        const { errorCode, message } = classifyError(new Error(reason));
        return { errorCode, message };
      }
    }

    return null;
  }

  private emit(
    options: TrackKpiOptions,
    status: KpiStatus,
    start: number,
    telegramId: string | null,
    failure?: SoftFailure,
  ): void {
    const event = new OperationOutcomeEvent({
      module: options.module,
      operation: options.operation ?? null,
      status,
      latencyMs: Date.now() - start,
      telegramId,
      errorCode: failure?.errorCode ?? null,
      errorMessage: failure?.message ?? null,
    });
    this.eventEmitter.emit(OPERATION_OUTCOME_EVENT, event);
  }

  private extractTelegramId(request: Request): string | null {
    const fromParams = (request.params as Record<string, string> | undefined)
      ?.telegramId;
    const fromBody = (request.body as Record<string, unknown> | undefined)
      ?.telegramId;
    if (fromParams) return fromParams;
    if (typeof fromBody === 'string') return fromBody;
    return null;
  }
}
