/**
 * Middleware Index
 * 
 * This file provides centralized exports for all middleware functions,
 * making it easy to import and use middleware throughout the application.
 */

// Authentication middleware
export {
  withAuth,
  withRole,
  withAdmin,
  withPermission,
  withAnyPermission,
  withAllPermissions,
  withOwnership,
  withOptionalAuth,
  authenticateUser,
  authenticate,
  getClientIP,
  getUserFromRequest,
  type AuthenticatedRequest,
} from './auth';

// Company-specific middleware
export {
  withCompanyAuth,
  withCompanyRole,
  withVerifiedCompany,
  hasCompanyRole,
  canManageCompany,
  canPostJobs,
  canViewCandidates,
  getCompanyByUserId,
  type CompanyAuthenticatedRequest,
} from './company-auth';

// Utility middleware and helpers
export {
  createAuditLog,
  checkRateLimit,
  withRateLimit,
  successResponse,
  errorResponse,
  conflictResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  paginatedResponse,
  validationErrorResponse,
  parseJsonBody,
  parseSearchParams,
  corsHeaders,
  withCors,
  logRequest,
  withRequestLogging,
} from './utils';

// Global middleware for Next.js
export { middleware as globalMiddleware, config } from './global';

// Re-export common types for convenience
export type { NextRequest, NextResponse } from 'next/server';
export type { UserType, CompanyRole } from '@/generated/prisma';

/**
 * Common middleware combinations for easy use
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from './auth';
import { createAuditLog, withRequestLogging } from './utils';
import { AuthenticatedRequest } from './auth';

/**
 * Admin middleware with automatic audit logging
 */
export function withAdminAudit(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  options?: {
    action?: string;
    tableName?: string;
    skipLogging?: boolean;
  }
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return withAdmin(async (req: AuthenticatedRequest, context?: any) => {
    const response = await handler(req, context);

    // Auto-audit logging if not skipped
    if (!options?.skipLogging && req.user) {
      try {
        const action = options?.action || `${req.method}_${req.url.split('/').pop()?.toUpperCase()}`;
        const tableName = options?.tableName || 'unknown';
        
        await createAuditLog(
          req.user.id,
          action,
          tableName,
          'admin_action',
          undefined,
          { method: req.method, url: req.url, status: response.status },
          req
        );
      } catch (error) {
        console.error('Auto-audit logging failed:', error);
      }
    }

    return response;
  });
}

/**
 * Admin middleware with rate limiting and request logging
 */
export function withSecureAdmin(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  rateLimit?: { limit: number; windowMs: number }
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  let middleware = withAdmin(handler);

  // Add rate limiting if specified
  if (rateLimit) {
    const { withRateLimit } = require('./utils');
    middleware = withRateLimit(rateLimit.limit, rateLimit.windowMs)(middleware);
  }

  // Add request logging
  middleware = withRequestLogging(middleware);

  return middleware;
}