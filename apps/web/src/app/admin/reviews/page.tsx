'use client';

import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageHeader } from '@/components/layout/AdminLayout/AdminPageHeader';
import { useAdminCompanyReviewsData } from '@/hooks/useAdminCompanyReviewsData';
import {
  companyReviewModerationStatusLabels,
  type AdminCompanyReviewListItem,
  type CompanyReviewModerationStatus,
} from '@/types/admin/company-review';
import { Loader2, Star } from 'lucide-react';
import { CompanyReviewsTable } from './components/CompanyReviewsTable';
import { ReviewDetailDialog } from './components/ReviewDetailDialog';

const allowedStatuses: CompanyReviewModerationStatus[] = ['pending', 'approved', 'all'];

function normalizeStatus(value: string | null): CompanyReviewModerationStatus {
  if (value && allowedStatuses.includes(value as CompanyReviewModerationStatus)) {
    return value as CompanyReviewModerationStatus;
  }

  return 'pending';
}

function ReviewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedReview, setSelectedReview] = useState<AdminCompanyReviewListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionReviewId, setActionReviewId] = useState<string | null>(null);
  const [actionTargetApproved, setActionTargetApproved] = useState<boolean | null>(null);

  const page = parseInt(searchParams?.get('page') || '1', 10);
  const limit = parseInt(searchParams?.get('limit') || '10', 10);
  const status = normalizeStatus(searchParams?.get('status'));
  const search = searchParams?.get('search') || '';

  const { reviews, pagination, loading, fetching, updateApprovalStatus } = useAdminCompanyReviewsData({
    page,
    limit,
    status,
    search,
  });

  const updateURLParams = useCallback(
    (params: Record<string, string | number | null>) => {
      const nextSearchParams = new URLSearchParams(searchParams?.toString() || '');

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          nextSearchParams.delete(key);
        } else {
          nextSearchParams.set(key, value.toString());
        }
      });

      router.push(`/admin/reviews?${nextSearchParams.toString()}`);
    },
    [router, searchParams]
  );

  const handleStatusChange = (value: string) => {
    updateURLParams({
      status: value,
      page: 1,
    });
  };

  const handleSearch = (value: string) => {
    updateURLParams({
      search: value || null,
      page: 1,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateURLParams({ page: nextPage });
  };

  const handlePageSizeChange = (nextLimit: number) => {
    updateURLParams({
      limit: nextLimit,
      page: 1,
    });
  };

  const handleView = (review: AdminCompanyReviewListItem) => {
    setSelectedReview(review);
    setIsDetailOpen(true);
  };

  const handleToggleApproval = async (
    review: AdminCompanyReviewListItem,
    nextApproved: boolean
  ) => {
    try {
      setActionReviewId(review.id);
      setActionTargetApproved(nextApproved);
      await updateApprovalStatus(review.id, nextApproved);

      if (selectedReview?.id === review.id) {
        setSelectedReview({
          ...selectedReview,
          isApproved: nextApproved,
        });
      }

      toast.success(
        nextApproved ? 'Duyệt bài đánh giá thành công' : 'Đưa bài đánh giá về trạng thái chờ duyệt'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái review';
      toast.error(message);
    } finally {
      setActionReviewId(null);
      setActionTargetApproved(null);
    }
  };

  const tabs = useMemo(
    () =>
      allowedStatuses.map((item) => ({
        value: item,
        label: companyReviewModerationStatusLabels[item],
      })),
    []
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto space-y-5 p-4 md:p-6">
        <AdminPageHeader
          title="Moderation Company Reviews"
          description="Duyệt, bỏ duyệt và theo dõi toàn bộ đánh giá công ty do ứng viên gửi lên."
          icon={Star}
          gradient="from-amber-500 via-orange-500 to-rose-500"
        />

        <Tabs value={status} onValueChange={handleStatusChange} className="space-y-4">
          <TabsList className="grid w-full max-w-[420px] grid-cols-3 rounded-xl bg-white/80 p-1 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-0">
            <CompanyReviewsTable
              reviews={reviews}
              loading={loading}
              fetching={fetching}
              pagination={pagination}
              status={status}
              search={search}
              actionReviewId={actionReviewId}
              actionTargetApproved={actionTargetApproved}
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onView={handleView}
              onToggleApproval={handleToggleApproval}
            />
          </CardContent>
        </Card>

        <ReviewDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          review={selectedReview}
        />
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ReviewsPageContent />
    </Suspense>
  );
}
