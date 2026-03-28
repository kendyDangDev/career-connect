'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CandidatesTable } from './components/CandidatesTable';
import { CandidateDetailDialog } from './components/CandidateDetailDialog';
import { useCandidatesData } from '@/hooks/useCandidatesData';
import {
  CandidateListItem,
  AvailabilityStatus,
  PreferredWorkType,
  UserStatus,
} from './types';
import { Loader2, Users } from 'lucide-react';
import { AdminPageHeader } from '@/components/layout/AdminLayout/AdminPageHeader';

const VALID_STATUS: readonly UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const VALID_AVAILABILITY_STATUS: readonly AvailabilityStatus[] = [
  'AVAILABLE',
  'NOT_AVAILABLE',
  'PASSIVE',
];
const VALID_PREFERRED_WORK_TYPES: readonly PreferredWorkType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
];

const normalizeEnumParam = <T extends string>(value: string | null, allowedValues: readonly T[]) => {
  if (!value) return '';
  return allowedValues.includes(value as T) ? value : '';
};

function CandidatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateListItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Parse URL params
  const page = parseInt(searchParams?.get('page') || '1');
  const limit = parseInt(searchParams?.get('limit') || '10');
  const search = searchParams?.get('search') || '';
  const status = normalizeEnumParam(searchParams?.get('status') || null, VALID_STATUS);
  const availabilityStatus = normalizeEnumParam(
    searchParams?.get('availabilityStatus') || null,
    VALID_AVAILABILITY_STATUS
  );
  const preferredWorkType = normalizeEnumParam(
    searchParams?.get('preferredWorkType') || null,
    VALID_PREFERRED_WORK_TYPES
  );
  const sortBy = searchParams?.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams?.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const { candidates, loading, error, pagination, fetchCandidateDetails, refresh } =
    useCandidatesData({
      page,
      limit,
      search,
      status,
      availabilityStatus,
      preferredWorkType,
      sortBy,
      sortOrder,
    });

  // Update URL params
  const updateURLParams = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value.toString());
        }
      });

      router.push(`/admin/candidates?${newSearchParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handlers
  const handleSearch = (value: string) => {
    updateURLParams({ search: value, page: 1 });
  };

  const handleFilter = (filterType: string, value: string) => {
    updateURLParams({ [filterType]: value, page: 1 });
  };

  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateURLParams({ sortBy: field, sortOrder: newSortOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateURLParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateURLParams({ limit: newSize, page: 1 });
  };

  const handleView = (candidate: CandidateListItem) => {
    setSelectedCandidate(candidate);
    setIsDetailDialogOpen(true);
  };

  // Show error if any
  if (error) {
    toast.error(error);
  }

  if (loading && candidates.length === 0) {
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
          title="Quản lý ứng viên"
          description="👥 Danh sách và quản lý thông tin các ứng viên trong hệ thống"
          icon={Users}
          gradient="from-blue-600 via-cyan-600 to-teal-600"
        />

        <CandidatesTable
          candidates={candidates}
          loading={loading}
          pagination={pagination}
          filters={{
            search,
            status,
            availabilityStatus,
            preferredWorkType,
            sortBy,
            sortOrder,
          }}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onView={handleView}
        />

        <CandidateDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          candidateId={selectedCandidate?.id}
          fetchCandidateDetails={fetchCandidateDetails}
        />
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CandidatesPageContent />
    </Suspense>
  );
}
