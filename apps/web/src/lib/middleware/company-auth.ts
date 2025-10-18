import { NextRequest, NextResponse } from 'next/server';
import { CompanyRole } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from './auth';

export interface CompanyAuthenticatedRequest extends AuthenticatedRequest {
  company?: {
    id: string;
    companyName: string;
    verificationStatus: string;
    role: CompanyRole;
  };
}

/**
 * Middleware to verify user is an employer and has access to company
 */
export function withCompanyAuth(
  handler: (req: CompanyAuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (req.user?.userType !== 'EMPLOYER' && req.user?.userType !== 'ADMIN') {
        return NextResponse.json(
          { error: "Forbidden - You can't access this resource" },
          { status: 403 }
        );
      }

      // Get company user relationship
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          userId: req.user.id,
        },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              verificationStatus: true,
            },
          },
        },
      });

      if (!companyUser) {
        return NextResponse.json(
          { error: 'You are not associated with any company' },
          { status: 403 }
        );
      }

      // Add company info to request
      const companyReq = req as CompanyAuthenticatedRequest;
      companyReq.company = {
        id: companyUser.companyId,
        companyName: companyUser.company.companyName,
        verificationStatus: companyUser.company.verificationStatus,
        role: companyUser.role,
      };

      return handler(companyReq, context);
    })(req);
  };
}

/**
 * Middleware to verify company role permissions
 */
export function withCompanyRole(
  requiredRoles: CompanyRole[],
  handler: (req: CompanyAuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withCompanyAuth(async (req: CompanyAuthenticatedRequest) => {
      if (!req.company || !requiredRoles.includes(req.company.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient company role permissions' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req, context);
  };
}

/**
 * Middleware to verify company is verified
 */
export function withVerifiedCompany(
  handler: (req: CompanyAuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withCompanyAuth(async (req: CompanyAuthenticatedRequest) => {
      if (!req.company || req.company.verificationStatus !== 'VERIFIED') {
        return NextResponse.json(
          { error: 'Company is not verified. Please complete verification process.' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req, context);
  };
}

/**
 * Check if user has specific company role
 */
export function hasCompanyRole(userRole: CompanyRole, requiredRoles: CompanyRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user can manage company (ADMIN or HR_MANAGER)
 */
export function canManageCompany(userRole: CompanyRole): boolean {
  return hasCompanyRole(userRole, [CompanyRole.ADMIN, CompanyRole.HR_MANAGER]);
}

/**
 * Check if user can post jobs (any role)
 */
export function canPostJobs(userRole: CompanyRole): boolean {
  return hasCompanyRole(userRole, [
    CompanyRole.ADMIN,
    CompanyRole.HR_MANAGER,
    CompanyRole.RECRUITER,
  ]);
}

/**
 * Check if user can view candidates (any role)
 */
export function canViewCandidates(userRole: CompanyRole): boolean {
  return hasCompanyRole(userRole, [
    CompanyRole.ADMIN,
    CompanyRole.HR_MANAGER,
    CompanyRole.RECRUITER,
  ]);
}

/**
 * Get company by user ID (utility function)
 */
export async function getCompanyByUserId(userId: string) {
  const companyUser = await prisma.companyUser.findFirst({
    where: { userId },
    include: {
      company: true,
    },
  });

  return companyUser?.company || null;
}

/**
 * Legacy function for backward compatibility
 * Use withCompanyAuth middleware instead for new implementations
 */
export async function requireCompanyAuth(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // For now, this is a simplified implementation
    // In a real app, you would validate the JWT token here
    const token = authHeader.replace('Bearer ', '');

    // This should be replaced with actual JWT validation
    // For demonstration, we'll assume the token contains user info

    return NextResponse.json(
      { error: 'This function is deprecated. Use withCompanyAuth middleware instead.' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
