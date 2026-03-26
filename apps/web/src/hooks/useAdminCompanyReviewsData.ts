'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCompanyReviewsApi, adminCompanyReviewsKeys } from '@/api/admin-company-reviews.api';
import type {
  AdminCompanyReviewListResponse,
  AdminCompanyReviewQuery,
  CompanyReviewModerationStatus,
} from '@/types/admin/company-review';

interface UseAdminCompanyReviewsDataOptions {
  page: number;
  limit: number;
  status: CompanyReviewModerationStatus;
  search?: string;
}

function buildOptimisticListState(
  current: AdminCompanyReviewListResponse | undefined,
  nextApproved: boolean,
  reviewId: string,
  status: CompanyReviewModerationStatus
): AdminCompanyReviewListResponse | undefined {
  if (!current?.data) {
    return current;
  }

  const reviews = current.data.reviews;
  const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

  if (reviewIndex === -1) {
    return current;
  }

  if (status === 'all') {
    return {
      ...current,
      data: {
        ...current.data,
        reviews: reviews.map((review) =>
          review.id === reviewId ? { ...review, isApproved: nextApproved } : review
        ),
      },
    };
  }

  const shouldRemove =
    (status === 'pending' && nextApproved) || (status === 'approved' && !nextApproved);

  if (!shouldRemove) {
    return current;
  }

  const nextReviews = reviews.filter((review) => review.id !== reviewId);
  const nextTotal = Math.max(current.data.pagination.total - 1, 0);

  return {
    ...current,
    data: {
      ...current.data,
      reviews: nextReviews,
      pagination: {
        ...current.data.pagination,
        total: nextTotal,
        totalPages: nextTotal === 0 ? 0 : Math.ceil(nextTotal / current.data.pagination.limit),
      },
    },
  };
}

export function useAdminCompanyReviewsData(options: UseAdminCompanyReviewsDataOptions) {
  const queryClient = useQueryClient();

  const queryParams: AdminCompanyReviewQuery = {
    page: options.page,
    limit: options.limit,
    status: options.status,
    ...(options.search ? { search: options.search } : {}),
  };

  const listQuery = useQuery({
    queryKey: adminCompanyReviewsKeys.list(queryParams),
    queryFn: () => adminCompanyReviewsApi.getList(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminCompanyReviewsApi.updateApprovalStatus(id, isApproved),
    onMutate: async ({ id, isApproved }) => {
      await queryClient.cancelQueries({ queryKey: adminCompanyReviewsKeys.lists() });

      const previousEntries = queryClient.getQueriesData<AdminCompanyReviewListResponse>({
        queryKey: adminCompanyReviewsKeys.lists(),
      });

      previousEntries.forEach(([queryKey, cachedState]) => {
        const queryParams = (queryKey as readonly unknown[])[2] as AdminCompanyReviewQuery | undefined;
        const status = queryParams?.status ?? 'pending';

        queryClient.setQueryData<AdminCompanyReviewListResponse | undefined>(
          queryKey,
          buildOptimisticListState(cachedState, isApproved, id, status)
        );
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries?.forEach(([queryKey, previousState]) => {
        queryClient.setQueryData(queryKey, previousState);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewsKeys.lists() });
    },
  });

  const data = listQuery.data?.data;

  const updateApprovalStatus = useCallback(
    async (id: string, isApproved: boolean) => {
      return approvalMutation.mutateAsync({ id, isApproved });
    },
    [approvalMutation]
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: adminCompanyReviewsKeys.lists() });
  }, [queryClient]);

  return {
    reviews: data?.reviews ?? [],
    pagination: data?.pagination ?? {
      page: options.page,
      limit: options.limit,
      total: 0,
      totalPages: 0,
    },
    activeStatus: data?.filters.status ?? options.status,
    loading: listQuery.isLoading,
    fetching: listQuery.isFetching,
    error: listQuery.error ? (listQuery.error as Error).message : null,
    updateApprovalStatus,
    refresh,
  };
}
