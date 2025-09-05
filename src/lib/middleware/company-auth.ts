import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { UserType, CompanyRole } from "@/generated/prisma";

export interface CompanyAuthResult {
  userId: string;
  companyId: string;
  companyRole: CompanyRole;
  user: {
    id: string;
    email: string;
    userType: UserType;
  };
  company: {
    id: string;
    companyName: string;
    verificationStatus: string;
  };
}

/**
 * Middleware to verify user is an employer and has access to company
 */
export async function requireCompanyAuth(
  request: NextRequest
): Promise<CompanyAuthResult | NextResponse> {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        userType: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is employer
    if (user.userType !== UserType.EMPLOYER) {
      return NextResponse.json(
        { error: "Forbidden - Only employers can access this resource" },
        { status: 403 }
      );
    }

    // Get company user relationship
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: user.id
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            verificationStatus: true
          }
        }
      }
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: "You are not associated with any company" },
        { status: 403 }
      );
    }

    return {
      userId: user.id,
      companyId: companyUser.companyId,
      companyRole: companyUser.role,
      user,
      company: companyUser.company
    };
  } catch (error) {
    console.error("Company auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check if user has specific company role
 */
export function hasCompanyRole(
  userRole: CompanyRole,
  requiredRoles: CompanyRole[]
): boolean {
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
    CompanyRole.RECRUITER
  ]);
}

/**
 * Middleware to verify company is verified
 */
export async function requireVerifiedCompany(
  companyId: string
): Promise<boolean | NextResponse> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { verificationStatus: true }
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  if (company.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Company is not verified. Please complete verification process." },
      { status: 403 }
    );
  }

  return true;
}

/**
 * Get company by user ID
 */
export async function getCompanyByUserId(userId: string) {
  const companyUser = await prisma.companyUser.findFirst({
    where: { userId },
    include: {
      company: true
    }
  });

  return companyUser?.company || null;
}
