import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { JobViewService } from '@/services/candidate/job-view.service';
import { JobViewsQuery } from '@/types/candidate/job-view.types';

/**
 * GET /api/candidate/job-views
 * Get list of job views for the authenticated candidate
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để xem lịch sử xem việc làm' 
        },
        { status: 401 }
      );
    }

    // Check if user is a candidate
    if (session.user.userType !== 'CANDIDATE') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Chỉ ứng viên mới có thể xem lịch sử xem việc làm' 
        },
        { status: 403 }
      );
    }

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
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    if (query.limit > 50) query.limit = 50; // Max limit

    // Get job views
    const result = await JobViewService.getJobViews(session.user.id, query);

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
}
