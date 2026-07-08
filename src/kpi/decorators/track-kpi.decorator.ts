import { SetMetadata } from '@nestjs/common';
import { KpiModule } from '../kpi.enums';

export const TRACK_KPI_KEY = 'track_kpi';

export interface TrackKpiOptions {
  module: KpiModule;
  /** Operación específica (opcional): get_events, create_event, etc. */
  operation?: string;
}

/**
 * Marca un handler de controlador para que el KpiInterceptor registre su
 * resultado. Solo añade metadata: NO altera el comportamiento del endpoint.
 */
export const TrackKpi = (options: TrackKpiOptions) =>
  SetMetadata(TRACK_KPI_KEY, options);
