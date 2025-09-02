import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createAdminHandler,
  createAuditLog,
  successResponse,
  errorResponse,
  checkRateLimit
} from '@/middleware/admin-auth';
import {
  bulkOperationSchema,
  bulkUpdateStatusSchema
} from '@/lib/validations/system-categories';

// POST /api/admin/system-categories/industries/bulk/update-status
export const POST = createAdminHandler(async (req, context) => {
  try {
    // Check rate limit
    if (!checkRateLimit(context.user.id, 5, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = bulkUpdateStatusSchema.parse(body);

    // Check if all IDs exist
    const industries = await prisma.industry.findMany({
      where: {
        id: { in: validatedData.ids }
      },
      select: { id: true, name: true, isActive: true }
    });

    if (industries.length !== validatedData.ids.length) {
      const foundIds = industries.map(i => i.id);
      const notFoundIds = validatedData.ids.filter(id => !foundIds.includes(id));
      return errorResponse(
        'NOT_FOUND',
        `Không tìm thấy ngành nghề với ID: ${notFoundIds.join(', ')}`,
        404
      );
    }

    // Update status for all industries
    const updateResult = await prisma.industry.updateMany({
      where: {
        id: { in: validatedData.ids }
      },
      data: {
        isActive: validatedData.isActive
      }
    });

    // Create audit logs for each updated industry
    for (const industry of industries) {
      await createAuditLog(
        context.user.id,
        'UPDATE_STATUS',
        'industries',
        industry.id,
        { isActive: industry.isActive },
        { isActive: validatedData.isActive },
        req
      );
    }

    return successResponse(
      {
        updated: updateResult.count,
        ids: validatedData.ids
      },
      `Đã cập nhật trạng thái cho ${updateResult.count} ngành nghề`
    );
  } catch (error: any) {
    console.error('Bulk update status error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'UPDATE_ERROR',
      error.message || 'Không thể cập nhật trạng thái',
      500
    );
  }
});

// DELETE /api/admin/system-categories/industries/bulk
export const DELETE = createAdminHandler(async (req, context) => {
  try {
    // Check rate limit
    if (!checkRateLimit(context.user.id, 3, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = bulkOperationSchema.parse(body);

    // Check if all IDs exist
    const industries = await prisma.industry.findMany({
      where: {
        id: { in: validatedData.ids }
      },
      select: { id: true, name: true }
    });

    if (industries.length !== validatedData.ids.length) {
      const foundIds = industries.map(i => i.id);
      const notFoundIds = validatedData.ids.filter(id => !foundIds.includes(id));
      return errorResponse(
        'NOT_FOUND',
        `Không tìm thấy ngành nghề với ID: ${notFoundIds.join(', ')}`,
        404
      );
    }

    // Check if any industry is in use
    const companyCounts = await prisma.company.groupBy({
      by: ['industryId'],
      where: {
        industryId: { in: validatedData.ids }
      },
      _count: true
    });

    const inUseIndustries = companyCounts.filter(c => c._count > 0);
    if (inUseIndustries.length > 0) {
      const inUseIds = inUseIndustries.map(i => i.industryId);
      const inUseNames = industries
        .filter(i => inUseIds.includes(i.id))
        .map(i => i.name);
      
      return errorResponse(
        'IN_USE',
        `Không thể xóa các ngành nghề đang được sử dụng: ${inUseNames.join(', ')}`,
        400
      );
    }

    // Delete all industries
    const deleteResult = await prisma.industry.deleteMany({
      where: {
        id: { in: validatedData.ids }
      }
    });

    // Create audit logs for each deleted industry
    for (const industry of industries) {
      await createAuditLog(
        context.user.id,
        'BULK_DELETE',
        'industries',
        industry.id,
        industry,
        null,
        req
      );
    }

    return successResponse(
      {
        deleted: deleteResult.count,
        ids: validatedData.ids
      },
      `Đã xóa ${deleteResult.count} ngành nghề`
    );
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'DELETE_ERROR',
      error.message || 'Không thể xóa ngành nghề',
      500
    );
  }
});
