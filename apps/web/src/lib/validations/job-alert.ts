import { z } from 'zod';
import { JobType, ExperienceLevel, AlertFrequency } from '@/generated/prisma';

// Enum validators
const jobTypeSchema = z.nativeEnum(JobType).optional();
const experienceLevelSchema = z.nativeEnum(ExperienceLevel).optional();
const alertFrequencySchema = z.nativeEnum(AlertFrequency).optional();

// Create job alert schema
export const createJobAlertSchema = z
  .object({
    alertName: z
      .string()
      .min(3, 'Tên thông báo phải có ít nhất 3 ký tự')
      .max(100, 'Tên thông báo không được vượt quá 100 ký tự')
      .trim(),

    keywords: z
      .string()
      .max(500, 'Từ khóa không được vượt quá 500 ký tự')
      .optional()
      .transform((val) => val?.trim() || undefined),

    locationIds: z
      .array(z.string().cuid())
      .max(10, 'Chỉ được chọn tối đa 10 địa điểm')
      .optional()
      .default([]),

    categoryIds: z
      .array(z.string().cuid())
      .max(10, 'Chỉ được chọn tối đa 10 danh mục')
      .optional()
      .default([]),

    jobType: jobTypeSchema,

    salaryMin: z.number().min(0, 'Mức lương tối thiểu phải lớn hơn hoặc bằng 0').optional(),

    experienceLevel: experienceLevelSchema,

    frequency: alertFrequencySchema.default(AlertFrequency.WEEKLY),
  })
  .refine(
    (data) => {
      // At least one filter criteria must be provided
      return !!(
        data.keywords ||
        (data.locationIds && data.locationIds.length > 0) ||
        (data.categoryIds && data.categoryIds.length > 0) ||
        data.jobType ||
        data.salaryMin ||
        data.experienceLevel
      );
    },
    {
      message: 'Phải có ít nhất một tiêu chí tìm kiếm',
      path: ['general'],
    }
  );

// Update job alert schema
export const updateJobAlertSchema = z
  .object({
    alertName: z
      .string()
      .min(3, 'Tên thông báo phải có ít nhất 3 ký tự')
      .max(100, 'Tên thông báo không được vượt quá 100 ký tự')
      .trim()
      .optional(),

    keywords: z
      .string()
      .max(500, 'Từ khóa không được vượt quá 500 ký tự')
      .optional()
      .transform((val) => val?.trim() || undefined),

    locationIds: z.array(z.string().cuid()).max(10, 'Chỉ được chọn tối đa 10 địa điểm').optional(),

    categoryIds: z.array(z.string().cuid()).max(10, 'Chỉ được chọn tối đa 10 danh mục').optional(),

    jobType: jobTypeSchema,

    salaryMin: z.number().min(0, 'Mức lương tối thiểu phải lớn hơn hoặc bằng 0').optional(),

    experienceLevel: experienceLevelSchema,

    frequency: alertFrequencySchema,

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If updating filters, at least one must be provided
      const hasFilterUpdate =
        data.keywords !== undefined ||
        data.locationIds !== undefined ||
        data.categoryIds !== undefined ||
        data.jobType !== undefined ||
        data.salaryMin !== undefined ||
        data.experienceLevel !== undefined;

      // If only filter updates are being made, ensure at least one is meaningful
      if (
        hasFilterUpdate &&
        !data.alertName &&
        data.isActive === undefined &&
        data.frequency === undefined
      ) {
        return !!(
          data.keywords ||
          (data.locationIds && data.locationIds.length > 0) ||
          (data.categoryIds && data.categoryIds.length > 0) ||
          data.jobType ||
          data.salaryMin ||
          data.experienceLevel
        );
      }

      return true;
    },
    {
      message: 'Phải có ít nhất một tiêu chí tìm kiếm khi cập nhật bộ lọc',
      path: ['general'],
    }
  );

// Toggle job alert status schema
export const toggleJobAlertStatusSchema = z.object({
  isActive: z.boolean(),
});

// Query parameters schema for listing job alerts
export const jobAlertQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Trang phải là số nguyên dương')
    .transform(Number)
    .refine((val) => val > 0, 'Trang phải lớn hơn 0')
    .optional()
    .default(1),

  limit: z
    .string()
    .regex(/^\d+$/, 'Giới hạn phải là số nguyên dương')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, 'Giới hạn phải từ 1 đến 100')
    .optional()
    .default(20),

  search: z.string().max(100, 'Từ khóa tìm kiếm không được vượt quá 100 ký tự').optional(),

  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  frequency: z
    .string()
    .refine((val) => !val || Object.values(AlertFrequency).includes(val as AlertFrequency))
    .transform((val) => (val ? [val as AlertFrequency] : undefined))
    .optional(),

  hasKeywords: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  hasLocations: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  hasCategories: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  sortBy: z
    .enum(['createdAt', 'alertName', 'lastSentAt', 'frequency'])
    .optional()
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Type exports
export type CreateJobAlertInput = z.infer<typeof createJobAlertSchema>;
export type UpdateJobAlertInput = z.infer<typeof updateJobAlertSchema>;
export type ToggleJobAlertStatusInput = z.infer<typeof toggleJobAlertStatusSchema>;
export type JobAlertQueryInput = z.infer<typeof jobAlertQuerySchema>;

// Validation helper functions
export function validateCreateJobAlert(data: unknown) {
  return createJobAlertSchema.safeParse(data);
}

export function validateUpdateJobAlert(data: unknown) {
  return updateJobAlertSchema.safeParse(data);
}

export function validateToggleJobAlertStatus(data: unknown) {
  return toggleJobAlertStatusSchema.safeParse(data);
}

export function validateJobAlertQuery(data: unknown) {
  return jobAlertQuerySchema.safeParse(data);
}
