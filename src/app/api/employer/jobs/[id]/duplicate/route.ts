import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { EmployerJobService } from '@/services/employer/job.service';
import { DuplicateJobDTO } from '@/types/employer/job';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export const POST = withAuth(
  withPermission('job.create', async (req: AuthenticatedRequest, { params }: Params) => {
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
            select: { companyId: true },
            take: 1,
          },
        },
      });

      const companyId = userWithCompany?.companyUsers?.[0]?.companyId;
      if (!companyId) {
        return NextResponse.json(
          { success: false, error: 'No company associated with user' },
          { status: 400 }
        );
      }

      // Check if company is verified
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { verificationStatus: true },
      });

      if (!company || company.verificationStatus !== 'VERIFIED') {
        return NextResponse.json(
          {
            success: false,
            error: 'Your company must be verified before posting jobs',
          },
          { status: 403 }
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

      // TODO: Check job posting quota/limits based on subscription plan

      // Parse optional request body
      let duplicateData: DuplicateJobDTO | undefined;
      try {
        const body = await req.json();
        duplicateData = body;
      } catch {
        // Body is optional, so we can proceed without it
      }

      // Duplicate the job
      const duplicatedJob = await EmployerJobService.duplicateJob(
        id,
        companyId,
        user.id,
        duplicateData
      );

      if (!duplicatedJob) {
        return NextResponse.json(
          {
            success: false,
            error: "Job not found or you don't have permission to duplicate it",
          },
          { status: 404 }
        );
      }

      // Get duplicated job with details
      const jobDetail = await EmployerJobService.getJobDetail(duplicatedJob.id, companyId);

      return NextResponse.json(
        {
          success: true,
          message: 'Job duplicated successfully',
          data: {
            originalJobId: id,
            duplicatedJob: jobDetail,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error duplicating job:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to duplicate job',
        },
        { status: 500 }
      );
    }
  })
);
