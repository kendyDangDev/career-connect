import { prisma } from '@/lib/prisma';
// import { Prisma, Template } from '@prisma/client';
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateQuery,
} from '@/lib/validations/template.validation';
import { Prisma } from '@/types';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

// Configure Cloudinary (should be in env config)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class TemplateService {
  /**
   * Get all templates with pagination and filtering
   */
  static async getTemplates(query: TemplateQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      isPremium,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TemplateWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
      ...(isPremium !== undefined && { isPremium }),
    };

    // Execute query with pagination
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          _count: {
            select: { userCvs: true },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    // Transform data
    const data = templates.map((template) => ({
      ...template,
      usageCount: template._count.userCvs,
      _count: undefined,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string) {
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userCvs: true },
        },
        userCvs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            cv_name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return {
      ...template,
      usageCount: template._count.userCvs,
      recentUsages: template.userCvs,
      _count: undefined,
      userCvs: undefined,
    };
  }

  /**
   * Create a new template
   */
  static async createTemplate(data: CreateTemplateInput) {
    // Validate structure and styling if provided
    if (data.structure) {
      this.validateTemplateStructure(data.structure);
    }

    const template = await prisma.template.create({
      data: {
        name: data.name,
        category: data.category,
        previewImage: data.previewImage,
        structure: data.structure as any,
        styling: data.styling as any,
        isPremium: data.isPremium || false,
      },
    });

    return template;
  }

  /**
   * Update template
   */
  static async updateTemplate(id: string, data: UpdateTemplateInput) {
    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      throw new Error('Template not found');
    }

    // Validate structure and styling if provided
    if (data.structure) {
      this.validateTemplateStructure(data.structure);
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.previewImage !== undefined && { previewImage: data.previewImage }),
        ...(data.structure !== undefined && { structure: data.structure as any }),
        ...(data.styling !== undefined && { styling: data.styling as any }),
        ...(data.isPremium !== undefined && { isPremium: data.isPremium }),
      },
    });

    return template;
  }

  /**
   * Delete template
   */
  static async deleteTemplate(id: string) {
    // Check if template exists and is not in use
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userCvs: true },
        },
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Prevent deletion if template is in use
    if (template._count.userCvs > 0) {
      throw new Error(
        `Cannot delete template. It is being used by ${template._count.userCvs} CV(s).`
      );
    }

    // Delete preview image from Cloudinary if exists
    if (template.previewImage) {
      await this.deleteImageFromCloudinary(template.previewImage);
    }

    await prisma.template.delete({
      where: { id },
    });

    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Upload preview image
   */
  static async uploadPreviewImage(file: Buffer, filename: string): Promise<string> {
    try {
      // Optimize image with sharp
      const optimizedImage = await sharp(file)
        .resize(800, 1130, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'cv-templates',
            public_id: `template-${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Failed to upload image: ${error.message}`));
            } else if (result) {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(optimizedImage);
      });
    } catch (error) {
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(id: string, newName: string) {
    const sourceTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!sourceTemplate) {
      throw new Error('Source template not found');
    }

    const duplicatedTemplate = await prisma.template.create({
      data: {
        name: newName || `${sourceTemplate.name} (Copy)`,
        category: sourceTemplate.category,
        previewImage: sourceTemplate.previewImage,
        structure: sourceTemplate.structure as any,
        styling: sourceTemplate.styling as any,
        isPremium: sourceTemplate.isPremium,
      },
    });

    return duplicatedTemplate;
  }

  /**
   * Get template statistics
   */
  static async getTemplateStatistics() {
    const [totalTemplates, premiumTemplates, freeTemplates, categoryStats, usageStats] =
      await Promise.all([
        prisma.template.count(),
        prisma.template.count({ where: { isPremium: true } }),
        prisma.template.count({ where: { isPremium: false } }),
        prisma.template.groupBy({
          by: ['category'],
          _count: true,
        }),
        prisma.userCv.groupBy({
          by: ['templateId'],
          _count: true,
          orderBy: {
            _count: {
              templateId: 'desc',
            },
          },
          take: 10,
        }),
      ]);

    // Get most used templates details
    const mostUsedTemplateIds = usageStats
      .filter((stat) => stat.templateId)
      .map((stat) => stat.templateId as string);

    const mostUsedTemplates = await prisma.template.findMany({
      where: { id: { in: mostUsedTemplateIds } },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    const mostUsedWithCount = usageStats
      .filter((stat) => stat.templateId)
      .map((stat) => {
        const template = mostUsedTemplates.find((t) => t.id === stat.templateId);
        return {
          ...template,
          usageCount: stat._count,
        };
      });

    return {
      total: totalTemplates,
      premium: premiumTemplates,
      free: freeTemplates,
      byCategory: categoryStats.map((stat) => ({
        category: stat.category || 'uncategorized',
        count: stat._count,
      })),
      mostUsed: mostUsedWithCount,
    };
  }

  /**
   * Private helper methods
   */
  private static validateTemplateStructure(structure: any) {
    // Custom validation logic for template structure
    if (!structure.sections || !Array.isArray(structure.sections)) {
      throw new Error('Template structure must contain sections array');
    }

    // Check for duplicate section IDs
    const sectionIds = structure.sections.map((s: any) => s.id);
    const uniqueIds = new Set(sectionIds);
    if (sectionIds.length !== uniqueIds.size) {
      throw new Error('Duplicate section IDs found in template structure');
    }

    return true;
  }

  private static async deleteImageFromCloudinary(imageUrl: string) {
    try {
      // Extract public_id from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `cv-templates/${filename.split('.')[0]}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      // Don't throw error as this is not critical
    }
  }
}