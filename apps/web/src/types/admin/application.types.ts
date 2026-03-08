import { ApplicationStatus } from '@/generated/prisma';

// Application types for admin
export interface ApplicationDetail {
  id: string;
  // Add other properties based on your API response
  [key: string]: any;
}

export interface UpdateApplicationStatusParams {
  applicationId: string;
  status: ApplicationStatus;
  reason?: string;
  notes?: string;
}
