import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { ApplicationService } from '@/services/application.service';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import { getApplicationStatsQuerySchema } from '@/lib/validations/application.validation';

/**
 * GET /api/applications/stats
 * Get application statistics
 * Access:
 * - ADMIN: Can view all statistics
 * - EMPLOYER: Can view statistics for their company's applications
 * - CANDIDATE: Can view their own application statistics
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      companyId: searchParams.get('companyId') || undefined,
      jobId: searchParams.get('jobId') || undefined,
      candidateId: searchParams.get('candidateId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const validatedParams = getApplicationStatsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const user = req.user!;
    const filters = validatedParams.data;

    // Apply access control based on user type
    if (user.userType === UserType.CANDIDATE) {
      // Candidates can only see their own application statistics
      const candidate = await prisma.candidate.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      filters.candidateId = candidate.id;

      // Clear other filters to prevent access to other data
      delete filters.companyId;
      delete filters.jobId;
    } else if (user.userType === UserType.EMPLOYER) {
      // Employers can only see statistics for their company's applications
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          userId: user.id,
        },
        select: { companyId: true },
      });

      if (!companyUser) {
        return errorResponse('Company access not found', 403);
      }

      // If no company is specified, use their company
      if (!filters.companyId) {
        filters.companyId = companyUser.companyId;
      } else if (filters.companyId !== companyUser.companyId) {
        return errorResponse('Access denied to company data', 403);
      }

      // If jobId is specified, verify it belongs to their company
      if (filters.jobId) {
        const job = await prisma.job.findFirst({
          where: {
            id: filters.jobId,
            companyId: companyUser.companyId,
          },
        });

        if (!job) {
          return errorResponse('Job not found or access denied', 404);
        }
      }
    }
    // ADMIN can access all statistics without restrictions

    const stats = await ApplicationService.getApplicationStats(filters);
    return successResponse(stats, 'Application statistics retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve application statistics', error);
  }
});
