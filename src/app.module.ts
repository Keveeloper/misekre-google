import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleController } from './google/google.controller';
import { GoogleService } from './google/google.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleModule } from './google/google.module';
import { UsersModule } from './users/users.module';
import { FinancialControlModule } from './financial-control/financial-control.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Para que esté disponible en todos los módulos sin re-importar
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5434', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // ¡ATENCIÓN! No usar en producción (preferible usar migraciones)
    }),
    GoogleModule, // Importa tu módulo de Google aquí
    UsersModule,
    FinancialControlModule,
  ],
  controllers: [AppController, GoogleController],
  providers: [AppService, GoogleService],
})
export class AppModule {}
