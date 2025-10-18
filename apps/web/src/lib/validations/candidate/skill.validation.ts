import { z } from 'zod';
import { ProficiencyLevel } from '@/generated/prisma';

// Create candidate skill schema
export const createCandidateSkillSchema = z.object({
  skillId: z
    .string()
    .min(1, 'Skill ID is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid skill ID format'),

  proficiencyLevel: z.nativeEnum(ProficiencyLevel, {
    message: 'Invalid proficiency level',
  }),

  yearsExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50')
    .optional(),
});

// Update candidate skill schema
export const updateCandidateSkillSchema = z.object({
  proficiencyLevel: z
    .nativeEnum(ProficiencyLevel, {
      message: 'Invalid proficiency level',
    })
    .optional(),

  yearsExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50')
    .optional()
    .nullable(),
});

// Bulk create candidate skills schema
export const bulkCreateCandidateSkillsSchema = z.object({
  skills: z
    .array(createCandidateSkillSchema)
    .min(1, 'At least one skill is required')
    .max(20, 'Cannot add more than 20 skills at once'),
});

// Delete multiple skills schema
export const deleteMultipleSkillsSchema = z.object({
  skillIds: z
    .array(z.string())
    .min(1, 'At least one skill ID is required')
    .max(20, 'Cannot delete more than 20 skills at once'),
});

// Query parameters schema for getting skills
export const getCandidateSkillsQuerySchema = z.object({
  includeSkillDetails: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// Type exports
export type CreateCandidateSkillInput = z.infer<typeof createCandidateSkillSchema>;
export type UpdateCandidateSkillInput = z.infer<typeof updateCandidateSkillSchema>;
export type BulkCreateCandidateSkillsInput = z.infer<typeof bulkCreateCandidateSkillsSchema>;
export type DeleteMultipleSkillsInput = z.infer<typeof deleteMultipleSkillsSchema>;
export type GetCandidateSkillsQuery = z.infer<typeof getCandidateSkillsQuerySchema>;
