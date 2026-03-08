import axiosInstance from '@/lib/axios';
import type { User, UserFormData, UsersResponse, UsersQuery } from '@/app/admin/users/types';

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UsersQuery) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const usersApi = {
  getList: async (params: UsersQuery): Promise<UsersResponse> => {
    const { data } = await axiosInstance.get<UsersResponse>('/api/admin/users', { params });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await axiosInstance.get<{ data: User }>(`/api/admin/users/${id}`);
    return data.data;
  },

  create: async (body: UserFormData): Promise<User> => {
    const { data } = await axiosInstance.post<{ data: User }>('/api/admin/users', body);
    return data.data;
  },

  update: async (id: string, body: UserFormData): Promise<User> => {
    const { data } = await axiosInstance.put<{ data: User }>(`/api/admin/users/${id}`, body);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/admin/users/${id}`);
  },
};
