import { NextRequest, NextResponse } from 'next/server';
import {
  withCompanyAuth,
  withCompanyRole,
  CompanyAuthenticatedRequest,
  canManageCompany,
} from '@/lib/middleware/company-auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/middleware';
import { CompanyService } from '@/services/company.service';
import { CompanyRole } from '@/generated/prisma';
import { z } from 'zod';

/**
 * GET /api/companies/profile
 * Get company profile for authenticated employer
 * Requires: Any company role (ADMIN, HR_MANAGER, RECRUITER)
 */
export const GET = withCompanyAuth(async (request: CompanyAuthenticatedRequest) => {
  try {
    const companyId = request.company!.id;
    const companyRole = request.company!.role;

    // Get company profile with additional info
    const companyProfile = await CompanyService.getCompanyProfile(companyId);

    if (!companyProfile) {
      return errorResponse('NOT_FOUND', 'Company not found', 404);
    }

    // Get company statistics if user can manage company
    let stats = null;
    if (canManageCompany(companyRole)) {
      stats = await CompanyService.getCompanyStats(companyId);
    }

    return successResponse(
      {
        company: companyProfile,
        userRole: companyRole,
        canManage: canManageCompany(companyRole),
        stats,
      },
      'Company profile retrieved successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to fetch company profile', error);
  }
});

/**
 * PUT /api/companies/profile
 * Update company profile
 * Requires: Company ADMIN or HR_MANAGER role
 */
export const PUT = withCompanyRole(
  [CompanyRole.ADMIN, CompanyRole.HR_MANAGER],
  async (request: CompanyAuthenticatedRequest) => {
    try {
      const companyId = request.company!.id;

      // Parse request body
      const body = await request.json();

      // Import validation functions
      const { validateCompanyData, sanitizeCompanyData } = await import(
        '@/lib/utils/company-utils'
      );

      // Validate data
      const validation = validateCompanyData(body);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }

      // Sanitize data
      const sanitizedData = sanitizeCompanyData(body);

      // Update company profile
      await CompanyService.updateCompanyProfile(companyId, sanitizedData);

      // Get updated profile with additional info
      const companyProfile = await CompanyService.getCompanyProfile(companyId);

      return successResponse({ company: companyProfile }, 'Company profile updated successfully');
    } catch (error) {
      // Handle unique constraint errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return errorResponse('DUPLICATE_COMPANY', 'A company with this name already exists', 409);
      }

      return serverErrorResponse('Failed to update company profile', error);
    }
  }
);
