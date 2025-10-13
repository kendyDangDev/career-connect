import { useQuery } from '@tanstack/react-query';

export const useApplicationDetail = (applicationId: string) => {
  return useQuery({
    queryKey: ['application-detail', applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/applications/${applicationId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch application detail: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch application detail');
      }

      return result.data;
    },
    enabled: !!applicationId,
  });
};
