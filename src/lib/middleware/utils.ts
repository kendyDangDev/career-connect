import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIP } from './auth';

/**
 * Audit log helper for tracking admin and user actions
 */
export async function createAuditLog(
  userId: string,
  action: string,
  tableName: string,
  recordId: string,
  oldValues?: any,
  newValues?: any,
  request?: NextRequest
) {
  try {
    const ipAddress = request ? getClientIP(request) : 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't break the main operation
  }
}

/**
 * Rate limiting helper using in-memory storage (for development)
 * For production, consider using Redis or a dedicated rate limiting service
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    const resetTime = now + windowMs;
    requestCounts.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime,
    };
  }

  if (userLimit.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userLimit.resetTime,
    };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: limit - userLimit.count,
    resetTime: userLimit.resetTime,
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  limit: number = 100,
  windowMs: number = 60000,
  keyGenerator?: (req: NextRequest) => string
) {
  return function (
    handler: (req: NextRequest) => Promise<NextResponse>
  ): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest) => {
      const key = keyGenerator ? keyGenerator(req) : getClientIP(req);
      const result = checkRateLimit(key, limit, windowMs);

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            resetTime: new Date(result.resetTime).toISOString(),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
            },
          }
        );
      }

      const response = await handler(req);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    };
  };
}

/**
 * Standard success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standard error response helper
 */
export function errorResponse(
  error: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Conflict response helper (409 status)
 */
export function conflictResponse(
  message: string = 'Resource already exists',
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'CONFLICT',
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status: 409 }
  );
}

/**
 * Unauthorized response helper (401 status)
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized - Authentication required'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'UNAUTHORIZED',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Forbidden response helper (403 status)
 */
export function forbiddenResponse(
  message: string = 'Forbidden - Insufficient permissions'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'FORBIDDEN',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

/**
 * Server error response helper (500 status)
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  error?: any
): NextResponse {
  // Log the error for debugging
  if (error) {
    console.error('Server Error:', error);
  }
  
  return NextResponse.json(
    {
      success: false,
      error: 'SERVER_ERROR',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  status: number = 200
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Validation error response helper (for Zod or similar validation errors)
 */
export function validationErrorResponse(
  message: string = 'Validation failed',
  errors: any[] = []
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'VALIDATION_ERROR',
      message,
      details: errors,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * Helper to safely parse JSON request body
 */
export async function parseJsonBody<T = any>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json();
  } catch (error) {
    console.error('Failed to parse JSON body:', error);
    return null;
  }
}

/**
 * Helper to safely parse URL search parameters with validation
 */
export function parseSearchParams(
  searchParams: URLSearchParams,
  schema?: Record<string, 'string' | 'number' | 'boolean'>
): Record<string, any> {
  const params: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (schema && schema[key]) {
      switch (schema[key]) {
        case 'number':
          const numValue = Number(value);
          params[key] = isNaN(numValue) ? undefined : numValue;
          break;
        case 'boolean':
          params[key] = value === 'true' || value === '1';
          break;
        default:
          params[key] = value;
      }
    } else {
      params[key] = value;
    }
  }

  return params;
}

/**
 * CORS helper for API routes
 */
export function corsHeaders(origin?: string) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400');

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  return headers;
}

/**
 * CORS middleware
 */
export function withCors(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  }
) {
  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(
          Array.isArray(options?.origin) 
            ? options.origin[0] 
            : options?.origin
        ),
      });
    }

    const response = await handler(req);
    
    // Add CORS headers to response
    const corsHeadersMap = corsHeaders(
      Array.isArray(options?.origin) 
        ? options.origin[0] 
        : options?.origin
    );
    
    for (const [key, value] of corsHeadersMap.entries()) {
      response.headers.set(key, value);
    }

    return response;
  };
}

/**
 * Request logging helper
 */
export function logRequest(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
}

/**
 * Request logging middleware
 */
export function withRequestLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    logRequest(req);
    const start = Date.now();
    
    try {
      const response = await handler(req);
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${response.status} - ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - ERROR - ${duration}ms:`, error);
      throw error;
    }
  };
}