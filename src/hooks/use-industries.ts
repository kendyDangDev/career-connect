import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Industry,
  CreateIndustryDto,
  UpdateIndustryDto,
  SystemCategoryQuery,
  PaginatedResponse,
} from '@/types/system-categories';

const API_BASE = '/api/admin/system-categories/industries';

// API functions
const fetchIndustries = async (
  params: SystemCategoryQuery
): Promise<PaginatedResponse<Industry>> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch industries');
  }

  return response.json();
};

const fetchIndustryById = async (id: string): Promise<Industry> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch industry');
  }

  const data = await response.json();
  return data.data;
};

const createIndustry = async (data: CreateIndustryDto): Promise<Industry> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create industry');
  }

  const result = await response.json();
  return result.data;
};

const updateIndustry = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateIndustryDto;
}): Promise<Industry> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update industry');
  }

  const result = await response.json();
  return result.data;
};

const deleteIndustry = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete industry');
  }
};

// Custom hooks
export const useIndustries = (params: SystemCategoryQuery) => {
  return useQuery({
    queryKey: ['industries', params],
    queryFn: () => fetchIndustries(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useIndustry = (id: string | null) => {
  return useQuery({
    queryKey: ['industry', id],
    queryFn: () => fetchIndustryById(id!),
    enabled: !!id,
  });
};

export const useCreateIndustry = () => {
  const queryClient = useQueryClient();
  // use sonner toast consistent with other hooks

  return useMutation({
    mutationFn: createIndustry,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      toast.success('Tạo ngành nghề mới thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo ngành nghề');
    },
  });
};

export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();
  // use sonner toast consistent with other hooks

  return useMutation({
    mutationFn: updateIndustry,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['industry', variables.id] });
      toast.success('Cập nhật ngành nghề thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật ngành nghề');
    },
  });
};

export const useDeleteIndustry = () => {
  const queryClient = useQueryClient();
  // use sonner toast consistent with other hooks

  return useMutation({
    mutationFn: deleteIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      toast.success('Xóa ngành nghề thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa ngành nghề');
    },
  });
};

// Analytics hook
export const useIndustriesAnalytics = () => {
  return useQuery({
    queryKey: ['industries-analytics'],
    queryFn: async () => {
      // Fetch all industries for analytics
      const response = await fetchIndustries({ limit: 100, page: 1 });

      // Calculate analytics
      const totalIndustries = response.meta.total;
      const activeIndustries = response.data.filter((i) => i.isActive).length;
      const companiesPerIndustry = response.data
        .map((industry) => ({
          name: industry.name,
          companies: industry._count?.companies || 0,
        }))
        .sort((a, b) => b.companies - a.companies);

      const topIndustries = companiesPerIndustry.slice(0, 10);
      const industriesWithoutCompanies = response.data.filter(
        (i) => (i._count?.companies || 0) === 0
      ).length;

      return {
        totalIndustries,
        activeIndustries,
        inactiveIndustries: totalIndustries - activeIndustries,
        topIndustries,
        industriesWithoutCompanies,
        companiesPerIndustry,
      };
    },
  });
};

// Table filtering hook
export const useIndustriesTableState = () => {
  const [filters, setFilters] = useState<SystemCategoryQuery>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const updateFilter = useCallback((key: keyof SystemCategoryQuery, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
};
