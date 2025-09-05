'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  Company,
  CompanyFormData,
  CompaniesResponse as ApiCompaniesResponse,
} from '@/app/admin/companies/types';

export interface CompaniesData {
  companies: Company[];
  totalCount: number;
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

export function useCompaniesData(options?: UseCompaniesDataOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CompaniesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use options if provided, otherwise get from URL
  const currentPage = options?.page || parseInt(searchParams.get('page') || '1', 10);
  const pageSize = options?.limit || parseInt(searchParams.get('limit') || '10', 10);
  const currentSearch = options?.search || searchParams.get('search') || '';
  const currentStatus = options?.status || searchParams.get('status') || '';
  const currentCompanySize = options?.companySize || searchParams.get('companySize') || '';
  const currentIndustryId = options?.industryId || searchParams.get('industryId') || '';
  const currentSortBy = options?.sortBy || searchParams.get('sortBy') || 'createdAt';
  const currentSortOrder = options?.sortOrder || searchParams.get('sortOrder') || 'desc';

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(currentSearch && { search: currentSearch }),
        ...(currentStatus && { status: currentStatus }),
        ...(currentCompanySize && { companySize: currentCompanySize }),
        ...(currentIndustryId && { industryId: currentIndustryId }),
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      });

      const response = await fetch(`/api/admin/companies?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const apiResponse: ApiCompaniesResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        setData({
          companies: apiResponse.data.companies,
          totalCount: apiResponse.data.pagination.total,
          page: apiResponse.data.pagination.page,
          limit: apiResponse.data.pagination.limit,
          totalPages: apiResponse.data.pagination.totalPages,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentStatus, currentCompanySize, currentIndustryId, currentSortBy, currentSortOrder, pageSize]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Update URL params
  const updateParams = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      // Reset to page 1 if search/filter changes
      if (params.search !== undefined || params.status !== undefined || params.companySize !== undefined || params.industryId !== undefined) {
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
      updateParams({ status: status || null });
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

  // CRUD operations
  const createCompany = useCallback(
    async (companyData: CompanyFormData) => {
      try {
        const response = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyData),
        });

        if (!response.ok) {
          throw new Error('Failed to create company');
        }

        const newCompany = await response.json();
        await fetchCompanies();
        return newCompany;
      } catch (err) {
        throw err;
      }
    },
    [fetchCompanies]
  );

  const updateCompany = useCallback(
    async (id: string, companyData: CompanyFormData) => {
      try {
        const response = await fetch(`/api/admin/companies/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyData),
        });

        if (!response.ok) {
          throw new Error('Failed to update company');
        }

        const updatedCompany = await response.json();
        await fetchCompanies();
        return updatedCompany;
      } catch (err) {
        throw err;
      }
    },
    [fetchCompanies]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/admin/companies/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete company');
        }

        await fetchCompanies();
      } catch (err) {
        throw err;
      }
    },
    [fetchCompanies]
  );

  const getCompany = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }, []);

  const pagination = data && {
    page: data.page,
    limit: data.limit,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
  };

  return {
    // Data
    companies: data?.companies || [],
    total: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    loading,
    error,
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
    refresh: fetchCompanies,
  };
}
