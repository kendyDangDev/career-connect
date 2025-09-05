import { InterviewReview, InterviewOutcome, Company, Job, User } from '@/generated/prisma';

export interface InterviewReviewWithRelations extends InterviewReview {
  company?: Company;
  job?: Job | null;
  reviewer?: User;
}

export interface GetInterviewReviewsParams {
  companyId?: string;
  companySlug?: string;
  jobId?: string;
  reviewerId?: string;
  outcome?: InterviewOutcome;
  minOverallRating?: number;
  minDifficultyRating?: number;
  recommendation?: boolean;
  sortBy?: 'createdAt' | 'overallRating' | 'difficultyRating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateInterviewReviewInput {
  companyId: string;
  jobId?: string | null;
  overallRating: number;
  difficultyRating: number;
  experienceDescription: string;
  interviewQuestions?: string | null;
  processDescription?: string | null;
  outcome: InterviewOutcome;
  recommendation: boolean;
  isAnonymous?: boolean;
}

export interface UpdateInterviewReviewInput {
  overallRating?: number;
  difficultyRating?: number;
  experienceDescription?: string;
  interviewQuestions?: string | null;
  processDescription?: string | null;
  outcome?: InterviewOutcome;
  recommendation?: boolean;
  isAnonymous?: boolean;
}

export interface InterviewReviewResponse {
  reviews: InterviewReviewWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface InterviewReviewStatistics {
  totalReviews: number;
  averageOverallRating: number;
  averageDifficultyRating: number;
  recommendationRate: number;
  outcomeDistribution: Record<InterviewOutcome, number>;
  ratingDistribution: {
    overall: Record<number, number>;
    difficulty: Record<number, number>;
  };
}

export interface ReviewerInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean;
}

export interface InterviewReviewDetail extends InterviewReview {
  company: {
    id: string;
    companyName: string;
    companySlug: string;
    logoUrl?: string;
  };
  job?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  reviewer: ReviewerInfo;
}

export interface InterviewTips {
  companyId: string;
  commonQuestions: string[];
  processOverview: string;
  preparationTips: string[];
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
}

export interface InterviewReviewFilters {
  overallRating?: number[];
  difficultyRating?: number[];
  outcome?: InterviewOutcome[];
  hasQuestions?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
