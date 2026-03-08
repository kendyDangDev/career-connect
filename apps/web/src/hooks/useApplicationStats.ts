'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getApplicationStats,
  employerApplicationStatsKeys,
} from '@/api/employer/employerApplicationStats.api';
import type {
  ApplicationStatsParams,
  ApplicationStatsData,
  TimeRange,
} from '@/types/employer/applicationStats.types';

export type { TimeRange };

export interface UseApplicationStatsState {
  data: ApplicationStatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching application statistics and analytics for employers
 */
export const useApplicationStats = (params: ApplicationStatsParams = {}) => {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: employerApplicationStatsKeys.stat(params),
    queryFn: () => getApplicationStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
};
