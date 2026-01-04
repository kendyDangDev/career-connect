/**
 * Admin Dashboard & Analytics Types
 * Định nghĩa types cho Admin Dashboard API responses
 */

export interface AdminDashboardOverview {
  // System-wide statistics
  systemStats: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    activeUsers: number;
    verifiedCompanies: number;
    activeJobs: number;
    trends: {
      users: TrendValue;
      companies: TrendValue;
      jobs: TrendValue;
      applications: TrendValue;
    };
  };

  // Recruitment metrics
  recruitmentMetrics: {
    totalApplications: number;
    totalHired: number;
    hireRate: number;
    averageTimeToHire: number; // in days
    conversionRate: number; // views to applications
    totalJobViews: number;
  };

  // User breakdown by type
  userBreakdown: {
    candidates: number;
    employers: number;
    admins: number;
  };

  // Job status breakdown
  jobStatusBreakdown: {
    active: number;
    pending: number;
    closed: number;
    expired: number;
    draft: number;
  };

  // Application pipeline
  applicationPipeline: {
    applied: number;
    screening: number;
    interviewing: number;
    offered: number;
    hired: number;
    rejected: number;
  };

  // Top performers
  topPerformers: {
    companies: TopCompany[];
    jobs: TopJob[];
    categories: TopCategory[];
    locations: TopLocation[];
  };
}

export interface AdminDashboardAnalytics {
  timeRange: TimeRange;
  dateRange: {
    from: string;
    to: string;
  };

  // Time series data
  timeSeries: {
    daily: DailyMetrics[];
    weekly?: WeeklyMetrics[];
    monthly?: MonthlyMetrics[];
  };

  // Conversion funnel
  conversionFunnel: {
    jobViews: number;
    applications: number;
    screening: number;
    interviewing: number;
    offered: number;
    hired: number;
    rejected: number;
  };

  // Growth metrics
  growthMetrics: {
    userGrowth: GrowthData;
    companyGrowth: GrowthData;
    jobGrowth: GrowthData;
    applicationGrowth: GrowthData;
  };

  // Top skills
  topSkills: SkillStats[];

  // Industry distribution
  industryDistribution: IndustryStats[];

  // Location distribution
  locationDistribution: LocationStats[];

  // Salary insights
  salaryInsights: {
    averageSalary: number;
    medianSalary: number;
    salaryRanges: SalaryRange[];
  };

  // Performance metrics
  performanceMetrics: {
    averageApplicationsPerJob: number;
    averageViewsPerJob: number;
    averageTimeToFirstApplication: number; // hours
    averageResponseTime: number; // hours
    jobFillRate: number; // percentage
  };
}

export interface AdminDashboardActivities {
  recentActivities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    type?: ActivityType[];
    dateFrom?: string;
    dateTo?: string;
  };
}

// Supporting types
export interface TrendValue {
  value: string; // e.g., "+15%", "-5%"
  isPositive: boolean;
  count?: number;
}

export interface TopCompany {
  id: string;
  name: string;
  logoUrl?: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  hireRate: number;
  verificationStatus: string;
}

export interface TopJob {
  id: string;
  title: string;
  companyName: string;
  companyId: string;
  applications: number;
  views: number;
  conversionRate: number;
  status: string;
  createdAt: string;
}

export interface TopCategory {
  id: string;
  name: string;
  jobCount: number;
  applicationCount: number;
  averageSalary?: number;
}

export interface TopLocation {
  city: string;
  province: string;
  jobCount: number;
  companyCount: number;
  applicationCount: number;
}

export interface DailyMetrics {
  date: string; // ISO date
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  jobViews: number;
}

export interface WeeklyMetrics {
  week: string; // Week of year
  startDate: string;
  endDate: string;
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  jobViews: number;
}

export interface MonthlyMetrics {
  month: string; // e.g., "Jan 2024"
  year: number;
  monthNumber: number;
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  jobViews: number;
  hired: number;
}

export interface GrowthData {
  current: number;
  previous: number;
  growthRate: number; // percentage
  growthCount: number;
  isPositive: boolean;
}

export interface SkillStats {
  skillId: string;
  skillName: string;
  count: number;
  percentage: number;
  averageSalary?: number;
  category: string;
}

export interface IndustryStats {
  industryId: string;
  industryName: string;
  companyCount: number;
  jobCount: number;
  applicationCount: number;
  percentage: number;
}

export interface LocationStats {
  city: string;
  province: string;
  country: string;
  jobCount: number;
  companyCount: number;
  userCount: number;
  percentage: number;
}

export interface SalaryRange {
  range: string; // e.g., "10-20M", "20-30M"
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  userType?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export type ActivityType =
  | 'USER_REGISTRATION'
  | 'USER_LOGIN'
  | 'USER_UPDATE'
  | 'COMPANY_REGISTRATION'
  | 'COMPANY_VERIFICATION'
  | 'COMPANY_UPDATE'
  | 'JOB_CREATION'
  | 'JOB_UPDATE'
  | 'JOB_STATUS_CHANGE'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGE'
  | 'ADMIN_ACTION'
  | 'SYSTEM_EVENT';

export type TimeRange = '7days' | '30days' | '90days' | '6months' | 'year' | 'all' | 'custom';

// Query parameters
export interface OverviewQueryParams {
  includeTopPerformers?: boolean;
  topLimit?: number;
}

export interface AnalyticsQueryParams {
  timeRange: TimeRange;
  dateFrom?: string; // for custom range
  dateTo?: string; // for custom range
  includeTimeSeries?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export interface ActivitiesQueryParams {
  page?: number;
  limit?: number;
  type?: ActivityType | ActivityType[];
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

// API Response types
export interface DashboardOverviewResponse {
  success: boolean;
  data: AdminDashboardOverview;
  timestamp: string;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  data: AdminDashboardAnalytics;
  timestamp: string;
}

export interface DashboardActivitiesResponse {
  success: boolean;
  data: AdminDashboardActivities;
  timestamp: string;
}
