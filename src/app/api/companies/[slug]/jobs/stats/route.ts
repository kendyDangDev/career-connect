import { NextRequest, NextResponse } from 'next/server';
import { CompanyJobService } from '@/services/public/company-job.service';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * OPTIONS /api/companies/[slug]/jobs/stats - Handle CORS preflight
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
 * GET /api/companies/[slug]/jobs/stats - Get job statistics for a company
 * @param slug - Company slug or ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
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

    // First, find the company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { id: slug },
          { companySlug: slug }
        ]
      },
      select: {
        id: true,
        companyName: true,
        companySlug: true,
      }
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          message: 'Không tìm thấy công ty',
        },
        { status: 404 }
      );
    }

    // Get job statistics
    const stats = await CompanyJobService.getCompanyJobStats(company.id);

    const response = NextResponse.json({
      success: true,
      message: 'Company job statistics retrieved successfully',
      data: {
        company: {
          id: company.id,
          name: company.companyName,
          slug: company.companySlug,
        },
        stats
      },
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
    console.error('Error fetching company job statistics:', error);
    
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company job statistics',
        message: 'Đã xảy ra lỗi khi tải thống kê công việc của công ty',
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