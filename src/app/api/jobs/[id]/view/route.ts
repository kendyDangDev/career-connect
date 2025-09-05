import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { JobViewService } from '@/services/candidate/job-view.service';
import { JobViewInput } from '@/types/candidate/job-view.types';

/**
 * POST /api/jobs/[id]/view
 * Record a job view when user views a job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    // Get user session (optional - can track anonymous views)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get client information
    const ipAddress = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create job view record
    const jobViewData: JobViewInput & { userId?: string } = {
      jobId,
      ipAddress,
      userAgent
    };

    if (userId) {
      jobViewData.userId = userId;
    }

    const jobView = await JobViewService.createJobView(jobViewData);

    return NextResponse.json({
      success: true,
      message: 'Đã ghi nhận lượt xem việc làm',
      data: {
        id: jobView.id,
        viewedAt: jobView.viewedAt
      }
    });

  } catch (error) {
    console.error('Create job view error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Job not found or not active') {
        return NextResponse.json(
          { 
            error: 'Not Found',
            message: 'Công việc không tồn tại hoặc đã ngừng tuyển dụng' 
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Đã có lỗi xảy ra khi ghi nhận lượt xem' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/[id]/view
 * Check if current user has viewed this job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({
        success: true,
        data: {
          hasViewed: false,
          message: 'User not authenticated'
        }
      });
    }

    // Check if user has viewed this job
    const hasViewed = await JobViewService.hasUserViewedJob(
      session.user.id, 
      jobId
    );

    return NextResponse.json({
      success: true,
      data: {
        hasViewed,
        userId: session.user.id,
        jobId
      }
    });

  } catch (error) {
    console.error('Check job view error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Đã có lỗi xảy ra khi kiểm tra lượt xem' 
      },
      { status: 500 }
    );
  }
}
