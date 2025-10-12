import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/services/template.service';
import { withAdmin } from '@/lib/middleware';

/**
 * GET /api/admin/templates/stats
 * Get template statistics
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const statistics = await TemplateService.getTemplateStatistics();

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('GET /api/admin/templates/stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

