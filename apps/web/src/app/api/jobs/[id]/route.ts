import { NextRequest, NextResponse } from 'next/server';
import { PublicJobService } from '@/services/public/job.service';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/jobs/[id] - Public endpoint to get job details
 * No authentication required
 * Supports both job ID and slug
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // const id = 'cmf479xdf0001ulbw8i705irn';

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID or slug is required',
          message: 'Mã công việc là bắt buộc',
        },
        { status: 400 }
      );
    }

    // Get job detail
    const job = await PublicJobService.detailByIdOrSlug(id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
          message: 'Không tìm thấy công việc hoặc công việc đã ngừng tuyển dụng',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job details retrieved successfully',
      data: job,
    });
  } catch (error) {
    console.error('Error fetching public job detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job details',
        message: 'Đã xảy ra lỗi khi tải thông tin công việc',
      },
      { status: 500 }
    );
  }
}
