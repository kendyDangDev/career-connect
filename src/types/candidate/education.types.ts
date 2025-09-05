import { CandidateEducation, DegreeType, Prisma } from '@/generated/prisma';

export interface CandidateEducationWithRelations extends CandidateEducation {
  // Add any relations here if needed
}

export interface GetCandidateEducationParams {
  candidateId: string;
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'gpa';
  sortOrder?: 'asc' | 'desc';
  includeDescription?: boolean;
}

export interface CreateCandidateEducationInput {
  institutionName: string;
  degreeType: DegreeType;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date | null;
  gpa?: number | null;
  description?: string | null;
}

export interface UpdateCandidateEducationInput {
  institutionName?: string;
  degreeType?: DegreeType;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date | null;
  gpa?: number | null;
  description?: string | null;
}

export interface BulkCreateCandidateEducationInput {
  education: CreateCandidateEducationInput[];
}

export interface CandidateEducationResponse {
  education: CandidateEducationWithRelations[];
  total: number;
}

export interface DeleteMultipleEducationInput {
  educationIds: string[];
}

export interface EducationStatistics {
  totalEducation: number;
  byDegreeType: Record<DegreeType, number>;
  averageGPA?: number;
  currentlyStudying: number;
  completed: number;
}
