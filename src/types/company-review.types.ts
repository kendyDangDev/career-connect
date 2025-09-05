import { CompanyReview, EmploymentStatus, Company, User } from '@/generated/prisma';

export interface CompanyReviewWithRelations extends CompanyReview {
  company?: Company;
  reviewer?: User;
}

export interface GetCompanyReviewsParams {
  companyId?: string;
  companySlug?: string;
  reviewerId?: string;
  isApproved?: boolean;
  rating?: number;
  minRating?: number;
  employmentStatus?: EmploymentStatus;
  sortBy?: 'createdAt' | 'rating' | 'workLifeBalanceRating' | 'salaryBenefitRating' | 'managementRating' | 'cultureRating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateCompanyReviewInput {
  companyId: string;
  rating: number;
  title: string;
  reviewText: string;
  pros?: string | null;
  cons?: string | null;
  workLifeBalanceRating?: number | null;
  salaryBenefitRating?: number | null;
  managementRating?: number | null;
  cultureRating?: number | null;
  isAnonymous?: boolean;
  employmentStatus: EmploymentStatus;
  positionTitle?: string | null;
  employmentLength?: string | null;
}

export interface UpdateCompanyReviewInput {
  rating?: number;
  title?: string;
  reviewText?: string;
  pros?: string | null;
  cons?: string | null;
  workLifeBalanceRating?: number | null;
  salaryBenefitRating?: number | null;
  managementRating?: number | null;
  cultureRating?: number | null;
  isAnonymous?: boolean;
  employmentStatus?: EmploymentStatus;
  positionTitle?: string | null;
  employmentLength?: string | null;
}

export interface AdminUpdateReviewInput {
  isApproved?: boolean;
}

export interface CompanyReviewResponse {
  reviews: CompanyReviewWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CompanyReviewStatistics {
  totalReviews: number;
  averageRating: number;
  averageWorkLifeBalance: number;
  averageSalaryBenefit: number;
  averageManagement: number;
  averageCulture: number;
  ratingDistribution: Record<number, number>; // 1-5 star counts
  byEmploymentStatus: Record<EmploymentStatus, number>;
  recommendationRate: number; // percentage
}

export interface ReviewerInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean;
}

export interface CompanyReviewDetail extends CompanyReview {
  company: {
    id: string;
    companyName: string;
    companySlug: string;
    logoUrl?: string;
  };
  reviewer: ReviewerInfo;
}

export interface ReportReviewInput {
  reviewId: string;
  reason: string;
  description?: string;
}

export interface CompanyReviewFilters {
  rating?: number[];
  employmentStatus?: EmploymentStatus[];
  hasPositionTitle?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
