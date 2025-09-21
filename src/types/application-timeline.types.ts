import { ApplicationStatus } from '@/generated/prisma';

// Base ApplicationTimeline interface matching Prisma schema
export interface ApplicationTimeline {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  note: string | null;
  changedBy: string;
  createdAt: Date;
  application?: ApplicationWithDetails;
  user?: UserBasic;
}

// Extended ApplicationTimeline with relations
export interface ApplicationTimelineWithRelations extends ApplicationTimeline {
  application: ApplicationWithDetails;
  user: UserBasic;
}

// Basic user info for timeline entries
export interface UserBasic {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: string;
}

// Application details for timeline context
export interface ApplicationWithDetails {
  id: string;
  jobId: string;
  candidateId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  job?: {
    id: string;
    title: string;
    slug: string;
    company: {
      id: string;
      companyName: string;
      companySlug: string;
    };
  };
  candidate?: {
    id: string;
    user: UserBasic;
  };
}

// DTO for creating a new timeline entry
export interface CreateApplicationTimelineDTO {
  applicationId: string;
  status: ApplicationStatus;
  note?: string;
}

// DTO for updating a timeline entry (limited fields)
export interface UpdateApplicationTimelineDTO {
  note?: string;
}

// Query parameters for filtering timeline entries
export interface ApplicationTimelineQueryParams {
  applicationId?: string;
  status?: ApplicationStatus | ApplicationStatus[];
  changedBy?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Response format for timeline listing
export interface ApplicationTimelineListResponse {
  data: ApplicationTimelineWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Statistics for application timeline
export interface ApplicationTimelineStats {
  applicationId: string;
  totalStatusChanges: number;
  currentStatus: ApplicationStatus;
  statusCounts: Record<ApplicationStatus, number>;
  averageTimeInStatus: Record<ApplicationStatus, number>; // in hours
  lastUpdateDate: Date;
  timelineProgress: TimelineProgress[];
}

// Progress tracking for timeline
export interface TimelineProgress {
  status: ApplicationStatus;
  enteredAt: Date;
  exitedAt?: Date;
  durationHours?: number;
  note?: string;
  changedBy: UserBasic;
}

// Bulk operations DTOs
export interface BulkCreateTimelineDTO {
  entries: CreateApplicationTimelineDTO[];
}

export interface BulkUpdateStatusDTO {
  applicationIds: string[];
  status: ApplicationStatus;
  note?: string;
}

// Error types specific to ApplicationTimeline
export enum ApplicationTimelineErrorCode {
  TIMELINE_NOT_FOUND = 'TIMELINE_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DUPLICATE_STATUS = 'DUPLICATE_STATUS',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
}

// Status transition rules
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['INTERVIEWING', 'REJECTED', 'WITHDRAWN'],
  INTERVIEWING: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

// Helper type for status validation
export function isValidStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): boolean {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

// Export timeline notification types
export interface TimelineNotification {
  type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'TIMELINE_UPDATED';
  applicationId: string;
  timelineId: string;
  oldStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  recipientUserId: string;
  message: string;
}
