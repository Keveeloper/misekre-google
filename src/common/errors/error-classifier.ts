import { HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';
import { ErrorCode } from './error-codes.enum';

/** Resultado de clasificar cualquier error en valores estables. */
export interface ClassifiedError {
  errorCode: ErrorCode;
  message: string;
  status: number;
}

/**
 * Traduce CUALQUIER error (excepción del dominio, excepción de NestJS,
 * error de la API de Google, error de TypeORM o desconocido) a un
 * { errorCode, message, status } estable. Es la pieza que garantiza que
 * el KPI de fallo sepa QUÉ falló, no solo que falló.
 */
export function classifyError(error: unknown): ClassifiedError {
  // 1) Nuestras excepciones tipadas: ya traen toda la información.
  if (error instanceof DomainException) {
    return {
      errorCode: error.errorCode,
      message: error.message,
      status: error.getStatus(),
    };
  }

  // 2) Excepciones nativas de NestJS (UnauthorizedException, NotFound, etc.).
  if (error instanceof HttpException) {
    const status = error.getStatus();
    return {
      errorCode: mapStatusToErrorCode(status),
      message: error.message,
      status,
    };
  }

  // 3) Errores de persistencia de TypeORM.
  if (error instanceof QueryFailedError) {
    return {
      errorCode: ErrorCode.DB_ERROR,
      message: 'Error al acceder a la base de datos',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  // 4) Errores de la API de Google (googleapis / gaxios).
  const googleError = classifyGoogleError(error);
  if (googleError) {
    return googleError;
  }

  // 5) Cualquier otro caso: desconocido.
  return {
    errorCode: ErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : String(error),
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}

export function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
    case HttpStatus.FORBIDDEN:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCode.VALIDATION_ERROR;
    default:
      return ErrorCode.UNKNOWN;
  }
}

/**
 * Detecta errores propios de la integración con Google. googleapis usa gaxios,
 * cuyos errores exponen `code` y/o `response.status`, y para credenciales
 * caducadas suelen incluir `invalid_grant`.
 */
function classifyGoogleError(error: unknown): ClassifiedError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const err = error as {
    code?: number | string;
    message?: string;
    response?: { status?: number; data?: { error?: string } };
  };

  const status = err.response?.status ?? toNumber(err.code);
  const rawMessage = err.message ?? '';
  const oauthError = err.response?.data?.error ?? '';
  const looksLikeGoogle =
    status !== undefined ||
    /invalid_grant|google|calendar|oauth/i.test(`${rawMessage} ${oauthError}`);

  if (!looksLikeGoogle) {
    return null;
  }

  // Credenciales caducadas / inválidas.
  if (status === 401 || /invalid_grant/i.test(`${rawMessage} ${oauthError}`)) {
    return {
      errorCode: ErrorCode.TOKEN_EXPIRED,
      message: 'El token de Google es inválido o expiró',
      status: HttpStatus.UNAUTHORIZED,
    };
  }

  // Cualquier otro fallo de la API de Google.
  return {
    errorCode: ErrorCode.GOOGLE_API_ERROR,
    message: rawMessage || 'Error al contactar la API de Google',
    status: HttpStatus.BAD_GATEWAY,
  };
}

function toNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return undefined;
}
