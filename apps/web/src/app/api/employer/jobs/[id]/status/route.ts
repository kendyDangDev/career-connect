import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { EmployerJobService } from '@/services/employer/job.service';
import { UpdateJobStatusDTO } from '@/types/employer/job';
import { canChangeJobStatus } from '@/lib/utils/job-utils';
import { JobStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export const PATCH = withPermission(
  'job.edit',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const user = req.user;
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // Get company ID from user
      const userWithCompany = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          companyUsers: {
            select: {
              companyId: true,
              company: {
                select: { verificationStatus: true },
              },
            },
            take: 1,
          },
        },
      });

      const companyId = userWithCompany?.companyUsers?.[0]?.companyId;
      const companyVerificationStatus =
        userWithCompany?.companyUsers?.[0]?.company?.verificationStatus;

      if (!companyId) {
        return NextResponse.json(
          { success: false, error: 'No company associated with user' },
          { status: 400 }
        );
      }

      const { id } = params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job ID is required',
          },
          { status: 400 }
        );
      }

      // Parse request body
      const body: UpdateJobStatusDTO = await req.json();
      const { status, reason, notifyApplicants } = body;

      // Validate status
      if (!status || !Object.values(JobStatus).includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid job status',
          },
          { status: 400 }
        );
      }

      // Get current job to check status transition
      const currentJob = await EmployerJobService.getJobDetail(id, companyId);
      if (!currentJob) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
          },
          { status: 404 }
        );
      }

      // Check if status transition is allowed
      const statusCheck = canChangeJobStatus(currentJob.status, status);
      if (!statusCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: statusCheck.reason || 'Invalid status transition',
          },
          { status: 400 }
        );
      }

      // If changing to ACTIVE, verify company is still verified
      if (status === JobStatus.ACTIVE && companyVerificationStatus !== 'VERIFIED') {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot activate job - company verification required',
          },
          { status: 403 }
        );
      }

      // Update job status
      const result = await EmployerJobService.updateJobStatus(id, companyId, body);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.message,
          },
          { status: 500 }
        );
      }

      // Get updated job
      const updatedJob = await EmployerJobService.getJobDetail(id, companyId);

      // Log the status change
      console.log(
        `Job ${id} status changed from ${currentJob.status} to ${status} by user ${user.id}`
      );

      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          id,
          previousStatus: currentJob.status,
          newStatus: status,
          job: updatedJob,
        },
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update job status',
        },
        { status: 500 }
      );
    }
  }
);
