import axiosInstance from '@/lib/axios';

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

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const jobsKeys = {
  all: ['jobs'] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  updateJob: async (jobId: string, data: UpdateJobData) => {
    const { data: response } = await axiosInstance.put(`/api/admin/jobs/${jobId}`, data);
    return response;
  },
};
