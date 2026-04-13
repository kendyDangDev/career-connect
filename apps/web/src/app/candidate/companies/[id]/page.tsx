'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  CompanyHero,
  CompanyTabs,
  CompanyAbout,
  CompanyKeyBenefits,
  CompanyActiveOpenings,
  CompanyReviews,
  CompanySidebar,
  type CompanyTabKey,
  type JobListing,
  type CompanyReviewItem,
  type CompanyReviewStats,
} from '@/components/company-profile';
import { CompanyReviewDialog } from '@/components/company-profile/CompanyReviewDialog';
import type { CreateCompanyReviewInput } from '@/lib/validations/company-review.validation';

const DEFAULT_REVIEWS_LIMIT = 3;
const EXPANDED_REVIEWS_LIMIT = 10;
const REVIEWS_SECTION_ID = 'company-section-reviews';

const COMPANY_SIZE_LABELS: Record<string, string> = {
  STARTUP_1_10: '1 - 10',
  SMALL_11_50: '11 - 50',
  MEDIUM_51_200: '51 - 200',
  LARGE_201_500: '200+',
  ENTERPRISE_500_PLUS: '500+',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

function formatJobSalary(job: RawJob): string | undefined {
  if (job.salaryNegotiable) return 'Thỏa thuận';

  const min = job.salaryMin ? Number(job.salaryMin) : null;
  const max = job.salaryMax ? Number(job.salaryMax) : null;

  if (!min && !max) return undefined;

  const formatAmount = (value: number) =>
    job.currency === 'VND'
      ? `${(value / 1_000_000).toFixed(0)}`
      : `$${(value / 1_000).toFixed(0)}k`;

  if (min && max) return `${formatAmount(min)} - ${formatAmount(max)} Triệu`;
  if (min) return `Từ ${formatAmount(min)} Triệu`;
  return `Đến ${formatAmount(max!)} Triệu`;
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);

  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 tuần trước';
  if (weeks < 5) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

function mergeUniqueReviews(
  currentReviews: CompanyReviewItem[],
  nextReviews: CompanyReviewItem[]
): CompanyReviewItem[] {
  const seenIds = new Set(currentReviews.map((review) => review.id));
  const merged = [...currentReviews];

  nextReviews.forEach((review) => {
    if (!seenIds.has(review.id)) {
      seenIds.add(review.id);
      merged.push(review);
    }
  });

  return merged;
}

function getApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const maybeMessage = payload as { error?: string; message?: string };
  return maybeMessage.error || maybeMessage.message || null;
}

