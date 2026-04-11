import { CompanySize, VerificationStatus } from '@/generated/prisma';

export interface CompanyPrimaryContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface CompanyUserSummary {
  id: string;
  role: string;
  isPrimaryContact: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
}

export interface CompanyStatistics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalFollowers: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  viewsLastMonth: number;
  primaryContact?: CompanyPrimaryContact;
}

export interface Company {
  id: string;
  companyName: string;
  companySlug: string;
  industry?: {
    id: string;
    name: string;
  } | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  businessLicenseUrl?: string | null;
  verificationNotes?: string | null;
  coverImageUrl?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  foundedYear?: number | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  _count: {
    companyUsers: number;
    jobs: number;
    companyFollowers: number;
    companyReviews?: number;
  };
  companyUsers?: CompanyUserSummary[];
  stats?: CompanyStatistics;
}

export interface CompanyFormData {
  companyName: string;
  industryId?: string | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  foundedYear?: number | null;
  verificationStatus?: VerificationStatus;
}

export interface CompaniesQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  companySize?: string;
  industryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompaniesResponse {
  success: boolean;
  data: {
    companies: Company[];
    pagination: PaginationInfo;
  };
}
