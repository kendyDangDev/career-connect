import { Company, CompanySize, VerificationStatus, Prisma } from "@/generated/prisma";

// Query parameters for listing companies
export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VerificationStatus;
  companySize?: CompanySize;
  industryId?: string;
  sortBy?: 'createdAt' | 'companyName' | 'verificationStatus' | 'activeJobCount';
  sortOrder?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

// Company detail response for admin
export interface AdminCompanyDetail extends Company {
  industry?: {
    id: string;
    name: string;
  } | null;
  _count: {
    companyUsers: number;
    jobs: number;
    companyFollowers: number;
    companyReviews: number;
  };
  companyUsers: {
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
  }[];
  stats?: CompanyStatistics;
}

// Company list item for admin
export interface AdminCompanyListItem {
  id: string;
  companyName: string;
  companySlug: string;
  industry?: {
    id: string;
    name: string;
  } | null;
  companySize?: CompanySize | null;
  verificationStatus: VerificationStatus;
  logoUrl?: string | null;
  city?: string | null;
  province?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    companyUsers: number;
    jobs: number;
    companyFollowers: number;
  };
}

// Company update DTO for admin (can update more fields than employer)
export interface AdminCompanyUpdateDTO {
  companyName?: string;
  companySlug?: string;
  industryId?: string | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  foundedYear?: number | null;
  verificationStatus?: VerificationStatus;
}

// Company statistics
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
  primaryContact?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

// Response for company list
export interface CompanyListResponse {
  companies: AdminCompanyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: VerificationStatus;
    companySize?: CompanySize;
    industryId?: string;
  };
}

// Admin dashboard statistics
export interface AdminCompanyStats {
  totalCompanies: number;
  verifiedCompanies: number;
  pendingVerification: number;
  rejectedCompanies: number;
  companiesBySize: {
    size: CompanySize;
    count: number;
  }[];
  companiesByIndustry: {
    industryId: string;
    industryName: string;
    count: number;
  }[];
  recentCompanies: {
    id: string;
    companyName: string;
    createdAt: Date;
    verificationStatus: VerificationStatus;
  }[];
  growthStats: {
    month: string;
    newCompanies: number;
    verifiedCompanies: number;
  }[];
}

// Bulk operation DTOs
export interface BulkCompanyOperation {
  companyIds: string[];
  action: 'verify' | 'reject' | 'suspend' | 'delete';
  reason?: string;
}

// Company verification DTO
export interface CompanyVerificationDTO {
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  notifyCompany?: boolean;
}

// Export/Import DTOs
export interface CompanyExportParams {
  format: 'csv' | 'excel' | 'json';
  fields?: string[];
  filters?: CompanyListParams;
}

// Audit log for company changes
export interface CompanyAuditLog {
  id: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  createdAt: Date;
}
