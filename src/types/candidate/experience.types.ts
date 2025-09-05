import { CandidateExperience, EmploymentType, Prisma } from '@/generated/prisma';

export interface CandidateExperienceWithRelations extends CandidateExperience {
  // Add any relations here if needed
}

export interface GetCandidateExperienceParams {
  candidateId: string;
  sortBy?: 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeDescription?: boolean;
  isCurrent?: boolean;
}

export interface CreateCandidateExperienceInput {
  companyName: string;
  positionTitle: string;
  employmentType: EmploymentType;
  startDate: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
  achievements?: string | null;
}

export interface UpdateCandidateExperienceInput {
  companyName?: string;
  positionTitle?: string;
  employmentType?: EmploymentType;
  startDate?: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
  achievements?: string | null;
}

export interface BulkCreateCandidateExperienceInput {
  experiences: CreateCandidateExperienceInput[];
}

export interface CandidateExperienceResponse {
  experiences: CandidateExperienceWithRelations[];
  total: number;
}

export interface DeleteMultipleExperienceInput {
  experienceIds: string[];
}

export interface ExperienceStatistics {
  totalExperiences: number;
  byEmploymentType: Record<EmploymentType, number>;
  totalYearsOfExperience: number;
  currentJobs: number;
  averageJobDuration: number; // in months
}

export interface ExperienceSummary {
  totalYears: number;
  positions: string[];
  companies: string[];
}
