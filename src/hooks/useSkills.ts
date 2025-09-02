import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Skill,
  SkillQuery,
  CreateSkillDto,
  UpdateSkillDto,
  PaginatedResponse,
  ApiResponse
} from '@/types/system-categories';

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
  sortOrder: 'asc'
};

export const useSkills = (): UseSkillsReturn => {
  const searchParams = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  
  // Parse filters from URL search params
  const [filters, setFilters] = useState<SkillQuery>(() => {
    const params: SkillQuery = { ...defaultFilters };
    
    searchParams.forEach((value, key) => {
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

  // Fetch skills
  const fetchSkills = useCallback(async (params?: SkillQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      const finalParams = { ...filters, ...params };
      
      Object.entries(finalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/system-categories/skills?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch skills');
      }

      setSkills(data.data || []);
      if (data.meta) {
        setTotalPages(data.meta.totalPages);
        setTotalItems(data.meta.total);
        setCategoryStats(data.meta.categoryStats || {});
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(`Lỗi khi tải danh sách kỹ năng: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single skill
  const getSkill = useCallback(async (id: string): Promise<Skill | null> => {
    try {
      const response = await fetch(`/api/admin/system-categories/skills/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch skill');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Lỗi khi tải thông tin kỹ năng: ${message}`);
      return null;
    }
  }, []);

  // Create skill
  const createSkill = useCallback(async (data: CreateSkillDto): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/system-categories/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create skill');
      }

      toast.success(result.message || 'Tạo kỹ năng thành công');
      await fetchSkills();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Lỗi khi tạo kỹ năng: ${message}`);
      return false;
    }
  }, [fetchSkills]);

  // Update skill
  const updateSkill = useCallback(async (id: string, data: UpdateSkillDto): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update skill');
      }

      toast.success(result.message || 'Cập nhật kỹ năng thành công');
      await fetchSkills();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Lỗi khi cập nhật kỹ năng: ${message}`);
      return false;
    }
  }, [fetchSkills]);

  // Delete skill
  const deleteSkill = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/skills/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete skill');
      }

      toast.success(result.message || 'Xóa kỹ năng thành công');
      await fetchSkills();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Lỗi khi xóa kỹ năng: ${message}`);
      return false;
    }
  }, [fetchSkills]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SkillQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchSkills();
  }, [fetchSkills]);

  // Fetch skills on mount and when filters change
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage: filters.page || 1,
    pageSize: filters.limit || 10,
    filters,
    categoryStats,
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
