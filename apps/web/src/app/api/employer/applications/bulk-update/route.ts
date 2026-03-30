export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { EmployerApplicationService } from '@/services/employer/application.service';
import { BulkUpdateApplicationsDTO } from '@/types/employer/application';
import { ErrorCode } from '@/lib/errors/application-errors';
import { ApplicationStatus } from '@/generated/prisma';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    if (session.user.userType !== 'EMPLOYER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Employer access only' },
        { status: 403 }
      );
    }

    // Get company ID from session
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No company associated with user' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate application IDs
    if (
      !body.applicationIds ||
      !Array.isArray(body.applicationIds) ||
      body.applicationIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['UPDATE_STATUS', 'ADD_RATING', 'ADD_TAG'];
    if (!body.action || !validActions.includes(body.action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Validate based on action
    if (
      body.action === 'UPDATE_STATUS' &&
      (!body.status || !Object.values(ApplicationStatus).includes(body.status))
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required for status update' },
        { status: 400 }
      );
    }

    if (
      body.action === 'ADD_RATING' &&
      (body.rating === undefined || body.rating < 1 || body.rating > 5)
    ) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create bulk update DTO
    const bulkUpdateData: BulkUpdateApplicationsDTO = {
      applicationIds: body.applicationIds,
      action: body.action,
      status: body.status,
      rating: body.rating,
      notes: body.notes,
      notifyCandidates: body.notifyCandidates || false,
    };

    // Perform bulk update
    const result = await EmployerApplicationService.bulkUpdateApplications(
      companyId,
      session.user.id,
      bulkUpdateData
    );

    return NextResponse.json({
      success: true,
      data: {
        message: 'Bulk update completed',
        ...result,
      },
    });
  } catch (error: any) {
    console.error('Error performing bulk update:', error);

    if (error.message === 'Some applications not found or access denied') {
      return NextResponse.json(
        {
          success: false,
          error: 'Some applications not found or access denied',
          code: ErrorCode.APPLICATION_NOT_FOUND,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk update',
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }
}
