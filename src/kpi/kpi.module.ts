import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiEvent } from './entities/kpi-event.entity';
import { KpiDailySummary } from './entities/kpi-daily-summary.view';
import { KpiService } from './kpi.service';
import { KpiListener } from './listeners/kpi.listener';
import { KpiInterceptor } from './interceptors/kpi.interceptor';
import { KpiController } from './kpi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KpiEvent, KpiDailySummary])],
  controllers: [KpiController],
  providers: [
    KpiService,
    KpiListener,
    // Interceptor global: solo actúa sobre handlers marcados con @TrackKpi.
    { provide: APP_INTERCEPTOR, useClass: KpiInterceptor },
  ],
  exports: [KpiService],
})
export class KpiModule {}
