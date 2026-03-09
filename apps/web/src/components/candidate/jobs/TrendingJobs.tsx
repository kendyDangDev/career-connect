'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Star, MapPin, DollarSign, ArrowRight } from 'lucide-react';

interface TrendingJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
}

export default function TrendingJobs() {
  const [jobs, setJobs] = useState<TrendingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/jobs?limit=6&sortBy=viewCount&sortOrder=desc');
        if (res.ok) {
          const data = await res.json();
          const rawJobs = data.data?.jobs ?? data.data ?? [];
          setJobs(
            rawJobs.slice(0, 6).map((j: any) => ({
              id: j.id,
              title: j.title || 'Untitled',
              company: j.company?.companyName || j.company?.name || 'Company',
              location: j.locationCity || j.locationProvince || 'Việt Nam',
              salary: formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency || j.currency),
            }))
          );
        }
      } catch {
        // Fallback data
        setJobs([
          {
            id: '1',
            title: 'Senior React Developer',
            company: 'Tech Corp',
            location: 'Hà Nội',
            salary: '25-35M',
          },
          {
            id: '2',
            title: 'Backend Engineer',
            company: 'Startup ABC',
            location: 'Hồ Chí Minh',
            salary: '20-30M',
          },
          {
            id: '3',
            title: 'UI/UX Designer',
            company: 'Design Studio',
            location: 'Đà Nẵng',
            salary: '15-25M',
          },
          {
            id: '4',
            title: 'DevOps Engineer',
            company: 'Cloud Co',
            location: 'Remote',
            salary: '30-45M',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-56 shrink-0 animate-pulse rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="mb-2 h-3 w-16 rounded bg-gray-200" />
              <div className="mb-1 h-4 w-full rounded bg-gray-200" />
              <div className="mb-1 h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">Việc làm hot</h3>
        </div>
        <Link
          href="/jobs?sortBy=viewCount&sortOrder=desc"
          className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
        >
          Xem tất cả <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/candidate/jobs/${job.id}`}
            className="group w-56 shrink-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
          >
            <div className="mb-1.5 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
              <span className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase">
                Hot Job
              </span>
            </div>
            <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-purple-700">
              {job.title}
            </h4>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate">{job.company}</span>
              <span>•</span>
              <span className="truncate">{job.location}</span>
            </div>
            {job.salary && <span className="text-xs font-medium text-green-600">{job.salary}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return '';
  const fmt = (n: number) =>
    currency === 'USD' ? `$${(n / 1000).toFixed(0)}k` : `${(n / 1_000_000).toFixed(0)}M`;
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  if (max) return `Đến ${fmt(max)}`;
  return '';
}
