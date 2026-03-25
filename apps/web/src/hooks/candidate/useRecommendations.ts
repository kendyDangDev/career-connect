'use client';

import { useQuery } from '@tanstack/react-query';
import {
  recommendationApi,
  type CandidateRecommendationPayload,
  type CandidateRecommendationItem,
  type SimilarJobItem,
} from '@/api/candidate/recommendations.api';

export const recommendationKeys = {
  all: ['recommendations'] as const,
  candidate: () => [...recommendationKeys.all, 'candidate'] as const,
  similar: (jobId: string) => [...recommendationKeys.all, 'similar', jobId] as const,
};

export function useCandidateRecommendations(enabled = true) {
  return useQuery<CandidateRecommendationPayload>({
    queryKey: recommendationKeys.candidate(),
    queryFn: () => recommendationApi.getCandidateRecommendations(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSimilarJobs(jobId?: string | null, enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.similar(jobId ?? ''),
    queryFn: () => recommendationApi.getSimilarJobs(jobId!),
    enabled: enabled && Boolean(jobId),
    staleTime: 5 * 60 * 1000,
  });
}

export type { CandidateRecommendationItem, SimilarJobItem };
