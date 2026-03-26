import { z } from 'zod';

export const adminCompanyReviewQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'all']).optional().default('pending'),
  search: z.string().trim().optional().transform((value) => value || undefined),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type AdminCompanyReviewQueryInput = z.infer<typeof adminCompanyReviewQuerySchema>;
