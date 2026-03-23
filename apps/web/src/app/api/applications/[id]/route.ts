import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { ApplicationService } from '@/services/application.service';
import { ApplicationStatus, UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  applicationIdParamSchema,
  updateApplicationStatusSchema,
} from '@/lib/validations/application.validation';

const withApplicationAuth = (
  handler: (
    req: AuthenticatedRequest,
    context: { params: Promise<{ id: string }> }
  ) => Promise<NextResponse>
) => {
  return async (req: NextRequest, context: { params: Promise<{ id: string }> }) =>
    withAuth((authenticatedRequest) => handler(authenticatedRequest, context))(req);
};

/**
 * GET /api/applications/[id]
 * Get detailed information about a specific application
 * Access:
 * - ADMIN: Can view any application
 * - EMPLOYER: Can view applications for their company's jobs
 * - CANDIDATE: Can view their own applications only
 */
export const GET = withApplicationAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Validate application ID
    const { id } = await params;
    const validatedParams = applicationIdParamSchema.safeParse({ id });
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const applicationId = validatedParams.data.id;
    const user = req.user!;

    // Check if user can access this application
    const canAccess = await ApplicationService.canUserAccessApplication(
      applicationId,
      user.id,
      user.userType
    );

    if (!canAccess) {
      return errorResponse('Application not found or access denied', 404);
    }

    // Get application details
    const application = await ApplicationService.getApplicationDetail(applicationId);

    if (!application) {
      return errorResponse('Application not found', 404);
    }

    return successResponse(application, 'Application details retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve application details', error);
  }
});

/**
 * PATCH /api/applications/[id]
 * Update application status and details
 * Access:
 * - ADMIN: Can update any application
 * - EMPLOYER: Can update applications for their company's jobs
 */
export const PATCH = withApplicationAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Validate application ID
    const { id } = await params;
    const validatedParams = applicationIdParamSchema.safeParse({ id });
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const applicationId = validatedParams.data.id;
    const user = req.user!;

    // Only ADMIN and EMPLOYER can update applications
    if (user.userType === UserType.CANDIDATE) {
      return errorResponse('Access denied. Candidates cannot update application status', 403);
    }

    // Check if user can access this application
    const canAccess = await ApplicationService.canUserAccessApplication(
      applicationId,
      user.id,
      user.userType
    );

    if (!canAccess) {
      return errorResponse('Application not found or access denied', 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateApplicationStatusSchema.safeParse(body);
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error.flatten().fieldErrors);
    }

    const { status, note, rating, recruiterNotes, interviewScheduledAt } = validatedData.data;

    // Update application
    const updatedApplication = await ApplicationService.updateApplicationStatus(
      applicationId,
      status,
      note,
      user.id,
      rating,
      recruiterNotes,
      interviewScheduledAt
    );

    if (!updatedApplication) {
      return errorResponse('Failed to update application', 500);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_APPLICATION_STATUS',
        tableName: 'applications',
        recordId: applicationId,
        oldValues: {},
        newValues: {
          status,
          rating,
          recruiterNotes,
          interviewScheduledAt,
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return successResponse(updatedApplication, 'Application updated successfully');
  } catch (error) {
    return serverErrorResponse('Failed to update application', error);
  }
});

/**
 * DELETE /api/applications/[id]
 * Delete an application (soft delete by setting status to WITHDRAWN)
 * Access:
 * - ADMIN: Can delete any application
 * - CANDIDATE: Can withdraw their own applications (if not yet processed)
 */
export const DELETE = withApplicationAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    // Validate application ID
    const validatedParams = applicationIdParamSchema.safeParse({ id });
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const applicationId = validatedParams.data.id;
    const user = req.user!;

    // Check if user can access this application
    const canAccess = await ApplicationService.canUserAccessApplication(
      applicationId,
      user.id,
      user.userType
    );

    if (!canAccess) {
      return errorResponse('Application not found or access denied', 404);
    }

    // Get current application to check status
    const application = await ApplicationService.getApplicationDetail(applicationId);
    if (!application) {
      return errorResponse('Application not found', 404);
    }

    // Only allow withdrawal if application is in early stages
    if (user.userType === UserType.CANDIDATE) {
      const allowedStatuses: ApplicationStatus[] = [
        ApplicationStatus.APPLIED,
        ApplicationStatus.SCREENING,
      ];
      if (!allowedStatuses.includes(application.status)) {
        return errorResponse(
          'Cannot withdraw application. It has already progressed beyond the initial stages.',
          400
        );
      }
    }

    // Update application status to WITHDRAWN
    const updatedApplication = await ApplicationService.updateApplicationStatus(
      applicationId,
      'WITHDRAWN',
      user.userType === UserType.CANDIDATE
        ? 'Application withdrawn by candidate'
        : 'Application withdrawn by administrator',
      user.id
    );

    if (!updatedApplication) {
      return errorResponse('Failed to withdraw application', 500);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'WITHDRAW_APPLICATION',
        tableName: 'applications',
        recordId: applicationId,
        oldValues: { status: application.status },
        newValues: { status: 'WITHDRAWN' },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return successResponse(
      { applicationId, status: 'WITHDRAWN' },
      'Application withdrawn successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to withdraw application', error);
  }
});
