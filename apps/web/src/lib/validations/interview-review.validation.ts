import { z } from 'zod';
import { InterviewOutcome } from '@/generated/prisma';

// Rating validation helper
const ratingSchema = z.number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

// Create interview review schema
export const createInterviewReviewSchema = z.object({
  companyId: z.string()
    .min(1, 'Company ID is required'),
  
  jobId: z.string()
    .optional()
    .nullable(),
  
  overallRating: ratingSchema,
  
  difficultyRating: ratingSchema,
  
  experienceDescription: z.string()
    .min(100, 'Experience description must be at least 100 characters')
    .max(3000, 'Experience description is too long'),
  
  interviewQuestions: z.string()
    .min(20, 'Interview questions must be at least 20 characters')
    .max(2000, 'Interview questions is too long')
    .optional()
    .nullable(),
  
  processDescription: z.string()
    .min(50, 'Process description must be at least 50 characters')
    .max(1500, 'Process description is too long')
    .optional()
    .nullable(),
  
  outcome: z.nativeEnum(InterviewOutcome, {
    message: 'Invalid interview outcome' 
  }),
  
  recommendation: z.boolean(),
  
  isAnonymous: z.boolean()
    .optional()
    .default(false)
});

// Update interview review schema
export const updateInterviewReviewSchema = z.object({
  overallRating: ratingSchema
    .optional(),
  
  difficultyRating: ratingSchema
    .optional(),
  
  experienceDescription: z.string()
    .min(100, 'Experience description must be at least 100 characters')
    .max(3000, 'Experience description is too long')
    .optional(),
  
  interviewQuestions: z.string()
    .min(20, 'Interview questions must be at least 20 characters')
    .max(2000, 'Interview questions is too long')
    .nullable()
    .optional(),
  
  processDescription: z.string()
    .min(50, 'Process description must be at least 50 characters')
    .max(1500, 'Process description is too long')
    .nullable()
    .optional(),
  
  outcome: z.nativeEnum(InterviewOutcome, {
    message: 'Invalid interview outcome' 
  }).optional(),
  
  recommendation: z.boolean()
    .optional(),
  
  isAnonymous: z.boolean()
    .optional()
});

// Query parameters schema for getting interview reviews
export const getInterviewReviewsQuerySchema = z.object({
  companyId: z.string().optional(),
  companySlug: z.string().optional(),
  jobId: z.string().optional(),
  reviewerId: z.string().optional(),
  outcome: z.nativeEnum(InterviewOutcome).optional(),
  minOverallRating: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 5, {
      message: 'Overall rating must be between 1 and 5'
    })
    .optional(),
  minDifficultyRating: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 5, {
      message: 'Difficulty rating must be between 1 and 5'
    })
    .optional(),
  recommendation: z.string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'overallRating', 'difficultyRating'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  page: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Page must be a positive integer'
    })
    .optional()
    .default(1),
  limit: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    })
    .optional()
    .default(10)
}).refine((data) => {
  // Must have either companyId/companySlug or jobId or reviewerId
  if (!data.companyId && !data.companySlug && !data.jobId && !data.reviewerId) {
    return false;
  }
  return true;
}, {
  message: 'Either companyId, companySlug, jobId, or reviewerId is required',
  path: ['companyId']
});

// Interview tips query schema
export const getInterviewTipsQuerySchema = z.object({
  companyId: z.string().optional(),
  companySlug: z.string().optional()
}).refine((data) => {
  if (!data.companyId && !data.companySlug) {
    return false;
  }
  return true;
}, {
  message: 'Either companyId or companySlug is required',
  path: ['companyId']
});

// Type exports
export type CreateInterviewReviewInput = z.infer<typeof createInterviewReviewSchema>;
export type UpdateInterviewReviewInput = z.infer<typeof updateInterviewReviewSchema>;
export type GetInterviewReviewsQuery = z.infer<typeof getInterviewReviewsQuerySchema>;
export type GetInterviewTipsQuery = z.infer<typeof getInterviewTipsQuerySchema>;
