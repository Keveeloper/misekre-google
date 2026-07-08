import { ErrorCode } from '../../common/errors/error-codes.enum';
import { KpiModule, KpiStatus } from '../kpi.enums';

/** Nombre del evento que viaja por el bus interno. */
export const OPERATION_OUTCOME_EVENT = 'operation.outcome';

/** Datos que describen el resultado de una operación monitoreada. */
export interface OperationOutcomeProps {
  module: KpiModule;
  status: KpiStatus;
  latencyMs: number;
  operation?: string | null;
  errorCode?: ErrorCode | null;
  errorMessage?: string | null;
  telegramId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Evento emitido por el interceptor cuando una operación termina (éxito o
 * fallo). El KpiListener lo recibe de forma asíncrona y lo persiste.
 */
export class OperationOutcomeEvent implements OperationOutcomeProps {
  readonly module: KpiModule;
  readonly status: KpiStatus;
  readonly latencyMs: number;
  readonly operation?: string | null;
  readonly errorCode?: ErrorCode | null;
  readonly errorMessage?: string | null;
  readonly telegramId?: string | null;
  readonly metadata?: Record<string, unknown> | null;

  constructor(props: OperationOutcomeProps) {
    this.module = props.module;
    this.status = props.status;
    this.latencyMs = props.latencyMs;
    this.operation = props.operation ?? null;
    this.errorCode = props.errorCode ?? null;
    this.errorMessage = props.errorMessage ?? null;
    this.telegramId = props.telegramId ?? null;
    this.metadata = props.metadata ?? null;
  }
}
