import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { KpiModule, KpiStatus } from '../kpi.enums';

/**
 * Tabla cruda de KPIs (append-only). Una fila por cada intento de operación
 * del agente, con su resultado y dimensiones. Los conteos y tendencias se
 * calculan después con la vista `kpi_daily_summary`.
 */
@Entity('kpi_events')
@Index(['module', 'createdAt'])
@Index(['status'])
@Index(['telegramId'])
export class KpiEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  module: KpiModule;

  /** Operación específica (get_events, create_event…). Opcional por ahora. */
  @Column({ type: 'varchar', nullable: true })
  operation: string | null;

  @Column({ type: 'varchar' })
  status: KpiStatus;

  /** Latencia de la operación en milisegundos. */
  @Column({ name: 'latency_ms', type: 'int', nullable: true })
  latencyMs: number | null;

  /** Código de error estable cuando status = FAILURE. */
  @Column({ name: 'error_code', type: 'varchar', nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  /** Usuario (telegramId) que originó la operación. */
  @Column({ name: 'telegram_id', type: 'varchar', nullable: true })
  telegramId: string | null;

  /** Datos extra flexibles sin necesidad de migrar la tabla. */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  // Mismo patrón que el resto de entidades (transactions, users): CreateDateColumn
  // simple. Con el contenedor en TZ America/Bogota, queda en hora local de Bogotá.
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
