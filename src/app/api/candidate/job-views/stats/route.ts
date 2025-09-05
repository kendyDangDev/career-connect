import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { JobViewService } from '@/services/candidate/job-view.service';

/**
 * GET /api/candidate/job-views/stats
 * Get job view statistics for the authenticated candidate
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để xem thống kê' 
        },
        { status: 401 }
      );
    }

    // Check if user is a candidate
    if (session.user.userType !== 'CANDIDATE') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Chỉ ứng viên mới có thể xem thống kê việc làm đã xem' 
        },
        { status: 403 }
      );
    }

    // Get job view statistics
    const stats = await JobViewService.getJobViewStats(session.user.id);

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
}
