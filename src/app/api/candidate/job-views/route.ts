import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { JobViewService } from '@/services/candidate/job-view.service';
import { JobViewsQuery } from '@/types/candidate/job-view.types';

/**
 * GET /api/candidate/job-views
 * Get list of job views for the authenticated candidate
 */
export const GET = withPermission('job.view', async (request: AuthenticatedRequest) => {
  try {

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query: JobViewsQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') || 'viewedAt') as 'viewedAt' | 'jobTitle',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    };

    // Validate pagination
    if (query.page! < 1) query.page = 1;
    if (query.limit! < 1) query.limit = 10;
    if (query.limit! > 50) query.limit = 50; // Max limit

    // Get job views using authenticated user
    const result = await JobViewService.getJobViews(request.user!.id, query);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Get job views error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Đã có lỗi xảy ra khi lấy lịch sử xem việc làm' 
      },
      { status: 500 }
    );
  }
});
