'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  candidateApplicationsApi,
  type CandidateApplicationsListParams,
  type CandidateApplicationsStatsParams,
} from '@/api/candidate/applications.api';
import { handleApiError } from '@/lib/axios';

export const candidateApplicationsKeys = {
  all: ['candidate', 'applications'] as const,
  lists: () => [...candidateApplicationsKeys.all, 'list'] as const,
  list: (params: CandidateApplicationsListParams) =>
    [...candidateApplicationsKeys.lists(), params] as const,
  stats: (params: CandidateApplicationsStatsParams) =>
    [...candidateApplicationsKeys.all, 'stats', params] as const,
  detail: (applicationId: string) =>
    [...candidateApplicationsKeys.all, 'detail', applicationId] as const,
};

export function useCandidateApplications(params: CandidateApplicationsListParams = {}) {
  return useQuery({
    queryKey: candidateApplicationsKeys.list(params),
    queryFn: () => candidateApplicationsApi.getApplications(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCandidateApplicationStats(params: CandidateApplicationsStatsParams = {}) {
  return useQuery({
    queryKey: candidateApplicationsKeys.stats(params),
    queryFn: () => candidateApplicationsApi.getStats(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCandidateApplicationDetail(applicationId?: string | null, enabled = true) {
  return useQuery({
    queryKey: candidateApplicationsKeys.detail(applicationId ?? ''),
    queryFn: () => candidateApplicationsApi.getApplicationDetail(applicationId!),
    enabled: enabled && Boolean(applicationId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => candidateApplicationsApi.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateApplicationsKeys.all });
      toast.success('Đã rút hồ sơ ứng tuyển.');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}
