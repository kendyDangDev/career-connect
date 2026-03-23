import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@/generated/prisma';

/**
 * GET /api/jobs/skill-options
 * Returns active skills used by active jobs for public filters.
 */
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')?.trim();
    const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? '200');
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 200)
      : 200;

    const skills = await prisma.skill.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
        jobSkills: {
          some: {
            job: {
              status: JobStatus.ACTIVE,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: limit,
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[/api/jobs/skill-options] Error:', error);
    return NextResponse.json({ skills: [] }, { status: 200 });
  }
}
