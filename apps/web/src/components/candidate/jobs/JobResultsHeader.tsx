'use client';

import { ChevronDown } from 'lucide-react';

interface JobResultsHeaderProps {
  totalJobs: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export default function JobResultsHeader({
  totalJobs,
  sortBy,
  sortOrder,
  onSortChange,
}: JobResultsHeaderProps) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('_');
    onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
  };

  return (
    <div className="mb-8 flex flex-col items-end justify-between gap-4 sm:flex-row">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Showing {totalJobs.toLocaleString()} Jobs
        </h2>
        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
          Matching your specific requirements
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold tracking-wider uppercase">Sort by:</span>
          <div className="relative">
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={handleSortChange}
              className="cursor-pointer appearance-none border-none bg-transparent pr-6 font-bold text-slate-900 focus:ring-0 focus:outline-none dark:text-white"
            >
              <option value="publishedAt_desc">Most Recent</option>
              <option value="viewCount_desc">Most Viewed</option>
              <option value="applicationCount_desc">Most Applied</option>
              <option value="salaryMax_desc">Highest Salary</option>
              <option value="salaryMin_asc">Lowest Salary</option>
              <option value="relevance_desc">Most Relevant</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-[18px] w-[18px] -translate-y-1/2 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
