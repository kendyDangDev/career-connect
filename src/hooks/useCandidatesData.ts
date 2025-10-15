import { useState, useEffect, useCallback } from 'react';
import { 
  CandidateListItem, 
  CandidatesQuery, 
  CandidatesResponse, 
  PaginationInfo,
  Candidate 
} from '@/app/admin/candidates/types';

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
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: options.page,
    limit: options.limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add all query parameters
      queryParams.append('page', options.page.toString());
      queryParams.append('limit', options.limit.toString());
      
      if (options.search) queryParams.append('search', options.search);
      if (options.status) queryParams.append('status', options.status);
      if (options.availabilityStatus) queryParams.append('availabilityStatus', options.availabilityStatus);
      if (options.preferredWorkType) queryParams.append('preferredWorkType', options.preferredWorkType);
      if (options.minExperience !== undefined) queryParams.append('minExperience', options.minExperience.toString());
      if (options.maxExperience !== undefined) queryParams.append('maxExperience', options.maxExperience.toString());
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

      const response = await fetch(`/api/candidates?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch candidates');
      }

      const data: CandidatesResponse = await response.json();
      
      if (data.success) {
        setCandidates(data.data);
        setPagination({
          page: data.meta.page,
          limit: data.meta.limit,
          total: data.meta.total,
          totalPages: data.meta.totalPages,
          hasNextPage: data.meta.page < data.meta.totalPages,
          hasPreviousPage: data.meta.page > 1,
        });
      } else {
        throw new Error('Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [
    options.page,
    options.limit,
    options.search,
    options.status,
    options.availabilityStatus,
    options.preferredWorkType,
    options.minExperience,
    options.maxExperience,
    options.sortBy,
    options.sortOrder,
  ]);

  const fetchCandidateDetails = useCallback(async (id: string): Promise<Candidate | null> => {
    try {
      const response = await fetch(`/api/candidates/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch candidate details');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Failed to fetch candidate details');
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, []);

  const updateCandidate = useCallback(async (id: string, data: Partial<Candidate>) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update candidate');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh candidates list
        await fetchCandidates();
        return result.data;
      } else {
        throw new Error('Failed to update candidate');
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
      throw err;
    }
  }, [fetchCandidates]);

  const deleteCandidate = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete candidate');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh candidates list
        await fetchCandidates();
        return true;
      } else {
        throw new Error('Failed to delete candidate');
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      throw err;
    }
  }, [fetchCandidates]);

  const refresh = useCallback(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    loading,
    error,
    pagination,
    fetchCandidateDetails,
    updateCandidate,
    deleteCandidate,
    refresh,
  };
};