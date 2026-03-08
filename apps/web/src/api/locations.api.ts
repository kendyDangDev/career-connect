import axiosInstance from '@/lib/axios';
import {
  Location,
  LocationQuery,
  CreateLocationDto,
  UpdateLocationDto,
  PaginatedResponse,
} from '@/types/system-categories';

interface LocationsResponse {
  success: boolean;
  data: Location[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    typeStats?: Record<string, number>;
  };
}

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const locationsKeys = {
  all: ['locations'] as const,
  lists: () => [...locationsKeys.all, 'list'] as const,
  list: (params: LocationQuery) => [...locationsKeys.lists(), params] as const,
  details: () => [...locationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationsKeys.details(), id] as const,
  tree: () => [...locationsKeys.all, 'tree'] as const,
  popular: () => [...locationsKeys.all, 'popular'] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const locationsApi = {
  getList: async (params: LocationQuery): Promise<LocationsResponse> => {
    const { data } = await axiosInstance.get<LocationsResponse>(
      '/api/admin/system-categories/locations',
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Location> => {
    const { data } = await axiosInstance.get<{ data: Location }>(
      `/api/admin/system-categories/locations/${id}`
    );
    return data.data;
  },

  getTree: async (): Promise<LocationsResponse> => {
    const { data } = await axiosInstance.get<LocationsResponse>(
      '/api/admin/system-categories/locations',
      {
        params: { parentId: null, includeChildren: true, limit: 100 },
      }
    );
    return data;
  },

  create: async (body: CreateLocationDto): Promise<{ data: Location; message: string }> => {
    const { data } = await axiosInstance.post<{ data: Location; message: string }>(
      '/api/admin/system-categories/locations',
      body
    );
    return data;
  },

  update: async (
    id: string,
    body: UpdateLocationDto
  ): Promise<{ data: Location; message: string }> => {
    const { data } = await axiosInstance.put<{ data: Location; message: string }>(
      `/api/admin/system-categories/locations/${id}`,
      body
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(
      `/api/admin/system-categories/locations/${id}`
    );
    return data;
  },

  getPopularCities: async (): Promise<Location[]> => {
    const { data } = await axiosInstance.get<{ data: Location[] }>(
      '/api/admin/system-categories/locations/popular'
    );
    return data.data;
  },
};
