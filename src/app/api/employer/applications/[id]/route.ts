import { NextRequest, NextResponse } from 'next/server';
import { withCompanyAuth, CompanyAuthenticatedRequest } from '@/lib/middleware/company-auth';
import { EmployerApplicationService } from '@/services/employer/application.service';
import { ErrorCode } from '@/lib/errors/application-errors';

export const GET = withCompanyAuth(async (req: CompanyAuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    // Get application detail
    const application = await EmployerApplicationService.getApplicationDetail(params.id, req.company!.id);

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
});
