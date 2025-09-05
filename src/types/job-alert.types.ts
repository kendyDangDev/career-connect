import { 
  JobAlert, 
  Candidate,
  JobType,
  ExperienceLevel,
  AlertFrequency,
  Prisma
} from '@/generated/prisma';

// Request types
export interface CreateJobAlertRequest {
  alertName: string;
  keywords?: string;
  locationIds?: string[];
  categoryIds?: string[];
  jobType?: JobType;
  salaryMin?: number;
  experienceLevel?: ExperienceLevel;
  frequency?: AlertFrequency;
}

export interface UpdateJobAlertRequest {
  alertName?: string;
  keywords?: string;
  locationIds?: string[];
  categoryIds?: string[];
  jobType?: JobType;
  salaryMin?: number;
  experienceLevel?: ExperienceLevel;
  frequency?: AlertFrequency;
  isActive?: boolean;
}

export interface ToggleJobAlertStatusRequest {
  isActive: boolean;
}

// Service parameter types
export interface GetJobAlertsParams {
  candidateId: string;
  filters?: JobAlertFilters;
  pagination?: PaginationParams;
}

export interface CreateJobAlertParams {
  candidateId: string;
  data: CreateJobAlertRequest;
}

export interface UpdateJobAlertParams {
  id: string;
  candidateId: string;
  data: UpdateJobAlertRequest;
}

export interface DeleteJobAlertParams {
  id: string;
  candidateId: string;
}

export interface ToggleJobAlertStatusParams {
  id: string;
  candidateId: string;
  isActive: boolean;
}

export interface TestJobAlertParams {
  id: string;
  candidateId: string;
}

// Filter types
export interface JobAlertFilters {
  search?: string;
  isActive?: boolean;
  frequency?: AlertFrequency[];
  hasKeywords?: boolean;
  hasLocations?: boolean;
  hasCategories?: boolean;
  sortBy?: 'createdAt' | 'alertName' | 'lastSentAt' | 'frequency';
  sortOrder?: 'asc' | 'desc';
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Response types
export interface JobAlertWithRelations extends JobAlert {
  candidate?: Partial<Candidate>;
  _count?: {
    matchingJobs?: number;
  };
}

export interface JobAlertListResponse {
  jobAlerts: JobAlertWithRelations[];
  total: number;
}

export interface JobAlertStatsResponse {
  totalAlerts: number;
  activeAlerts: number;
  inactiveAlerts: number;
  byFrequency: {
    daily: number;
    weekly: number;
    instant: number;
  };
}

// Helper types for parsing JSON fields
export interface ParsedJobAlert extends Omit<JobAlert, 'locationIds' | 'categoryIds'> {
  locationIds: string[];
  categoryIds: string[];
}

// Validation helper
export function parseJobAlertJsonFields(jobAlert: JobAlert): ParsedJobAlert {
  return {
    ...jobAlert,
    locationIds: jobAlert.locationIds ? (jobAlert.locationIds as string[]) : [],
    categoryIds: jobAlert.categoryIds ? (jobAlert.categoryIds as string[]) : []
  };
}

// Type guards
export function isValidAlertFrequency(frequency: string): frequency is AlertFrequency {
  return Object.values(AlertFrequency).includes(frequency as AlertFrequency);
}

export function isValidJobType(jobType: string): jobType is JobType {
  return Object.values(JobType).includes(jobType as JobType);
}

export function isValidExperienceLevel(level: string): level is ExperienceLevel {
  return Object.values(ExperienceLevel).includes(level as ExperienceLevel);
}
