import { NextResponse } from 'next/server';
import { withCompanyAuth, CompanyAuthenticatedRequest } from '@/lib/middleware/company-auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/services/notification-service';

export const dynamic = 'force-dynamic';

export const GET = withCompanyAuth(
  async (request: CompanyAuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const application = await prisma.application.findFirst({
        where: {
          id,
          job: {
            companyId: request.company!.id,
          },
        },
        select: {
          id: true,
          cvFileUrl: true,
          candidate: {
            select: {
              userId: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
        },
      });

      if (!application) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found or access denied',
          },
          { status: 404 }
        );
      }

      if (!application.cvFileUrl) {
        return NextResponse.json(
          {
            success: false,
            error: 'CV not found for this application',
          },
          { status: 404 }
        );
      }

      await notificationService.notifyCandidateCvViewed({
        applicationId: application.id,
        candidateUserId: application.candidate.userId,
        companyId: application.job.company.id,
        companyName: application.job.company.companyName,
        jobId: application.job.id,
        jobTitle: application.job.title,
      });

      return NextResponse.redirect(application.cvFileUrl, { status: 307 });
    } catch (error) {
      console.error('Error handling employer CV view:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to open CV',
        },
        { status: 500 }
      );
    }
  }
);
