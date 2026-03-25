import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';
import { JobRecommendationService } from '@/services/job-recommendation.service';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return errorResponse('Job ID is required', 400);
    }

    const jobs = await JobRecommendationService.getSimilarJobs(id, { limit: 5 });
    return successResponse({ jobs }, 'Similar jobs retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve similar jobs', error);
  }
}
