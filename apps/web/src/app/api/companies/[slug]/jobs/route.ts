import { NextRequest, NextResponse } from 'next/server';
import { CompanyJobService } from '@/services/public/company-job.service';

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * OPTIONS /api/companies/[slug]/jobs - Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const res = new NextResponse(null, { status: 200 });

  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

/**
 * GET /api/companies/[slug]/jobs - Get all active jobs of a specific company
 * @param slug - Company slug or ID
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 50)
 * - jobType: FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP
 * - experienceLevel: ENTRY | MID | SENIOR | LEAD | EXECUTIVE
 * - workLocationType: ONSITE | REMOTE | HYBRID
 * - search: string (search in title)
 * - sortBy: createdAt | publishedAt | salaryMin | salaryMax | applicationDeadline
 * - sortOrder: asc | desc
 * - includeExpired: boolean (default: false)
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const origin = request.headers.get('origin');

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company slug or ID is required',
          message: 'Mã hoặc slug công ty là bắt buộc',
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      jobType: searchParams.get('jobType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      workLocationType: searchParams.get('workLocationType') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'publishedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      includeExpired: searchParams.get('includeExpired') === 'true',
    };

    // Validate pagination params
    if (queryParams.page < 1) queryParams.page = 1;
    if (queryParams.limit < 1 || queryParams.limit > 50) queryParams.limit = 10;

    // Get company jobs
    const result = await CompanyJobService.getCompanyJobs(slug, queryParams);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          message: 'Không tìm thấy công ty',
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Company jobs retrieved successfully',
      data: result,
    });

    // Add CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company jobs',
        message: 'Đã xảy ra lỗi khi tải danh sách công việc của công ty',
      },
      { status: 500 }
    );

    const origin = request.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    return response;
  }
}