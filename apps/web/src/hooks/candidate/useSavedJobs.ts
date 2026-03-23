'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  candidateSavedJobsApi,
  type CandidateSavedJobsListData,
  type CandidateSavedJobsListParams,
  type CandidateSavedJobStatus,
} from '@/api/candidate/saved-jobs.api';
import { handleApiError } from '@/lib/axios';

interface SaveJobInput {
  jobId: string;
}

interface RemoveSavedJobInput {
  savedJobId: string;
  jobId: string;
}

interface ToggleSavedJobInput {
  jobId: string;
  isSaved: boolean;
  savedJobId?: string;
}

type SavedJobsListSnapshot = Array<readonly [readonly unknown[], CandidateSavedJobsListData | undefined]>;

export const candidateSavedJobsKeys = {
  all: ['candidate', 'saved-jobs'] as const,
  lists: () => [...candidateSavedJobsKeys.all, 'list'] as const,
  list: (params: CandidateSavedJobsListParams) => [...candidateSavedJobsKeys.lists(), params] as const,
  status: (jobId: string) => [...candidateSavedJobsKeys.all, 'status', jobId] as const,
};

export function useCandidateSavedJobs(params: CandidateSavedJobsListParams = {}) {
  return useQuery({
    queryKey: candidateSavedJobsKeys.list(params),
    queryFn: () => candidateSavedJobsApi.getSavedJobs(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCandidateSavedJobStatus(jobId?: string | null, enabled = true) {
  return useQuery({
    queryKey: candidateSavedJobsKeys.status(jobId ?? ''),
    queryFn: () => candidateSavedJobsApi.getSavedJobStatus(jobId!),
    enabled: enabled && Boolean(jobId),
    staleTime: 2 * 60 * 1000,
  });
}

function updateSavedJobListCache(
  data: CandidateSavedJobsListData,
  savedJobId: string
): CandidateSavedJobsListData {
  const nextSavedJobs = data.savedJobs.filter((item) => item.id !== savedJobId);

  if (nextSavedJobs.length === data.savedJobs.length) {
    return data;
  }

  const nextTotal = Math.max(0, data.pagination.total - 1);
  const nextTotalPages =
    nextTotal === 0 ? 1 : Math.max(1, Math.ceil(nextTotal / data.pagination.limit));

  return {
    savedJobs: nextSavedJobs,
    pagination: {
      ...data.pagination,
      total: nextTotal,
      totalPages: nextTotalPages,
      hasNext: data.pagination.page < nextTotalPages,
      hasPrev: data.pagination.page > 1,
    },
  };
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId }: SaveJobInput) => candidateSavedJobsApi.saveJob(jobId),
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: candidateSavedJobsKeys.status(jobId) });

      const previousStatus = queryClient.getQueryData<CandidateSavedJobStatus>(
        candidateSavedJobsKeys.status(jobId)
      );

      queryClient.setQueryData<CandidateSavedJobStatus>(candidateSavedJobsKeys.status(jobId), {
        isSaved: true,
        savedAt: new Date().toISOString(),
        savedJobId: previousStatus?.savedJobId || `optimistic-${jobId}`,
      });

      return { previousStatus, jobId };
    },
    onSuccess: (payload, { jobId }) => {
      queryClient.setQueryData<CandidateSavedJobStatus>(candidateSavedJobsKeys.status(jobId), {
        isSaved: true,
        savedAt: payload.savedJob.createdAt,
        savedJobId: payload.savedJob.id,
      });
      toast.success('Đã lưu việc làm.');
    },
    onError: (error, { jobId }, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(candidateSavedJobsKeys.status(jobId), context.previousStatus);
      } else {
        queryClient.removeQueries({ queryKey: candidateSavedJobsKeys.status(jobId), exact: true });
      }
      toast.error(handleApiError(error));
    },
    onSettled: (_data, _error, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: candidateSavedJobsKeys.status(jobId) });
      queryClient.invalidateQueries({ queryKey: candidateSavedJobsKeys.lists() });
    },
  });
}

export function useRemoveSavedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ savedJobId }: RemoveSavedJobInput) => candidateSavedJobsApi.removeSavedJob(savedJobId),
    onMutate: async ({ savedJobId, jobId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: candidateSavedJobsKeys.status(jobId) }),
        queryClient.cancelQueries({ queryKey: candidateSavedJobsKeys.lists() }),
      ]);

      const previousStatus = queryClient.getQueryData<CandidateSavedJobStatus>(
        candidateSavedJobsKeys.status(jobId)
      );
      const listSnapshots = queryClient.getQueriesData<CandidateSavedJobsListData>({
        queryKey: candidateSavedJobsKeys.lists(),
      }) as SavedJobsListSnapshot;

      queryClient.setQueryData<CandidateSavedJobStatus>(candidateSavedJobsKeys.status(jobId), {
        isSaved: false,
      });

      listSnapshots.forEach(([queryKey, data]) => {
        if (!data) {
          return;
        }

        queryClient.setQueryData(queryKey, updateSavedJobListCache(data, savedJobId));
      });

      return {
        previousStatus,
        listSnapshots,
        jobId,
      };
    },
    onSuccess: (_payload, { jobId }) => {
      queryClient.setQueryData<CandidateSavedJobStatus>(candidateSavedJobsKeys.status(jobId), {
        isSaved: false,
      });
      toast.success('Đã bỏ lưu việc làm.');
    },
    onError: (error, { jobId }, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(candidateSavedJobsKeys.status(jobId), context.previousStatus);
      } else {
        queryClient.removeQueries({ queryKey: candidateSavedJobsKeys.status(jobId), exact: true });
      }

      context?.listSnapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      toast.error(handleApiError(error));
    },
    onSettled: (_data, _error, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: candidateSavedJobsKeys.status(jobId) });
      queryClient.invalidateQueries({ queryKey: candidateSavedJobsKeys.all });
    },
  });
}

export function useToggleSavedJob() {
  const saveMutation = useSaveJob();
  const removeMutation = useRemoveSavedJob();

  const toggleSavedJob = async ({ jobId, isSaved, savedJobId }: ToggleSavedJobInput) => {
    if (isSaved) {
      if (!savedJobId) {
        throw new Error('Missing saved job id');
      }

      return removeMutation.mutateAsync({ savedJobId, jobId });
    }

    return saveMutation.mutateAsync({ jobId });
  };

  return {
    toggleSavedJob,
    isPending: saveMutation.isPending || removeMutation.isPending,
    saveMutation,
    removeMutation,
  };
}
