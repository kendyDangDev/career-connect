import { NextRequest, NextResponse } from 'next/server';
import { PublicJobService, PublicJobListParams } from '@/services/public/job.service';

/**
 * OPTIONS /api/jobs - Handle CORS preflight for public jobs endpoint
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const res = new NextResponse(null, { status: 200 });

  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    // Fallback for server-to-server or missing origin
    res.headers.set('Access-Control-Allow-Origin', '*');
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

/**
 * GET /api/jobs - Public endpoint to get list of active jobs
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const origin = request.headers.get('origin');

    // Parse query parameters
    const params: PublicJobListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50), // Max 50 items per page
      search: searchParams.get('search') || undefined,
      jobType: searchParams.get('jobType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      salaryMin:
        searchParams.get('salaryMin') && !isNaN(parseInt(searchParams.get('salaryMin')!))
          ? parseInt(searchParams.get('salaryMin')!)
          : undefined,
      salaryMax:
        searchParams.get('salaryMax') && !isNaN(parseInt(searchParams.get('salaryMax')!))
          ? parseInt(searchParams.get('salaryMax')!)
          : undefined,
      locationCity: searchParams.get('locationCity') || undefined,
      locationProvince: searchParams.get('locationProvince') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      skills: searchParams
        .get('skills')
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      companyId: searchParams.get('companyId') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'publishedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // Validate pagination params
    if (params.page! < 1) params.page = 1;
    if (params.limit! < 1 || params.limit! > 50) params.limit = 10;

    // Validate salary params
    if (
      params.salaryMin !== undefined &&
      params.salaryMax !== undefined &&
      params.salaryMin > params.salaryMax
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid salary range',
          message: 'salaryMin cannot be greater than salaryMax',
        },
        { status: 400 }
      );
    }

    // Get jobs list
    const result = await PublicJobService.list(params);

    const response = NextResponse.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: result,
    });

    // Add CORS headers for RN / Expo
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  } catch (error) {
    console.error('Error fetching public jobs list:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: 'Đã xảy ra lỗi khi tải danh sách công việc',
      },
      { status: 500 }
    );

    const origin = request.headers.get('origin');
    // if (origin) {
    //   response.headers.set('Access-Control-Allow-Origin', origin);
    //   response.headers.set('Access-Control-Allow-Credentials', 'true');
    // } else {
    //   response.headers.set('Access-Control-Allow-Origin', '*');
    // }
    // response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    // response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }
}
