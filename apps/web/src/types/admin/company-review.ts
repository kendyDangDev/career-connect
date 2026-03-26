import { EmploymentStatus } from '@/generated/prisma';

export type CompanyReviewModerationStatus = 'pending' | 'approved' | 'all';

export interface AdminCompanyReviewQuery {
  page: number;
  limit: number;
  status?: CompanyReviewModerationStatus;
  search?: string;
}

export interface AdminCompanyReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCompanyReviewCompany {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl?: string | null;
}

export interface AdminCompanyReviewReviewer {
  id: string;
  displayName: string;
  isAnonymous: boolean;
}

export interface AdminCompanyReviewListItem {
  id: string;
  company: AdminCompanyReviewCompany;
  reviewer: AdminCompanyReviewReviewer;
  rating: number;
  title: string;
  reviewText: string;
  pros?: string | null;
  cons?: string | null;
  workLifeBalanceRating?: number | null;
  salaryBenefitRating?: number | null;
  managementRating?: number | null;
  cultureRating?: number | null;
  employmentStatus: EmploymentStatus;
  positionTitle?: string | null;
  employmentLength?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminCompanyReviewListResponseData {
  reviews: AdminCompanyReviewListItem[];
  pagination: AdminCompanyReviewPagination;
  filters: {
    status: CompanyReviewModerationStatus;
    search?: string;
  };
}

export interface AdminCompanyReviewListResponse {
  success: boolean;
  data: AdminCompanyReviewListResponseData;
  message?: string;
  timestamp?: string;
}

export interface AdminCompanyReviewApprovalResponse {
  success: boolean;
  data: {
    review: {
      id: string;
      isApproved: boolean;
    };
  };
  message?: string;
}

export const companyReviewModerationStatusLabels: Record<CompanyReviewModerationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  all: 'Tất cả',
};
