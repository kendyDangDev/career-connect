import { z } from 'zod';
import { EmploymentType } from '@/generated/prisma';

// Create candidate experience schema
export const createCandidateExperienceSchema = z.object({
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long'),
  
  positionTitle: z.string()
    .min(1, 'Position title is required')
    .max(200, 'Position title is too long'),
  
  employmentType: z.nativeEnum(EmploymentType, {
    errorMap: () => ({ message: 'Invalid employment type' })
  }),
  
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid start date'
    })
    .transform((date) => new Date(date)),
  
  endDate: z.string()
    .optional()
    .nullable()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid end date'
    })
    .transform((date) => date ? new Date(date) : null),
  
  isCurrent: z.boolean()
    .optional()
    .default(false),
  
  description: z.string()
    .max(2000, 'Description is too long')
    .optional()
    .nullable(),
  
  achievements: z.string()
    .max(2000, 'Achievements is too long')
    .optional()
    .nullable()
}).refine((data) => {
  // If job is current, end date should be null
  if (data.isCurrent && data.endDate) {
    return false;
  }
  // If not current, should have end date
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  // End date must be after start date
  if (data.endDate && data.startDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'Invalid date configuration',
  path: ['endDate']
});

// Update candidate experience schema
export const updateCandidateExperienceSchema = z.object({
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long')
    .optional(),
  
  positionTitle: z.string()
    .min(1, 'Position title is required')
    .max(200, 'Position title is too long')
    .optional(),
  
  employmentType: z.nativeEnum(EmploymentType, {
    errorMap: () => ({ message: 'Invalid employment type' })
  }).optional(),
  
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid start date'
    })
    .transform((date) => new Date(date))
    .optional(),
  
  endDate: z.string()
    .nullable()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid end date'
    })
    .transform((date) => date ? new Date(date) : null)
    .optional(),
  
  isCurrent: z.boolean()
    .optional(),
  
  description: z.string()
    .max(2000, 'Description is too long')
    .nullable()
    .optional(),
  
  achievements: z.string()
    .max(2000, 'Achievements is too long')
    .nullable()
    .optional()
});

// Bulk create candidate experience schema
export const bulkCreateCandidateExperienceSchema = z.object({
  experiences: z.array(createCandidateExperienceSchema)
    .min(1, 'At least one experience record is required')
    .max(10, 'Cannot add more than 10 experience records at once')
});

// Delete multiple experience schema
export const deleteMultipleExperienceSchema = z.object({
  experienceIds: z.array(z.string())
    .min(1, 'At least one experience ID is required')
    .max(10, 'Cannot delete more than 10 experience records at once')
});

// Query parameters schema for getting experience
export const getCandidateExperienceQuerySchema = z.object({
  sortBy: z.enum(['startDate', 'endDate', 'createdAt'])
    .optional()
    .default('startDate'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  includeDescription: z.string()
    .transform((val) => val === 'true')
    .optional(),
  isCurrent: z.string()
    .transform((val) => val === 'true')
    .optional()
});

// Type exports
export type CreateCandidateExperienceInput = z.infer<typeof createCandidateExperienceSchema>;
export type UpdateCandidateExperienceInput = z.infer<typeof updateCandidateExperienceSchema>;
export type BulkCreateCandidateExperienceInput = z.infer<typeof bulkCreateCandidateExperienceSchema>;
export type DeleteMultipleExperienceInput = z.infer<typeof deleteMultipleExperienceSchema>;
export type GetCandidateExperienceQuery = z.infer<typeof getCandidateExperienceQuerySchema>;
