import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest, successResponse } from '@/lib/middleware';
import { AdminCompanyService } from '@/services/admin/company.service';

// GET: Get company statistics (Admin with system.view_analytics permission)
export const GET = withPermission(
  'system.view_analytics',
  async (request: AuthenticatedRequest) => {
    try {
      // Get statistics
      const stats = await AdminCompanyService.getAdminStats();

      return successResponse(stats);
    } catch (error) {
      console.error('Error fetching company statistics:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch company statistics',
        },
        { status: 500 }
      );
    }
  }
);
