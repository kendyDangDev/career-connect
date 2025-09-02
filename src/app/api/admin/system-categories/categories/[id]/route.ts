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
  updateCategorySchema,
  idParamSchemaJoi,
  validateAndCreateSlug,
  checkDuplicateName,
  checkItemInUse
} from '@/lib/validations/system-categories';
import { Category } from '@/types/system-categories';

// GET /api/admin/system-categories/categories/[id]
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

    // Get category with full details
    const category = await prisma.category.findUnique({
      where: { id: id! },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: {
                children: true,
                jobCategories: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true,
            jobCategories: true
          }
        }
      }
    });

    if (!category) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy danh mục',
        404
      );
    }

    return successResponse<Category>(category as any);
  } catch (error: any) {
    console.error('Get category error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy thông tin danh mục',
      500
    );
  }
});

// PUT /api/admin/system-categories/categories/[id]
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

    // Get existing category
    const existingCategory = await prisma.category.findUnique({
      where: { id: id! },
      include: {
        children: {
          select: { id: true }
        }
      }
    });

    if (!existingCategory) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy danh mục',
        404
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const isDuplicate = await checkDuplicateName(
        prisma,
        'category',
        validatedData.name,
        id
      );

      if (isDuplicate) {
        return errorResponse(
          'DUPLICATE_NAME',
          'Danh mục với tên này đã tồn tại',
          400
        );
      }
    }

    // Validate parent ID if being updated
    if (validatedData.parentId !== undefined) {
      // Cannot set itself as parent
      if (validatedData.parentId === id) {
        return errorResponse(
          'SELF_PARENT',
          'Danh mục không thể là cha của chính nó',
          400
        );
      }

      // Check if new parent exists
      if (validatedData.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: validatedData.parentId }
        });

        if (!parentCategory) {
          return errorResponse(
            'INVALID_PARENT',
            'Danh mục cha không tồn tại',
            400
          );
        }

        // Check for circular reference
        // Cannot set a child category as parent
        const childIds = existingCategory.children.map(c => c.id);
        if (childIds.includes(validatedData.parentId)) {
          return errorResponse(
            'CIRCULAR_REFERENCE',
            'Không thể đặt danh mục con làm danh mục cha',
            400
          );
        }

        // Check depth
        let currentParentId = parentCategory.parentId;
        let depth = 1;
        const MAX_DEPTH = 3;

        while (currentParentId && depth < MAX_DEPTH) {
          const parent = await prisma.category.findUnique({
            where: { id: currentParentId },
            select: { parentId: true }
          });
          
          if (!parent) break;
          currentParentId = parent.parentId;
          depth++;
        }

        if (depth >= MAX_DEPTH) {
          return errorResponse(
            'MAX_DEPTH_EXCEEDED',
            `Không thể di chuyển danh mục vào cấp quá ${MAX_DEPTH}`,
            400
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = validateAndCreateSlug({ name: updateData.name }).slug;
    }

    // Handle parentId update
    if (validatedData.parentId === '') {
      updateData.parentId = null;
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: id! },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            children: true,
            jobCategories: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'UPDATE',
      'categories',
      id!,
      existingCategory,
      updatedCategory,
      req
    );

    return successResponse<Category>(
      updatedCategory as any,
      'Cập nhật danh mục thành công'
    );
  } catch (error: any) {
    console.error('Update category error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'UPDATE_ERROR',
      error.message || 'Không thể cập nhật danh mục',
      500
    );
  }
});

// DELETE /api/admin/system-categories/categories/[id]
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

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: id! }
    });

    if (!category) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy danh mục',
        404
      );
    }

    // Check if category is in use
    const { inUse, count, relatedModel } = await checkItemInUse(
      prisma,
      'category',
      id!
    );

    if (inUse) {
      return errorResponse(
        'IN_USE',
        `Không thể xóa danh mục này vì đang được sử dụng bởi ${count} ${relatedModel}`,
        400
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: id! }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'DELETE',
      'categories',
      id!,
      category,
      null,
      req
    );

    return successResponse(
      { id },
      'Xóa danh mục thành công'
    );
  } catch (error: any) {
    console.error('Delete category error:', error);
    return errorResponse(
      'DELETE_ERROR',
      error.message || 'Không thể xóa danh mục',
      500
    );
  }
});
