import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/jobs/categories
 * Returns all job categories sorted by name
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[/api/jobs/categories] Error:', error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
