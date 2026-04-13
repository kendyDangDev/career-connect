'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, Loader2, SlidersHorizontal, Upload, Users } from 'lucide-react';
import { CandidateCard } from '@/components/employer/applications/CandidateCard';
import { FiltersPanel } from '@/components/employer/applications/FiltersPanel';
import {
  useApplicationsList,
  useSaveApplicationNote,
  useUpdateApplicationRating,
  useUpdateApplicationStatus,
} from '@/hooks/employer/useApplications';
import { ApplicationStatus } from '@/generated/prisma';
import { useStartConversation } from '@/hooks/useStartConversation';
import { MessageModal } from '@/components/employer/applications/MessageModal';
import { useChatContext } from '@/contexts/ChatContext';
import { useDebounce } from '@/hooks/useDebounced';
import { CandidateApplication } from '@/api/employer/applications.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPLIED]: 'Mới',
  [ApplicationStatus.SCREENING]: 'Đang xem xét',
  [ApplicationStatus.INTERVIEWING]: 'Phỏng vấn',
  [ApplicationStatus.OFFERED]: 'Đã gửi offer',
  [ApplicationStatus.HIRED]: 'Tuyển dụng',
  [ApplicationStatus.REJECTED]: 'Từ chối',
  [ApplicationStatus.WITHDRAWN]: 'Đã rút',
};

const toDatetimeLocalValue = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const experienceRangeMatchers: Record<string, (years: number) => boolean> = {
  '0-1 năm': (years) => years >= 0 && years <= 1,
  '1-3 năm': (years) => years >= 1 && years <= 3,
  '3-5 năm': (years) => years >= 3 && years <= 5,
  '5+ năm': (years) => years >= 5,
};

const matchesRatingFilter = (
  candidateRating: number | null | undefined,
  minimumRating: number | null
) => {
  if (minimumRating == null) {
    return true;
  }

  if (candidateRating == null) {
    return false;
  }

  return candidateRating >= minimumRating;
};

const matchesExperienceFilter = (
  experienceYears: number | null | undefined,
  selectedRanges: string[]
) => {
  if (selectedRanges.length === 0) {
    return true;
  }

  if (experienceYears == null) {
    return false;
  }

  return selectedRanges.some((range) => experienceRangeMatchers[range]?.(experienceYears) ?? false);
};

