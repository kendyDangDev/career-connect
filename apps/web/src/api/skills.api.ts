import axiosInstance from '@/lib/axios';
import {
  Skill,
  SkillQuery,
  CreateSkillDto,
  UpdateSkillDto,
  PaginatedResponse,
} from '@/types/system-categories';

interface SkillsResponse extends PaginatedResponse<Skill> {
  meta: PaginatedResponse<Skill>['meta'] & {
    categoryStats?: Record<string, number>;
  };
}

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const skillsKeys = {
  all: ['skills'] as const,
  lists: () => [...skillsKeys.all, 'list'] as const,
  list: (params: SkillQuery) => [...skillsKeys.lists(), params] as const,
  details: () => [...skillsKeys.all, 'detail'] as const,
  detail: (id: string) => [...skillsKeys.details(), id] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const skillsApi = {
  getList: async (params: SkillQuery): Promise<SkillsResponse> => {
    const { data } = await axiosInstance.get<SkillsResponse>(
      '/api/admin/system-categories/skills',
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Skill> => {
    const { data } = await axiosInstance.get<{ data: Skill }>(
      `/api/admin/system-categories/skills/${id}`
    );
    return data.data;
  },

  create: async (body: CreateSkillDto): Promise<{ data: Skill; message: string }> => {
    const { data } = await axiosInstance.post<{ data: Skill; message: string }>(
      '/api/admin/system-categories/skills',
      body
    );
    return data;
  },

  update: async (id: string, body: UpdateSkillDto): Promise<{ data: Skill; message: string }> => {
    const { data } = await axiosInstance.put<{ data: Skill; message: string }>(
      `/api/admin/system-categories/skills/${id}`,
      body
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(
      `/api/admin/system-categories/skills/${id}`
    );
    return data;
  },
};
