'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CandidatesTable } from './components/CandidatesTable';
import { CandidateDetailDialog } from './components/CandidateDetailDialog';
import { useCandidatesData } from '@/hooks/useCandidatesData';
import { CandidateListItem } from './types';
import { Loader2 } from 'lucide-react';

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateListItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Parse URL params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const availabilityStatus = searchParams.get('availabilityStatus') || '';
  const preferredWorkType = searchParams.get('preferredWorkType') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const { 
    candidates, 
    loading, 
    error,
    pagination, 
    fetchCandidateDetails, 
    refresh 
  } = useCandidatesData({
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
      const newSearchParams = new URLSearchParams(searchParams.toString());

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý ứng viên</h1>
        <p className="text-muted-foreground">
          Danh sách và quản lý thông tin các ứng viên trong hệ thống
        </p>
      </div>

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
  );
}