export default function ApplicationsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const page = 1;
  const [filters, setFilters] = useState({
    search: '',
    status: [] as ApplicationStatus[],
    rating: null as number | null,
    location: [] as string[],
    experience: [] as string[],
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: string;
    candidateId: string;
    fullName: string;
    avatarUrl?: string;
  } | null>(null);
  const [statusConfirmation, setStatusConfirmation] = useState<{
    applicationId: string;
    candidateName: string;
    currentStatus: ApplicationStatus;
    nextStatus: ApplicationStatus;
  } | null>(null);
  const [interviewDialog, setInterviewDialog] = useState<{
    applicationId: string;
    candidateName: string;
    currentStatus: ApplicationStatus;
    nextStatus?: ApplicationStatus;
  } | null>(null);
  const [interviewScheduledAt, setInterviewScheduledAt] = useState('');
  const [interviewError, setInterviewError] = useState('');

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

  const { data, isLoading, error, refetch } = useApplicationsList(apiParams);

  const updateStatusMutation = useUpdateApplicationStatus();
  const updateRatingMutation = useUpdateApplicationRating();
  const saveNoteMutation = useSaveApplicationNote();

  const { startConversation } = useStartConversation();
  const { initializeChat } = useChatContext();

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const applications: CandidateApplication[] = data?.data?.applications || [];
  const stats = data?.data?.stats;

  const getCandidateById = (id: string) => applications.find((app) => app.id === id);

  const getCandidateFullName = (candidate: CandidateApplication) => {
    const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    return fullName || candidate.email.split('@')[0];
  };

  const isInterviewDialogSaving = updateStatusMutation.isPending;

  const closeInterviewDialog = () => {
    if (isInterviewDialogSaving) return;

    setInterviewDialog(null);
    setInterviewScheduledAt('');
    setInterviewError('');
  };

  const closeStatusConfirmation = () => {
    if (updateStatusMutation.isPending) return;
    setStatusConfirmation(null);
  };

  const handleStatusChange = (id: string, status: string) => {
    const candidate = getCandidateById(id);
    const nextStatus = status as ApplicationStatus;

    if (!candidate || candidate.status === nextStatus) return;

    if (nextStatus === ApplicationStatus.INTERVIEWING) {
      setInterviewDialog({
        applicationId: id,
        candidateName: getCandidateFullName(candidate),
        currentStatus: candidate.status,
        nextStatus,
      });
      setInterviewScheduledAt(toDatetimeLocalValue(candidate.interviewScheduledAt));
      setInterviewError('');
      return;
    }

    setStatusConfirmation({
      applicationId: id,
      candidateName: getCandidateFullName(candidate),
      currentStatus: candidate.status,
      nextStatus,
    });
  };

  const handleOpenInterviewScheduleDialog = (id: string) => {
    const candidate = getCandidateById(id);

    if (!candidate) return;

    setInterviewDialog({
      applicationId: id,
      candidateName: getCandidateFullName(candidate),
      currentStatus: candidate.status,
    });
    setInterviewScheduledAt(toDatetimeLocalValue(candidate.interviewScheduledAt));
    setInterviewError('');
  };

  const handleRatingChange = (id: string, rating: number) => {
    updateRatingMutation.mutate({
      applicationId: id,
      ratingData: { rating },
    });
  };

  const handleSaveNote = async (id: string, note: string) => {
    await saveNoteMutation.mutateAsync({
      applicationId: id,
      notes: note.trim(),
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmation) return;

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: statusConfirmation.applicationId,
        statusData: { status: statusConfirmation.nextStatus },
      });

      setStatusConfirmation(null);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleSaveInterviewSchedule = async () => {
    if (!interviewDialog) return;

    if (!interviewScheduledAt) {
      setInterviewError('Vui lòng chọn ngày giờ phỏng vấn.');
      return;
    }

    const scheduledDate = new Date(interviewScheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      setInterviewError('Ngày giờ phỏng vấn không hợp lệ.');
      return;
    }

    if (scheduledDate.getTime() <= Date.now()) {
      setInterviewError('Ngày giờ phỏng vấn phải ở tương lai.');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: interviewDialog.applicationId,
        statusData: {
          status: interviewDialog.nextStatus,
          interviewScheduledAt: scheduledDate.toISOString(),
          notifyCandidate: true,
        },
      });

      closeInterviewDialog();
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleSendMessage = async (id: string) => {
    const candidate = getCandidateById(id);
    if (!candidate) return;

    const fullName = getCandidateFullName(candidate);

    setSelectedCandidate({
      id: candidate.id,
      candidateId: candidate.userId,
      fullName,
      avatarUrl: candidate.avatarUrl,
    });

    await startConversation(candidate.userId, fullName, {
      type: 'APPLICATION_RELATED',
      applicationId: candidate.id,
      jobId: candidate.jobId,
    });

    setMessageModalOpen(true);
  };

  const filteredCandidates = applications.filter((candidate) => {
    if (!matchesRatingFilter(candidate.rating, filters.rating)) {
      return false;
    }

    if (
      filters.location.length > 0 &&
      !filters.location.some((location) =>
        normalizeText(candidate.location).includes(normalizeText(location))
      )
    ) {
      return false;
    }

    if (!matchesExperienceFilter(candidate.experienceYears, filters.experience)) {
      return false;
    }

    return true;
  });

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

            {/* <button className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg">
              <Download className="h-4 w-4" />
              Export
            </button> */}
          </div>
        </div>
      </div>

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
        ].map((stat) => (
          <div
            key={stat.status}
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

      <div className="grid gap-6 lg:grid-cols-4">
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

        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {filteredCandidates.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Không tìm thấy ứng viên</h3>
              <p className="mt-2 text-sm text-gray-600">Thử thay đổi bộ lọc để xem thêm ứng viên</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusChange={handleStatusChange}
                  onRatingChange={handleRatingChange}
                  onSendMessage={handleSendMessage}
                  onSaveNote={handleSaveNote}
                  isSavingNote={
                    saveNoteMutation.isPending &&
                    saveNoteMutation.variables?.applicationId === candidate.id
                  }
                  onManageInterviewSchedule={handleOpenInterviewScheduleDialog}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(interviewDialog)}
        onOpenChange={(open) => {
          if (!open) {
            closeInterviewDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {interviewDialog?.currentStatus === ApplicationStatus.INTERVIEWING
                ? 'Cập nhật lịch phỏng vấn'
                : 'Lên lịch phỏng vấn'}
            </DialogTitle>
            <DialogDescription>
              {interviewDialog ? (
                <>
                  Chọn ngày giờ phỏng vấn cho ứng viên{' '}
                  <strong>{interviewDialog.candidateName}</strong>. Sau khi lưu, hệ thống sẽ gửi
                  email thông báo đến ứng viên.
                </>
              ) : (
                'Chọn ngày giờ phỏng vấn.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="datetime-local"
              value={interviewScheduledAt}
              onChange={(event) => {
                setInterviewScheduledAt(event.target.value);
                if (interviewError) {
                  setInterviewError('');
                }
              }}
              error={interviewError || undefined}
              min={toDatetimeLocalValue(new Date().toISOString())}
            />
            <p className="text-xs text-gray-500">
              Lịch phỏng vấn sẽ được lưu vào hệ thống và gửi email cho ứng viên ngay sau khi cập
              nhật thành công.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={closeInterviewDialog}
              disabled={isInterviewDialogSaving}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveInterviewSchedule} disabled={isInterviewDialogSaving}>
              {isInterviewDialogSaving ? 'Đang lưu...' : 'Lưu lịch phỏng vấn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(statusConfirmation)}
        onOpenChange={(open) => {
          if (!open) {
            closeStatusConfirmation();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {statusConfirmation ? (
                <>
                  <span className="block">
                    Bạn sắp chuyển ứng viên <strong>{statusConfirmation.candidateName}</strong> từ{' '}
                    <strong>{applicationStatusLabels[statusConfirmation.currentStatus]}</strong>{' '}
                    sang <strong>{applicationStatusLabels[statusConfirmation.nextStatus]}</strong>.
                  </span>
                  <span className="block">
                    Hãy xác nhận để cập nhật trạng thái ứng viên trong hệ thống.
                  </span>
                </>
              ) : (
                'Xác nhận cập nhật trạng thái ứng viên.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Hủy</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleConfirmStatusChange}
              disabled={updateStatusMutation.isPending}
              className={
                statusConfirmation?.nextStatus === ApplicationStatus.REJECTED
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : ''
              }
            >
              {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
