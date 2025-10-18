import { z } from 'zod';

// Schema cho Template
export const templateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
  previewImage: z.string().max(255).optional(),
  structure: z.any().optional(), // JSON field
  styling: z.any().optional(), // JSON field
  isPremium: z.boolean().default(false),
});

// Schema cho UserCV
export const createUserCvSchema = z.object({
  userId: z.string().optional(),
  templateId: z.string().optional(),
  cv_name: z.string().min(1, 'CV name is required'),
  cvData: z.any().optional(), // JSON field
  description: z.string().max(500).optional().nullable(),
});

export const updateUserCvSchema = z.object({
  templateId: z.string().optional(),
  cv_name: z.string().min(1).optional(),
  cvData: z.any().optional(), // JSON field
});

// Schema cho CVSection
export const createCvSectionSchema = z.object({
  cvId: z.string().min(1, 'CV ID is required'),
  title: z.string().min(1).max(100),
  content: z.any().optional(), // JSON field
  order: z.number().int().optional(),
});

export const updateCvSectionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.any().optional(), // JSON field
  order: z.number().int().optional(),
});

// Schema cho batch update sections
export const batchUpdateSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1).max(100).optional(),
      content: z.any().optional(),
      order: z.number().int().optional(),
    })
  ),
});

// Schema cho query parameters
export const cvQuerySchema = z.object({
  userId: z.string().optional(),
  templateId: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'cv_name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const sectionQuerySchema = z.object({
  cvId: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .optional(),
  sortBy: z.enum(['order', 'createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Type exports
export type CreateUserCvInput = z.infer<typeof createUserCvSchema>;
export type UpdateUserCvInput = z.infer<typeof updateUserCvSchema>;
export type CreateCvSectionInput = z.infer<typeof createCvSectionSchema>;
export type UpdateCvSectionInput = z.infer<typeof updateCvSectionSchema>;
export type BatchUpdateSectionsInput = z.infer<typeof batchUpdateSectionsSchema>;
export type CvQueryInput = z.infer<typeof cvQuerySchema>;
export type SectionQueryInput = z.infer<typeof sectionQuerySchema>;
