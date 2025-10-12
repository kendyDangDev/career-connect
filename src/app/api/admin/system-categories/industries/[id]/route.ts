import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { UserType } from '@/generated/prisma';
import {
  createAuditLog,
  successResponse,
  errorResponse,
  paginatedResponse,
  checkRateLimit
} from '@/lib/middleware/utils';
import {
  updateIndustrySchema,
  idParamSchemaJoi,
  validateAndCreateSlug,
  checkDuplicateName,
  checkItemInUse
} from '@/lib/validations/system-categories';
import { Industry } from '@/types/system-categories';

// GET /api/admin/system-categories/industries/[id]
export const GET = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error } = idParamSchemaJoi.validate({ id });
    if (error) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Get industry
    const industry = await prisma.industry.findUnique({
      where: { id: id! },
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      }
    });

    if (!industry) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy ngành nghề',
        404
      );
    }

    return successResponse<Industry>(industry as any);
  } catch (error: any) {
    console.error('Get industry error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy thông tin ngành nghề',
      500
    );
  }
});

// PUT /api/admin/system-categories/industries/[id]
export const PUT = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.user!.id, 10, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error: idError } = idParamSchemaJoi.validate({ id });
    if (idError) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Get existing industry
    const existingIndustry = await prisma.industry.findUnique({
      where: { id: id! }
    });

    if (!existingIndustry) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy ngành nghề',
        404
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateIndustrySchema.parse(body);

    // Check duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingIndustry.name) {
      const isDuplicate = await checkDuplicateName(
        prisma,
        'industry',
        validatedData.name,
        id
      );

      if (isDuplicate) {
        return errorResponse(
          'DUPLICATE_NAME',
          'Ngành nghề với tên này đã tồn tại',
          400
        );
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = validateAndCreateSlug({ name: updateData.name }).slug;
    }

    // Update industry
    const updatedIndustry = await prisma.industry.update({
      where: { id: id! },
      data: updateData,
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'industries',
      id!,
      existingIndustry,
      updatedIndustry,
      req
    );

    return successResponse<Industry>(
      updatedIndustry as any,
      'Cập nhật ngành nghề thành công'
    );
  } catch (error: any) {
    console.error('Update industry error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'UPDATE_ERROR',
      error.message || 'Không thể cập nhật ngành nghề',
      500
    );
  }
});

// DELETE /api/admin/system-categories/industries/[id]
export const DELETE = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.user!.id, 5, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error } = idParamSchemaJoi.validate({ id });
    if (error) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Check if industry exists
    const industry = await prisma.industry.findUnique({
      where: { id: id! }
    });

    if (!industry) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy ngành nghề',
        404
      );
    }

    // Check if industry is in use
    const { inUse, count, relatedModel } = await checkItemInUse(
      prisma,
      'industry',
      id!
    );

    if (inUse) {
      return errorResponse(
        'IN_USE',
        `Không thể xóa ngành nghề này vì đang được sử dụng bởi ${count} ${relatedModel}`,
        400
      );
    }

    // Delete industry
    await prisma.industry.delete({
      where: { id: id! }
    });

    // Create audit log
    await createAuditLog(
      req.user!.id,
      'DELETE',
      'industries',
      id!,
      industry,
      null,
      req
    );

    return successResponse(
      { id },
      'Xóa ngành nghề thành công'
    );
  } catch (error: any) {
    console.error('Delete industry error:', error);
    return errorResponse(
      'DELETE_ERROR',
      error.message || 'Không thể xóa ngành nghề',
      500
    );
  }
});
