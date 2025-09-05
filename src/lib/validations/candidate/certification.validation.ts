import { z } from 'zod';

// Create candidate certification schema
export const createCandidateCertificationSchema = z.object({
  certificationName: z.string()
    .min(1, 'Certification name is required')
    .max(300, 'Certification name is too long'),
  
  issuingOrganization: z.string()
    .min(1, 'Issuing organization is required')
    .max(200, 'Issuing organization is too long'),
  
  issueDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid issue date'
    })
    .transform((date) => new Date(date)),
  
  expiryDate: z.string()
    .optional()
    .nullable()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid expiry date'
    })
    .transform((date) => date ? new Date(date) : null),
  
  credentialId: z.string()
    .max(100, 'Credential ID is too long')
    .optional()
    .nullable(),
  
  credentialUrl: z.string()
    .url('Invalid credential URL')
    .max(500, 'Credential URL is too long')
    .optional()
    .nullable()
}).refine((data) => {
  if (data.expiryDate && data.issueDate) {
    return data.expiryDate >= data.issueDate;
  }
  return true;
}, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate']
});

// Update candidate certification schema
export const updateCandidateCertificationSchema = z.object({
  certificationName: z.string()
    .min(1, 'Certification name is required')
    .max(300, 'Certification name is too long')
    .optional(),
  
  issuingOrganization: z.string()
    .min(1, 'Issuing organization is required')
    .max(200, 'Issuing organization is too long')
    .optional(),
  
  issueDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid issue date'
    })
    .transform((date) => new Date(date))
    .optional(),
  
  expiryDate: z.string()
    .nullable()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid expiry date'
    })
    .transform((date) => date ? new Date(date) : null)
    .optional(),
  
  credentialId: z.string()
    .max(100, 'Credential ID is too long')
    .nullable()
    .optional(),
  
  credentialUrl: z.string()
    .url('Invalid credential URL')
    .max(500, 'Credential URL is too long')
    .nullable()
    .optional()
});

// Bulk create candidate certification schema
export const bulkCreateCandidateCertificationSchema = z.object({
  certifications: z.array(createCandidateCertificationSchema)
    .min(1, 'At least one certification record is required')
    .max(10, 'Cannot add more than 10 certification records at once')
});

// Delete multiple certification schema
export const deleteMultipleCertificationSchema = z.object({
  certificationIds: z.array(z.string())
    .min(1, 'At least one certification ID is required')
    .max(10, 'Cannot delete more than 10 certification records at once')
});

// Query parameters schema for getting certifications
export const getCandidateCertificationQuerySchema = z.object({
  sortBy: z.enum(['issueDate', 'expiryDate', 'createdAt', 'certificationName'])
    .optional()
    .default('issueDate'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  isExpired: z.string()
    .transform((val) => val === 'true')
    .optional(),
  isValid: z.string()
    .transform((val) => val === 'true')
    .optional()
});

// Type exports
export type CreateCandidateCertificationInput = z.infer<typeof createCandidateCertificationSchema>;
export type UpdateCandidateCertificationInput = z.infer<typeof updateCandidateCertificationSchema>;
export type BulkCreateCandidateCertificationInput = z.infer<typeof bulkCreateCandidateCertificationSchema>;
export type DeleteMultipleCertificationInput = z.infer<typeof deleteMultipleCertificationSchema>;
export type GetCandidateCertificationQuery = z.infer<typeof getCandidateCertificationQuerySchema>;
