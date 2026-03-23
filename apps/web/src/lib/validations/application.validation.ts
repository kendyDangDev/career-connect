import { z } from 'zod';
import { ApplicationStatus } from '@/generated/prisma';

const createDateBoundarySchema = (endOfDay = false) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const normalizedDate = new Date(
        `${value}${endOfDay ? 'T23:59:59.999' : 'T00:00:00.000'}`
      );

      if (!Number.isNaN(normalizedDate.getTime())) {
        return normalizedDate;
      }
    }

    return value;
  }, z.date().optional());

const applicationStatusFilterSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : String(value).split(',');
  const normalizedValues = values
    .map((item) => String(item).trim())
    .filter(Boolean);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}, z.array(z.nativeEnum(ApplicationStatus)).min(1).optional());

// Query parameters for getting applications list
export const getApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['appliedAt', 'statusUpdatedAt', 'rating']).default('appliedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: applicationStatusFilterSchema,
  jobId: z.string().cuid().optional(),
  candidateId: z.string().cuid().optional(),
  dateFrom: createDateBoundarySchema(),
  dateTo: createDateBoundarySchema(true),
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
  dateFrom: createDateBoundarySchema(),
  dateTo: createDateBoundarySchema(true),
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
