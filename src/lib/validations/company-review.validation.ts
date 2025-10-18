import { z } from 'zod';
import { EmploymentStatus } from '@/generated/prisma';

// Rating validation helper
const ratingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

// Create company review schema
export const createCompanyReviewSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),

  rating: ratingSchema,

  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),

  reviewText: z
    .string()
    .min(50, 'Review must be at least 50 characters')
    .max(2000, 'Review is too long'),

  pros: z
    .string()
    .min(10, 'Pros must be at least 10 characters')
    .max(1000, 'Pros is too long')
    .optional()
    .nullable(),

  cons: z
    .string()
    .min(10, 'Cons must be at least 10 characters')
    .max(1000, 'Cons is too long')
    .optional()
    .nullable(),

  workLifeBalanceRating: ratingSchema.optional().nullable(),

  salaryBenefitRating: ratingSchema.optional().nullable(),

  managementRating: ratingSchema.optional().nullable(),

  cultureRating: ratingSchema.optional().nullable(),

  isAnonymous: z.boolean().optional().default(false),

  employmentStatus: z.nativeEnum(EmploymentStatus, {
    message: 'Invalid employment status',
  }),

  positionTitle: z
    .string()
    .min(2, 'Position title must be at least 2 characters')
    .max(100, 'Position title is too long')
    .optional()
    .nullable(),

  employmentLength: z
    .string()
    .min(2, 'Employment length must be at least 2 characters')
    .max(50, 'Employment length is too long')
    .optional()
    .nullable(),
});

// Update company review schema
export const updateCompanyReviewSchema = z.object({
  rating: ratingSchema.optional(),

  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title is too long')
    .optional(),

  reviewText: z
    .string()
    .min(50, 'Review must be at least 50 characters')
    .max(2000, 'Review is too long')
    .optional(),

  pros: z
    .string()
    .min(10, 'Pros must be at least 10 characters')
    .max(1000, 'Pros is too long')
    .nullable()
    .optional(),

  cons: z
    .string()
    .min(10, 'Cons must be at least 10 characters')
    .max(1000, 'Cons is too long')
    .nullable()
    .optional(),

  workLifeBalanceRating: ratingSchema.nullable().optional(),

  salaryBenefitRating: ratingSchema.nullable().optional(),

  managementRating: ratingSchema.nullable().optional(),

  cultureRating: ratingSchema.nullable().optional(),

  isAnonymous: z.boolean().optional(),

  employmentStatus: z
    .nativeEnum(EmploymentStatus, {
      message: 'Invalid employment status',
    })
    .optional(),

  positionTitle: z
    .string()
    .min(2, 'Position title must be at least 2 characters')
    .max(100, 'Position title is too long')
    .nullable()
    .optional(),

  employmentLength: z
    .string()
    .min(2, 'Employment length must be at least 2 characters')
    .max(50, 'Employment length is too long')
    .nullable()
    .optional(),
});

// Admin update review schema
export const adminUpdateReviewSchema = z.object({
  isApproved: z.boolean(),
});

// Report review schema
export const reportReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),

  reason: z.string().min(5, 'Reason must be at least 5 characters').max(100, 'Reason is too long'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description is too long')
    .optional(),
});

// Query parameters schema for getting reviews
export const getCompanyReviewsQuerySchema = z
  .object({
    companyId: z.string().optional(),
    companySlug: z.string().optional(),
    reviewerId: z.string().optional(),
    isApproved: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    rating: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 5, {
        message: 'Rating must be between 1 and 5',
      })
      .optional(),
    minRating: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 5, {
        message: 'Minimum rating must be between 1 and 5',
      })
      .optional(),
    employmentStatus: z.nativeEnum(EmploymentStatus).optional(),
    sortBy: z
      .enum([
        'createdAt',
        'rating',
        'workLifeBalanceRating',
        'salaryBenefitRating',
        'managementRating',
        'cultureRating',
      ])
      .optional()
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 1, {
        message: 'Page must be a positive integer',
      })
      .optional()
      .default(1),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      })
      .optional()
      .default(10),
  })
  .refine(
    (data) => {
      // Must have either companyId or companySlug
      if (!data.companyId && !data.companySlug && !data.reviewerId) {
        return false;
      }
      return true;
    },
    {
      message: 'Either companyId, companySlug, or reviewerId is required',
      path: ['companyId'],
    }
  );

// Type exports
export type CreateCompanyReviewInput = z.infer<typeof createCompanyReviewSchema>;
export type UpdateCompanyReviewInput = z.infer<typeof updateCompanyReviewSchema>;
export type AdminUpdateReviewInput = z.infer<typeof adminUpdateReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
export type GetCompanyReviewsQuery = z.infer<typeof getCompanyReviewsQuerySchema>;
