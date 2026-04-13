'use client';

import { useState } from 'react';
import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ApplicationStatus } from '@/generated/prisma';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CandidateCardProps {
  candidate: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    position: string;
    location: string;
    experience: string;
    experienceYears?: number | null;
    appliedDate: string;
    status: ApplicationStatus;
    rating?: number | null;
    avatarUrl?: string;
    skills?: string[];
    notes?: string;
    cvFileUrl?: string;
    coverLetter?: string;
    interviewScheduledAt?: string;
  };
  onStatusChange?: (id: string, status: string) => void;
  onRatingChange?: (id: string, rating: number) => void;
  onSendMessage?: (id: string) => void;
  onSaveNote?: (id: string, note: string) => Promise<void> | void;
  isSavingNote?: boolean;
  onManageInterviewSchedule?: (id: string) => void;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  [ApplicationStatus.APPLIED]: { label: 'Mới', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  [ApplicationStatus.SCREENING]: {
    label: 'Đang xem xét',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: 'Phỏng vấn',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  [ApplicationStatus.OFFERED]: {
    label: 'Đã gửi offer',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  [ApplicationStatus.HIRED]: {
    label: 'Tuyển dụng',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Đã rút',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function CandidateCard({
  candidate,
  onStatusChange,
  onRatingChange,
  onSendMessage,
  onSaveNote,
  isSavingNote = false,
  onManageInterviewSchedule,
}: CandidateCardProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(candidate.notes ?? '');
  const [noteError, setNoteError] = useState('');
  const status = statusConfig[candidate.status];
  const rating = candidate.rating ?? 0;
  const noteIsLong = Boolean(
    candidate.notes && (candidate.notes.length > 180 || candidate.notes.split(/\r?\n/).length > 3)
  );
  const showInterviewScheduleSection =
    candidate.status === ApplicationStatus.INTERVIEWING || Boolean(candidate.interviewScheduledAt);

  const getFullName = () => {
    const { firstName, lastName } = candidate;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return candidate.email.split('@')[0];
  };

  const fullName = getFullName();

  const getInitials = () => {
    const { firstName, lastName } = candidate;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (lastName) return lastName.slice(0, 2).toUpperCase();
    return candidate.email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không giới hạn';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const formatInterviewDateTime = (dateString?: string) => {
    if (!dateString) return 'Chưa lên lịch phỏng vấn';
    try {
      return format(new Date(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const openNoteEditor = () => {
    setDraftNote(candidate.notes ?? '');
    setNoteError('');
    setIsEditingNote(true);
  };

  const cancelNoteEditor = () => {
    if (isSavingNote) return;

    setDraftNote(candidate.notes ?? '');
    setNoteError('');
    setIsEditingNote(false);
  };

  const handleSaveNote = async () => {
    if (!onSaveNote) return;

    const trimmedNote = draftNote.trim();

    if (!trimmedNote) {
      setNoteError('Vui lòng nhập nội dung ghi chú.');
      return;
    }

    if (trimmedNote.length > 1000) {
      setNoteError('Ghi chú tối đa 1000 ký tự.');
      return;
    }

    try {
      await Promise.resolve(onSaveNote(candidate.id, trimmedNote));
      setNoteError('');
      setIsEditingNote(false);
    } catch {
      // Error toast is handled upstream.
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-lg font-bold text-white shadow-md">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start gap-2">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-700">
                  {fullName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4 cursor-pointer transition-colors',
                      i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    )}
                    onClick={() => onRatingChange?.(candidate.id, i + 1)}
                    aria-label={`Đánh giá ${i + 1} sao cho ${fullName}`}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-gray-500">
                  {rating > 0 ? `${rating}/5` : 'Chưa đánh giá'}
                </span>
              </div>
            </div>

            <p className="mb-2 text-sm font-medium text-purple-600">{candidate.position}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {candidate.location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {candidate.experience === 'null+ năm'
                  ? 'Chưa có kinh nghiệm'
                  : candidate.experience}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(candidate.appliedDate)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
              status.color
            )}
          >
            {status.label}
          </span>

          <div className="group/menu relative">
            <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
              <MoreVertical className="h-4 w-4" />
            </button>

            <div className="invisible absolute top-full right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/menu:visible group-hover/menu:opacity-100">
              <div className="p-1">
                {Object.entries(statusConfig).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    disabled={key === candidate.status}
                    onClick={() => onStatusChange?.(candidate.id, key as ApplicationStatus)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                      key === candidate.status
                        ? 'cursor-default bg-gray-50 text-gray-400'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    )}
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        value.color.split(' ')[0].replace('bg-', 'bg-')
                      )}
                    />
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          href={`mailto:${candidate.email}`}
          className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-600"
        >
          <Mail className="h-4 w-4" />
          {candidate.email}
        </a>
        {candidate.phone && (
          <a
            href={`tel:${candidate.phone}`}
            className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-600"
          >
            <Phone className="h-4 w-4" />
            {candidate.phone}
          </a>
        )}
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              +{candidate.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {showInterviewScheduleSection && (
        <div className="mt-4 overflow-hidden rounded-xl border border-sky-100 bg-sky-50/70">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Lịch phỏng vấn</p>
              <p className="mt-1 text-xs text-gray-600">
                {formatInterviewDateTime(candidate.interviewScheduledAt)}
              </p>
            </div>

            {candidate.status === ApplicationStatus.INTERVIEWING && (
              <button
                type="button"
                onClick={() => onManageInterviewSchedule?.(candidate.id)}
                className="shrink-0 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100"
              >
                {candidate.interviewScheduledAt ? 'Đổi lịch' : 'Chọn lịch'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        {isEditingNote ? (
          <div className="overflow-hidden rounded-xl border border-amber-100 bg-amber-50/70">
            <div className="flex items-center justify-between gap-3 border-b border-amber-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {candidate.notes ? 'Chỉnh sửa ghi chú tuyển dụng' : 'Thêm ghi chú tuyển dụng'}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Ghi chú được lưu dưới dạng 1 bản duy nhất và sẽ ghi đè nội dung hiện tại.
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-amber-700">
                {draftNote.trim().length}/1000
              </span>
            </div>

            <div className="space-y-3 px-4 py-3">
              <Textarea
                value={draftNote}
                onChange={(event) => {
                  setDraftNote(event.target.value);
                  if (noteError) {
                    setNoteError('');
                  }
                }}
                placeholder="Ví dụ: Ứng viên giao tiếp tốt, cần đào sâu thêm về kinh nghiệm React..."
                className="min-h-[140px] resize-y border-amber-200 bg-white"
                maxLength={1000}
                error={noteError || undefined}
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelNoteEditor}
                  disabled={isSavingNote}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSavingNote || draftNote.trim() === (candidate.notes?.trim() ?? '')}
                  className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
              </div>
            </div>
          </div>
        ) : candidate.notes ? (
          <div className="overflow-hidden rounded-xl border border-amber-100 bg-amber-50/70">
            <div className="flex items-center justify-between gap-3 border-b border-amber-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Ghi chú tuyển dụng</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`note-rating-${i}`}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span>{rating > 0 ? `${rating}/5 sao` : 'Chưa đánh giá'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={openNoteEditor}
                className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="px-4 py-3">
              <p
                className={cn(
                  'text-sm leading-6 whitespace-pre-wrap text-gray-700',
                  !isNotesExpanded && noteIsLong && 'line-clamp-3'
                )}
              >
                {candidate.notes}
              </p>

              {noteIsLong && (
                <button
                  type="button"
                  onClick={() => setIsNotesExpanded((prev) => !prev)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-purple-700 transition-colors hover:text-purple-800"
                >
                  {isNotesExpanded ? (
                    <>
                      Thu gọn
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Xem thêm
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openNoteEditor}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-purple-200 bg-purple-50/60 px-4 py-3 text-left transition-colors hover:border-purple-300 hover:bg-purple-50"
          >
            <div>
              <p className="text-sm font-semibold text-purple-900">Chưa có ghi chú tuyển dụng</p>
              <p className="mt-1 text-xs text-purple-700">
                Tạo ghi chú nội bộ duy nhất để theo dõi ứng viên thuận tiện hơn.
              </p>
            </div>
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm">
              Thêm ghi chú
            </span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
        <a
          href={candidate.cvFileUrl ? `/api/employer/applications/${candidate.id}/cv` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-medium ${
            candidate.cvFileUrl
              ? 'text-purple-700 hover:shadow-sm'
              : 'cursor-not-allowed text-gray-400 hover:shadow-none'
          }`}
        >
          <FileText className="h-4 w-4" />
          {candidate.cvFileUrl ? 'Xem CV' : 'CV Not Available'}
        </a>
        <button
          onClick={() => onSendMessage?.(candidate.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
        >
          <MessageSquare className="h-4 w-4" />
          Nhắn tin
        </button>
      </div>
    </div>
  );
}
