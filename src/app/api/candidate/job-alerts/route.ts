import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { JobAlertService } from '@/services/job-alert.service';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  serverErrorResponse,
  validationErrorResponse,
  conflictResponse
} from '@/utils/api-response';
import { 
  JobAlertFilters,
  CreateJobAlertRequest
} from '@/types/job-alert.types';
import { 
  validateCreateJobAlert,
  jobAlertQuerySchema
} from '@/lib/validations/job-alert';
import { UserType, AlertFrequency } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/job-alerts
 * Get list of job alerts for the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse and validate query parameters
    const searchParams = new URL(req.url).searchParams;
    const queryValidation = jobAlertQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryValidation.success) {
      return validationErrorResponse(
        queryValidation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const {
      page,
      limit,
      search,
      isActive,
      frequency,
      hasKeywords,
      hasLocations,
      hasCategories,
      sortBy,
      sortOrder
    } = queryValidation.data;

    // Build filters
    const filters: JobAlertFilters = {
      search,
      isActive,
      frequency,
      hasKeywords,
      hasLocations,
      hasCategories,
      sortBy,
      sortOrder
    };

    // Get job alerts
    const { jobAlerts, total } = await JobAlertService.getJobAlerts({
      candidateId: candidate.id,
      filters,
      pagination: { page, limit }
    });

    // Return paginated response
    return paginatedResponse(
      jobAlerts,
      page,
      limit,
      total,
      'Job alerts retrieved successfully'
    );

  } catch (error) {
    return serverErrorResponse('Failed to retrieve job alerts', error);
  }
});

/**
 * POST /api/candidate/job-alerts
 * Create a new job alert for the authenticated candidate
 */
export const POST = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = validateCreateJobAlert(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Validate location IDs if provided
    if (validation.data.locationIds && validation.data.locationIds.length > 0) {
      const validLocationCount = await prisma.location.count({
        where: {
          id: { in: validation.data.locationIds },
          isActive: true
        }
      });

      if (validLocationCount !== validation.data.locationIds.length) {
        return validationErrorResponse({
          locationIds: ['One or more location IDs are invalid']
        });
      }
    }

    // Validate category IDs if provided
    if (validation.data.categoryIds && validation.data.categoryIds.length > 0) {
      const validCategoryCount = await prisma.category.count({
        where: {
          id: { in: validation.data.categoryIds },
          isActive: true
        }
      });

      if (validCategoryCount !== validation.data.categoryIds.length) {
        return validationErrorResponse({
          categoryIds: ['One or more category IDs are invalid']
        });
      }
    }

    // Create the job alert
    try {
      const jobAlert = await JobAlertService.createJobAlert({
        candidateId: candidate.id,
        data: validation.data
      });

      return successResponse(
        jobAlert,
        'Job alert created successfully',
        201
      );

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Maximum number of job alerts reached (10)') {
        return conflictResponse('You have reached the maximum limit of 10 job alerts');
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to create job alert', error);
  }
});
