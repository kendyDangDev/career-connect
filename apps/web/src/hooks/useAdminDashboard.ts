/**
 * Admin Dashboard React Query Hooks
 * Hooks for fetching and managing Admin Dashboard data
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { adminDashboardApi } from '@/api/admin-dashboard.api';
import type {
  DashboardOverviewResponse,
  DashboardAnalyticsResponse,
  DashboardActivitiesResponse,
  OverviewQueryParams,
  AnalyticsQueryParams,
  ActivitiesQueryParams,
  TimeRange,
} from '@/types/admin/dashboard.types';

/**
 * Query Keys - Quản lý cache keys
 */
export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  overview: (params?: OverviewQueryParams) =>
    [...adminDashboardKeys.all, 'overview', params] as const,
  analytics: (params?: AnalyticsQueryParams) =>
    [...adminDashboardKeys.all, 'analytics', params] as const,
  activities: (params?: ActivitiesQueryParams) =>
    [...adminDashboardKeys.all, 'activities', params] as const,
};

/**
 * Hook: useAdminDashboardOverview
 * Lấy tổng quan dashboard với system stats
 * 
 * @param params - Query parameters
 * @param options - React Query options
 * @returns Query result with dashboard overview data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAdminDashboardOverview({
 *   includeTopPerformers: true,
 *   topLimit: 5
 * });
 * ```
 */
export const useAdminDashboardOverview = (
  params?: OverviewQueryParams,
  options?: Omit<
    UseQueryOptions<DashboardOverviewResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<DashboardOverviewResponse, Error>({
    queryKey: adminDashboardKeys.overview(params),
    queryFn: () => adminDashboardApi.getOverview(params),
    staleTime: 1000 * 60 * 5, // 5 phút - Overview data không thay đổi thường xuyên
    ...options,
  });
};

/**
 * Hook: useAdminDashboardAnalytics
 * Lấy analytics chi tiết với time series data
 * 
 * @param params - Query parameters including timeRange
 * @param options - React Query options
 * @returns Query result with analytics data
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAdminDashboardAnalytics({
 *   timeRange: '30days',
 *   includeTimeSeries: true,
 * });
 * ```
 */
export const useAdminDashboardAnalytics = (
  params?: AnalyticsQueryParams,
  options?: Omit<
    UseQueryOptions<DashboardAnalyticsResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<DashboardAnalyticsResponse, Error>({
    queryKey: adminDashboardKeys.analytics(params),
    queryFn: () => adminDashboardApi.getAnalytics(params),
    staleTime: 1000 * 60 * 15, // 15 phút - Analytics data có thể cache lâu hơn
    ...options,
  });
};

/**
 * Hook: useAdminDashboardActivities
 * Lấy recent activities từ audit logs
 * 
 * @param params - Query parameters including pagination
 * @param options - React Query options
 * @returns Query result with activities data
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAdminDashboardActivities({
 *   page: 1,
 *   limit: 50,
 *   type: 'JOB_CREATION'
 * });
 * ```
 */
export const useAdminDashboardActivities = (
  params?: ActivitiesQueryParams,
  options?: Omit<
    UseQueryOptions<DashboardActivitiesResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<DashboardActivitiesResponse, Error>({
    queryKey: adminDashboardKeys.activities(params),
    queryFn: () => adminDashboardApi.getActivities(params),
    staleTime: 0, // Không cache - Activities là real-time data
    refetchOnWindowFocus: true, // Refetch khi focus lại
    ...options,
  });
};

/**
 * Hook: useAdminDashboard
 * Combined hook để lấy tất cả dashboard data cùng lúc
 * 
 * @param overviewParams - Overview query params
 * @param analyticsTimeRange - Time range for analytics
 * @returns Object chứa tất cả query results
 * 
 * @example
 * ```tsx
 * const {
 *   overview,
 *   analytics,
 *   activities,
 *   isLoading
 * } = useAdminDashboard({
 *   overviewParams: { includeTopPerformers: true },
 *   analyticsTimeRange: '30days'
 * });
 * ```
 */
export const useAdminDashboard = ({
  overviewParams,
  analyticsTimeRange = '30days',
  activitiesParams,
}: {
  overviewParams?: OverviewQueryParams;
  analyticsTimeRange?: TimeRange;
  activitiesParams?: ActivitiesQueryParams;
} = {}) => {
  const overview = useAdminDashboardOverview(overviewParams);
  const analytics = useAdminDashboardAnalytics({
    timeRange: analyticsTimeRange,
    includeTimeSeries: false, // Không cần time series cho overview
  });
  const activities = useAdminDashboardActivities({
    page: 1,
    limit: 5, // Chỉ lấy 5 activities gần nhất
    ...activitiesParams,
  });

  return {
    overview,
    analytics,
    activities,
    isLoading: overview.isLoading || analytics.isLoading || activities.isLoading,
    isError: overview.isError || analytics.isError || activities.isError,
    error: overview.error || analytics.error || activities.error,
  };
};
