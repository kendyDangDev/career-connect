import { z } from 'zod';
import { DegreeType } from '@/generated/prisma';

// Create candidate education schema
export const createCandidateEducationSchema = z.object({
  institutionName: z.string()
    .min(1, 'Institution name is required')
    .max(200, 'Institution name is too long'),
  
  degreeType: z.nativeEnum(DegreeType, {
    errorMap: () => ({ message: 'Invalid degree type' })
  }),
  
  fieldOfStudy: z.string()
    .min(1, 'Field of study is required')
    .max(200, 'Field of study is too long'),
  
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
  
  gpa: z.number()
    .min(0, 'GPA cannot be negative')
    .max(4.0, 'GPA cannot exceed 4.0')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(1000, 'Description is too long')
    .optional()
    .nullable()
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Update candidate education schema
export const updateCandidateEducationSchema = z.object({
  institutionName: z.string()
    .min(1, 'Institution name is required')
    .max(200, 'Institution name is too long')
    .optional(),
  
  degreeType: z.nativeEnum(DegreeType, {
    errorMap: () => ({ message: 'Invalid degree type' })
  }).optional(),
  
  fieldOfStudy: z.string()
    .min(1, 'Field of study is required')
    .max(200, 'Field of study is too long')
    .optional(),
  
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
  
  gpa: z.number()
    .min(0, 'GPA cannot be negative')
    .max(4.0, 'GPA cannot exceed 4.0')
    .nullable()
    .optional(),
  
  description: z.string()
    .max(1000, 'Description is too long')
    .nullable()
    .optional()
});

// Bulk create candidate education schema
export const bulkCreateCandidateEducationSchema = z.object({
  education: z.array(createCandidateEducationSchema)
    .min(1, 'At least one education record is required')
    .max(10, 'Cannot add more than 10 education records at once')
});

// Delete multiple education schema
export const deleteMultipleEducationSchema = z.object({
  educationIds: z.array(z.string())
    .min(1, 'At least one education ID is required')
    .max(10, 'Cannot delete more than 10 education records at once')
});

// Query parameters schema for getting education
export const getCandidateEducationQuerySchema = z.object({
  sortBy: z.enum(['startDate', 'endDate', 'createdAt', 'gpa'])
    .optional()
    .default('startDate'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  includeDescription: z.string()
    .transform((val) => val === 'true')
    .optional()
});

// Type exports
export type CreateCandidateEducationInput = z.infer<typeof createCandidateEducationSchema>;
export type UpdateCandidateEducationInput = z.infer<typeof updateCandidateEducationSchema>;
export type BulkCreateCandidateEducationInput = z.infer<typeof bulkCreateCandidateEducationSchema>;
export type DeleteMultipleEducationInput = z.infer<typeof deleteMultipleEducationSchema>;
export type GetCandidateEducationQuery = z.infer<typeof getCandidateEducationQuerySchema>;
