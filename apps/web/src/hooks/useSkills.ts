import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Skill,
  SkillQuery,
  CreateSkillDto,
  UpdateSkillDto,
  PaginatedResponse,
  ApiResponse,
} from '@/types/system-categories';
import { skillsApi, skillsKeys } from '@/api/skills.api';

interface SkillsResponse extends PaginatedResponse<Skill> {
  meta: PaginatedResponse<Skill>['meta'] & {
    categoryStats?: Record<string, number>;
  };
}

interface UseSkillsReturn {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: SkillQuery;
  categoryStats: Record<string, number>;

  // Actions
  fetchSkills: (params?: SkillQuery) => Promise<void>;
  getSkill: (id: string) => Promise<Skill | null>;
  createSkill: (data: CreateSkillDto) => Promise<boolean>;
  updateSkill: (id: string, data: UpdateSkillDto) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  updateFilters: (filters: Partial<SkillQuery>) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

const defaultFilters: SkillQuery = {
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useSkills = (): UseSkillsReturn => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Parse filters from URL search params
  const [filters, setFilters] = useState<SkillQuery>(() => {
    const params: SkillQuery = { ...defaultFilters };

    searchParams?.forEach((value, key) => {
      if (key === 'page') params.page = parseInt(value);
      else if (key === 'limit') params.limit = parseInt(value);
      else if (key === 'isActive') params.isActive = value === 'true';
      else if (key === 'sortBy') params.sortBy = value;
      else if (key === 'sortOrder') params.sortOrder = value as 'asc' | 'desc';
      else if (key === 'search') params.search = value;
      else if (key === 'category') params.category = value as any;
    });

    return params;
  });

  // Query for skills list
  const skillsQuery = useQuery({
    queryKey: skillsKeys.list(filters),
    queryFn: () => skillsApi.getList(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create skill mutation
  const createMutation = useMutation({
    mutationFn: skillsApi.create,
    onSuccess: (result) => {
      toast.success(result.message || 'Tạo kỹ năng thành công');
      queryClient.invalidateQueries({ queryKey: skillsKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo kỹ năng: ${error.message}`);
    },
  });

  // Update skill mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSkillDto }) => skillsApi.update(id, data),
    onSuccess: (result) => {
      toast.success(result.message || 'Cập nhật kỹ năng thành công');
      queryClient.invalidateQueries({ queryKey: skillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: skillsKeys.detail(result.data.id) });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật kỹ năng: ${error.message}`);
    },
  });

  // Delete skill mutation
  const deleteMutation = useMutation({
    mutationFn: skillsApi.delete,
    onSuccess: (result) => {
      toast.success(result.message || 'Xóa kỹ năng thành công');
      queryClient.invalidateQueries({ queryKey: skillsKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa kỹ năng: ${error.message}`);
    },
  });

  // Fetch skills (legacy compatibility - now just refetches query)
  const fetchSkills = useCallback(
    async (params?: SkillQuery) => {
      if (params) {
        // If custom params provided, update filters
        setFilters((prev) => ({ ...prev, ...params }));
      } else {
        // Otherwise refetch current query
        await queryClient.invalidateQueries({ queryKey: skillsKeys.lists() });
      }
    },
    [queryClient]
  );

  // Get single skill
  const getSkill = useCallback(async (id: string): Promise<Skill | null> => {
    try {
      return await skillsApi.getById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Lỗi khi tải thông tin kỹ năng: ${message}`);
      return null;
    }
  }, []);

  // Create skill wrapper
  const createSkill = useCallback(
    async (data: CreateSkillDto): Promise<boolean> => {
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [createMutation]
  );

  // Update skill wrapper
  const updateSkill = useCallback(
    async (id: string, data: UpdateSkillDto): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  // Delete skill wrapper
  const deleteSkill = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SkillQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: skillsKeys.lists() });
  }, [queryClient]);

  return {
    skills: skillsQuery.data?.data || [],
    loading: skillsQuery.isLoading,
    error: skillsQuery.error?.message || null,
    totalPages: skillsQuery.data?.meta.totalPages || 0,
    totalItems: skillsQuery.data?.meta.total || 0,
    currentPage: filters.page || 1,
    pageSize: filters.limit || 10,
    filters,
    categoryStats: skillsQuery.data?.meta.categoryStats || {},
    fetchSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill,
    updateFilters,
    resetFilters,
    refreshData,
  };
};
