import { z } from 'zod';
import { UserType, UserStatus, Gender } from '@/generated/prisma';

// User Update Schema
export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string()
    .regex(/^(\+84|84|0)[35789][0-9]{8}$/, 'Invalid phone number')
    .optional()
    .nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  userType: z.nativeEnum(UserType).optional(),
});

// User Status Update Schema (for admin)
export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// UserProfile Create/Update Schema
export const userProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default('Vietnam').optional(),
  bio: z.string().max(1000).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
});

// Query Parameters Schemas
export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().positive().max(100)).default('10'),
  search: z.string().optional(),
  userType: z.nativeEnum(UserType).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// User ID Parameter Schema
export const userIdParamSchema = z.object({
  id: z.string().cuid(),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  email: z.string().email(),
});

// Type exports for TypeScript
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;