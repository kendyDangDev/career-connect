import { z } from 'zod';
import { ApplicationStatus } from '@/generated/prisma';

// Query parameters for getting applications list
export const getApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['appliedAt', 'statusUpdatedAt', 'rating']).default('appliedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  jobId: z.string().cuid().optional(),
  candidateId: z.string().cuid().optional(),
});

// Update application status schema
export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  note: z.string().min(1).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  recruiterNotes: z.string().max(2000).optional(),
  interviewScheduledAt: z.coerce.date().optional(),
});

// Application detail params
export const applicationIdParamSchema = z.object({
  id: z.string().cuid('Invalid application ID'),
});

// Bulk update applications schema
export const bulkUpdateApplicationsSchema = z.object({
  applicationIds: z.array(z.string().cuid()).min(1).max(100),
  status: z.nativeEnum(ApplicationStatus),
  note: z.string().min(1).max(1000).optional(),
});

// Application stats query schema
export const getApplicationStatsQuerySchema = z.object({
  companyId: z.string().cuid().optional(),
  jobId: z.string().cuid().optional(),
  candidateId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Export types
export type GetApplicationsQuery = z.infer<typeof getApplicationsQuerySchema>;
export type UpdateApplicationStatusData = z.infer<typeof updateApplicationStatusSchema>;
export type ApplicationIdParam = z.infer<typeof applicationIdParamSchema>;
export type BulkUpdateApplicationsData = z.infer<typeof bulkUpdateApplicationsSchema>;
export type GetApplicationStatsQuery = z.infer<typeof getApplicationStatsQuerySchema>;

// Application constraints
export const applicationConstraints = {
  maxCoverLetterLength: 5000,
  maxRecruiterNotesLength: 2000,
  maxTimelineNoteLength: 1000,
  maxRating: 5,
  minRating: 1,
} as const;
