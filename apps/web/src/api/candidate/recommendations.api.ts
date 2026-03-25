import { axiosInstance } from '@/lib/axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface RecommendationCompanySummary {
  id: string;
  companyName: string;
  companySlug?: string;
  logoUrl?: string | null;
  verificationStatus?: string;
}

export interface RecommendationJobSkill {
  skill: {
    id: string;
    name: string | null;
  };
}

export interface RecommendationJobCardData {
  id: string;
  title: string;
  slug: string;
  jobType: string;
  workLocationType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryNegotiable: boolean;
  address: string | null;
  locationCity: string | null;
  locationProvince: string | null;
  applicationDeadline: string | null;
  status: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  company: RecommendationCompanySummary;
  jobSkills: RecommendationJobSkill[];
  skills: string[];
  recommendationScore?: number;
  similarityScore?: number;
}

export type CandidateRecommendationItem = RecommendationJobCardData;
export type SimilarJobItem = RecommendationJobCardData;
export type RecommendationStrategy = 'behavioral' | 'profile';

export interface CandidateRecommendationPayload {
  strategy: RecommendationStrategy;
  title: string;
  description: string;
  jobs: CandidateRecommendationItem[];
}

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;

  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }

  return response.data.data;
}

export const recommendationApi = {
  async getCandidateRecommendations() {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateRecommendationPayload>>(
        '/api/candidate/recommendations'
      )
    );
  },

  async getSimilarJobs(jobId: string) {
    const payload = await unwrapResponse(
      axiosInstance.get<ApiResponse<{ jobs: SimilarJobItem[] }>>(`/api/jobs/${jobId}/similar`)
    );

    return payload.jobs;
  },
};
