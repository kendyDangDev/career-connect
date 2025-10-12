/**
 * Application Error Codes
 * Standardized error codes for consistent error handling across the application
 */
export enum ErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Application-specific errors
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  APPLICATION_STATUS_INVALID = 'APPLICATION_STATUS_INVALID',
  APPLICATION_UPDATE_FAILED = 'APPLICATION_UPDATE_FAILED',
  APPLICATION_DELETE_FAILED = 'APPLICATION_DELETE_FAILED',
  
  // Job-specific errors
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  JOB_EXPIRED = 'JOB_EXPIRED',
  JOB_NOT_ACTIVE = 'JOB_NOT_ACTIVE',
  JOB_QUOTA_EXCEEDED = 'JOB_QUOTA_EXCEEDED',
  
  // Company-specific errors
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  COMPANY_NOT_VERIFIED = 'COMPANY_NOT_VERIFIED',
  COMPANY_SUSPENDED = 'COMPANY_SUSPENDED',
  
  // User-specific errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // File upload errors
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  
  // Email errors
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  EMAIL_TEMPLATE_NOT_FOUND = 'EMAIL_TEMPLATE_NOT_FOUND',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Timeline errors
  TIMELINE_NOT_FOUND = 'TIMELINE_NOT_FOUND',
  TIMELINE_UPDATE_FAILED = 'TIMELINE_UPDATE_FAILED',
  
  // Interview errors
  INTERVIEW_NOT_FOUND = 'INTERVIEW_NOT_FOUND',
  INTERVIEW_ALREADY_SCHEDULED = 'INTERVIEW_ALREADY_SCHEDULED',
  INTERVIEW_TIME_CONFLICT = 'INTERVIEW_TIME_CONFLICT',
}

/**
 * Application Error class for structured error handling
 */
export class ApplicationError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

/**
 * Helper function to create standard error responses
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number = 500,
  details?: any
) {
  return {
    success: false,
    error: message,
    code,
    ...(details && { details }),
  };
}

/**
 * Map error codes to HTTP status codes
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.APPLICATION_NOT_FOUND]: 404,
  [ErrorCode.APPLICATION_ALREADY_EXISTS]: 409,
  [ErrorCode.APPLICATION_STATUS_INVALID]: 400,
  [ErrorCode.APPLICATION_UPDATE_FAILED]: 500,
  [ErrorCode.APPLICATION_DELETE_FAILED]: 500,
  [ErrorCode.JOB_NOT_FOUND]: 404,
  [ErrorCode.JOB_EXPIRED]: 400,
  [ErrorCode.JOB_NOT_ACTIVE]: 400,
  [ErrorCode.JOB_QUOTA_EXCEEDED]: 429,
  [ErrorCode.COMPANY_NOT_FOUND]: 404,
  [ErrorCode.COMPANY_NOT_VERIFIED]: 403,
  [ErrorCode.COMPANY_SUSPENDED]: 403,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.USER_NOT_VERIFIED]: 403,
  [ErrorCode.USER_SUSPENDED]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.ACCESS_DENIED]: 403,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.FILE_UPLOAD_FAILED]: 500,
  [ErrorCode.FILE_SIZE_EXCEEDED]: 413,
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: 415,
  [ErrorCode.EMAIL_SEND_FAILED]: 500,
  [ErrorCode.EMAIL_TEMPLATE_NOT_FOUND]: 404,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.TRANSACTION_FAILED]: 500,
  [ErrorCode.TIMELINE_NOT_FOUND]: 404,
  [ErrorCode.TIMELINE_UPDATE_FAILED]: 500,
  [ErrorCode.INTERVIEW_NOT_FOUND]: 404,
  [ErrorCode.INTERVIEW_ALREADY_SCHEDULED]: 409,
  [ErrorCode.INTERVIEW_TIME_CONFLICT]: 409,
};

/**
 * Get HTTP status code for an error code
 */
export function getStatusCode(code: ErrorCode): number {
  return ERROR_STATUS_MAP[code] || 500;
}
