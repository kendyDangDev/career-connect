import { z } from 'zod';
import { SkillCategory, LocationType } from '@/types/system-categories';

// Common validation schemas
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
};

// Industry validation schemas
export const createIndustrySchema = z.object({
  name: z.string().min(2, 'Tên ngành nghề phải có ít nhất 2 ký tự').max(100),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateIndustrySchema = createIndustrySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(100),
  parentId: z.string().cuid().optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Skill validation schemas
export const createSkillSchema = z.object({
  name: z.string().min(2, 'Tên kỹ năng phải có ít nhất 2 ký tự').max(100),
  category: z.nativeEnum(SkillCategory, {
    message: 'Loại kỹ năng không hợp lệ',
  }),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
});

export const updateSkillSchema = createSkillSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Location validation schemas
export const createLocationSchema = z.object({
  name: z.string().min(2, 'Tên địa điểm phải có ít nhất 2 ký tự').max(100),
  type: z.nativeEnum(LocationType, {
    message: 'Loại địa điểm không hợp lệ',
  }),
  parentId: z.string().cuid().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Query validation schemas
export const systemCategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'sortOrder']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const categoryQuerySchema = systemCategoryQuerySchema.extend({
  parentId: z.string().cuid().optional().or(z.literal('null')),
  includeChildren: z.coerce.boolean().default(false),
});

export const locationQuerySchema = systemCategoryQuerySchema.extend({
  type: z.nativeEnum(LocationType).optional(),
  parentId: z.string().cuid().optional().or(z.literal('null')),
  includeChildren: z.coerce.boolean().default(false),
});

export const skillQuerySchema = systemCategoryQuerySchema.extend({
  category: z.nativeEnum(SkillCategory).optional(),
});

// Bulk operation schemas
export const bulkOperationSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Phải chọn ít nhất 1 mục'),
});

export const bulkUpdateStatusSchema = bulkOperationSchema.extend({
  isActive: z.boolean(),
});

// ID validation
export const idParamSchema = z.object({
  id: z.string().cuid('ID không hợp lệ'),
});

// ID validation for Joi (used in route handlers)
import Joi from 'joi';
export const idParamSchemaJoi = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'ID là bắt buộc',
    'string.empty': 'ID không được để trống',
  }),
});

// Import validation
export const importFileSchema = z.object({
  file: z.any(), // Will be validated in the handler
});

// Validation helpers
export const validateAndCreateSlug = (data: any) => {
  if (data.name && !data.slug) {
    data.slug = createSlug(data.name);
  }
  return data;
};

// Check duplicate name
export const checkDuplicateName = async (
  prisma: any,
  model: string,
  name: string,
  excludeId?: string
) => {
  const whereClause: any = {
    name: {
      equals: name,
      mode: 'insensitive',
    },
  };

  if (excludeId) {
    whereClause.NOT = { id: excludeId };
  }

  const existing = await (prisma as any)[model].findFirst({
    where: whereClause,
  });

  return !!existing;
};

// Check if item is in use
export const checkItemInUse = async (
  prisma: any,
  model: string,
  id: string
): Promise<{ inUse: boolean; count: number; relatedModel?: string }> => {
  switch (model) {
    case 'industry':
      const companiesCount = await prisma.company.count({
        where: { industryId: id },
      });
      return {
        inUse: companiesCount > 0,
        count: companiesCount,
        relatedModel: 'companies',
      };

    case 'category':
      const jobCategoriesCount = await prisma.jobCategory.count({
        where: { categoryId: id },
      });
      const childrenCount = await prisma.category.count({
        where: { parentId: id },
      });
      const totalCount = jobCategoriesCount + childrenCount;
      return {
        inUse: totalCount > 0,
        count: totalCount,
        relatedModel: totalCount > 0 ? 'jobCategories/children' : undefined,
      };

    case 'skill':
      const candidateSkillsCount = await prisma.candidateSkill.count({
        where: { skillId: id },
      });
      const jobSkillsCount = await prisma.jobSkill.count({
        where: { skillId: id },
      });
      const totalSkillCount = candidateSkillsCount + jobSkillsCount;
      return {
        inUse: totalSkillCount > 0,
        count: totalSkillCount,
        relatedModel: totalSkillCount > 0 ? 'candidateSkills/jobSkills' : undefined,
      };

    case 'location':
      const locationChildrenCount = await prisma.location.count({
        where: { parentId: id },
      });
      return {
        inUse: locationChildrenCount > 0,
        count: locationChildrenCount,
        relatedModel: 'children',
      };

    default:
      return { inUse: false, count: 0 };
  }
};
