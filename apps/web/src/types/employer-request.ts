import { CompanySize, VerificationStatus } from '@/generated/prisma';

export type EmployerRequestStatus = 'NONE' | VerificationStatus;

export interface EmployerRequestCompany {
  id: string;
  companyName: string;
  companySlug: string;
  industryId: string | null;
  industryName: string | null;
  companySize: CompanySize | null;
  websiteUrl: string | null;
  description: string | null;
  logoUrl: string | null;
  businessLicenseUrl: string | null;
  verificationStatus: VerificationStatus;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerRequestState {
  status: EmployerRequestStatus;
  company: EmployerRequestCompany | null;
  canEdit: boolean;
  requiresSessionRefresh: boolean;
}
