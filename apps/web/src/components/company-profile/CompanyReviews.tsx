import { CheckCircle2, Star, XCircle } from 'lucide-react';

export interface CompanyReviewItem {
  id: string;
  title: string;
  rating: number;
  reviewText: string;
  pros?: string | null;
  cons?: string | null;
  positionTitle?: string | null;
  employmentStatus?: 'CURRENT' | 'FORMER' | string;
  employmentLength?: string | null;
  createdAt?: string;
  workLifeBalanceRating?: number | null;
  salaryBenefitRating?: number | null;
  managementRating?: number | null;
  cultureRating?: number | null;
}

export interface CompanyReviewStats {
  averageRating: number;
  recommendationRate: number;
}

interface CompanyReviewsProps {
  reviews: CompanyReviewItem[];
  totalReviews: number;
  stats?: CompanyReviewStats | null;
  isLoading?: boolean;
}

function formatEmploymentStatus(status?: string): string {
  if (status === 'CURRENT') return 'Current Employee';
  if (status === 'FORMER') return 'Former Employee';
  return 'Employee';
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5 ">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          className={`h-4 w-4 ${
            idx < rating ? 'fill-violet-500 text-violet-500' : 'text-violet-200'
          }`}
        />
      ))}
    </div>
  );
}

function renderScoreDots(score?: number | null) {
  const active = Math.max(0, Math.min(5, Math.round(score ?? 0)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span
          key={idx}
          className={`h-2 w-2 rounded-full ${idx < active ? 'bg-violet-500' : 'bg-violet-200'}`}
        />
      ))}
    </div>
  );
}

export function CompanyReviews({ reviews, totalReviews, stats, isLoading = false }: CompanyReviewsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-violet-600" />
          <h2 className="text-xl font-bold text-gray-900">Employee Reviews</h2>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-3">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-2xl font-bold leading-none text-center text-violet-600">
                {stats?.averageRating?.toFixed(1) ?? '0.0'}
              </p>
              <div className="mt-1">{renderStars(Math.round(stats?.averageRating ?? 0))}</div>
            </div>
            <div className="h-12 w-px bg-violet-200" />
            <p className=" font-semibold text-gray-600">
              {stats?.recommendationRate ?? 0}% Recommend to a Friend
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="h-5 w-3/5 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <p className="text-sm text-gray-500">No employee reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <h3 className="text-xl font-bold text-gray-900">{review.title}</h3>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    {review.positionTitle || 'Employee'} · {formatEmploymentStatus(review.employmentStatus)}
                    {review.employmentLength ? ` · ${review.employmentLength}` : ''}
                  </p>
                </div>

                <span className="text-xs text-gray-400">{formatRelativeTime(review.createdAt)}</span>
              </div>

              <p className="mt-4 text-lg leading-7 text-gray-600">{review.reviewText}</p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    PROS
                  </p>
                  <p className=" leading-7 text-gray-600">{review.pros || 'No pros shared.'}</p>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-rose-600">
                    <XCircle className="h-4 w-4" />
                    CONS
                  </p>
                  <p className=" leading-7 text-gray-600">{review.cons || 'No cons shared.'}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-wide text-gray-400 uppercase">Work-life</span>
                    {renderScoreDots(review.workLifeBalanceRating)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                      Compensation
                    </span>
                    {renderScoreDots(review.salaryBenefitRating)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-wide text-gray-400 uppercase">Management</span>
                    {renderScoreDots(review.managementRating)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          View All {totalReviews} Reviews
        </button>
      </div>
    </div>
  );
}
