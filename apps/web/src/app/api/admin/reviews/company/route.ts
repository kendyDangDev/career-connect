import { withAdmin, type AuthenticatedRequest, successResponse, serverErrorResponse } from '@/lib/middleware';
import { validationErrorResponse } from '@/utils/api-response';
import { adminCompanyReviewQuerySchema } from '@/lib/validations/admin-company-review.validation';
import { AdminCompanyReviewService } from '@/services/admin/company-review.service';

export const GET = withAdmin(async (request: AuthenticatedRequest) => {
  try {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const validated = adminCompanyReviewQuerySchema.safeParse(queryParams);

    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    const result = await AdminCompanyReviewService.getCompanyReviews(validated.data);

    return successResponse(result, 'Company reviews retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve company reviews', error);
  }
});
