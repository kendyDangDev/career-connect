import axiosInstance from '@/lib/axios';
import { DashboardSummaryResponse } from '@/types/employer/dashboard.types';

export const employerDashboardApi = {
  /**
   * Get complete dashboard summary data
   * Includes: stats, pipeline, recent jobs, charts, activity, interviews, notifications
   */
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const { data } = await axiosInstance.get<DashboardSummaryResponse>(
      '/api/employer/dashboard/summary'
    );
    return data;
  },
};
