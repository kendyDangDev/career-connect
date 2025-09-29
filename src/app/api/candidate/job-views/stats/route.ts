import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/middleware/auth';
import { JobViewService } from '@/services/candidate/job-view.service';

/**
 * GET /api/candidate/job-views/stats
 * Get job view statistics for the authenticated candidate
 */
export const GET = withPermission('job.view', async (request: AuthenticatedRequest) => {
  try {
    // Get job view statistics using authenticated user
    const stats = await JobViewService.getJobViewStats(request.user!.id);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get job view stats error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Đã có lỗi xảy ra khi lấy thống kê' 
      },
      { status: 500 }
    );
  }
});
