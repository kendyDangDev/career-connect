import { NextRequest, NextResponse } from 'next/server';
import { withCompanyAuth, CompanyAuthenticatedRequest } from '@/lib/middleware/company-auth';
import { EmployerApplicationService } from '@/services/employer/application.service';
import { ErrorCode } from '@/lib/errors/application-errors';
import { ApplicationStatus } from '@/generated/prisma';
import { UpdateApplicationStatusDTO } from '@/types/employer/application';

export const GET = withCompanyAuth(
  async (req: CompanyAuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      // Get application detail
      const { id } = await params;
      const application = await EmployerApplicationService.getApplicationDetail(
        id,
        req.company!.id
      );

      if (!application) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found or access denied',
            code: ErrorCode.APPLICATION_NOT_FOUND,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      console.error('Error fetching application detail:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch application detail',
          code: ErrorCode.INTERNAL_ERROR,
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/employer/applications/[id]
 * Update application - Flexible endpoint for updating any field (status, rating, notes, etc.)
 * This is the recommended endpoint for all application updates
 */
export const PATCH = withCompanyAuth(
  async (req: CompanyAuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const body = await req.json();

      // Validate that at least one field is provided
      if (
        body.status === undefined &&
        body.rating === undefined &&
        body.notes === undefined &&
        body.interviewScheduledAt === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'At least one field (status, rating, notes, or interviewScheduledAt) must be provided',
          },
          { status: 400 }
        );
      }

      // Validate status if provided
      if (body.status !== undefined && !Object.values(ApplicationStatus).includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status value' },
          { status: 400 }
        );
      }

      // Validate rating if provided
      if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
        return NextResponse.json(
          { success: false, error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }

      // Validate notes if provided
      if (body.notes !== undefined) {
        if (typeof body.notes !== 'string') {
          return NextResponse.json(
            { success: false, error: 'Notes must be a string' },
            { status: 400 }
          );
        }

        if (body.notes.length > 1000) {
          return NextResponse.json(
            { success: false, error: 'Notes cannot exceed 1000 characters' },
            { status: 400 }
          );
        }
      }

      if (body.status === ApplicationStatus.INTERVIEWING && body.interviewScheduledAt === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: 'interviewScheduledAt is required when moving application to INTERVIEWING',
          },
          { status: 400 }
        );
      }

      // Create update DTO - only include fields that are provided
      const updateData: UpdateApplicationStatusDTO = {};

      if (body.status !== undefined) {
        updateData.status = body.status;
      }
      if (body.rating !== undefined) {
        updateData.rating = body.rating;
      }
      if (body.notes !== undefined) {
        updateData.notes = body.notes;
      }
      if (body.interviewScheduledAt !== undefined) {
        updateData.interviewScheduledAt = body.interviewScheduledAt;
      }
      if (body.notifyCandidate !== undefined) {
        updateData.notifyCandidate = body.notifyCandidate;
      }

      const { id } = await params;

      // Update application
      const result = await EmployerApplicationService.updateApplicationStatus(
        id,
        req.company!.id,
        req.user!.id,
        updateData
      );

      return NextResponse.json({
        success: true,
        message: 'Application updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error updating application:', error);

      if (error.message === 'Application not found or access denied') {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found or access denied',
            code: ErrorCode.APPLICATION_NOT_FOUND,
          },
          { status: 404 }
        );
      }

      if (
        error.message === 'Interview schedule must be a valid date' ||
        error.message === 'Interview schedule must be in the future' ||
        error.message === 'Interview schedule is required when moving application to INTERVIEWING'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update application',
          code: ErrorCode.INTERNAL_ERROR,
        },
        { status: 500 }
      );
    }
  }
);
