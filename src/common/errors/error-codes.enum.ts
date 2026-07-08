/**
 * Códigos de error estables y enumerados.
 * Se usan tanto en las respuestas HTTP como en el registro de KPIs,
 * para poder responder a la pregunta "¿QUÉ falló?" y no solo "¿falló?".
 */
export enum ErrorCode {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED', // Token de Google inválido o expirado
  GOOGLE_API_ERROR = 'GOOGLE_API_ERROR', // Fallo al contactar la API de Google
  DB_ERROR = 'DB_ERROR', // Error de persistencia (PostgreSQL / TypeORM)
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Datos de entrada inválidos
  NOT_FOUND = 'NOT_FOUND', // Recurso no encontrado
  UNAUTHORIZED = 'UNAUTHORIZED', // API key inválida / sin permiso
  UNKNOWN = 'UNKNOWN', // Cualquier fallo no clasificado
}
