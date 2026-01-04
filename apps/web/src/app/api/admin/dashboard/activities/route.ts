import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { AdminDashboardActivities, ActivityType } from '@/types/admin/dashboard.types';

/**
 * GET /api/admin/dashboard/activities
 * Lấy recent activities trong hệ thống từ audit logs
 * Requires: ADMIN role
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 50, max 100)
 * - type: ActivityType | ActivityType[] (comma separated)
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - userId: filter by specific user
 * - search: search in action/tableName
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Filters
    const typeParam = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    // Type filter
    if (typeParam) {
      const types = typeParam.split(',').filter(Boolean);
      if (types.length > 0) {
        where.action = { in: types };
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // User filter
    if (userId) {
      where.userId = userId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { tableName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Lấy tất cả log, sau đó filter admin ở phía code
    const [allAuditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit * 3, // lấy nhiều hơn để bù cho việc filter phía code
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userType: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Filter bỏ các log của userType: 'ADMIN'
    const auditLogs = allAuditLogs.filter((log) => log.user?.userType !== 'ADMIN').slice(0, limit);

    // Map audit logs to activities format
    const recentActivities = auditLogs.map((log) => {
      const userName = log.user
        ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
        : 'System';

      // Determine activity type from action
      let activityType: ActivityType = 'SYSTEM_EVENT';
      let description = '';

      if (
        log.action.includes('USER') ||
        log.action.includes('LOGIN') ||
        log.action.includes('REGISTER')
      ) {
        if (log.action.includes('REGISTER')) {
          activityType = 'USER_REGISTRATION';
          description = `Đã đăng ký tài khoản mới`;
        } else if (log.action.includes('LOGIN')) {
          activityType = 'USER_LOGIN';
          description = `Đã đăng nhập vào hệ thống`;
        } else if (log.action.includes('UPDATE')) {
          activityType = 'USER_UPDATE';
          description = `Đã cập nhật thông tin tài khoản`;
        }
      } else if (log.action.includes('COMPANY')) {
        if (log.action.includes('VERIFICATION') || log.action.includes('VERIFY')) {
          activityType = 'COMPANY_VERIFICATION';
          description = `Công ty Đã được xác thực`;
        } else if (log.action.includes('UPDATE')) {
          activityType = 'COMPANY_UPDATE';
          description = `Đã cập nhật thông tin công ty`;
        } else {
          activityType = 'COMPANY_REGISTRATION';
          description = `Công ty mới Đã được đăng ký`;
        }
      } else if (log.action.includes('JOB')) {
        if (log.action.includes('CREATE')) {
          activityType = 'JOB_CREATION';
          description = `Đã tạo tin tuyển dụng mới`;
        } else if (log.action.includes('STATUS')) {
          activityType = 'JOB_STATUS_CHANGE';
          description = `Trạng thái tin tuyển dụng Đã được thay đổi`;
        } else if (log.action.includes('UPDATE')) {
          activityType = 'JOB_UPDATE';
          description = `Đã cập nhật tin tuyển dụng`;
        }
      } else if (log.action.includes('APPLICATION')) {
        if (log.action.includes('SUBMIT') || log.action.includes('CREATE')) {
          activityType = 'APPLICATION_SUBMITTED';
          description = `Đã nộp đơn ứng tuyển`;
        } else if (log.action.includes('STATUS')) {
          activityType = 'APPLICATION_STATUS_CHANGE';
          description = `Trạng thái đơn ứng tuyển Đã được cập nhật`;
        }
      } else if (log.action.includes('ADMIN')) {
        activityType = 'ADMIN_ACTION';
        description = `Admin Đã thực hiện hành động: ${log.action}`;
      }

      // If no description yet, use action name
      if (!description) {
        description = log.action.replace(/_/g, ' ').toLowerCase();
      }

      return {
        id: log.id,
        type: activityType,
        action: log.action,
        description,
        userId: log.userId || undefined,
        userName: log.user ? userName : undefined,
        userType: log.user?.userType || undefined,
        targetId: log.recordId || undefined,
        targetType: log.tableName || undefined,
        metadata: {
          ...(log.newValues ? { newValues: log.newValues } : {}),
          ...(log.oldValues ? { oldValues: log.oldValues } : {}),
        },
        timestamp: log.createdAt.toISOString(),
        ipAddress: log.ipAddress || undefined,
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    // Response
    const activitiesData: AdminDashboardActivities = {
      recentActivities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      filters: {
        type: typeParam ? (typeParam.split(',') as ActivityType[]) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: activitiesData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin dashboard activities error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch activities',
        message: 'Đã xảy ra lỗi khi tải hoạt động hệ thống',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
