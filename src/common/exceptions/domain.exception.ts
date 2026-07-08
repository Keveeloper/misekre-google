import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../errors/error-codes.enum';

/**
 * Excepción base del dominio. Extiende HttpException para integrarse con NestJS,
 * pero además lleva un `errorCode` estable que el filtro y los KPIs usan para
 * clasificar el fallo de forma confiable.
 */
export class DomainException extends HttpException {
  readonly errorCode: ErrorCode;

  constructor(
    message: string,
    errorCode: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
    this.errorCode = errorCode;
  }
}

/** El token de Google no existe, es inválido o expiró. */
export class GoogleTokenException extends DomainException {
  constructor(message = 'El token de Google es inválido o expiró') {
    super(message, ErrorCode.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
  }
}

/** Google Calendar no respondió o devolvió un error de API. */
export class CalendarUnavailableException extends DomainException {
  constructor(message = 'No se pudo contactar Google Calendar') {
    super(message, ErrorCode.GOOGLE_API_ERROR, HttpStatus.BAD_GATEWAY);
  }
}

/** No se encontró el recurso solicitado (usuario, transacción, etc.). */
export class ResourceNotFoundException extends DomainException {
  constructor(message = 'Recurso no encontrado') {
    super(message, ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

/** Datos de entrada inválidos a nivel de negocio. */
export class ValidationException extends DomainException {
  constructor(message = 'Datos inválidos') {
    super(message, ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST);
  }
}

/** Fallo al leer/escribir en la base de datos. */
export class PersistenceException extends DomainException {
  constructor(message = 'Error al acceder a la base de datos') {
    super(message, ErrorCode.DB_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
