import { axiosInstance } from '@/lib/axios';
import {
  CandidateListItem,
  CandidatesQuery,
  CandidatesResponse,
  Candidate,
} from '@/app/admin/candidates/types';

// Query Keys factory
export const candidatesKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidatesKeys.all, 'list'] as const,
  list: (filters: CandidatesQuery) => [...candidatesKeys.lists(), filters] as const,
  details: () => [...candidatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidatesKeys.details(), id] as const,
};

// API Functions
export const getCandidates = async (params: CandidatesQuery): Promise<CandidatesResponse> => {
  const sanitizedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  const response = await axiosInstance.get<CandidatesResponse>('/api/candidates', {
    params: sanitizedParams,
  });
  return response.data;
};

export const getCandidateDetails = async (id: string): Promise<Candidate> => {
  const response = await axiosInstance.get<{ success: boolean; data: Candidate }>(
    `/api/candidates/${id}`
  );
  if (!response.data.success) {
    throw new Error('Failed to fetch candidate details');
  }
  return response.data.data;
};

export const updateCandidate = async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
  const response = await axiosInstance.patch<{ success: boolean; data: Candidate }>(
    `/api/candidates/${id}`,
    data
  );
  if (!response.data.success) {
    throw new Error('Failed to update candidate');
  }
  return response.data.data;
};

export const deleteCandidate = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete<{ success: boolean }>(`/api/candidates/${id}`);
  if (!response.data.success) {
    throw new Error('Failed to delete candidate');
  }
};
