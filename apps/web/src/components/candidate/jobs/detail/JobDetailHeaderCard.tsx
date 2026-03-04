'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { JobData } from './JobDetailPage';

interface JobDetailHeaderCardProps {
  job: JobData;
  viewCount: number;
  applicationCount: number;
  savedCount: number;
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'FULL-TIME',
  PART_TIME: 'PART-TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE',
};

const workLocationLabels: Record<string, string> = {
  REMOTE: 'REMOTE FRIENDLY',
  ONSITE: 'ONSITE',
  HYBRID: 'HYBRID',
};

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string = 'VND',
  negotiable: boolean = false
): string {
  if (negotiable) return 'Thỏa thuận';
  if (!min && !max) return 'Thỏa thuận';

  const fmt = (n: number) =>
    currency === 'VND' ? `${(n / 1_000_000).toFixed(0)}M VND` : `$${(n / 1_000).toFixed(0)}k`;

  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export default function JobDetailHeaderCard({
  job,
  viewCount,
  applicationCount,
  savedCount,
}: JobDetailHeaderCardProps) {
  const [saved, setSaved] = useState(false);

  const location = job.locationCity
    ? `${job.locationCity}${job.locationProvince ? `, ${job.locationProvince}` : ''}`
    : 'Remote';

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryNegotiable);
  const isVerified = job.company?.verificationStatus === 'VERIFIED';

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="shadow-sophisticated overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
        {/* Left: Logo + Info */}
        <div className="flex items-start gap-6">
          {/* Company Logo */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-800">
            {job.company.logoUrl ? (
              <Image
                src={job.company.logoUrl}
                alt={job.company.companyName}
                width={96}
                height={96}
                className="h-full w-full object-contain"
                unoptimized
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-5xl">terminal</span>
            )}
          </div>

          {/* Job Info */}
          <div className="flex flex-col gap-2">
            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {job.title}
            </h1>

            {/* Company + Location + Salary */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                {job.company.companyName}
                {isVerified && (
                  <span
                    className="material-symbols-outlined fill-1 text-primary text-lg"
                    title="Verified Employer"
                  >
                    verified
                  </span>
                )}
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">location_on</span>
                {location}
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                {salary}
              </span>
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {job.jobType && (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {jobTypeLabels[job.jobType] || job.jobType}
                </span>
              )}
              {job.workLocationType && (
                <span className="border-primary/10 bg-primary-light text-primary dark:bg-primary/20 rounded-full border px-3 py-1 text-xs font-bold">
                  {workLocationLabels[job.workLocationType] || job.workLocationType}
                </span>
              )}
              {job.urgent && (
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  URGENT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex w-full flex-row gap-3 md:w-auto md:flex-col lg:flex-row">
          <button className="from-primary shadow-primary/20 hover:shadow-primary/40 h-12 min-w-[140px] flex-1 transform rounded-xl bg-gradient-to-r to-purple-500 font-bold text-white shadow-lg transition-all hover:scale-[1.02] md:flex-none lg:flex-none">
            Apply Now
          </button>

          <button
            onClick={() => setSaved(!saved)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
              saved
                ? 'border-primary bg-primary-light text-primary dark:bg-primary/20'
                : 'hover:bg-primary-light hover:text-primary border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">bookmark</span>
          </button>

          <button
            onClick={handleShare}
            className="hover:bg-primary-light hover:text-primary flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-6 grid grid-cols-2 gap-6 border-t border-slate-100 pt-6 md:grid-cols-4 dark:border-slate-800">
        {/* Applications */}
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Applications
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCount(applicationCount)}
            </span>
            {applicationCount > 10 && (
              <span className="text-primary text-xs font-medium">+12 today</span>
            )}
          </div>
        </div>

        {/* Job Views */}
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Job Views
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCount(viewCount)}
            </span>
          </div>
        </div>

        {/* Saved By */}
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Saved By
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCount(savedCount)}
            </span>
          </div>
        </div>

        {/* Hiring Speed */}
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Hiring Speed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-bold">
              {applicationCount > 50 ? 'Fast' : 'Normal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
