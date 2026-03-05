'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, DollarSign, BadgeCheck, ArrowRight } from 'lucide-react';

interface SimilarJob {
  id: string;
  title: string;
  company: {
    companyName: string;
    logoUrl: string | null;
    verificationStatus: string;
  };
  locationCity: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryNegotiable: boolean;
  jobType: string;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
  negotiable: boolean
) {
  if (negotiable) return 'Thỏa thuận';
  if (!min && !max) return null;
  const fmt = (n: number) =>
    currency === 'VND' ? `${(n / 1_000_000).toFixed(0)}M` : `$${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

const typeLabel: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

export default function SimilarJobs({
  currentJobId,
  jobType,
}: {
  currentJobId: string;
  jobType: string;
}) {
  const [jobs, setJobs] = useState<SimilarJob[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs?limit=4&jobType=${jobType}`);
        const json = await res.json();
        if (json.success) {
          setJobs(
            (json.data?.jobs ?? []).filter((j: SimilarJob) => j.id !== currentJobId).slice(0, 3)
          );
        }
      } catch {
        /* silent */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJobId, jobType]);

  if (!jobs.length) return null;

  return (
    <div className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Việc làm tương tự</h2>
        <Link
          href="/candidate/jobs"
          className="flex items-center gap-1 text-sm font-medium text-purple-600 transition hover:text-purple-700"
        >
          Xem thêm <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => {
          const salary = formatSalary(
            job.salaryMin,
            job.salaryMax,
            job.currency,
            job.salaryNegotiable
          );
          const location = job.locationCity || '';

          return (
            <Link
              key={job.id}
              href={`/candidate/jobs/${job.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  {job.company.logoUrl ? (
                    <Image
                      src={job.company.logoUrl}
                      alt={job.company.companyName}
                      width={44}
                      height={44}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="truncate">{job.company.companyName}</span>
                    {job.company.verificationStatus === 'VERIFIED' && (
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-purple-700">
                    {job.title}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {salary && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <DollarSign className="h-3 w-3" /> {salary}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" /> {location}
                  </span>
                )}
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
                  {typeLabel[job.jobType] ?? job.jobType}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
