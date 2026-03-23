import { axiosInstance } from '@/lib/axios';
import { ApplicationStatus, type UserType, type WorkLocationType } from '@/generated/prisma';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CandidateApplicationsListParams {
  page?: number;
  limit?: number;
  statuses?: ApplicationStatus[];
  dateFrom?: string;
  dateTo?: string;
}

export interface CandidateApplicationsStatsParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface CandidateApplicationCompanySummary {
  id: string;
  companyName: string;
  logoUrl?: string | null;
}

export interface CandidateApplicationJobSummary {
  id: string;
  title: string;
  workLocationType?: WorkLocationType | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  currency?: string | null;
  salaryNegotiable?: boolean;
  locationCity?: string | null;
  locationProvince?: string | null;
  company: CandidateApplicationCompanySummary;
}

export interface CandidateApplicationListItem {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  statusUpdatedAt: string;
  interviewScheduledAt?: string | null;
  cvFileUrl?: string | null;
  job: CandidateApplicationJobSummary;
}

export interface CandidateApplicationsListData {
  applications: CandidateApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CandidateApplicationsStats {
  total: number;
  byStatus: Partial<Record<ApplicationStatus, number>>;
}

export interface CandidateApplicationTimelineItem {
  id: string;
  status: ApplicationStatus;
  note?: string | null;
  createdAt: string;
  changedBy: string;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    userType: UserType;
  };
}

export interface CandidateApplicationDetail {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  interviewScheduledAt?: string | null;
  cvFileUrl?: string | null;
  job: CandidateApplicationJobSummary;
  timeline: CandidateApplicationTimelineItem[];
}

export interface WithdrawApplicationResponse {
  applicationId: string;
  status: ApplicationStatus;
}

function buildQueryString(params: CandidateApplicationsListParams | CandidateApplicationsStatsParams) {
  const queryParams = new URLSearchParams();

  if ('page' in params && params.page) {
    queryParams.set('page', String(params.page));
  }

  if ('limit' in params && params.limit) {
    queryParams.set('limit', String(params.limit));
  }

  if ('statuses' in params && params.statuses) {
    params.statuses.forEach((status) => queryParams.append('status[]', status));
  }

  if (params.dateFrom) {
    queryParams.set('dateFrom', params.dateFrom);
  }

  if (params.dateTo) {
    queryParams.set('dateTo', params.dateTo);
  }

  const serializedParams = queryParams.toString();
  return serializedParams ? `?${serializedParams}` : '';
}

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;

  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }

  return response.data.data;
}

export const candidateApplicationsApi = {
  getApplications(params: CandidateApplicationsListParams = {}) {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateApplicationsListData>>(
        `/api/applications${buildQueryString(params)}`
      )
    );
  },

  getStats(params: CandidateApplicationsStatsParams = {}) {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateApplicationsStats>>(
        `/api/applications/stats${buildQueryString(params)}`
      )
    );
  },

  getApplicationDetail(applicationId: string) {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateApplicationDetail>>(`/api/applications/${applicationId}`)
    );
  },

  withdrawApplication(applicationId: string) {
    return unwrapResponse(
      axiosInstance.delete<ApiResponse<WithdrawApplicationResponse>>(`/api/applications/${applicationId}`)
    );
  },
};
