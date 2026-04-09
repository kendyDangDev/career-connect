'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Download, Upload, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { CandidateCard } from '@/components/employer/applications/CandidateCard';
import { FiltersPanel } from '@/components/employer/applications/FiltersPanel';
import {
  useApplicationsList,
  useUpdateApplicationStatus,
  useUpdateApplicationRating,
} from '@/hooks/employer/useApplications';
import { ApplicationStatus } from '@/generated/prisma';
import { useStartConversation } from '@/hooks/useStartConversation';
import { MessageModal } from '@/components/employer/applications/MessageModal';
import { useChatContext } from '@/contexts/ChatContext';
import { useDebounce } from '@/hooks/useDebounced';

export default function ApplicationsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: [] as ApplicationStatus[],
    rating: null as number | null,
    location: [] as string[],
    experience: [] as string[],
  });

  // Debounce search term (500ms delay)
  const debouncedSearch = useDebounce(filters.search, 500);

  // Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: string;
    candidateId: string;
    fullName: string;
    avatarUrl?: string;
  } | null>(null);

  // Build API query parameters with debounced search
  const apiParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: filters.status.length > 0 ? filters.status.join(',') : undefined,
      sortBy: 'appliedAt',
      sortOrder: 'desc' as const,
    }),
    [page, debouncedSearch, filters.status]
  );

  // Fetch applications with React Query
  const { data, isLoading, error, refetch } = useApplicationsList(apiParams);

  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus();
  const updateRatingMutation = useUpdateApplicationRating();

  // Messaging
  const { startConversation, isCreating } = useStartConversation();
  const { initializeChat } = useChatContext();

  // Initialize chat on mount (for messaging feature)
  useEffect(() => {
    initializeChat();
  }, []);

  // Handlers
  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({
      applicationId: id,
      statusData: { status: status as ApplicationStatus },
    });
  };

  const handleRatingChange = (id: string, rating: number) => {
    updateRatingMutation.mutate({
      applicationId: id,
      ratingData: { rating },
    });
  };

  const handleSendMessage = async (id: string) => {
    // Find candidate data
    const candidate = applications.find((app: any) => app.id === id);
    if (!candidate) return;

    // Set selected candidate
    setSelectedCandidate({
      id: candidate.id,
      candidateId: candidate.userId, // Use userId for conversation
      fullName: candidate.firstName + ' ' + candidate.lastName,
      avatarUrl: candidate.avatarUrl,
    });

    // Start conversation with userId (not candidateId)
    await startConversation(candidate.userId, candidate.firstName + ' ' + candidate.lastName, {
      type: 'APPLICATION_RELATED',
      applicationId: candidate.id,
      jobId: candidate.jobId,
    });

    // Open modal
    setMessageModalOpen(true);
  };

  // Get applications and stats from API response
  const applications = (data as any)?.data?.applications || [];
  const stats = (data as any)?.data?.stats;
  const pagination = (data as any)?.data?.pagination;

  // Client-side filter for rating (API doesn't support rating filter yet)
  const filteredCandidates = applications.filter((candidate: any) => {
    if (filters.rating && candidate.rating && candidate.rating < filters.rating) {
      return false;
    }
    // Note: location and experience filters would need API support
    // For now, we'll keep them as client-side filters
    if (filters.location.length > 0 && !filters.location.includes(candidate.location)) {
      return false;
    }
    if (filters.experience.length > 0 && !filters.experience.includes(candidate.experience)) {
      return false;
    }
    return true;
  });

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải danh sách ứng viên...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">Lỗi tải dữ liệu</h3>
          <p className="mb-4 text-red-700">Không thể tải danh sách ứng viên</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-white">Quản lý ứng viên</h1>
            <p className="text-purple-100">
              Tổng cộng <span className="font-semibold text-white">{stats?.total || 0}</span> ứng
              viên
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          {
            label: 'Mới',
            status: ApplicationStatus.APPLIED,
            count: stats?.byStatus[ApplicationStatus.APPLIED] || 0,
            color: 'from-blue-500 to-indigo-600',
          },
          {
            label: 'Đang xem xét',
            status: ApplicationStatus.SCREENING,
            count: stats?.byStatus[ApplicationStatus.SCREENING] || 0,
            color: 'from-purple-500 to-purple-600',
          },
          {
            label: 'Phỏng vấn',
            status: ApplicationStatus.INTERVIEWING,
            count: stats?.byStatus[ApplicationStatus.INTERVIEWING] || 0,
            color: 'from-yellow-500 to-orange-500',
          },
          {
            label: 'Đã gửi offer',
            status: ApplicationStatus.OFFERED,
            count: stats?.byStatus[ApplicationStatus.OFFERED] || 0,
            color: 'from-orange-500 to-red-500',
          },
          {
            label: 'Tuyển dụng',
            status: ApplicationStatus.HIRED,
            count: stats?.byStatus[ApplicationStatus.HIRED] || 0,
            color: 'from-green-500 to-emerald-600',
          },
          {
            label: 'Từ chối',
            status: ApplicationStatus.REJECTED,
            count: stats?.byStatus[ApplicationStatus.REJECTED] || 0,
            color: 'from-gray-400 to-gray-500',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="shadow-soft relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md"
          >
            <div
              className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10`}
            />
            <div className="relative">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FiltersPanel
                filters={filters}
                onFilterChange={setFilters}
                isSearching={filters.search !== debouncedSearch}
              />
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {filteredCandidates.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Không tìm thấy ứng viên</h3>
              <p className="mt-2 text-sm text-gray-600">Thử thay đổi bộ lọc để xem thêm ứng viên</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate: any) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusChange={handleStatusChange}
                  onRatingChange={handleRatingChange}
                  onSendMessage={handleSendMessage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedCandidate && (
        <MessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidateId={selectedCandidate.candidateId}
          candidateName={selectedCandidate.fullName}
          candidateAvatar={selectedCandidate.avatarUrl}
        />
      )}
    </div>
  );
}
