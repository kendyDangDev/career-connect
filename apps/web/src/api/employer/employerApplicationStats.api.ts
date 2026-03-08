import { axiosInstance } from '@/lib/axios';
import type {
  ApplicationStatsParams,
  ApplicationStatsData,
} from '@/types/employer/applicationStats.types';

// Query Keys
export const employerApplicationStatsKeys = {
  all: ['employerApplicationStats'] as const,
  stats: () => [...employerApplicationStatsKeys.all, 'stats'] as const,
  stat: (params: ApplicationStatsParams) =>
    [...employerApplicationStatsKeys.stats(), params] as const,
};

// API Functions
export const getApplicationStats = async (
  params: ApplicationStatsParams
): Promise<ApplicationStatsData> => {
  const response = await axiosInstance.get('/api/employer/applications/stats', { params });
  return response.data.data;
};
