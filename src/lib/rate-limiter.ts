import { NextRequest, NextResponse } from 'next/server';

interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  statusCode?: number;
}

interface RequestInfo {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis or a database)
const requestStore = new Map<string, RequestInfo>();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of requestStore.entries()) {
      if (now > value.resetTime) {
        requestStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export function createRateLimiter(options: RateLimiterOptions) {
  return (request: NextRequest): NextResponse | null => {
    const ip = getClientIP(request);
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    const requestInfo = requestStore.get(key);

    if (!requestInfo) {
      // First request from this IP for this endpoint
      requestStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return null; // Allow request
    }

    if (now > requestInfo.resetTime) {
      // Window has expired, reset
      requestStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return null; // Allow request
    }

    if (requestInfo.count >= options.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: options.message || 'Too many requests',
          retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000),
        },
        { status: options.statusCode || 429 }
      );
    }

    // Increment counter
    requestInfo.count++;
    requestStore.set(key, requestInfo);

    return null; // Allow request
  };
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  if (clientIP) {
    return clientIP.trim();
  }

  // Fallback to unknown if no IP found
  return 'unknown';
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.',
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  // maxRequests: 3, // 3 registrations per hour
  message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
});

export const emailRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1, // 1 email per minute
  message: 'Vui lòng đợi ít nhất 1 phút trước khi gửi email tiếp theo.',
});

export const smsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1, // 1 SMS per minute
  message: 'Vui lòng đợi ít nhất 1 phút trước khi gửi SMS tiếp theo.',
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
});
