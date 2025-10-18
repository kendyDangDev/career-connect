import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = async (jobId: string, data: UpdateJobData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && result.details.fieldErrors) {
          const fieldErrors = Object.entries(result.details.fieldErrors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('; ');
          throw new Error(`Lỗi validation: ${fieldErrors}`);
        }
        throw new Error(result.error || 'Cập nhật việc làm thất bại');
      }

      if (!result.success) {
        throw new Error(result.error || 'Cập nhật việc làm thất bại');
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật việc làm';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateJob,
    loading,
    error,
  };
};
