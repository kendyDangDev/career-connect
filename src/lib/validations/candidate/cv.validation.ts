import { z } from 'zod';

// CV constraints
export const cvConstraints = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxCvCount: 5, // Maximum CVs per candidate
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],
};

// Upload CV Schema
export const uploadCandidateCvSchema = z.object({
  cvName: z
    .string()
    .min(1, 'CV name is required')
    .max(100, 'CV name must not exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()[\]]+$/,
      'CV name can only contain letters, numbers, spaces, and common special characters'
    ),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
  isPrimary: z.boolean().optional().default(false),
});

// Update CV Schema
export const updateCandidateCvSchema = z.object({
  cvName: z
    .string()
    .min(1, 'CV name is required')
    .max(100, 'CV name must not exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()[\]]+$/,
      'CV name can only contain letters, numbers, spaces, and common special characters'
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable()
    .optional(),
  isPrimary: z.boolean().optional(),
});

// Get CVs Query Schema
export const getCandidateCvsQuerySchema = z.object({
  page: z.coerce
    .number()
    .min(1)
    .optional()
    .default(1)
    .transform((val) => val || 1),
  limit: z.coerce
    .number()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .transform((val) => val || 10),
  sortBy: z
    .enum(['cvName', 'uploadedAt', 'fileSize', 'viewCount'])
    .optional()
    .default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z
    .string()
    .max(100)
    .optional()
    .transform((val) => val?.trim()),
});

// Set Primary CV Schema
export const setPrimaryCvSchema = z.object({
  cvId: z.string().cuid('Invalid CV ID format'),
});

// Response schemas for type safety
export const candidateCvResponseSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  cvName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  isPrimary: z.boolean(),
  description: z.string().nullable(),
  uploadedAt: z.date(),
  lastViewedAt: z.date().nullable(),
  viewCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const candidateCvListResponseSchema = z.object({
  cvs: z.array(candidateCvResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }),
  statistics: z.object({
    totalCvs: z.number(),
    totalFileSize: z.number(),
    totalViews: z.number(),
    primaryCvId: z.string().nullable(),
  }),
});

// Type exports
export type UploadCandidateCvInput = z.infer<typeof uploadCandidateCvSchema>;
export type UpdateCandidateCvInput = z.infer<typeof updateCandidateCvSchema>;
export type GetCandidateCvsQuery = z.infer<typeof getCandidateCvsQuerySchema>;
export type SetPrimaryCvInput = z.infer<typeof setPrimaryCvSchema>;
export type CandidateCvResponse = z.infer<typeof candidateCvResponseSchema>;
export type CandidateCvListResponse = z.infer<typeof candidateCvListResponseSchema>;
