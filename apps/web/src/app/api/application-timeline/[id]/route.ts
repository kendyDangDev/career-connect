export const dynamic = 'force-dynamic';
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
  notFoundResponse,
  noContentResponse,
} from '@/utils/api-response';
import {
  UpdateApplicationTimelineDTO,
  ApplicationTimelineErrorCode,
} from '@/types/application-timeline.types';

/**
 * GET /api/application-timeline/[id]
 * Get a specific timeline entry
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Await params
    const { id } = await params;

    // Get timeline entry
    const timeline = await ApplicationTimelineService.getById(id, true);

    if (!timeline) {
      return notFoundResponse('Timeline entry');
    }

    // Check access permissions
    const hasAccess = await ApplicationTimelineService.checkAccess(
      id,
      session.user.id,
      session.user.userType
    );

    if (!hasAccess) {
      return forbiddenResponse("You don't have access to this timeline entry");
    }

    return successResponse(timeline, 'Timeline entry retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching timeline entry:', error);
    return serverErrorResponse('Failed to fetch timeline entry', error);
  }
}

/**
 * PUT /api/application-timeline/[id]
 * Update a timeline entry (only note can be updated)
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Await params
    const { id } = await params;

    // Only employers and admins can update timeline entries
    if (session.user.userType !== 'EMPLOYER' && session.user.userType !== 'ADMIN') {
      return forbiddenResponse('Only employers and admins can update timeline entries');
    }

    // Check if timeline entry exists
    const existingTimeline = await ApplicationTimelineService.getById(id);
    if (!existingTimeline) {
      return notFoundResponse('Timeline entry');
    }

    // Check access permissions
    const hasAccess = await ApplicationTimelineService.checkAccess(
      id,
      session.user.id,
      session.user.userType
    );

    if (!hasAccess) {
      return forbiddenResponse("You don't have access to update this timeline entry");
    }

    // Parse request body
    const body: UpdateApplicationTimelineDTO = await req.json();

    // Validate note length if provided
    if (body.note && body.note.length > 1000) {
      return validationErrorResponse({
        note: 'Note must be less than 1000 characters',
      });
    }

    // Update timeline entry
    const updatedTimeline = await ApplicationTimelineService.update(id, body);

    return successResponse(updatedTimeline, 'Timeline entry updated successfully');
  } catch (error: any) {
    console.error('Error updating timeline entry:', error);
    return serverErrorResponse('Failed to update timeline entry', error);
  }
}

/**
 * DELETE /api/application-timeline/[id]
 * Delete a timeline entry (admin only)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Await params
    const { id } = await params;

    // Only admins can delete timeline entries
    if (session.user.userType !== 'ADMIN') {
      return forbiddenResponse('Only admins can delete timeline entries');
    }

    // Check if timeline entry exists
    const existingTimeline = await ApplicationTimelineService.getById(id);
    if (!existingTimeline) {
      return notFoundResponse('Timeline entry');
    }

    // Delete timeline entry
    await ApplicationTimelineService.delete(id);

    return noContentResponse();
  } catch (error: any) {
    console.error('Error deleting timeline entry:', error);
    return serverErrorResponse('Failed to delete timeline entry', error);
  }
}
