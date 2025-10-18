import { useState, useCallback, useEffect } from 'react';
import { AdminJobService, AdminJobListParams } from '@/services/admin/job.service';
import { JobListResponse, JobDetail, CreateJobDTO, UpdateJobDTO, UpdateJobStatusDTO } from '@/types/employer/job';

export interface UseJobsListState {
  jobs: JobListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: AdminJobListParams) => void;
}

export interface UseJobDetailState {
  job: JobDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseJobMutationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  createJob: (data: CreateJobDTO) => Promise<void>;
  updateJob: (jobId: string, data: UpdateJobDTO) => Promise<void>;
  updateJobStatus: (jobId: string, data: UpdateJobStatusDTO) => Promise<void>;
  duplicateJob: (jobId: string, title?: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  bulkUpdateStatus: (jobIds: string[], status: string, reason?: string) => Promise<void>;
  bulkDelete: (jobIds: string[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing jobs list with filtering, pagination, and search
 */
export const useJobsList = (initialFilters: AdminJobListParams = {}) => {
  const [state, setState] = useState<UseJobsListState>({
    jobs: null,
    loading: false,
    error: null,
    refetch: async () => {},
    updateFilters: () => {},
  });

  const [filters, setFilters] = useState<AdminJobListParams>(initialFilters);

  const fetchJobs = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const jobs = await AdminJobService.getJobsList(filters);
      setState(prev => ({
        ...prev,
        jobs,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false,
      }));
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: AdminJobListParams) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    ...state,
    refetch: fetchJobs,
    updateFilters,
    filters,
  };
};

/**
 * Hook for managing single job details
 */
export const useJobDetail = (jobId: string | null) => {
  const [state, setState] = useState<UseJobDetailState>({
    job: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const fetchJobDetail = useCallback(async () => {
    if (!jobId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const job = await AdminJobService.getJobDetail(jobId);
      setState(prev => ({
        ...prev,
        job,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch job details',
        loading: false,
      }));
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  return {
    ...state,
    refetch: fetchJobDetail,
  };
};

/**
 * Hook for job mutation operations (create, update, delete, etc.)
 */
export const useJobMutations = (onSuccess?: (operation: string, data?: any) => void) => {
  const [state, setState] = useState<UseJobMutationState>({
    loading: false,
    error: null,
    success: false,
    createJob: async () => {},
    updateJob: async () => {},
    updateJobStatus: async () => {},
    duplicateJob: async () => {},
    deleteJob: async () => {},
    bulkUpdateStatus: async () => {},
    bulkDelete: async () => {},
    reset: () => {},
  });

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      loading: false,
      error: null,
      success: false,
    }));
  }, []);

  const createJob = useCallback(async (data: CreateJobDTO) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.createJob(data);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('create', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      }));
    }
  }, [onSuccess]);

  const updateJob = useCallback(async (jobId: string, data: UpdateJobDTO) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.updateJob(jobId, data);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('update', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      }));
    }
  }, [onSuccess]);

  const updateJobStatus = useCallback(async (jobId: string, data: UpdateJobStatusDTO) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.updateJobStatus(jobId, data);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('updateStatus', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update job status',
      }));
    }
  }, [onSuccess]);

  const duplicateJob = useCallback(async (jobId: string, title?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.duplicateJob(jobId, title ? { title } : undefined);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('duplicate', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to duplicate job',
      }));
    }
  }, [onSuccess]);

  const deleteJob = useCallback(async (jobId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.deleteJob(jobId);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('delete', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      }));
    }
  }, [onSuccess]);

  const bulkUpdateStatus = useCallback(async (jobIds: string[], status: string, reason?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.bulkUpdateJobStatus(jobIds, status, reason);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('bulkUpdateStatus', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update job statuses',
      }));
    }
  }, [onSuccess]);

  const bulkDelete = useCallback(async (jobIds: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const result = await AdminJobService.bulkDeleteJobs(jobIds);
      setState(prev => ({ ...prev, loading: false, success: true }));
      onSuccess?.('bulkDelete', result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete jobs',
      }));
    }
  }, [onSuccess]);

  return {
    ...state,
    createJob,
    updateJob,
    updateJobStatus,
    duplicateJob,
    deleteJob,
    bulkUpdateStatus,
    bulkDelete,
    reset,
  };
};

/**
 * Hook for job statistics and analytics
 */
export const useJobAnalytics = (jobId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const fetchStatistics = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const stats = await AdminJobService.getJobStatistics(jobId);
      setStatistics(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

/**
 * Hook for admin dashboard summary statistics
 */
export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await AdminJobService.getAdminStatsSummary();
      setSummary(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};