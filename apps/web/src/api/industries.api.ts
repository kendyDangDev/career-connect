import axiosInstance from '@/lib/axios';
import {
  Industry,
  CreateIndustryDto,
  UpdateIndustryDto,
  SystemCategoryQuery,
  PaginatedResponse,
} from '@/types/system-categories';

const BASE_URL = '/api/admin/system-categories/industries';

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const industriesKeys = {
  all: ['industries'] as const,
  lists: () => [...industriesKeys.all, 'list'] as const,
  list: (params: SystemCategoryQuery) => [...industriesKeys.lists(), params] as const,
  details: () => [...industriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...industriesKeys.details(), id] as const,
  analytics: () => [...industriesKeys.all, 'analytics'] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const industriesApi = {
  getList: async (params: SystemCategoryQuery): Promise<PaginatedResponse<Industry>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<Industry>>(BASE_URL, { params });
    return data;
  },

  getById: async (id: string): Promise<Industry> => {
    const { data } = await axiosInstance.get<{ data: Industry }>(`${BASE_URL}/${id}`);
    return data.data;
  },

  create: async (body: CreateIndustryDto): Promise<Industry> => {
    const { data } = await axiosInstance.post<{ data: Industry }>(BASE_URL, body);
    return data.data;
  },

  update: async (id: string, body: UpdateIndustryDto): Promise<Industry> => {
    const { data } = await axiosInstance.put<{ data: Industry }>(`${BASE_URL}/${id}`, body);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
