'use client';

import { Clock3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateRecentSearchItem } from '@/api/candidate/search-history.api';

interface RecentSearchesDropdownProps {
  visible: boolean;
  searches: CandidateRecentSearchItem[];
  isLoading?: boolean;
  onSelect: (keyword: string) => void;
  className?: string;
}

export default function RecentSearchesDropdown({
  visible,
  searches,
  isLoading = false,
  onSelect,
  className,
}: RecentSearchesDropdownProps) {
  if (!visible || (!isLoading && searches.length === 0)) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)]',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
        <Clock3 className="h-3.5 w-3.5 text-purple-500" />
        Tìm kiếm gần đây
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          Đang tải lịch sử tìm kiếm...
        </div>
      ) : (
        <div className="py-1.5">
          {searches.map((search) => (
            <button
              key={search.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(search.keyword)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
            >
              <Clock3 className="h-4 w-4 text-slate-400" />
              <span className="truncate">{search.keyword}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
