import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CandidateListItem,
  CandidatesQuery,
  CandidatesResponse,
  PaginationInfo,
  Candidate,
} from '@/app/admin/candidates/types';
import {
  candidatesKeys,
  getCandidates,
  getCandidateDetails,
  updateCandidate as updateCandidateApi,
  deleteCandidate as deleteCandidateApi,
} from '@/api/candidate/candidates.api';

interface UseCandidatesDataOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  availabilityStatus?: string;
  preferredWorkType?: string;
  minExperience?: number;
  maxExperience?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useCandidatesData = (options: UseCandidatesDataOptions) => {
  const queryClient = useQueryClient();

  // Query for fetching candidates list
  const {
    data: candidatesResponse,
    isLoading: loading,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: candidatesKeys.list(options),
    queryFn: () => getCandidates(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract data from response
  const candidates = candidatesResponse?.data || [];
  const pagination: PaginationInfo = candidatesResponse
    ? {
        page: candidatesResponse.meta.page,
        limit: candidatesResponse.meta.limit,
        total: candidatesResponse.meta.total,
        totalPages: candidatesResponse.meta.totalPages,
        hasNextPage: candidatesResponse.meta.page < candidatesResponse.meta.totalPages,
        hasPreviousPage: candidatesResponse.meta.page > 1,
      }
    : {
        page: options.page,
        limit: options.limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

  // Mutation for fetching candidate details
  const fetchCandidateDetailsMutation = useMutation({
    mutationFn: (id: string) => getCandidateDetails(id),
  });

  // Mutation for updating candidate
  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Candidate> }): Promise<Candidate> =>
      updateCandidateApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
    },
  });

  // Mutation for deleting candidate
  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string): Promise<void> => deleteCandidateApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
    },
  });

  const fetchCandidateDetails = async (id: string): Promise<Candidate | null> => {
    try {
      return await fetchCandidateDetailsMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      return null;
    }
  };

  const updateCandidate = async (id: string, data: Partial<Candidate>) => {
    try {
      return await updateCandidateMutation.mutateAsync({ id, data });
    } catch (err) {
      console.error('Error updating candidate:', err);
      throw err;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      await deleteCandidateMutation.mutateAsync(id);
      return true;
    } catch (err) {
      console.error('Error deleting candidate:', err);
      throw err;
    }
  };

  return {
    candidates,
    loading,
    error: error ? (error as Error).message : null,
    pagination,
    fetchCandidateDetails,
    updateCandidate,
    deleteCandidate,
    refresh,
  };
};
