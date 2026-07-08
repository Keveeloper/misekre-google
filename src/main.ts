import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación automática de DTOs (class-validator). Los fallos quedan
  // clasificados como VALIDATION_ERROR por el filtro global.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Manejo de errores unificado para toda la app.
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