function scrollToReviewsSection() {
  const section = document.getElementById(REVIEWS_SECTION_ID);
  if (!section) return;

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${REVIEWS_SECTION_ID}`);
}

interface PublicCompanyProfile {
  id: string;
  companyName: string;
  companySlug: string;
  industry: { id: string; name: string } | null;
  companySize: string | null;
  websiteUrl: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  foundedYear: number | null;
  verificationStatus: string;
  activeJobCount: number;
  followerCount: number;
}

interface RawJob {
  id: string;
  title: string;
  jobType: string;
  locationCity: string | null;
  locationProvince: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryNegotiable: boolean;
  publishedAt: string | null;
  createdAt: string;
  jobSkills?: Array<{
    requiredLevel?: string | null;
    skill: { name: string; category?: string | null } | null;
  }>;
}

interface CompanyReviewsApiData {
  reviews: CompanyReviewItem[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  statistics?: CompanyReviewStats;
}

interface CompanyReviewsApiResponse {
  success: boolean;
  data?: CompanyReviewsApiData;
  error?: string;
  message?: string;
}

interface CompanyUserReviewsApiResponse {
  success: boolean;
  data?: {
    reviews: CompanyReviewItem[];
    total: number;
  };
  error?: string;
  message?: string;
}

interface FetchApprovedReviewsOptions {
  append?: boolean;
  limit?: number;
  page?: number;
}

export default function CompanyProfilePage() {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [activeTab, setActiveTab] = useState<CompanyTabKey>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [company, setCompany] = useState<PublicCompanyProfile | null>(null);
  const [overviewJobs, setOverviewJobs] = useState<JobListing[]>([]);
  const [allJobs, setAllJobs] = useState<JobListing[] | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [allJobsLoading, setAllJobsLoading] = useState(false);
  const [reviews, setReviews] = useState<CompanyReviewItem[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewStats, setReviewStats] = useState<CompanyReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [currentUserReview, setCurrentUserReview] = useState<CompanyReviewItem | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isCandidateUser = session?.user?.userType === 'CANDIDATE';
  const canWriteReview = !currentUserReview;
  const writeReviewLabel = currentUserReview
    ? currentUserReview.isApproved === false
      ? 'Review pending approval'
      : 'Review submitted'
    : 'Write review';

  const mapJobs = useCallback(
    (rawJobs: RawJob[]): JobListing[] =>
      rawJobs.map((job) => ({
        id: job.id,
        title: job.title,
        location: [job.locationCity, job.locationProvince].filter(Boolean).join(', ') || '',
        type: JOB_TYPE_LABELS[job.jobType] ?? job.jobType,
        salary: formatJobSalary(job),
        postedAt: timeAgo(job.publishedAt ?? job.createdAt),
        tags: job.jobSkills?.map((skill) => skill.skill?.name).filter(Boolean) as string[],
      })),
    []
  );

  const extractRequiredTechStack = useCallback((rawJobs: RawJob[]): string[] => {
    const allowedCategories = new Set(['technical', 'language']);
    const requiredSkills = new Set<string>();

    rawJobs.forEach((job) => {
      job.jobSkills?.forEach((jobSkill) => {
        const level = (jobSkill.requiredLevel || '').toLowerCase();
        const skillName = jobSkill.skill?.name?.trim();
        const category = (jobSkill.skill?.category || '').toLowerCase();

        if (level === 'required' && skillName && allowedCategories.has(category)) {
          requiredSkills.add(skillName);
        }
      });
    });

    return Array.from(requiredSkills).sort((a, b) => a.localeCompare(b));
  }, []);

  const fetchApprovedReviews = useCallback(
    async ({
      append = false,
      limit = DEFAULT_REVIEWS_LIMIT,
      page = 1,
    }: FetchApprovedReviewsOptions = {}) => {
      if (!slug) return;

      if (append) {
        setReviewsLoadingMore(true);
      } else {
        setReviewsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          companySlug: slug,
          page: String(page),
          limit: String(limit),
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        const response = await fetch(`/api/reviews/company?${params.toString()}`);
        const payload = (await response
          .json()
          .catch(() => null)) as CompanyReviewsApiResponse | null;

        if (!response.ok || !payload?.success || !payload.data) {
          throw new Error(getApiMessage(payload) || 'Failed to load company reviews');
        }

        const nextReviews = payload.data.reviews ?? [];
        setReviews((previousReviews) =>
          append ? mergeUniqueReviews(previousReviews, nextReviews) : nextReviews
        );
        setReviewsTotal(payload.data.total ?? 0);
        setReviewStats(payload.data.statistics ?? null);
        setReviewsPage(payload.data.page ?? page);
        setReviewsHasMore(payload.data.hasMore ?? false);
      } catch {
        if (append) {
          toast.error('Failed to load more reviews.');
          return;
        }

        setReviews([]);
        setReviewsTotal(0);
        setReviewStats(null);
        setReviewsPage(1);
        setReviewsHasMore(false);
      } finally {
        if (append) {
          setReviewsLoadingMore(false);
        } else {
          setReviewsLoading(false);
        }
      }
    },
    [slug]
  );

  const fetchCurrentUserCompanyReview = useCallback(async () => {
    if (!company?.id || sessionStatus !== 'authenticated' || !isCandidateUser) {
      setCurrentUserReview(null);
      return null;
    }

    try {
      const response = await fetch('/api/reviews/company/user?includeUnapproved=true');
      const payload = (await response
        .json()
        .catch(() => null)) as CompanyUserReviewsApiResponse | null;

      if (!response.ok || !payload?.success || !payload.data) {
        throw new Error(getApiMessage(payload) || 'Failed to load your review');
      }

      const matchingReview =
        payload.data.reviews.find((review) => review.companyId === company.id) || null;

      setCurrentUserReview(matchingReview);
      return matchingReview;
    } catch {
      setCurrentUserReview(null);
      return null;
    }
  }, [company?.id, isCandidateUser, sessionStatus]);

  const refreshReviews = useCallback(async () => {
    await Promise.all([
      fetchApprovedReviews({
        page: 1,
        limit: reviewsExpanded ? EXPANDED_REVIEWS_LIMIT : DEFAULT_REVIEWS_LIMIT,
      }),
      fetchCurrentUserCompanyReview(),
    ]);
  }, [fetchApprovedReviews, fetchCurrentUserCompanyReview, reviewsExpanded]);

  useEffect(() => {
    if (!slug) return;

    setCompany(null);
    setOverviewJobs([]);
    setAllJobs(null);
    setTechStack([]);
    setReviews([]);
    setReviewsTotal(0);
    setReviewStats(null);
    setReviewsPage(1);
    setReviewsHasMore(false);
    setReviewsExpanded(false);
    setCurrentUserReview(null);
    setReviewDialogOpen(false);
    setReviewSubmitting(false);
    setActiveTab('overview');
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const [profileRes, jobsRes, techStackJobsRes] = await Promise.all([
          fetch(`/api/companies/${slug}`),
          fetch(`/api/companies/${slug}/jobs?limit=5`),
          fetch(`/api/companies/${slug}/jobs?limit=50`),
        ]);

        if (profileRes.status === 404) {
          setNotFound(true);
          return;
        }

        const profileJson = await profileRes.json();
        if (!profileJson.success) {
          setNotFound(true);
          return;
        }

        const companyData: PublicCompanyProfile = profileJson.data;
        setCompany(companyData);

        fetch(`/api/candidate/company-followers/check/${companyData.id}`)
          .then((response) => response.json())
          .then((payload) => {
            if (payload.success) {
              setIsFollowing(payload.data?.isFollowing ?? false);
            }
          })
          .catch(() => {});

        if (jobsRes.ok) {
          const jobsJson = await jobsRes.json();
          if (jobsJson.success) {
            const rawJobs: RawJob[] = jobsJson.data?.jobs ?? [];
            setOverviewJobs(mapJobs(rawJobs));
            setTechStack(extractRequiredTechStack(rawJobs));
          }
        }

        if (techStackJobsRes.ok) {
          const techStackJobsJson = await techStackJobsRes.json();
          if (techStackJobsJson.success) {
            const rawJobs: RawJob[] = techStackJobsJson.data?.jobs ?? [];
            setTechStack((previousTechStack) => {
              const merged = new Set([...previousTechStack, ...extractRequiredTechStack(rawJobs)]);
              return Array.from(merged).sort((a, b) => a.localeCompare(b));
            });
          }
        }
      } catch {
        // Keep existing silent failure behavior for the main company shell.
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, mapJobs, extractRequiredTechStack]);

  useEffect(() => {
    if (activeTab !== 'jobs' || allJobs !== null || !company) return;

    setAllJobsLoading(true);
    fetch(`/api/companies/${company.companySlug}/jobs?limit=50`)
      .then((response) => response.json())
      .then((payload) => {
        if (payload.success) {
          const rawJobs: RawJob[] = payload.data?.jobs ?? [];
          setAllJobs(mapJobs(rawJobs));
          setTechStack((previousTechStack) => {
            const merged = new Set([...previousTechStack, ...extractRequiredTechStack(rawJobs)]);
            return Array.from(merged).sort((a, b) => a.localeCompare(b));
          });
          return;
        }

        setAllJobs([]);
      })
      .catch(() => setAllJobs([]))
      .finally(() => setAllJobsLoading(false));
  }, [activeTab, allJobs, company, mapJobs, extractRequiredTechStack]);

  useEffect(() => {
    if (!slug) return;

    void fetchApprovedReviews({ page: 1, limit: DEFAULT_REVIEWS_LIMIT });
  }, [fetchApprovedReviews, slug]);

  useEffect(() => {
    if (!company?.id || sessionStatus === 'loading') return;

    void fetchCurrentUserCompanyReview();
  }, [company?.id, fetchCurrentUserCompanyReview, sessionStatus]);

  const handleFollow = async () => {
    if (!company || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const response = await fetch(`/api/candidate/company-followers/${company.id}`, {
          method: 'DELETE',
        });

        if (response.ok || response.status === 204) {
          setIsFollowing(false);
          setCompany((previousCompany) =>
            previousCompany
              ? {
                  ...previousCompany,
                  followerCount: Math.max(0, previousCompany.followerCount - 1),
                }
              : previousCompany
          );
        }
      } else {
        const response = await fetch('/api/candidate/company-followers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: company.id }),
        });

        if (response.ok) {
          setIsFollowing(true);
          setCompany((previousCompany) =>
            previousCompany
              ? { ...previousCompany, followerCount: previousCompany.followerCount + 1 }
              : previousCompany
          );
        }
      }
    } catch {
      // Keep silent error behavior for follow/unfollow, matching existing UX.
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAlert = () => {
    document.getElementById('job-alert-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubscribeJobAlert = (_email: string) => {
    // TODO: call job-alert subscription API
  };

  const handleOpenReviewDialog = () => {
    if (sessionStatus === 'loading' || !company) return;

    if (!session) {
      const callbackUrl =
        typeof window !== 'undefined' ? window.location.href : `/candidate/companies/${slug}`;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (!isCandidateUser) {
      toast.error('Only candidate accounts can submit reviews.');
      return;
    }

    if (!canWriteReview) {
      return;
    }

    setActiveTab('reviews');
    scrollToReviewsSection();
    setReviewDialogOpen(true);
  };

  const handleExpandReviews = async () => {
    if (reviewsExpanded) {
      setActiveTab('reviews');
      scrollToReviewsSection();
      return;
    }

    setActiveTab('reviews');
    setReviewsExpanded(true);
    scrollToReviewsSection();
    await fetchApprovedReviews({ page: 1, limit: EXPANDED_REVIEWS_LIMIT });
  };

  const handleLoadMoreReviews = async () => {
    if (!reviewsExpanded || !reviewsHasMore || reviewsLoadingMore) return;

    await fetchApprovedReviews({
      append: true,
      page: reviewsPage + 1,
      limit: EXPANDED_REVIEWS_LIMIT,
    });
  };

  const handleReviewSubmit = async (values: CreateCompanyReviewInput) => {
    if (!company) return;

    setReviewSubmitting(true);

    try {
      const response = await fetch('/api/reviews/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        const message = getApiMessage(payload);

        if (response.status === 409) {
          throw new Error(message || 'You have already reviewed this company.');
        }

        if (response.status === 403) {
          throw new Error(message || 'Only candidate accounts can submit reviews.');
        }

        if (response.status === 401) {
          throw new Error(message || 'Please sign in to submit a review.');
        }

        throw new Error(message || 'Unable to submit your review right now.');
      }

      setReviewDialogOpen(false);
      setActiveTab('reviews');
      scrollToReviewsSection();
      toast.success('Đánh giá của bạn đã được gửi thành công và đang chờ ban quản trị phê duyệt.');
      await refreshReviews();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to submit your review right now.'
      );
      throw error;
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-12 animate-pulse rounded-2xl bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-gray-200 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 pt-16">
        <p className="text-xl font-semibold text-gray-500">Không tìm thấy công ty.</p>
        <a href="/candidate/companies" className="text-sm text-indigo-600 hover:underline">
          Quay lại danh sách công ty
        </a>
      </div>
    );
  }

  const location = [company.city, company.province].filter(Boolean).join(', ');
  const companySizeLabel =
    COMPANY_SIZE_LABELS[company.companySize ?? ''] ?? company.companySize ?? '-';

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          <CompanyHero
            name={company.companyName}
            logoUrl={company.logoUrl ?? undefined}
            coverImageUrl={company.coverImageUrl ?? undefined}
            industry={company.industry?.name}
            location={location || undefined}
            websiteUrl={company.websiteUrl ?? undefined}
            activeJobsCount={company.activeJobCount}
            employeesCount={companySizeLabel}
            followersCount={formatFollowers(company.followerCount)}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onAlert={handleAlert}
            followLoading={followLoading}
          />

          <div className="sticky top-16 z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CompanyTabs
              activeTab={activeTab}
              jobsCount={company.activeJobCount}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <section id="company-section-overview" className="scroll-mt-32 space-y-5">
                <CompanyAbout description={company.description ?? ''} techStack={techStack} />
                <CompanyKeyBenefits />
              </section>

              <section id="company-section-jobs" className="scroll-mt-32">
                {allJobsLoading ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="flex animate-pulse gap-4 border-b border-gray-100 py-4 first:pt-0 last:border-0 last:pb-0"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-2/3 rounded bg-gray-200" />
                          <div className="h-3 w-1/2 rounded bg-gray-200" />
                        </div>
                        <div className="h-7 w-16 rounded-lg bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <CompanyActiveOpenings
                    jobs={allJobs ?? overviewJobs}
                    companyId={company.companySlug}
                    companyName={company.companyName}
                    logoUrl={company.logoUrl}
                    totalCount={company.activeJobCount}
                  />
                )}
              </section>

              <section id="company-section-life" className="scroll-mt-32">
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-gray-400">Life at Company content coming soon...</p>
                </div>
              </section>

              <section id={REVIEWS_SECTION_ID} className="scroll-mt-32">
                <CompanyReviews
                  reviews={reviews}
                  totalReviews={reviewsTotal}
                  stats={reviewStats}
                  isLoading={reviewsLoading}
                  currentUserReview={currentUserReview}
                  canWriteReview={canWriteReview}
                  writeReviewLabel={writeReviewLabel}
                  onWriteReview={handleOpenReviewDialog}
                  onExpand={handleExpandReviews}
                  onLoadMore={handleLoadMoreReviews}
                  hasMore={reviewsHasMore}
                  isExpanded={reviewsExpanded}
                  isLoadingMore={reviewsLoadingMore}
                />
              </section>
            </div>

            <div id="job-alert-form">
              <CompanySidebar
                industry={company.industry?.name}
                companySize={companySizeLabel}
                headquarters={location || undefined}
                foundedYear={company.foundedYear?.toString()}
                websiteUrl={company.websiteUrl ?? undefined}
                onSubscribeJobAlert={handleSubscribeJobAlert}
              />
            </div>
          </div>
        </div>
      </div>

      <CompanyReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        companyId={company.id}
        companyName={company.companyName}
        isSubmitting={reviewSubmitting}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
