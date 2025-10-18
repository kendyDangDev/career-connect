'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  User,
  UserFormData,
  UsersResponse as ApiUsersResponse,
} from '@/app/admin/users/types';

export interface UsersData {
  users: User[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseUsersDataOptions {
  page?: number;
  limit?: number;
  search?: string;
  userType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useUsersData(options?: UseUsersDataOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use options if provided, otherwise get from URL
  const currentPage = options?.page || parseInt(searchParams?.get('page') || '1', 10);
  const pageSize = options?.limit || parseInt(searchParams?.get('limit') || '10', 10);
  const currentSearch = options?.search || searchParams?.get('search') || '';
  const currentUserType = options?.userType || searchParams?.get('userType') || '';
  const currentStatus = options?.status || searchParams?.get('status') || '';
  const currentSortBy = options?.sortBy || searchParams?.get('sortBy') || 'createdAt';
  const currentSortOrder = options?.sortOrder || searchParams?.get('sortOrder') || 'desc';

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(currentSearch && { search: currentSearch }),
        ...(currentUserType && { userType: currentUserType }),
        ...(currentStatus && { status: currentStatus }),
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const apiResponse: ApiUsersResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        setData({
          users: apiResponse.data,
          totalCount: apiResponse.pagination.totalCount,
          page: apiResponse.pagination.page,
          limit: apiResponse.pagination.limit,
          totalPages: apiResponse.pagination.totalPages,
          hasNextPage: apiResponse.pagination.hasNextPage,
          hasPreviousPage: apiResponse.pagination.hasPreviousPage,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    currentSearch,
    currentUserType,
    currentStatus,
    currentSortBy,
    currentSortOrder,
    pageSize,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      if (params.search !== undefined || params.role !== undefined) {
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

  const handleRoleFilter = useCallback(
    (role: string) => {
      updateParams({ role: role || null });
    },
    [updateParams]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      updateParams({ status: status || null });
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
  const createUser = useCallback(
    async (userData: UserFormData) => {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to create user');
        }

        const newUser = await response.json();
        await fetchUsers();
        return newUser;
      } catch (err) {
        throw err;
      }
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (id: string, userData: UserFormData) => {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        const updatedUser = await response.json();
        await fetchUsers();
        return updatedUser;
      } catch (err) {
        throw err;
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        await fetchUsers();
      } catch (err) {
        throw err;
      }
    },
    [fetchUsers]
  );

  const getUser = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }, []);

  const pagination = data ? {
    page: data.page,
    limit: data.limit,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    hasPreviousPage: data.hasPreviousPage,
  } : {
    page: currentPage,
    limit: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return {
    // Data
    users: data?.users || [],
    total: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
    loading,
    error,

    // Current state
    // currentPage,
    // currentSearch,
    // currentRole,
    // currentSortBy,
    // currentSortOrder,
    // pageSize,
    pagination,

    // Handlers
    handlePageChange,
    handleSearch,
    handleRoleFilter,
    handleStatusFilter,
    handleSort,

    // CRUD operations
    createUser,
    updateUser,
    deleteUser,
    getUser,

    // Refresh data
    refresh: fetchUsers,
  };
}
