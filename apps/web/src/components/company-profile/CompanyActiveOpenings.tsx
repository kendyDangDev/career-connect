import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface JobListing {
  id: string;
  title: string;
  companyName?: string;
  logoUrl?: string | null;
  location: string;
  type: string;
  salary?: string;
  postedAt: string;
  tags?: string[];
}

interface CompanyActiveOpeningsProps {
  jobs: JobListing[];
  companyId?: string;
  companyName?: string;
  logoUrl?: string | null;
  totalCount?: number;
  title?: string;
  subtitle?: string;
  emptyStateMessage?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  actionLabel?: string;
}

function buildJobHref(jobId: string) {
  return `/candidate/jobs/${jobId}`;
}

function isToday(postedAt: string) {
  const normalized = postedAt.trim().toLowerCase();
  return normalized === 'today' || normalized === 'h\u00f4m nay';
}

function getJobBadge(job: JobListing) {
  if (isToday(job.postedAt)) {
    return {
      label: 'Urgent',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  const normalizedType = job.type.trim().toLowerCase();
  if (
    normalizedType.includes('contract') ||
    normalizedType.includes('hợp đồng') ||
    normalizedType.includes('hop dong')
  ) {
    return {
      label: 'Contract',
      className: 'bg-fuchsia-100 text-fuchsia-700',
    };
  }

  if (
    normalizedType.includes('hybrid') ||
    normalizedType.includes('lai') ||
    normalizedType.includes('kết hợp') ||
    normalizedType.includes('ket hop')
  ) {
    return {
      label: 'Hybrid',
      className: 'bg-slate-100 text-slate-600',
    };
  }

  return null;
}

function getCompensationLabel(salary?: string) {
  if (!salary) return null;
  return salary.includes('/hr') ? 'Rate' : 'Salary';
}

function getVisibleTags(tags?: string[]) {
  const seen = new Set<string>();
  const normalizedTags = (tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !/^\+\d+$/.test(tag))
    .filter((tag) => {
      const normalizedTag = tag.toLowerCase();
      if (seen.has(normalizedTag)) return false;
      seen.add(normalizedTag);
      return true;
    });

  return {
    visibleTags: normalizedTags.slice(0, 3),
    remainingCount: Math.max(normalizedTags.length - 3, 0),
  };
}

function getDisplayCompanyName(companyName?: string, fallback?: string) {
  return companyName?.trim() || fallback?.trim() || 'Company';
}

export function CompanyActiveOpenings({
  jobs,
  companyId,
  companyName,
  logoUrl,
  totalCount,
  title = 'Active Openings',
  subtitle,
  emptyStateMessage = 'No active openings at the moment.',
  viewAllHref,
  viewAllLabel = 'See all jobs',
  actionLabel = 'Apply Now',
}: CompanyActiveOpeningsProps) {
  const resolvedSubtitle =
    subtitle ??
    (totalCount && totalCount > 0
      ? `${totalCount} open roles currently available`
      : 'Explore the latest openings from this company');
  const resolvedViewAllHref = viewAllHref ?? (companyId ? `/companies/${companyId}/jobs` : null);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{resolvedSubtitle}</p>
        </div>

        {resolvedViewAllHref && totalCount !== undefined && totalCount > jobs.length && (
          <Link
            href={resolvedViewAllHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-800"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-purple-700">{emptyStateMessage}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {jobs.map((job) => {
            const badge = getJobBadge(job);
            const compensationLabel = getCompensationLabel(job.salary);
            const isPrimaryAction = isToday(job.postedAt);
            const displayCompanyName = getDisplayCompanyName(
              job.companyName,
              companyName ?? job.type
            );
            const displayLogoUrl = job.logoUrl ?? logoUrl;
            const logoFallback = displayCompanyName.charAt(0).toUpperCase();
            const { visibleTags, remainingCount } = getVisibleTags(job.tags);

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-[0_14px_32px_rgba(109,40,217,0.10)] sm:px-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <Link
                      href={buildJobHref(job.id)}
                      className="shrink-0 rounded-2xl bg-slate-100/80 p-1.5 transition-transform hover:scale-[1.02]"
                    >
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {displayLogoUrl ? (
                          <Image
                            src={displayLogoUrl}
                            alt={`${displayCompanyName} logo`}
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 text-base font-bold text-white shadow-inner">
                            {logoFallback}
                          </span>
                        )}
                      </span>
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={buildJobHref(job.id)}
                          className="truncate text-[1.3rem] font-bold tracking-tight text-slate-900"
                        >
                          {job.title}
                        </Link>

                        {badge && (
                          <span
                            className={`rounded-md px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.12em] uppercase ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] text-slate-500">
                        <span className="font-semibold text-slate-700">{displayCompanyName}</span>
                        {job.location && (
                          <>
                            <span className="text-slate-300">&middot;</span>
                            <span>{job.location}</span>
                          </>
                        )}
                      </p>

                      {visibleTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {visibleTags.map((tag) => (
                            <span
                              key={`${job.id}-${tag}`}
                              className="rounded-md bg-slate-100 px-2.5 py-1 text-[0.7rem] leading-none font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="rounded-md bg-fuchsia-50 px-2.5 py-1 text-[0.7rem] leading-none font-semibold text-fuchsia-600">
                              +{remainingCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 lg:min-w-[168px] lg:items-end">
                    {compensationLabel && job.salary && (
                      <div className="text-left lg:text-right">
                        <p className="text-[0.62rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
                          {compensationLabel}
                        </p>
                        <p className="mt-1 text-[1.35rem] font-extrabold tracking-tight text-slate-900">
                          {job.salary}
                        </p>
                      </div>
                    )}

                    <Link
                      href={buildJobHref(job.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                        isPrimaryAction
                          ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-[0_12px_26px_rgba(168,85,247,0.35)] hover:from-fuchsia-600 hover:to-purple-700 hover:shadow-[0_16px_30px_rgba(168,85,247,0.45)]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {actionLabel}
                      {isPrimaryAction && <ArrowRight className="h-4 w-4" />}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
