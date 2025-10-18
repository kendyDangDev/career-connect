import { z } from 'zod';

// Schema cho template structure
const TemplateStructureSchema = z.object({
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum([
      'personal_info',
      'summary',
      'experience',
      'education',
      'skills',
      'certifications',
      'languages',
      'references',
      'custom'
    ]),
    title: z.string(),
    required: z.boolean().default(false),
    order: z.number(),
    config: z.record(z.string(), z.any()).optional()
  })).optional(),
  layout: z.object({
    columns: z.number().min(1).max(3).default(1),
    spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
    margins: z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional()
    }).optional()
  }).optional()
});

// Schema cho template styling
const TemplateStylingSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
  }).optional(),
  fonts: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
    size: z.object({
      base: z.number().min(8).max(20).optional(),
      heading1: z.number().min(16).max(48).optional(),
      heading2: z.number().min(14).max(36).optional(),
      heading3: z.number().min(12).max(28).optional()
    }).optional()
  }).optional(),
  borderRadius: z.number().min(0).max(20).optional(),
  theme: z.enum(['professional', 'modern', 'creative', 'minimal', 'classic']).optional()
});

// Schema cho tạo template mới
export const CreateTemplateSchema = z.object({
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name cannot exceed 100 characters')
    .trim(),
  category: z.enum([
    'professional',
    'creative',
    'modern',
    'simple',
    'technical',
    'executive',
    'student'
  ]).optional(),
  previewImage: z.string()
    .url('Invalid preview image URL')
    .optional(),
  structure: TemplateStructureSchema.optional(),
  styling: TemplateStylingSchema.optional(),
  isPremium: z.boolean().default(false),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  tags: z.array(z.string()).max(10).optional()
});

// Schema cho cập nhật template
export const UpdateTemplateSchema = CreateTemplateSchema.partial();

// Schema cho query parameters
export const TemplateQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isPremium: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema cho upload preview image
export const UploadPreviewImageSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG and WebP images are allowed'
    )
});

// Type exports
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof UpdateTemplateSchema>;
export type TemplateQuery = z.infer<typeof TemplateQuerySchema>;
export type UploadPreviewImageInput = z.infer<typeof UploadPreviewImageSchema>;
export type TemplateStructure = z.infer<typeof TemplateStructureSchema>;
export type TemplateStyling = z.infer<typeof TemplateStylingSchema>;