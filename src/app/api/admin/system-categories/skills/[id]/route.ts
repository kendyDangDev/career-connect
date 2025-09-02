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
  updateSkillSchema,
  idParamSchemaJoi,
  validateAndCreateSlug,
  checkDuplicateName,
  checkItemInUse
} from '@/lib/validations/system-categories';
import { Skill } from '@/types/system-categories';

// GET /api/admin/system-categories/skills/[id]
export const GET = createAdminHandler(async (req, context) => {
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

    // Get skill
    const skill = await prisma.skill.findUnique({
      where: { id: id! },
      include: {
        _count: {
          select: {
            candidateSkills: true,
            jobSkills: true
          }
        }
      }
    });

    if (!skill) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy kỹ năng',
        404
      );
    }

    return successResponse<Skill>(skill as any);
  } catch (error: any) {
    console.error('Get skill error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy thông tin kỹ năng',
      500
    );
  }
});

// PUT /api/admin/system-categories/skills/[id]
export const PUT = createAdminHandler(async (req, context) => {
  try {
    // Check rate limit
    if (!checkRateLimit(context.user.id, 10, 60000)) {
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

    // Get existing skill
    const existingSkill = await prisma.skill.findUnique({
      where: { id: id! }
    });

    if (!existingSkill) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy kỹ năng',
        404
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateSkillSchema.parse(body);

    // Check duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingSkill.name) {
      const isDuplicate = await checkDuplicateName(
        prisma,
        'skill',
        validatedData.name,
        id
      );

      if (isDuplicate) {
        return errorResponse(
          'DUPLICATE_NAME',
          'Kỹ năng với tên này đã tồn tại',
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

    // Update skill
    const updatedSkill = await prisma.skill.update({
      where: { id: id! },
      data: updateData,
      include: {
        _count: {
          select: {
            candidateSkills: true,
            jobSkills: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'UPDATE',
      'skills',
      id!,
      existingSkill,
      updatedSkill,
      req
    );

    return successResponse<Skill>(
      updatedSkill as any,
      'Cập nhật kỹ năng thành công'
    );
  } catch (error: any) {
    console.error('Update skill error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'UPDATE_ERROR',
      error.message || 'Không thể cập nhật kỹ năng',
      500
    );
  }
});

// DELETE /api/admin/system-categories/skills/[id]
export const DELETE = createAdminHandler(async (req, context) => {
  try {
    // Check rate limit
    if (!checkRateLimit(context.user.id, 5, 60000)) {
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

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: id! }
    });

    if (!skill) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy kỹ năng',
        404
      );
    }

    // Check if skill is in use
    const { inUse, count, relatedModel } = await checkItemInUse(
      prisma,
      'skill',
      id!
    );

    if (inUse) {
      return errorResponse(
        'IN_USE',
        `Không thể xóa kỹ năng này vì đang được sử dụng bởi ${count} ${relatedModel}`,
        400
      );
    }

    // Delete skill
    await prisma.skill.delete({
      where: { id: id! }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'DELETE',
      'skills',
      id!,
      skill,
      null,
      req
    );

    return successResponse(
      { id },
      'Xóa kỹ năng thành công'
    );
  } catch (error: any) {
    console.error('Delete skill error:', error);
    return errorResponse(
      'DELETE_ERROR',
      error.message || 'Không thể xóa kỹ năng',
      500
    );
  }
});
