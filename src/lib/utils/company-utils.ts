import { companyUpdateSchema } from "@/types/company";

/**
 * Generate slug from company name
 */
export function generateCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate company update data
 */
export function validateCompanyData(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validate company name
  if (data.companyName !== undefined) {
    if (data.companyName.length < companyUpdateSchema.companyName.min) {
      errors.companyName = `Company name must be at least ${companyUpdateSchema.companyName.min} characters`;
    }
    if (data.companyName.length > companyUpdateSchema.companyName.max) {
      errors.companyName = `Company name must be at most ${companyUpdateSchema.companyName.max} characters`;
    }
    if (!companyUpdateSchema.companyName.pattern.test(data.companyName)) {
      errors.companyName = "Company name contains invalid characters";
    }
  }

  // Validate description
  if (data.description !== undefined && data.description !== null) {
    if (data.description.length < companyUpdateSchema.description.min) {
      errors.description = `Description must be at least ${companyUpdateSchema.description.min} characters`;
    }
    if (data.description.length > companyUpdateSchema.description.max) {
      errors.description = `Description must be at most ${companyUpdateSchema.description.max} characters`;
    }
  }

  // Validate website URL
  if (data.websiteUrl !== undefined && data.websiteUrl !== null && data.websiteUrl !== '') {
    if (!companyUpdateSchema.websiteUrl.pattern.test(data.websiteUrl)) {
      errors.websiteUrl = "Invalid website URL format";
    }
  }

  // Validate email
  if (data.email !== undefined && data.email !== null && data.email !== '') {
    if (!companyUpdateSchema.email.pattern.test(data.email)) {
      errors.email = "Invalid email format";
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
    if (!companyUpdateSchema.phone.pattern.test(data.phone)) {
      errors.phone = "Invalid phone number format (Vietnamese format required)";
    }
  }

  // Validate founded year
  if (data.foundedYear !== undefined && data.foundedYear !== null) {
    const year = parseInt(data.foundedYear);
    if (isNaN(year) || year < companyUpdateSchema.foundedYear.min || year > companyUpdateSchema.foundedYear.max) {
      errors.foundedYear = `Founded year must be between ${companyUpdateSchema.foundedYear.min} and ${companyUpdateSchema.foundedYear.max}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize company data for update
 */
export function sanitizeCompanyData(data: any): any {
  const sanitized: any = {};

  // String fields
  const stringFields = ['companyName', 'websiteUrl', 'description', 'address', 'city', 'province', 'country', 'phone', 'email'];
  stringFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field]?.trim() || null;
    }
  });

  // Enum fields
  if (data.companySize !== undefined) {
    sanitized.companySize = data.companySize || null;
  }

  // ID fields
  if (data.industryId !== undefined) {
    sanitized.industryId = data.industryId || null;
  }

  // Number fields
  if (data.foundedYear !== undefined) {
    sanitized.foundedYear = data.foundedYear ? parseInt(data.foundedYear) : null;
  }

  return sanitized;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number
): Promise<{ isValid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          isValid: false,
          error: `Image dimensions must be at least ${minWidth}x${minHeight}px`
        });
      } else if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          isValid: false,
          error: `Image dimensions must not exceed ${maxWidth}x${maxHeight}px`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: "Failed to load image"
      });
    };
    
    img.src = url;
  });
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}.${extension}`;
}
