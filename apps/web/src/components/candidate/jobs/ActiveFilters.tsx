'use client';

import { X } from 'lucide-react';
import type { JobListFilters } from './JobListPage';

interface ActiveFiltersProps {
  filters: JobListFilters;
  onRemove: (key: keyof JobListFilters) => void;
  onClearAll: () => void;
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Freelance',
};

const expLabels: Record<string, string> = {
  ENTRY: 'Entry Level',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

function formatSalary(n: number) {
  return `${(n / 1_000_000).toFixed(0)}M VND`;
}

export default function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const tags: { key: keyof JobListFilters; label: string; color: string }[] = [];

  if (filters.search) {
    tags.push({
      key: 'search',
      label: `"${filters.search}"`,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    });
  }
  if (filters.jobType) {
    tags.push({
      key: 'jobType',
      label: jobTypeLabels[filters.jobType] || filters.jobType,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    });
  }
  if (filters.experienceLevel) {
    tags.push({
      key: 'experienceLevel',
      label: expLabels[filters.experienceLevel] || filters.experienceLevel,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    });
  }
  if (filters.locationCity) {
    tags.push({
      key: 'locationCity',
      label: filters.locationCity,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    });
  }
  if (filters.salaryMin) {
    tags.push({
      key: 'salaryMin',
      label: `Từ ${formatSalary(filters.salaryMin)}`,
      color: 'bg-green-50 text-green-700 border-green-200',
    });
  }
  if (filters.salaryMax) {
    tags.push({
      key: 'salaryMax',
      label: `Đến ${formatSalary(filters.salaryMax)}`,
      color: 'bg-green-50 text-green-700 border-green-200',
    });
  }
  if (filters.categoryId) {
    tags.push({
      key: 'categoryId',
      label: `Danh mục: ${filters.categoryId}`,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <button
          key={tag.key}
          onClick={() => onRemove(tag.key)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80 ${tag.color}`}
        >
          {tag.label}
          <X className="h-3 w-3" />
        </button>
      ))}

      {tags.length > 1 && (
        <button
          onClick={onClearAll}
          className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
}
