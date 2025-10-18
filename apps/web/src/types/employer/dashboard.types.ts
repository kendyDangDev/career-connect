import { JobStatus, ApplicationStatus } from '@/generated/prisma';

// Dashboard Summary Stats
export interface DashboardSummary {
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  hireRate: number;
  newApplicationsThisWeek: number;
  expiringJobsCount: number;
  interviewsToday: number;
  pendingReviews: number;
  trends: {
    jobs: {
      value: string;
      isPositive: boolean;
    };
    applications: {
      value: string;
      isPositive: boolean;
    };
    views: {
      value: string;
      isPositive: boolean;
    };
    hireRate: {
      value: string;
      isPositive: boolean;
    };
  };
}

// Pipeline Stats
export interface PipelineStats {
  applied: number;
  screening: number;
  interviewing: number;
  hired: number;
  total: number;
}

// Recent Job for Dashboard
export interface DashboardJob {
  id: string;
  title: string;
  status: JobStatus;
  applications: number;
  views: number;
  daysLeft: number | null;
  createdAt: string;
  applicationDeadline: string | null;
}

// Applications Chart Data
export interface ApplicationsChartData {
  month: string;
  applications: number;
  interviews: number;
}

export interface ApplicationsChartSummary {
  totalApplications: number;
  totalInterviews: number;
  conversionRate: number;
  trend: {
    value: string;
    isPositive: boolean;
  };
  monthlyData: ApplicationsChartData[];
}

// Recent Activity
export type ActivityType = 'application' | 'interview' | 'rating' | 'status_change' | 'job_posted';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  createdAt: string;
  avatar?: string;
  jobTitle?: string;
  applicantName?: string;
  metadata?: {
    applicationId?: string;
    jobId?: string;
    rating?: number;
    oldStatus?: ApplicationStatus;
    newStatus?: ApplicationStatus;
  };
}

// Upcoming Interview
export interface UpcomingInterview {
  id: string;
  candidateName: string;
  position: string;
  jobId: string;
  applicationId: string;
  scheduledAt: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  candidateAvatar?: string;
}

// Dashboard Notifications
export interface DashboardNotification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  icon: string;
  count?: number;
}

// Complete Dashboard Data
export interface DashboardData {
  summary: DashboardSummary;
  pipeline: PipelineStats;
  recentJobs: DashboardJob[];
  applicationsChart: ApplicationsChartSummary;
  recentActivity: RecentActivity[];
  upcomingInterviews: UpcomingInterview[];
  notifications: DashboardNotification[];
}

// API Response Types
export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    summary: DashboardSummary;
    pipeline: PipelineStats;
  };
}

export interface RecentJobsResponse {
  success: boolean;
  data: DashboardJob[];
}

export interface ApplicationsChartResponse {
  success: boolean;
  data: ApplicationsChartSummary;
}

export interface RecentActivityResponse {
  success: boolean;
  data: RecentActivity[];
}

export interface UpcomingInterviewsResponse {
  success: boolean;
  data: UpcomingInterview[];
}
