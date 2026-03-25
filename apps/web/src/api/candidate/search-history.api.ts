import { axiosInstance } from '@/lib/axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CandidateRecentSearchItem {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  searchedAt: string;
}

export interface CandidateRecentSearchPayload {
  searches: CandidateRecentSearchItem[];
}

export interface CandidateTrackSearchPayload {
  recorded: boolean;
  search: CandidateRecentSearchItem | null;
}

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;

  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }

  return response.data.data;
}

export const candidateSearchHistoryApi = {
  async getRecentSearches(limit = 5) {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateRecentSearchPayload>>(
        `/api/candidate/search-history?limit=${limit}`
      )
    );
  },

  async trackSearch(keyword: string) {
    return unwrapResponse(
      axiosInstance.post<ApiResponse<CandidateTrackSearchPayload>>(
        '/api/candidate/search-history',
        { keyword }
      )
    );
  },
};
