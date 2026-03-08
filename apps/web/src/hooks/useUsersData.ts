'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  UserFormData,
  UsersResponse as ApiUsersResponse,
  UsersQuery,
} from '@/app/admin/users/types';
import { usersApi, usersKeys } from '@/api/users.api';

export interface UsersData {
  users: User[];
  total: number;
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
  const queryClient = useQueryClient();

  // Use options if provided, otherwise get from URL
  const currentPage = options?.page || parseInt(searchParams?.get('page') || '1', 10);
  const pageSize = options?.limit || parseInt(searchParams?.get('limit') || '10', 10);
  const currentSearch = options?.search || searchParams?.get('search') || '';
  const currentUserType = options?.userType || searchParams?.get('userType') || '';
  const currentStatus = options?.status || searchParams?.get('status') || '';
  const currentSortBy = options?.sortBy || searchParams?.get('sortBy') || 'createdAt';
  const currentSortOrder = options?.sortOrder || searchParams?.get('sortOrder') || 'desc';

  const queryParams: UsersQuery = {
    page: currentPage,
    limit: pageSize,
    search: currentSearch || undefined,
    userType: currentUserType || undefined,
    status: currentStatus || undefined,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder as 'asc' | 'desc',
  };

  // Query for users list
  const usersQuery = useQuery({
    queryKey: usersKeys.list(queryParams),
    queryFn: () => usersApi.getList(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

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
        const result = await createMutation.mutateAsync(userData);
        return result;
      } catch (err) {
        throw err;
      }
    },
    [createMutation]
  );

  const updateUser = useCallback(
    async (id: string, userData: UserFormData) => {
      try {
        const result = await updateMutation.mutateAsync({ id, data: userData });
        return result;
      } catch (err) {
        throw err;
      }
    },
    [updateMutation]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        throw err;
      }
    },
    [deleteMutation]
  );

  const getUser = useCallback(async (id: string) => {
    try {
      return await usersApi.getById(id);
    } catch (err) {
      throw err;
    }
  }, []);

  // Fetch users (legacy compatibility - now just refetches query)
  const fetchUsers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
  }, [queryClient]);

  const data = usersQuery.data;
  const pagination = data
    ? {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNextPage,
        hasPreviousPage: data.pagination.hasPreviousPage,
      }
    : {
        page: currentPage,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

  return {
    // Data
    users: data?.data || [],
    total: data?.pagination.total || 0,
    totalPages: data?.pagination.totalPages || 0,
    hasNextPage: data?.pagination.hasNextPage || false,
    hasPreviousPage: data?.pagination.hasPreviousPage || false,
    loading: usersQuery.isLoading,
    error: usersQuery.error?.message || null,

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
