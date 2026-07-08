import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KpiService } from '../kpi.service';
import {
  OPERATION_OUTCOME_EVENT,
  OperationOutcomeEvent,
} from '../events/operation-outcome.event';

/**
 * Escucha el resultado de cada operación y persiste el KPI de forma asíncrona.
 *
 * Red de seguridad: todo va envuelto en try/catch. Si la base de datos falla
 * al guardar el KPI:
 *  - la petición del agente NUNCA se ve afectada (esto corre fuera del request);
 *  - la señal NO se pierde en silencio: queda un log de error con el payload
 *    completo, que puede recuperarse/reprocesarse después.
 */
@Injectable()
export class KpiListener {
  private readonly logger = new Logger(KpiListener.name);

  constructor(private readonly kpiService: KpiService) {}

  @OnEvent(OPERATION_OUTCOME_EVENT, { async: true })
  async handleOperationOutcome(event: OperationOutcomeEvent): Promise<void> {
    try {
      await this.kpiService.recordEvent(event);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Fallo al registrar KPI [${event.module}/${event.status}]: ${reason} | payload=${JSON.stringify(
          event,
        )}`,
      );
    }
  }
}
