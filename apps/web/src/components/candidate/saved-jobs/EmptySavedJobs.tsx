import Link from 'next/link';
import { Bookmark, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptySavedJobsProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptySavedJobs({
  hasActiveFilters,
  onClearFilters,
}: EmptySavedJobsProps) {
  return (
    <div className="rounded-[32px] border border-dashed border-purple-200 bg-white/95 px-6 py-16 text-center shadow-sm shadow-purple-900/5">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
        {hasActiveFilters ? <SearchX className="h-7 w-7" /> : <Bookmark className="h-7 w-7" />}
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        {hasActiveFilters
          ? 'Không tìm thấy việc làm đã lưu phù hợp'
          : 'Bạn chưa lưu công việc nào'}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {hasActiveFilters
          ? 'Thử nới lỏng bộ lọc hoặc xóa điều kiện tìm kiếm để xem nhiều kết quả hơn.'
          : 'Các công việc bạn lưu sẽ xuất hiện tại đây để bạn theo dõi và quay lại ứng tuyển bất cứ lúc nào.'}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild className="bg-purple-600 text-white hover:bg-purple-700">
          <Link href="/candidate/jobs">Khám phá việc làm ngay</Link>
        </Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 bg-white"
            onClick={onClearFilters}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
