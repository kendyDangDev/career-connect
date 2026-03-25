import { NextRequest } from 'next/server';
import { errorResponse, successResponse, serverErrorResponse } from '@/utils/api-response';
import { JobRecommendationService } from '@/services/job-recommendation.service';

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.RECOMMENDATION_CRON_SECRET;

    if (!configuredSecret) {
      return errorResponse('Recommendation cron secret is not configured', 500);
    }

    const receivedSecret = request.headers.get('x-cron-secret');
    if (receivedSecret !== configuredSecret) {
      return errorResponse('Unauthorized cron trigger', 401);
    }

    const refreshResult = await JobRecommendationService.refreshJobSimilarities();
    return successResponse(refreshResult, 'Job similarities calculated successfully');
  } catch (error) {
    return serverErrorResponse('Failed to calculate job similarities', error);
  }
}
