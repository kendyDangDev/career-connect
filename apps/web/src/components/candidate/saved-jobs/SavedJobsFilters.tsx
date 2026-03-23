'use client';

import { Search } from 'lucide-react';

import type { CandidateSavedJobsApplicationStatus } from '@/api/candidate/saved-jobs.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SavedJobsFiltersProps {
  searchValue: string;
  applicationStatus: CandidateSavedJobsApplicationStatus;
  sortBy: 'savedAt' | 'deadline' | 'salary' | 'jobTitle';
  sortOrder: 'asc' | 'desc';
  isBusy?: boolean;
  hasActiveFilters: boolean;
  onSearchValueChange: (value: string) => void;
  onApplicationStatusChange: (value: CandidateSavedJobsApplicationStatus) => void;
  onSortByChange: (value: 'savedAt' | 'deadline' | 'salary' | 'jobTitle') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  onApply: () => void;
}

export default function SavedJobsFilters({
  searchValue,
  applicationStatus,
  sortBy,
  sortOrder,
  isBusy = false,
  hasActiveFilters,
  onSearchValueChange,
  onApplicationStatusChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
  onApply,
}: SavedJobsFiltersProps) {
  return (
    <section className="rounded-[30px] border border-purple-100 bg-white/95 p-5 shadow-sm shadow-purple-900/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium text-slate-600">Tìm kiếm</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchValueChange(event.target.value)}
                placeholder="Tìm theo tên công việc hoặc công ty"
                className="border-slate-200 bg-white pl-9"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onApply();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={onApply}
              disabled={isBusy}
            >
              Tìm
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                onClick={onClearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:w-[640px] lg:shrink-0">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Trạng thái</label>
            <Select value={applicationStatus} onValueChange={onApplicationStatusChange}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="open">Còn hạn ứng tuyển</SelectItem>
                <SelectItem value="expired">Đã hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Sắp xếp theo</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Chọn cách sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savedAt">Ngày lưu</SelectItem>
                <SelectItem value="deadline">Hạn nộp hồ sơ</SelectItem>
                <SelectItem value="salary">Mức lương</SelectItem>
                <SelectItem value="jobTitle">Tên công việc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Thứ tự</label>
            <Select value={sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Chọn thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mới nhất trước</SelectItem>
                <SelectItem value="asc">Cũ nhất trước</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
