import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { ApplicationTimelineService } from '@/services/application-timeline.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  BulkCreateTimelineDTO,
  BulkUpdateStatusDTO,
  ApplicationTimelineErrorCode,
} from '@/types/application-timeline.types';
import { ApplicationStatus } from '@/generated/prisma';

/**
 * POST /api/application-timeline/bulk
 * Bulk create timeline entries
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Only employers and admins can bulk create timeline entries
    if (session.user.role !== 'EMPLOYER' && session.user.role !== 'ADMIN') {
      return forbiddenResponse('Only employers and admins can bulk update application statuses');
    }

    // Parse request body
    const body: BulkCreateTimelineDTO = await req.json();

    // Validate entries
    if (!body.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
      return validationErrorResponse({
        entries: 'At least one entry is required',
      });
    }

    // Validate each entry
    const validStatuses = [
      'APPLIED',
      'SCREENING',
      'INTERVIEWING',
      'OFFERED',
      'HIRED',
      'REJECTED',
      'WITHDRAWN',
    ];
    const validationErrors: Record<string, string> = {};

    body.entries.forEach((entry, index) => {
      if (!entry.applicationId) {
        validationErrors[`entries[${index}].applicationId`] = 'Application ID is required';
      }
      if (!entry.status) {
        validationErrors[`entries[${index}].status`] = 'Status is required';
      } else if (!validStatuses.includes(entry.status)) {
        validationErrors[`entries[${index}].status`] =
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(validationErrors);
    }

    // Create timeline entries
    const timelines = await ApplicationTimelineService.bulkCreate(body, session.user.id);

    return successResponse(
      {
        created: timelines.length,
        timelines,
      },
      `${timelines.length} timeline entries created successfully`,
      201
    );
  } catch (error: any) {
    console.error('Error bulk creating timeline entries:', error);

    // Handle specific errors
    if (error.message === ApplicationTimelineErrorCode.APPLICATION_NOT_FOUND) {
      return errorResponse('One or more applications not found', 404);
    }

    if (error.message === ApplicationTimelineErrorCode.INVALID_STATUS_TRANSITION) {
      return errorResponse('One or more invalid status transitions', 400);
    }

    return serverErrorResponse('Failed to bulk create timeline entries', error);
  }
}

/**
 * PUT /api/application-timeline/bulk
 * Bulk update status for multiple applications
 */
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Only employers and admins can bulk update
    if (session.user.role !== 'EMPLOYER' && session.user.role !== 'ADMIN') {
      return forbiddenResponse('Only employers and admins can bulk update application statuses');
    }

    // Parse request body
    const body: BulkUpdateStatusDTO = await req.json();

    // Validate required fields
    if (
      !body.applicationIds ||
      !Array.isArray(body.applicationIds) ||
      body.applicationIds.length === 0
    ) {
      return validationErrorResponse({
        applicationIds: 'At least one application ID is required',
      });
    }

    if (!body.status) {
      return validationErrorResponse({
        status: 'Status is required',
      });
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

    // Validate note length if provided
    if (body.note && body.note.length > 1000) {
      return validationErrorResponse({
        note: 'Note must be less than 1000 characters',
      });
    }

    // Update statuses
    const timelines = await ApplicationTimelineService.bulkUpdateStatus(body, session.user.id);

    return successResponse(
      {
        updated: timelines.length,
        skipped: body.applicationIds.length - timelines.length,
        timelines,
      },
      `${timelines.length} applications updated successfully`
    );
  } catch (error: any) {
    console.error('Error bulk updating statuses:', error);
    return serverErrorResponse('Failed to bulk update statuses', error);
  }
}
