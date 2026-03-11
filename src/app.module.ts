import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleController } from './google/google.controller';
import { GoogleService } from './google/google.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Para que esté disponible en todos los módulos sin re-importar
    }),
    GoogleModule, // Importa tu módulo de Google aquí
  ],
  controllers: [AppController, GoogleController],
  providers: [AppService, GoogleService],
})
export class AppModule {}
