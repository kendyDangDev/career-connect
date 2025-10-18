// JobView Types
export interface JobView {
  id: string;
  jobId: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  viewedAt: Date;
  job?: {
    id: string;
    title: string;
    slug: string;
    company: {
      id: string;
      companyName: string;
      logoUrl: string | null;
    };
    locationCity: string | null;
    locationProvince: string | null;
    jobType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    status: string;
  };
}

export interface JobViewInput {
  jobId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface JobViewsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'viewedAt' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface JobViewsResponse {
  data: JobView[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobViewStats {
  totalViews: number;
  uniqueJobs: number;
  viewsByDate: {
    date: string;
    count: number;
  }[];
  topViewedJobs: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    viewCount: number;
  }[];
  recentViews: JobView[];
}

export interface JobViewError {
  error: string;
  message: string;
  statusCode: number;
}
