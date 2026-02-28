import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/companies
 * Public endpoint to list companies sorted by active job count
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companySlug: true,
        companyName: true,
        logoUrl: true,
        verificationStatus: true,
        _count: {
          select: {
            jobs: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      where: {
        verificationStatus: { in: ['VERIFIED', 'PENDING'] },
      },
      orderBy: {
        jobs: { _count: 'desc' },
      },
      take: limit,
    });

    const result = companies.map((c) => ({
      id: c.id,
      companySlug: c.companySlug,
      companyName: c.companyName,
      logoUrl: c.logoUrl,
      verificationStatus: c.verificationStatus,
      activeJobCount: c._count.jobs,
    }));

    return NextResponse.json({ companies: result });
  } catch (error) {
    console.error('[/api/companies] Error:', error);
    return NextResponse.json({ companies: [] }, { status: 200 });
  }
}
