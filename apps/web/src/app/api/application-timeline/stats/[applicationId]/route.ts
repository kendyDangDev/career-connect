import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { ApplicationTimelineService } from '@/services/application-timeline.service';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/utils/api-response';
import { ApplicationTimelineErrorCode } from '@/types/application-timeline.types';

/**
 * GET /api/application-timeline/stats/[applicationId]
 * Get timeline statistics for a specific application
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { applicationId } = await params;

    // Get the timeline stats
    const stats = await ApplicationTimelineService.getStats(applicationId);

    // Check if user has access to view these stats
    if (session.user.userType === 'CANDIDATE') {
      // Verify this is the candidate's own application
      const timeline = await ApplicationTimelineService.getByApplicationId(applicationId);
      if (timeline.length > 0) {
        const firstEntry = timeline[0];
        if (firstEntry.application?.userId !== session.user.id) {
          return forbiddenResponse('You can only view statistics for your own applications');
        }
      }
    } else if (session.user.userType === 'EMPLOYER') {
      // Verify employer has access to this application
      const timeline = await ApplicationTimelineService.getByApplicationId(applicationId);
      if (timeline.length > 0) {
        const hasAccess = await ApplicationTimelineService.checkAccess(
          timeline[0].id,
          session.user.id,
          session.user.userType
        );
        if (!hasAccess) {
          return forbiddenResponse("You don't have access to this application's statistics");
        }
      }
    }

    return successResponse(stats, 'Timeline statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching timeline statistics:', error);

    // Handle specific errors
    if (error.message === ApplicationTimelineErrorCode.TIMELINE_NOT_FOUND) {
      return notFoundResponse('Timeline entries for this application');
    }

    if (error.message === ApplicationTimelineErrorCode.APPLICATION_NOT_FOUND) {
      return notFoundResponse('Application');
    }

    return serverErrorResponse('Failed to fetch timeline statistics', error);
  }
}
