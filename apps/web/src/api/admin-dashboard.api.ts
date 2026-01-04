/**
 * Admin Dashboard API Service
 * Service layer for Admin Dashboard & Analytics API calls
 */

import axiosInstance from '@/lib/axios';
import type {
  DashboardOverviewResponse,
  DashboardAnalyticsResponse,
  DashboardActivitiesResponse,
  OverviewQueryParams,
  AnalyticsQueryParams,
  ActivitiesQueryParams,
} from '@/types/admin/dashboard.types';

/**
 * Admin Dashboard API
 */
export const adminDashboardApi = {
  /**
   * GET /api/admin/dashboard/overview
   * Lấy tổng quan dashboard với thống kê toàn hệ thống
   */
  getOverview: async (params?: OverviewQueryParams): Promise<DashboardOverviewResponse> => {
    const { data } = await axiosInstance.get<DashboardOverviewResponse>(
      '/api/admin/dashboard/overview',
      { params }
    );
    return data;
  },

  /**
   * GET /api/admin/dashboard/analytics
   * Lấy analytics chi tiết với time series data
   */
  getAnalytics: async (params?: AnalyticsQueryParams): Promise<DashboardAnalyticsResponse> => {
    const { data } = await axiosInstance.get<DashboardAnalyticsResponse>(
      '/api/admin/dashboard/analytics',
      { params }
    );
    return data;
  },

  /**
   * GET /api/admin/dashboard/activities
   * Lấy recent activities từ audit logs
   */
  getActivities: async (
    params?: ActivitiesQueryParams
  ): Promise<DashboardActivitiesResponse> => {
    const { data } = await axiosInstance.get<DashboardActivitiesResponse>(
      '/api/admin/dashboard/activities',
      { params }
    );
    return data;
  },
};
