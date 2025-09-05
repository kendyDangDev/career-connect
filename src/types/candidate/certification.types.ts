import { CandidateCertification } from '@/generated/prisma';

export interface CandidateCertificationWithRelations extends CandidateCertification {
  // Add any relations here if needed
}

export interface GetCandidateCertificationParams {
  candidateId: string;
  sortBy?: 'issueDate' | 'expiryDate' | 'createdAt' | 'certificationName';
  sortOrder?: 'asc' | 'desc';
  isExpired?: boolean;
  isValid?: boolean;
}

export interface CreateCandidateCertificationInput {
  certificationName: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export interface UpdateCandidateCertificationInput {
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: Date;
  expiryDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export interface BulkCreateCandidateCertificationInput {
  certifications: CreateCandidateCertificationInput[];
}

export interface CandidateCertificationResponse {
  certifications: CandidateCertificationWithRelations[];
  total: number;
}

export interface DeleteMultipleCertificationInput {
  certificationIds: string[];
}

export interface CertificationStatistics {
  totalCertifications: number;
  validCertifications: number;
  expiredCertifications: number;
  expiringInNextMonth: number;
  byOrganization: Record<string, number>;
}

export interface CertificationSummary {
  total: number;
  valid: number;
  expired: number;
  topOrganizations: string[];
}
