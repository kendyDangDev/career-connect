'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface CompanyPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function CompanyPagination({ currentPage, totalPages }: CompanyPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`/candidate/companies?${params.toString()}`, { scroll: true });
    },
    [router, searchParams, totalPages]
  );

  if (totalPages <= 1) return null;

  // Build visible page numbers (window of 5 around current)
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p as number)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition-all ${
              p === currentPage
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
