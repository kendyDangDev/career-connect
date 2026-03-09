import Link from 'next/link';
import { MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react';

export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  salary?: string;
  postedAt: string;
  tags?: string[];
}

interface CompanyActiveOpeningsProps {
  jobs: JobListing[];
  companyId: string;
  totalCount?: number;
}

export function CompanyActiveOpenings({ jobs, companyId, totalCount }: CompanyActiveOpeningsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Active Openings</h2>
        {totalCount !== undefined && totalCount > jobs.length && (
          <Link
            href={`/companies/${companyId}/jobs`}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            See all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-10 text-center">
          <p className="text-sm text-gray-500">No active openings at the moment.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/candidate/jobs/${job.id}`}
              className="group flex items-start justify-between gap-4 py-4 transition-colors first:pt-0 last:pb-0 hover:text-indigo-700"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                  {job.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.type}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </span>
                  )}
                </div>
                {job.tags && job.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs text-gray-400">{job.postedAt}</span>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors group-hover:bg-indigo-100">
                    Apply →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
