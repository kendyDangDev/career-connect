import { NextRequest, NextResponse } from 'next/server';
import {
  withAdmin,
  AuthenticatedRequest,
  createAuditLog,
  successResponse,
  withAnyPermission,
} from '@/lib/middleware';
import { AdminCompanyService } from '@/services/admin/company.service';
import { CompanyListParams } from '@/types/admin/company';

export const GET = async (request: AuthenticatedRequest) => {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: CompanyListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      companySize: (searchParams.get('companySize') as any) || undefined,
      industryId: searchParams.get('industryId') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    };

    // Validate pagination params
    if (params.page < 1) params.page = 1;
    if (params.limit < 1 || params.limit > 100) params.limit = 10;

    // Get companies list
    const result = await AdminCompanyService.getCompanies(params);

    return successResponse(result);
  } catch (error) {
    console.error('Error fetching companies list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch companies',
      },
      { status: 500 }
    );
  }
};

export const POST = withAdmin(async (request: AuthenticatedRequest) => {
  try {
    // Parse request body
    const body = await request.json();
    const { action, companyIds } = body;

    // Handle bulk operations
    if (action === 'bulk-update-status') {
      const { status } = body;

      if (!status || !companyIds || !Array.isArray(companyIds)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
          },
          { status: 400 }
        );
      }

      const updatedCount = await AdminCompanyService.bulkUpdateStatus(companyIds, status);

      // Log admin action
      await createAuditLog(
        request.user!.id,
        `BULK_UPDATE_STATUS_${status}`,
        'companies',
        companyIds.join(','),
        null,
        { status, count: updatedCount },
        request
      );

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updatedCount} companies`,
        data: {
          updatedCount,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in bulk company operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk operation',
      },
      { status: 500 }
    );
  }
});
