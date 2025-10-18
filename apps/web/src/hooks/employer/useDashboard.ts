'use client';

import { useQuery } from '@tanstack/react-query';
import { employerDashboardApi } from '@/api/employer/dashboard.api';

// Query Keys - For cache management
export const dashboardKeys = {
  all: ['employer', 'dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

/**
 * Hook to fetch employer dashboard summary data
 * Includes: stats, pipeline, recent jobs, charts, activity, interviews, notifications
 * 
 * @returns {Object} Dashboard data with loading and error states
 */
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: employerDashboardApi.getSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data should be relatively fresh
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    retry: 2,
  });
};
