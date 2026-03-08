export type TimeRange = '7days' | '30days' | '90days' | 'year';

export interface ApplicationStatsParams {
  timeRange?: TimeRange;
  jobId?: string;
}

export interface StatusDistribution {
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  unrated: number;
}

export interface ExperienceDistribution {
  '0-2': number;
  '3-5': number;
  '6-10': number;
  '10+': number;
}

export interface ConversionFunnel {
  applied: number;
  reviewed: number;
  interviewed: number;
  hired: number;
  rejected: number;
}

export interface TopSkill {
  skill: string;
  count: number;
}

export interface ApplicationsByJob {
  jobId: string;
  jobTitle: string;
  count: number;
}

export interface ApplicationStatsSummary {
  totalApplications: number;
  averageTimeToHire: number;
  hireRate: number;
  timeRange: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ApplicationStatsData {
  summary: ApplicationStatsSummary;
  statusDistribution: Record<string, StatusDistribution>;
  ratingDistribution: RatingDistribution;
  experienceDistribution: ExperienceDistribution;
  conversionFunnel: ConversionFunnel;
  topSkills: TopSkill[];
  applicationsByJob: ApplicationsByJob[];
}
