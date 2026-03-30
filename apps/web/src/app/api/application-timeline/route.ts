export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { ApplicationTimelineService } from '@/services/application-timeline.service';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  CreateApplicationTimelineDTO,
  ApplicationTimelineQueryParams,
  ApplicationTimelineErrorCode,
} from '@/types/application-timeline.types';
import { ApplicationStatus } from '@/generated/prisma';

/**
 * GET /api/application-timeline
 * List timeline entries with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const params: ApplicationTimelineQueryParams = {
      applicationId: searchParams.get('applicationId') || undefined,
      status: (searchParams.get('status') as ApplicationStatus) || undefined,
      changedBy: searchParams.get('changedBy') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'status') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Handle multiple statuses
    const statuses = searchParams.getAll('status[]');
    if (statuses.length > 0) {
      params.status = statuses as ApplicationStatus[];
    }

    // Validate date range
    if (params.fromDate && params.toDate) {
      const from = new Date(params.fromDate);
      const to = new Date(params.toDate);
      if (from > to) {
        return validationErrorResponse({
          dateRange: 'From date must be before to date',
        });
      }
    }

    // Additional filtering based on user type
    if (session.user.userType === 'CANDIDATE') {
      // Candidates can only see their own application timelines
      const candidateApplications = await ApplicationTimelineService.getRecentActivities(
        session.user.id,
        undefined,
        1000
      );
      const applicationIds = [...new Set(candidateApplications.map((t) => t.applicationId))];

      if (!params.applicationId || !applicationIds.includes(params.applicationId)) {
        // Filter to only user's applications
        params.applicationId = applicationIds[0]; // This needs better handling
      }
    }

    // Get timeline entries
    const result = await ApplicationTimelineService.list(params);

    return paginatedResponse(
      result.data,
      params.page || 1,
      params.limit || 10,
      result.total,
      'Timeline entries retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching timeline entries:', error);
    return serverErrorResponse('Failed to fetch timeline entries', error);
  }
}

/**
 * POST /api/application-timeline
 * Create a new timeline entry
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Only employers and admins can create timeline entries
    if (session.user.userType !== 'EMPLOYER' && session.user.userType !== 'ADMIN') {
      return forbiddenResponse('Only employers and admins can update application status');
    }

    // Parse request body
    const body: CreateApplicationTimelineDTO = await req.json();

    // Validate required fields
    if (!body.applicationId || !body.status) {
      const errors: Record<string, string> = {};
      if (!body.applicationId) {
        errors.applicationId = 'Application ID is required';
      }
      if (!body.status) {
        errors.status = 'Status is required';
      }
      return validationErrorResponse(errors);
    }

    // Validate status value
    const validStatuses = [
      'APPLIED',
      'SCREENING',
      'INTERVIEWING',
      'OFFERED',
      'HIRED',
      'REJECTED',
      'WITHDRAWN',
    ];
    if (!validStatuses.includes(body.status)) {
      return validationErrorResponse({
        status: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Check if user has access to the application
    if (session.user.userType === 'EMPLOYER') {
      // Verify employer has access to this application
      const hasAccess = await ApplicationTimelineService.checkAccess(
        body.applicationId,
        session.user.id,
        session.user.userType
      );

      if (!hasAccess) {
        return forbiddenResponse("You don't have access to this application");
      }
    }

    // Create timeline entry
    const timeline = await ApplicationTimelineService.create(body, session.user.id);

    return successResponse(timeline, 'Timeline entry created successfully', 201);
  } catch (error: any) {
    console.error('Error creating timeline entry:', error);

    // Handle specific errors
    if (error.message === ApplicationTimelineErrorCode.APPLICATION_NOT_FOUND) {
      return errorResponse('Application not found', 404);
    }

    if (error.message === ApplicationTimelineErrorCode.INVALID_STATUS_TRANSITION) {
      return errorResponse('Invalid status transition', 400);
    }

    return serverErrorResponse('Failed to create timeline entry', error);
  }
}
