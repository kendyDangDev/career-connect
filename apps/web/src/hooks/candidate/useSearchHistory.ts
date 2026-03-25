'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  candidateSearchHistoryApi,
  type CandidateRecentSearchItem,
  type CandidateTrackSearchPayload,
} from '@/api/candidate/search-history.api';

export const candidateSearchHistoryKeys = {
  all: ['candidate-search-history'] as const,
  recent: (limit: number) => [...candidateSearchHistoryKeys.all, 'recent', limit] as const,
};

export function useCandidateRecentSearches(enabled = true, limit = 5) {
  return useQuery({
    queryKey: candidateSearchHistoryKeys.recent(limit),
    queryFn: async () => {
      const payload = await candidateSearchHistoryApi.getRecentSearches(limit);
      return payload.searches;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrackCandidateSearch() {
  const queryClient = useQueryClient();

  return useMutation<CandidateTrackSearchPayload, Error, string>({
    mutationFn: (keyword) => candidateSearchHistoryApi.trackSearch(keyword),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: candidateSearchHistoryKeys.all,
      });
    },
  });
}

export function useCandidateSearchHistory(enabled = true, limit = 5) {
  const recentSearchesQuery = useCandidateRecentSearches(enabled, limit);
  const trackSearchMutation = useTrackCandidateSearch();

  return {
    searches: recentSearchesQuery.data ?? ([] as CandidateRecentSearchItem[]),
    isLoadingRecentSearches: recentSearchesQuery.isLoading,
    isTrackingSearch: trackSearchMutation.isPending,
    trackSearch: (keyword: string) => {
      if (!enabled) {
        return Promise.resolve({ recorded: false, search: null });
      }

      return trackSearchMutation.mutateAsync(keyword);
    },
  };
}
