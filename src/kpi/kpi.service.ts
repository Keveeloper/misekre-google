import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiEvent } from './entities/kpi-event.entity';
import { KpiDailySummary } from './entities/kpi-daily-summary.view';
import { OperationOutcomeEvent } from './events/operation-outcome.event';
import { KpiModule } from './kpi.enums';

export interface KpiSummaryFilter {
  module?: KpiModule;
  from?: string; // YYYY-MM-DD inclusive
  to?: string; // YYYY-MM-DD inclusive
}

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(KpiEvent)
    private readonly kpiEventRepo: Repository<KpiEvent>,
    @InjectRepository(KpiDailySummary)
    private readonly summaryRepo: Repository<KpiDailySummary>,
  ) {}

  /**
   * Persiste un evento de KPI. No captura errores a propósito: el KpiListener
   * es quien aísla cualquier fallo de escritura (red de seguridad).
   */
  async recordEvent(event: OperationOutcomeEvent): Promise<void> {
    const entity = this.kpiEventRepo.create({
      module: event.module,
      operation: event.operation,
      status: event.status,
      latencyMs: event.latencyMs,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      telegramId: event.telegramId,
      metadata: event.metadata,
    });
    await this.kpiEventRepo.save(entity);
  }

  /** Lee la vista agregada con filtros opcionales por módulo y rango de fechas. */
  async getSummary(filter: KpiSummaryFilter = {}): Promise<KpiDailySummary[]> {
    const qb = this.summaryRepo.createQueryBuilder('s');

    if (filter.module) {
      qb.andWhere('s.module = :module', { module: filter.module });
    }
    if (filter.from) {
      qb.andWhere('s.day >= :from', { from: filter.from });
    }
    if (filter.to) {
      qb.andWhere('s.day <= :to', { to: filter.to });
    }

    return qb.orderBy('s.day', 'DESC').addOrderBy('s.module', 'ASC').getMany();
  }
}
