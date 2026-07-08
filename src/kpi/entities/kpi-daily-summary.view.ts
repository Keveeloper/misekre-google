import { ViewColumn, ViewEntity } from 'typeorm';

/**
 * Vista agregada de KPIs por módulo y día. TypeORM la crea automáticamente
 * (con synchronize) a partir de la tabla kpi_events. Siempre está fresca:
 * se calcula al consultarla, sin necesidad de refresh.
 */
@ViewEntity({
  name: 'kpi_daily_summary',
  expression: `
    SELECT
      "module"                                                         AS "module",
      date_trunc('day', "created_at")::date                            AS "day",
      COUNT(*) FILTER (WHERE "status" = 'SUCCESS')                     AS "success_count",
      COUNT(*) FILTER (WHERE "status" = 'FAILURE')                     AS "failure_count",
      COUNT(*)                                                         AS "total",
      ROUND(
        COUNT(*) FILTER (WHERE "status" = 'SUCCESS')::numeric
        / NULLIF(COUNT(*), 0) * 100, 2
      )                                                                AS "success_rate",
      ROUND(AVG("latency_ms"))                                         AS "avg_latency_ms"
    FROM "kpi_events"
    GROUP BY "module", date_trunc('day', "created_at")::date
  `,
})
export class KpiDailySummary {
  @ViewColumn()
  module: string;

  @ViewColumn()
  day: string;

  @ViewColumn({ name: 'success_count' })
  successCount: number;

  @ViewColumn({ name: 'failure_count' })
  failureCount: number;

  @ViewColumn()
  total: number;

  @ViewColumn({ name: 'success_rate' })
  successRate: number;

  @ViewColumn({ name: 'avg_latency_ms' })
  avgLatencyMs: number;
}
