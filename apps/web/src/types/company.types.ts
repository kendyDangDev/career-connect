import { CompanySize, VerificationStatus } from '@/generated/prisma';

// Company Profile Types
export interface CompanyProfile {
  id: string;
  companyName: string;
  companySlug: string;
  description: string | null;
  industry: { id: string; name: string; slug?: string } | null;
  companySize: CompanySize | null;
  foundedYear: number | null;
  websiteUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  verificationStatus: VerificationStatus;
  verificationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    jobs?: number;
    followers?: number;
    teamMembers?: number;
  };
}

// Company Statistics
export interface CompanyStats {
  activeJobs: number;
  totalApplications: number;
  profileViews: number;
  followers: number;
  teamMembers: number;
}

// Company Profile Response
export interface CompanyProfileResponse {
  success: boolean;
  data: {
    company: CompanyProfile;
    userRole: string;
    canManage: boolean;
    stats: CompanyStats | null;
  };
}

// Company Update Data
export interface UpdateCompanyData {
  companyName?: string;
  description?: string;
  industryId?: string | null;
  companySize?: CompanySize | '';
  foundedYear?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

// Company Update Response
export interface UpdateCompanyResponse {
  success: boolean;
  message: string;
  data: {
    company: CompanyProfile;
  };
}

// Media Upload Types
export interface MediaUploadResponse {
  success: boolean;
  data: {
    url: string;
    type: 'logo' | 'cover' | 'gallery';
  };
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
}
