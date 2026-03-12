'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useCallback } from 'react';

export interface Industry {
  id: string;
  name: string;
}

interface CompanyFiltersBarProps {
  industries: Industry[];
  totalCount: number;
}

const COMPANY_SIZE_OPTIONS = [
  { value: 'STARTUP_1_10', label: '1 – 10 nhân viên' },
  { value: 'SMALL_11_50', label: '11 – 50 nhân viên' },
  { value: 'MEDIUM_51_200', label: '51 – 200 nhân viên' },
  { value: 'LARGE_201_500', label: '201 – 500 nhân viên' },
  { value: 'ENTERPRISE_500_PLUS', label: '500+ nhân viên' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'name_desc', label: 'Tên Z → A' },
];

export default function CompanyFiltersBar({ industries, totalCount }: CompanyFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get('industryId') || '';
  const currentSize = searchParams.get('companySize') || '';
  const currentSort = searchParams.get('sortBy') || 'newest';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      router.push(`/candidate/companies?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/candidate/companies?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    currentIndustry || currentSize || (currentSort && currentSort !== 'newest');

  return (
    <div className="mb-8">
      {/* Results count + controls row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tất cả Công ty</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Hiển thị{' '}
            <span className="font-bold text-purple-600">{totalCount.toLocaleString('vi-VN')}</span>{' '}
            công ty phù hợp
          </p>
        </div>

        {/* Filter + Sort controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Industry filter */}
          <div className="relative">
            <select
              value={currentIndustry}
              onChange={(e) => updateParam('industryId', e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm font-medium text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">Tất cả ngành</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Company size filter */}
          <div className="relative">
            <select
              value={currentSize}
              onChange={(e) => updateParam('companySize', e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm font-medium text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">Mọi quy mô</option>
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Sort */}
          <div className="relative">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
              <SlidersHorizontal className="h-4 w-4 text-purple-500" />
              <select
                value={currentSort}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="cursor-pointer appearance-none bg-transparent font-semibold text-slate-700 outline-none focus:ring-0 dark:text-slate-300"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
            >
              <X className="h-3.5 w-3.5" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {currentIndustry && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-700/50 dark:bg-purple-900/20 dark:text-purple-300">
              {industries.find((i) => i.id === currentIndustry)?.name ?? 'Ngành'}
              <button
                onClick={() => updateParam('industryId', '')}
                className="text-purple-400 hover:text-purple-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentSize && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-700/50 dark:bg-indigo-900/20 dark:text-indigo-300">
              {COMPANY_SIZE_OPTIONS.find((s) => s.value === currentSize)?.label ?? currentSize}
              <button
                onClick={() => updateParam('companySize', '')}
                className="text-indigo-400 hover:text-indigo-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
