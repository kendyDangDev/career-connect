'use client';

import { useState, useCallback, useEffect } from 'react';
import { axiosInstance, handleApiError } from '@/lib/axios';

export type TimeRange = '7days' | '30days' | '90days' | 'year';

export interface ApplicationStatsParams {
  timeRange?: TimeRange;
  jobId?: string;
}

export interface StatusDistribution {
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  unrated: number;
}

export interface ExperienceDistribution {
  '0-2': number;
  '3-5': number;
  '6-10': number;
  '10+': number;
}

export interface ConversionFunnel {
  applied: number;
  reviewed: number;
  interviewed: number;
  hired: number;
  rejected: number;
}

export interface TopSkill {
  skill: string;
  count: number;
}

export interface ApplicationsByJob {
  jobId: string;
  jobTitle: string;
  count: number;
}

export interface ApplicationStatsSummary {
  totalApplications: number;
  averageTimeToHire: number;
  hireRate: number;
  timeRange: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ApplicationStatsData {
  summary: ApplicationStatsSummary;
  statusDistribution: Record<string, StatusDistribution>;
  ratingDistribution: RatingDistribution;
  experienceDistribution: ExperienceDistribution;
  conversionFunnel: ConversionFunnel;
  topSkills: TopSkill[];
  applicationsByJob: ApplicationsByJob[];
}

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
  const [state, setState] = useState<UseApplicationStatsState>({
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Build query params
      const queryParams = new URLSearchParams();
      if (params.timeRange) {
        queryParams.append('timeRange', params.timeRange);
      }
      if (params.jobId) {
        queryParams.append('jobId', params.jobId);
      }

      const response = await axiosInstance.get<{
        success: boolean;
        data: ApplicationStatsData;
      }>(`/api/employer/applications/stats?${queryParams.toString()}`);

      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          data: response.data.data,
          loading: false,
        }));
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error('Error fetching application statistics:', error);
    }
  }, [params.timeRange, params.jobId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
};
