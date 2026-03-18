'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COMPANY_SIZE_LABELS: Record<string, string> = {
  STARTUP_1_10: '1 – 10',
  SMALL_11_50: '11 – 50',
  MEDIUM_51_200: '51 – 200',
  LARGE_201_500: '200+',
  ENTERPRISE_501_PLUS: '500+',
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
  const fmt = (n: number) =>
    job.currency === 'VND' ? `${(n / 1_000_000).toFixed(0)}M` : `$${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return 'Hôm nay';
  if (d === 1) return '1 ngày trước';
  if (d < 7) return `${d} ngày trước`;
  const w = Math.floor(d / 7);
  if (w === 1) return '1 tuần trước';
  if (w < 5) return `${w} tuần trước`;
  const m = Math.floor(d / 30);
  return `${m} tháng trước`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
  statistics?: CompanyReviewStats;
}

interface CompanyReviewsApiResponse {
  success: boolean;
  data?: CompanyReviewsApiData;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const { id: slug } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const mapJobs = useCallback(
    (rawJobs: RawJob[]): JobListing[] =>
      rawJobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: [j.locationCity, j.locationProvince].filter(Boolean).join(', ') || '',
        type: JOB_TYPE_LABELS[j.jobType] ?? j.jobType,
        salary: formatJobSalary(j),
        postedAt: timeAgo(j.publishedAt ?? j.createdAt),
        tags: j.jobSkills?.map((s) => s.skill?.name).filter(Boolean) as string[],
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

  useEffect(() => {
    if (!slug) return;
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

        // Check follow status (requires auth — silently ignore 401)
        fetch(`/api/candidate/company-followers/check/${companyData.id}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.success) setIsFollowing(j.data?.isFollowing ?? false);
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
            setTechStack((prev) => {
              const merged = new Set([...prev, ...extractRequiredTechStack(rawJobs)]);
              return Array.from(merged).sort((a, b) => a.localeCompare(b));
            });
          }
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, mapJobs, extractRequiredTechStack]);

  // Lazy-load full jobs list when "jobs" tab is clicked
  useEffect(() => {
    if (activeTab !== 'jobs' || allJobs !== null || !company) return;
    setAllJobsLoading(true);
    fetch(`/api/companies/${company.companySlug}/jobs?limit=50`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const rawJobs: RawJob[] = json.data?.jobs ?? [];
          setAllJobs(mapJobs(rawJobs));
          setTechStack((prev) => {
            const merged = new Set([...prev, ...extractRequiredTechStack(rawJobs)]);
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
    setReviewsLoading(true);

    const encodedSlug = encodeURIComponent(slug);
    fetch(
      `/api/reviews/company?companySlug=${encodedSlug}&page=1&limit=3&sortBy=createdAt&sortOrder=desc`
    )
      .then((r) => r.json())
      .then((json: CompanyReviewsApiResponse) => {
        if (json.success && json.data) {
          setReviews(json.data.reviews ?? []);
          setReviewsTotal(json.data.total ?? 0);
          setReviewStats(json.data.statistics ?? null);
          return;
        }

        setReviews([]);
        setReviewsTotal(0);
        setReviewStats(null);
      })
      .catch(() => {
        setReviews([]);
        setReviewsTotal(0);
        setReviewStats(null);
      })
      .finally(() => setReviewsLoading(false));
  }, [slug]);

  const handleFollow = async () => {
    if (!company || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await fetch(`/api/candidate/company-followers/${company.id}`, {
          method: 'DELETE',
        });
        if (res.ok || res.status === 204) {
          setIsFollowing(false);
          setCompany((prev) =>
            prev ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) } : prev
          );
        }
      } else {
        const res = await fetch('/api/candidate/company-followers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: company.id }),
        });
        if (res.ok) {
          setIsFollowing(true);
          setCompany((prev) => (prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev));
        }
      }
    } catch {
      /* silent */
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

  // ─── Loading skeleton ────────────────────────────────────────────────────────
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

  // ─── Not found ───────────────────────────────────────────────────────────────
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

  // ─── Derived values ───────────────────────────────────────────────────────────
  const location = [company.city, company.province].filter(Boolean).join(', ');
  const companySizeLabel =
    COMPANY_SIZE_LABELS[company.companySize ?? ''] ?? company.companySize ?? '–';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        {/* Company Hero */}
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

        {/* Tab Navigation */}
        <div className="sticky top-16 z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CompanyTabs
            activeTab={activeTab}
            jobsCount={company.activeJobCount}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / Main Content */}
          <div className="space-y-5 lg:col-span-2">
            <section id="company-section-overview" className="scroll-mt-32 space-y-5">
              <CompanyAbout description={company.description ?? ''} techStack={techStack} />
              <CompanyKeyBenefits />
            </section>

            <section id="company-section-jobs" className="scroll-mt-32">
              {allJobsLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
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

            <section id="company-section-reviews" className="scroll-mt-32">
              <CompanyReviews
                reviews={reviews}
                totalReviews={reviewsTotal}
                stats={reviewStats}
                isLoading={reviewsLoading}
              />
            </section>
          </div>

          {/* Sidebar */}
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
  );
}
