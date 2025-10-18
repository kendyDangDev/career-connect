import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyApi } from '@/api/company.api';
import { UpdateCompanyData } from '@/types/company.types';
import { handleApiError } from '@/lib/axios';

/**
 * Query keys for company-related queries
 */
export const companyKeys = {
  all: ['company'] as const,
  profile: () => [...companyKeys.all, 'profile'] as const,
};

/**
 * Hook to fetch company profile
 * @returns Query result with company profile and stats
 */
export const useCompanyProfile = () => {
  return useQuery({
    queryKey: companyKeys.profile(),
    queryFn: companyApi.getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to update company profile
 * @returns Mutation to update company profile
 */
export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanyData) => companyApi.updateProfile(data),
    onSuccess: (response) => {
      // Invalidate and refetch company profile
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() });
      
      toast.success(response.message || 'Cập nhật thông tin công ty thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật thất bại. Vui lòng thử lại!');
    },
  });
};

/**
 * Hook to upload company media (logo, cover, gallery)
 * @returns Mutation to upload media
 */
export const useUploadCompanyMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: 'logo' | 'cover' | 'gallery' }) =>
      companyApi.uploadMedia(file, type),
    onSuccess: (response, variables) => {
      // Invalidate company profile to refetch with new media
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() });
      
      const mediaType = variables.type === 'logo' ? 'Logo' : variables.type === 'cover' ? 'Ảnh bìa' : 'Ảnh';
      toast.success(`${mediaType} đã được tải lên thành công!`);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Tải ảnh thất bại. Vui lòng thử lại!');
    },
  });
};

/**
 * Hook to delete company media
 * @returns Mutation to delete media
 */
export const useDeleteCompanyMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, type }: { url: string; type: 'logo' | 'cover' | 'gallery' }) =>
      companyApi.deleteMedia(url, type),
    onSuccess: (_, variables) => {
      // Invalidate company profile to refetch without deleted media
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() });
      
      const mediaType = variables.type === 'logo' ? 'Logo' : variables.type === 'cover' ? 'Ảnh bìa' : 'Ảnh';
      toast.success(`${mediaType} đã được xóa thành công!`);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Xóa ảnh thất bại. Vui lòng thử lại!');
    },
  });
};

/**
 * Hook to prefetch company profile (useful for navigation)
 */
export const usePrefetchCompanyProfile = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: companyKeys.profile(),
      queryFn: companyApi.getProfile,
    });
  };
};
