'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { companyAdminApi } from '@/api/company-admin.api';
import type {
  Company,
  CompanyFormData,
  CompaniesResponse,
  CompaniesQuery,
} from '@/types/company-admin.types';
import { handleApiError } from '@/lib/axios';

export interface CompaniesData {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseCompaniesDataOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  companySize?: string;
  industryId?: string;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Query keys for company admin-related queries
 */
export const companyAdminKeys = {
  all: ['companyAdmin'] as const,
  lists: () => [...companyAdminKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...companyAdminKeys.lists(), params] as const,
  details: () => [...companyAdminKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyAdminKeys.details(), id] as const,
};

export function useCompaniesData(options?: UseCompaniesDataOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Use options if provided, otherwise get from URL
  const currentPage = options?.page || parseInt(searchParams?.get('page') || '1', 10);
  const pageSize = options?.limit || parseInt(searchParams?.get('limit') || '10', 10);
  const currentSearch = options?.search || searchParams?.get('search') || '';
  const currentStatus = options?.status || searchParams?.get('status') || '';
  const currentCompanySize = options?.companySize || searchParams?.get('companySize') || '';
  const currentIndustryId = options?.industryId || searchParams?.get('industryId') || '';
  const currentSortBy = options?.sortBy || searchParams?.get('sortBy') || 'createdAt';
  const currentSortOrder = options?.sortOrder || searchParams?.get('sortOrder') || 'desc';

  // Build query params object
  const queryParams: CompaniesQuery = {
    page: currentPage,
    limit: pageSize,
    ...(currentSearch && { search: currentSearch }),
    ...(currentStatus && { status: currentStatus }),
    ...(currentCompanySize && { companySize: currentCompanySize }),
    ...(currentIndustryId && { industryId: currentIndustryId }),
    sortBy: currentSortBy,
    sortOrder: currentSortOrder as 'asc' | 'desc',
  };

  // Fetch companies data with React Query
  const {
    data: apiResponse,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: companyAdminKeys.list(queryParams),
    queryFn: () => companyAdminApi.getCompanies(queryParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Transform API response to hook data format
  const data: CompaniesData | null =
    apiResponse?.success && apiResponse.data
      ? {
          companies: apiResponse.data.companies,
          total: apiResponse.data.pagination.total,
          page: apiResponse.data.pagination.page,
          limit: apiResponse.data.pagination.limit,
          totalPages: apiResponse.data.pagination.totalPages,
        }
      : null;

  // Update URL params
  const updateParams = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      // Reset to page 1 if search/filter changes
      if (
        params.search !== undefined ||
        params.status !== undefined ||
        params.companySize !== undefined ||
        params.industryId !== undefined
      ) {
        newSearchParams.set('page', '1');
      }

      router.push(`?${newSearchParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handlers
  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams]
  );

  const handleSearch = useCallback(
    (search: string) => {
      updateParams({ search: search || null });
    },
    [updateParams]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      updateParams({ status: status === 'all' ? null : status || null });
    },
    [updateParams]
  );

  const handleCompanySizeFilter = useCallback(
    (companySize: string) => {
      updateParams({ companySize: companySize || null });
    },
    [updateParams]
  );

  const handleIndustryFilter = useCallback(
    (industryId: string) => {
      updateParams({ industryId: industryId || null });
    },
    [updateParams]
  );

  const handleSort = useCallback(
    (sortBy: string) => {
      const newSortOrder = currentSortBy === sortBy && currentSortOrder === 'asc' ? 'desc' : 'asc';

      updateParams({
        sortBy,
        sortOrder: newSortOrder,
      });
    },
    [currentSortBy, currentSortOrder, updateParams]
  );

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (companyData: CompanyFormData) => companyAdminApi.createCompany(companyData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: companyAdminKeys.lists() });
      toast.success(response.data ? 'Tạo công ty thành công!' : 'Tạo công ty thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Tạo công ty thất bại!');
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyFormData }) =>
      companyAdminApi.updateCompany(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyAdminKeys.detail(id) });
      toast.success(
        response.data ? 'Cập nhật công ty thành công!' : 'Cập nhật công ty thành công!'
      );
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật công ty thất bại!');
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => companyAdminApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyAdminKeys.lists() });
      toast.success('Xóa công ty thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Xóa công ty thất bại!');
    },
  });

  // Get single company query (for detail view)
  const getCompanyQuery = useMutation({
    mutationFn: (id: string) => companyAdminApi.getCompany(id),
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Lấy thông tin công ty thất bại!');
    },
  });

  // CRUD operations
  const createCompany = useCallback(
    async (companyData: CompanyFormData) => {
      const result = await createCompanyMutation.mutateAsync(companyData);
      return result.data;
    },
    [createCompanyMutation]
  );

  const updateCompany = useCallback(
    async (id: string, companyData: CompanyFormData) => {
      const result = await updateCompanyMutation.mutateAsync({ id, data: companyData });
      return result.data;
    },
    [updateCompanyMutation]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      await deleteCompanyMutation.mutateAsync(id);
    },
    [deleteCompanyMutation]
  );

  const getCompany = useCallback(
    async (id: string) => {
      const result = await getCompanyQuery.mutateAsync(id);
      return result.data;
    },
    [getCompanyQuery]
  );

  // Refresh data
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: companyAdminKeys.lists() });
  }, [queryClient]);

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      }
    : null;

  return {
    // Data
    companies: data?.companies || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    loading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    pagination,

    // Handlers
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    handleCompanySizeFilter,
    handleIndustryFilter,
    handleSort,

    // CRUD operations
    createCompany,
    updateCompany,
    deleteCompany,
    getCompany,

    // Refresh data
    refresh,
  };
}
