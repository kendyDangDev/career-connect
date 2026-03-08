import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SystemCategoryQuery } from '@/types/system-categories';
import { industriesApi, industriesKeys } from '@/api/industries.api';

// Custom hooks
export const useIndustries = (params: SystemCategoryQuery) => {
  return useQuery({
    queryKey: industriesKeys.list(params),
    queryFn: () => industriesApi.getList(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useIndustry = (id: string | null) => {
  return useQuery({
    queryKey: industriesKeys.detail(id!),
    queryFn: () => industriesApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: industriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industriesKeys.lists() });
      toast.success('Tạo ngành nghề mới thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo ngành nghề');
    },
  });
};

export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof industriesApi.update>[1] }) =>
      industriesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: industriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: industriesKeys.detail(variables.id) });
      toast.success('Cập nhật ngành nghề thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật ngành nghề');
    },
  });
};

export const useDeleteIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: industriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industriesKeys.lists() });
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
    queryKey: industriesKeys.analytics(),
    queryFn: async () => {
      // Fetch all industries for analytics
      const response = await industriesApi.getList({ limit: 100, page: 1 });

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
