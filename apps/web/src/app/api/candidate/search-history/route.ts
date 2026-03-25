import { UserType } from '@/generated/prisma';
import { withRole, type AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { CandidateSearchHistoryService } from '@/services/candidate-search-history.service';
import { errorResponse, serverErrorResponse, successResponse } from '@/utils/api-response';

async function getCandidateId(userId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    select: { id: true },
  });

  return candidate?.id ?? null;
}

export const GET = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    const candidateId = await getCandidateId(req.user!.id);

    if (!candidateId) {
      return errorResponse('Candidate profile not found', 404);
    }

    const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? '5');
    const limit = Number.isFinite(limitParam) ? limitParam : 5;
    const searches = await CandidateSearchHistoryService.getRecentSearches(candidateId, limit);

    return successResponse({ searches }, 'Recent searches retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve recent searches', error);
  }
});

export const POST = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    const candidateId = await getCandidateId(req.user!.id);

    if (!candidateId) {
      return errorResponse('Candidate profile not found', 404);
    }

    const body = (await req.json()) as { keyword?: unknown };
    const keyword = typeof body.keyword === 'string' ? body.keyword : '';

    if (!keyword.trim()) {
      return errorResponse('Keyword is required', 400);
    }

    const result = await CandidateSearchHistoryService.recordSearch(candidateId, keyword);

    return successResponse(
      result,
      result.recorded ? 'Search tracked successfully' : 'Search ignored'
    );
  } catch (error) {
    return serverErrorResponse('Failed to track search keyword', error);
  }
});
