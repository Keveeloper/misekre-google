import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { KpiModule } from '../kpi.enums';

/** Filtros opcionales para consultar la vista agregada de KPIs. */
export class GetKpiSummaryDto {
  @IsOptional()
  @IsEnum(KpiModule)
  module?: KpiModule;

  /** Fecha inicial inclusiva (YYYY-MM-DD). */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Fecha final inclusiva (YYYY-MM-DD). */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
