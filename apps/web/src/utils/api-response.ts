import { NextResponse } from 'next/server';

// Success response wrapper
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data
  }, { status: statusCode });
}

// Error response wrapper
export function errorResponse(
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    ...(details && { details })
  }, { status: statusCode });
}

// Pagination metadata builder
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// Paginated response wrapper
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse {
  return successResponse({
    data,
    pagination: buildPaginationMeta(page, limit, total)
  }, message);
}

// Validation error response
export function validationErrorResponse(
  errors: Record<string, string | string[]>
): NextResponse {
  return errorResponse(
    'Validation failed',
    400,
    errors
  );
}

// Not found response
export function notFoundResponse(
  resource: string
): NextResponse {
  return errorResponse(
    `${resource} not found`,
    404
  );
}

// Unauthorized response
export function unauthorizedResponse(
  message: string = 'Unauthorized access'
): NextResponse {
  return errorResponse(message, 401);
}

// Forbidden response
export function forbiddenResponse(
  message: string = 'Access forbidden'
): NextResponse {
  return errorResponse(message, 403);
}

// Internal server error response
export function serverErrorResponse(
  message: string = 'Internal server error',
  error?: any
): NextResponse {
  // Log the error for debugging
  if (error) {
    console.error('Server error:', error);
  }
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return errorResponse(
    message,
    500,
    isDevelopment && error ? { 
      error: error.message || String(error),
      stack: error.stack 
    } : undefined
  );
}

// Conflict response (for duplicate resources)
export function conflictResponse(
  message: string
): NextResponse {
  return errorResponse(message, 409);
}

// Success response with no content
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// Method not allowed response
export function methodNotAllowedResponse(
  allowedMethods: string[]
): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    allowedMethods
  }, { 
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', ')
    }
  });
}

// Parse query parameters with defaults
export function parseQueryParams(
  searchParams: URLSearchParams,
  defaults: Record<string, any> = {}
): Record<string, any> {
  const params: Record<string, any> = { ...defaults };
  
  for (const [key, value] of searchParams.entries()) {
    // Handle array parameters (e.g., jobType[]=FULL_TIME&jobType[]=PART_TIME)
    if (key.endsWith('[]')) {
      const actualKey = key.slice(0, -2);
      if (!params[actualKey]) {
        params[actualKey] = [];
      }
      params[actualKey].push(value);
    } else {
      // Handle boolean values
      if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      }
      // Handle numeric values
      else if (!isNaN(Number(value)) && value !== '') {
        params[key] = Number(value);
      }
      // Handle regular string values
      else {
        params[key] = value;
      }
    }
  }
  
  return params;
}

// Extract bearer token from authorization header
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  
  return null;
}

// Format error for response
export function formatError(error: any): {
  message: string;
  code?: string;
  details?: any;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      ...(error.name && { code: error.name })
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && typeof error === 'object') {
    return {
      message: error.message || 'An error occurred',
      code: error.code,
      details: error.details
    };
  }
  
  return { message: 'An unexpected error occurred' };
}
