import { jobValidationSchema } from '@/types/employer/job';
import { JobStatus } from '@/generated/prisma';

/**
 * Generate slug from job title
 */
export function generateJobSlug(title: string, companyName?: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Add company name if provided
  if (companyName) {
    const companySlug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${baseSlug}-${companySlug}`;
  }

  return baseSlug;
}

/**
 * Validate job data
 */
export function validateJobData(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validate title
  if (!data.title) {
    errors.title = 'Title is required';
  } else {
    if (data.title.length < jobValidationSchema.title.min) {
      errors.title = `Title must be at least ${jobValidationSchema.title.min} characters`;
    }
    if (data.title.length > jobValidationSchema.title.max) {
      errors.title = `Title must be at most ${jobValidationSchema.title.max} characters`;
    }
  }

  // Validate description
  if (!data.description) {
    errors.description = 'Description is required';
  } else {
    const plainText = stripHtml(data.description);
    if (plainText.length < jobValidationSchema.description.min) {
      errors.description = `Description must be at least ${jobValidationSchema.description.min} characters`;
    }
    if (plainText.length > jobValidationSchema.description.max) {
      errors.description = `Description must be at most ${jobValidationSchema.description.max} characters`;
    }
  }

  // Validate requirements
  if (!data.requirements) {
    errors.requirements = 'Requirements are required';
  } else {
    const plainText = stripHtml(data.requirements);
    if (plainText.length < jobValidationSchema.requirements.min) {
      errors.requirements = `Requirements must be at least ${jobValidationSchema.requirements.min} characters`;
    }
    if (plainText.length > jobValidationSchema.requirements.max) {
      errors.requirements = `Requirements must be at most ${jobValidationSchema.requirements.max} characters`;
    }
  }

  // Validate benefits (optional)
  if (data.benefits) {
    const plainText = stripHtml(data.benefits);
    if (plainText.length > jobValidationSchema.benefits.max) {
      errors.benefits = `Benefits must be at most ${jobValidationSchema.benefits.max} characters`;
    }
  }

  // Validate salary
  if (data.salaryMin !== undefined && data.salaryMin !== null) {
    const salaryMin = parseFloat(data.salaryMin);
    if (isNaN(salaryMin) || salaryMin < jobValidationSchema.salary.min) {
      errors.salaryMin = 'Invalid minimum salary';
    }
  }

  if (data.salaryMax !== undefined && data.salaryMax !== null) {
    const salaryMax = parseFloat(data.salaryMax);
    if (isNaN(salaryMax) || salaryMax > jobValidationSchema.salary.max) {
      errors.salaryMax = 'Invalid maximum salary';
    }
  }

  if (data.salaryMin && data.salaryMax && parseFloat(data.salaryMin) > parseFloat(data.salaryMax)) {
    errors.salary = 'Minimum salary cannot be greater than maximum salary';
  }

  // Validate application deadline
  if (data.applicationDeadline) {
    const deadline = new Date(data.applicationDeadline);
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + jobValidationSchema.applicationDeadline.minDays);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + jobValidationSchema.applicationDeadline.maxDays);

    if (deadline < minDate) {
      errors.applicationDeadline = `Application deadline must be at least ${jobValidationSchema.applicationDeadline.minDays} days from now`;
    }
    if (deadline > maxDate) {
      errors.applicationDeadline = `Application deadline cannot be more than ${jobValidationSchema.applicationDeadline.maxDays} days from now`;
    }
  }

  // Validate required fields
  if (!data.jobType) errors.jobType = 'Job type is required';
  if (!data.workLocationType) errors.workLocationType = 'Work location type is required';
  if (!data.experienceLevel) errors.experienceLevel = 'Experience level is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Check if job status can be changed
 */
export function canChangeJobStatus(
  currentStatus: JobStatus,
  newStatus: JobStatus
): { allowed: boolean; reason?: string } {
  // Draft can go to Active or remain Draft
  if (currentStatus === JobStatus.PENDING) {
    if (newStatus === JobStatus.ACTIVE || newStatus === JobStatus.PENDING) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Draft jobs can only be published or remain as draft',
    };
  }

  // Active can go to Closed, or Expired
  if (currentStatus === JobStatus.ACTIVE) {
    if (newStatus === JobStatus.CLOSED || newStatus === JobStatus.EXPIRED) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Active jobs can only be closed, or marked as expired',
    };
  }

  // Closed and Expired are final states
  if (currentStatus === JobStatus.CLOSED || currentStatus === JobStatus.EXPIRED) {
    return {
      allowed: false,
      reason: `${currentStatus} jobs cannot be changed to another status`,
    };
  }

  return { allowed: false, reason: 'Invalid status transition' };
}

/**
 * Sanitize job data for saving
 */
export function sanitizeJobData(data: any): any {
  const sanitized: any = {};

  // String fields
  const stringFields = [
    'title',
    'description',
    'requirements',
    'benefits',
    'locationCity',
    'locationProvince',
    'locationCountry',
    'currency',
  ];
  stringFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field]?.trim() || null;
    }
  });

  // Enum fields
  const enumFields = ['jobType', 'workLocationType', 'experienceLevel', 'status'];
  enumFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });

  // Number fields
  if (data.salaryMin !== undefined) {
    sanitized.salaryMin = data.salaryMin ? parseFloat(data.salaryMin) : null;
  }
  if (data.salaryMax !== undefined) {
    sanitized.salaryMax = data.salaryMax ? parseFloat(data.salaryMax) : null;
  }

  // Boolean fields
  const booleanFields = ['salaryNegotiable', 'featured', 'urgent'];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = Boolean(data[field]);
    }
  });

  // Date fields
  if (data.applicationDeadline !== undefined) {
    sanitized.applicationDeadline = data.applicationDeadline
      ? new Date(data.applicationDeadline)
      : null;
  }

  // Array fields
  if (data.skills !== undefined) {
    sanitized.skills = data.skills;
  }
  if (data.categories !== undefined) {
    sanitized.categories = data.categories;
  }

  return sanitized;
}

/**
 * Calculate job posting statistics
 */
export function calculateJobMetrics(job: any): {
  daysActive: number;
  daysUntilDeadline: number | null;
  applicationRate: number;
  viewToApplicationRate: number;
} {
  const now = new Date();
  const createdAt = new Date(job.createdAt);
  const publishedAt = job.publishedAt ? new Date(job.publishedAt) : createdAt;

  const daysActive = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));

  let daysUntilDeadline = null;
  if (job.applicationDeadline) {
    const deadline = new Date(job.applicationDeadline);
    daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const applicationRate = daysActive > 0 ? job.applicationCount / daysActive : 0;
  const viewToApplicationRate =
    job.viewCount > 0 ? (job.applicationCount / job.viewCount) * 100 : 0;

  return {
    daysActive,
    daysUntilDeadline,
    applicationRate: Math.round(applicationRate * 100) / 100,
    viewToApplicationRate: Math.round(viewToApplicationRate * 100) / 100,
  };
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(
  salaryMin?: number | null,
  salaryMax?: number | null,
  currency: string = 'VND',
  negotiable: boolean = false
): string {
  if (negotiable && !salaryMin && !salaryMax) {
    return 'Thương lượng';
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (salaryMin && salaryMax) {
    return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)}`;
  } else if (salaryMin) {
    return `Từ ${formatter.format(salaryMin)}`;
  } else if (salaryMax) {
    return `Đến ${formatter.format(salaryMax)}`;
  }

  return 'Thương lượng';
}
