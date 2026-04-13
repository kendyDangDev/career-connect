'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AdminCompanyReviewListItem,
  AdminCompanyReviewPagination,
  CompanyReviewModerationStatus,
} from '@/types/admin/company-review';
import { Loader2, Search, Star, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import { TablePagination } from './TablePagination';

interface CompanyReviewsTableProps {
  reviews: AdminCompanyReviewListItem[];
  loading: boolean;
  fetching: boolean;
  pagination: AdminCompanyReviewPagination;
  status: CompanyReviewModerationStatus;
  search: string;
  actionReviewId: string | null;
  actionTargetApproved: boolean | null;
  onSearch: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (review: AdminCompanyReviewListItem) => void;
  onToggleApproval: (review: AdminCompanyReviewListItem, nextApproved: boolean) => void;
}

const employmentStatusLabels = {
  CURRENT: 'Đang làm việc',
  FORMER: 'Đã nghỉ việc',
} as const;

function renderStars(value: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export function CompanyReviewsTable({
  reviews,
  loading,
  fetching,
  pagination,
  status,
  search,
  actionReviewId,
  actionTargetApproved,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onView,
  onToggleApproval,
}: CompanyReviewsTableProps) {
  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const emptyState = useMemo(() => {
    switch (status) {
      case 'approved':
        return {
          title: 'Chưa có review nào đã duyệt',
          description: 'Các review đã duyệt sẽ xuất hiện ở đây để admin theo dõi hoặc bỏ duyệt.',
        };
      case 'all':
        return {
          title: 'Chưa có review nào',
          description: 'Khi ứng viên gửi đánh giá công ty, dữ liệu sẽ xuất hiện tại đây.',
        };
      case 'pending':
      default:
        return {
          title: 'Không có review chờ duyệt',
          description: 'Queue moderation đang trống. Các review mới sẽ xuất hiện tại đây.',
        };
    }
  }, [status]);

  const handleSearchSubmit = () => {
    onSearch(searchValue.trim());
  };

  const isActionLoading = (review: AdminCompanyReviewListItem, nextApproved: boolean) =>
    actionReviewId === review.id && actionTargetApproved === nextApproved;

  return (
    <div className="w-full p-4">
      <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo công ty, reviewer, tiêu đề, nội dung..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              className="pl-9"
            />
          </div>

          <Button variant="outline" onClick={handleSearchSubmit}>
            Tìm kiếm
          </Button>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{pagination.total} review</span>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
          <Star className="text-muted-foreground/50 h-12 w-12" />
          <p className="mt-4 text-lg font-semibold">{emptyState.title}</p>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">{emptyState.description}</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border-x border-t p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">Công ty</TableHead>
                  <TableHead className="w-[180px]">Reviewer</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead className="w-[180px]">Thời gian gửi</TableHead>
                  <TableHead className="w-[180px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const nextApproved = !review.isApproved;

                  return (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">{review.company.companyName}</p>
                          <p className="text-muted-foreground text-xs">
                            /companies/{review.company.companySlug}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <p className="font-medium">{review.reviewer.displayName}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {review.reviewer.isAnonymous ? (
                              <Badge variant="outline">Ẩn danh</Badge>
                            ) : null}
                            <Badge variant="secondary">
                              {employmentStatusLabels[review.employmentStatus]}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            {renderStars(review.rating)}
                            <span className="text-sm font-semibold">{review.rating}/5</span>
                            {status === 'all' ? (
                              <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                                {review.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="space-y-1">
                            <p className="font-medium">{review.title}</p>
                            <p className="text-muted-foreground text-sm leading-6">
                              {truncateText(review.reviewText, 140)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">
                            {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-muted-foreground">
                            {format(new Date(review.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onView(review)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => onToggleApproval(review, nextApproved)}
                            disabled={isActionLoading(review, nextApproved)}
                            variant={review.isApproved ? 'secondary' : 'default'}
                          >
                            {isActionLoading(review, nextApproved) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : review.isApproved ? (
                              <RotateCcw className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            {review.isApproved ? 'Unapprove' : 'Approve'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  );
}
