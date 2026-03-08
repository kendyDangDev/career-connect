import { useMutation } from '@tanstack/react-query';
import { jobsApi } from '@/api/jobs.api';

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string | null;
  jobType?: string;
  workLocationType?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  salaryNegotiable?: boolean;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  applicationDeadline?: string | null;
  status?: string;
  featured?: boolean;
  urgent?: boolean;
}

export const useUpdateJob = () => {
  const mutation = useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: UpdateJobData }) =>
      jobsApi.updateJob(jobId, data),
  });

  const updateJob = async (jobId: string, data: UpdateJobData) => {
    try {
      const result = await mutation.mutateAsync({ jobId, data });
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật việc làm';
      throw new Error(errorMessage);
    }
  };

  return {
    updateJob,
    loading: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
