import { useQuery } from '@tanstack/react-query';
import { getApplicationDetail, adminApplicationKeys } from '@/api/admin/adminApplication.api';

export const useApplicationDetail = (applicationId: string) => {
  return useQuery({
    queryKey: adminApplicationKeys.detail(applicationId),
    queryFn: () => getApplicationDetail(applicationId),
    enabled: !!applicationId,
  });
};
