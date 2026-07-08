import {
  Controller,
  Get,
  Header,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { encode } from '@toon-format/toon';
import { KpiService } from './kpi.service';
import { GetKpiSummaryDto } from './dto/get-kpi-summary.dto';

@Controller('kpi')
export class KpiController {
  constructor(
    private readonly kpiService: KpiService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Devuelve los KPIs agregados por módulo y día, en TOON (consistente con el
   * ahorro de tokens del resto de la app). Protegido con la misma x-api-key.
   *
   * Ej: GET /kpi/summary?module=CALENDAR&from=2026-06-01&to=2026-06-30
   */
  @Get('summary')
  @Header('Content-Type', 'text/plain')
  async getSummary(
    @Headers('x-api-key') apiKey: string,
    @Query() filter: GetKpiSummaryDto,
  ) {
    const secret = this.configService.get<string>('MISEKRE_API_KEY');
    if (apiKey !== secret) {
      throw new UnauthorizedException('No tienes permiso para ver esto.');
    }

    const rows = await this.kpiService.getSummary(filter);

    // La vista entrega COUNT/AVG como string (bigint/numeric de Postgres):
    // los normalizamos a número para una salida limpia.
    const cleanData = rows.map((r) => ({
      module: r.module,
      day: r.day,
      successCount: Number(r.successCount),
      failureCount: Number(r.failureCount),
      total: Number(r.total),
      successRate: Number(r.successRate),
      avgLatencyMs: r.avgLatencyMs === null ? null : Number(r.avgLatencyMs),
    }));

    return encode(JSON.parse(JSON.stringify(cleanData)));
  }
}
