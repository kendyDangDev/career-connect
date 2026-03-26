import axiosInstance from '@/lib/axios';
import type {
  AdminCompanyReviewApprovalResponse,
  AdminCompanyReviewListResponse,
  AdminCompanyReviewQuery,
} from '@/types/admin/company-review';

export const adminCompanyReviewsKeys = {
  all: ['adminCompanyReviews'] as const,
  lists: () => [...adminCompanyReviewsKeys.all, 'list'] as const,
  list: (params: AdminCompanyReviewQuery) => [...adminCompanyReviewsKeys.lists(), params] as const,
};

export const adminCompanyReviewsApi = {
  getList: async (params: AdminCompanyReviewQuery): Promise<AdminCompanyReviewListResponse> => {
    const { data } = await axiosInstance.get<AdminCompanyReviewListResponse>(
      '/api/admin/reviews/company',
      { params }
    );
    return data;
  },

  updateApprovalStatus: async (
    id: string,
    isApproved: boolean
  ): Promise<AdminCompanyReviewApprovalResponse['data']['review']> => {
    const { data } = await axiosInstance.patch<AdminCompanyReviewApprovalResponse>(
      `/api/reviews/company/${id}/approve`,
      { isApproved }
    );
    return data.data.review;
  },
};
