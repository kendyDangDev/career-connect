'use client';

import { format } from 'date-fns';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { AdminCompanyReviewListItem } from '@/types/admin/company-review';
import { Briefcase, CalendarDays, Clock3, Star } from 'lucide-react';

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: AdminCompanyReviewListItem | null;
}

const employmentStatusLabels = {
  CURRENT: 'Đang làm việc',
  FORMER: 'Đã nghỉ việc',
} as const;

function RatingStars({
  value,
  size = 'h-4 w-4',
}: {
  value: number | null | undefined;
  size?: string;
}) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">Chưa có</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${size} ${index < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

function DetailBlock({ title, content }: { title: string; content?: string | null }) {
  if (!content) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-xl border bg-slate-50/80 p-4 dark:bg-slate-900/50">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-6">{content}</p>
    </div>
  );
}

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
}: ReviewDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <DialogHeader className="space-y-3 border-b px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={review?.isApproved ? 'default' : 'secondary'}>
              {review?.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
            </Badge>
            {review?.reviewer.isAnonymous ? <Badge variant="outline">Ẩn danh</Badge> : null}
          </div>

          <DialogTitle className="text-xl">
            {review?.title || 'Chi tiết đánh giá công ty'}
          </DialogTitle>
          <DialogDescription>
            Xem đầy đủ nội dung đánh giá trước khi thực hiện moderation.
          </DialogDescription>
        </DialogHeader>

        {review ? (
          <ScrollArea className="max-h-[calc(90vh-110px)]">
            <div className="space-y-6 px-6 py-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Công ty
                  </p>
                  <p className="mt-2 text-base font-semibold">{review.company.companyName}</p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Reviewer
                  </p>
                  <p className="mt-2 text-base font-semibold">{review.reviewer.displayName}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4" />
                    Đánh giá tổng
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <RatingStars value={review.rating} />
                    <span className="text-sm font-semibold">{review.rating}/5</span>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4" />
                    Trạng thái việc làm
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {employmentStatusLabels[review.employmentStatus]}
                  </p>
                  {review.positionTitle ? (
                    <p className="text-muted-foreground mt-2 text-sm">{review.positionTitle}</p>
                  ) : null}
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    Gửi lúc
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {review.employmentLength ? (
                    <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                      <Clock3 className="h-4 w-4" />
                      {review.employmentLength}
                    </div>
                  ) : null}
                </div>
              </div>

              <DetailBlock title="Nội dung đánh giá" content={review.reviewText} />
              <div className="grid gap-4 md:grid-cols-2">
                <DetailBlock title="Điểm cộng" content={review.pros} />
                <DetailBlock title="Điểm trừ" content={review.cons} />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-semibold">Đánh giá chi tiết</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Work-life balance</p>
                    <div className="mt-2">
                      <RatingStars value={review.workLifeBalanceRating} />
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Salary & benefits</p>
                    <div className="mt-2">
                      <RatingStars value={review.salaryBenefitRating} />
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Management</p>
                    <div className="mt-2">
                      <RatingStars value={review.managementRating} />
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Culture</p>
                    <div className="mt-2">
                      <RatingStars value={review.cultureRating} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
