'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Briefcase,
  MapPin,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Award,
  TrendingUp,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { useJobApplications, useUpdateApplication } from '@/hooks/useJob';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ApplicationListItemAPI } from '@/types/job.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobApplicationsPage({ params }: PageProps) {
  const { id: jobId } = use(params);

  // States
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('appliedAt');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch applications
  const {
    data: applicationsData,
    isLoading,
    error,
  } = useJobApplications(jobId, {
    page,
    limit: 20,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
    // sortBy,
    // sortOrder: 'desc',
  });

  // Mutation
  const updateApplicationMutation = useUpdateApplication(jobId);

  // Handle status change
  const handleStatusChange = (applicationId: string, status: string) => {
    if (confirm(`Bạn có chắc chắn muốn chuyển trạng thái ứng viên này?`)) {
      updateApplicationMutation.mutate({
        applicationId,
        data: { status: status as any },
      });
    }
  };

  // Handle rating
  const handleRating = (applicationId: string, rating: number) => {
    updateApplicationMutation.mutate({
      applicationId,
      data: { rating },
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  // Get candidate full name
  const getCandidateName = (candidate: ApplicationListItemAPI['candidate']) => {
    const { firstName, lastName } = candidate.user;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return candidate.user.email.split('@')[0];
  };

  // Format salary
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)} triệu`;
    if (min) return `Từ ${(min / 1000000).toFixed(0)} triệu`;
    if (max) return `Đến ${(max / 1000000).toFixed(0)} triệu`;
    return 'Thỏa thuận';
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xét duyệt' },
      REVIEWING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang xem xét' },
      INTERVIEWING: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Phỏng vấn' },
      OFFERED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã offer' },
      HIRED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã tuyển' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' },
    };

    const config = configs[status] || configs.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Rating stars component
  const RatingStars = ({
    rating,
    applicationId,
    readOnly = false,
  }: {
    rating?: number | null;
    applicationId: string;
    readOnly?: boolean;
  }) => {
    const currentRating = rating || 0;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && handleRating(applicationId, star)}
            disabled={readOnly || updateApplicationMutation.isPending}
            className={`transition-all ${!readOnly && 'hover:scale-110'} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {!readOnly && <span className="ml-1 text-xs text-gray-500">({currentRating}/5)</span>}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải danh sách ứng viên...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Không thể tải danh sách</h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <Link
            href={`/employer/jobs/${jobId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại chi tiết công việc
          </Link>
        </div>
      </div>
    );
  }

  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination;
  const stats = applicationsData?.data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/employer/jobs/${jobId}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <h1 className="mb-1 text-2xl font-bold text-white">Danh sách ứng viên</h1>
              <p className="text-purple-100">
                Tổng cộng <span className="font-semibold text-white">{pagination?.total || 0}</span>{' '}
                ứng viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
              <Download className="h-4 w-4" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng ứng viên</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xét duyệt</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ứng viên tiềm năng</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.topCandidates}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lịch phỏng vấn</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.scheduledInterviews}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, email ứng viên..."
                className="w-full rounded-lg border border-purple-100 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                showFilters
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['ALL', 'PENDING', 'REVIEWING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL'
                    ? 'Tất cả'
                    : status === 'PENDING'
                      ? 'Chờ duyệt'
                      : status === 'REVIEWING'
                        ? 'Xem xét'
                        : status === 'INTERVIEWING'
                          ? 'Phỏng vấn'
                          : status === 'OFFERED'
                            ? 'Đã offer'
                            : status === 'HIRED'
                              ? 'Đã tuyển'
                              : 'Từ chối'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Chưa có ứng viên</h3>
          <p className="mt-2 text-sm text-gray-600">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Không tìm thấy ứng viên phù hợp với bộ lọc'
              : 'Chưa có ứng viên nào ứng tuyển vào vị trí này'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application: ApplicationListItemAPI) => (
            <div
              key={application.id}
              className="shadow-soft rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Candidate Info */}
                <div className="flex flex-1 items-start gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {application.candidate.user.avatarUrl ? (
                      <img
                        src={application.candidate.user.avatarUrl}
                        alt={getCandidateName(application.candidate)}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                        {getCandidateName(application.candidate).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {application.matchScore && application.matchScore >= 80 && (
                      <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
                        <Award className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-gray-900">
                          {getCandidateName(application.candidate)}
                        </h3>
                        {application.candidate.currentPosition && (
                          <p className="flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4" />
                            {application.candidate.currentPosition}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    {/* Contact & Info */}
                    <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {application.candidate.user.email}
                      </div>
                      {application.candidate.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {application.candidate.user.phone}
                        </div>
                      )}
                      {application.candidate.experienceYears !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          {application.candidate.experienceYears} năm kinh nghiệm
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Ứng tuyển: {formatDate(application.appliedAt)}
                      </div>
                    </div>

                    {/* Skills */}
                    {application.candidate.skills && application.candidate.skills.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {application.candidate.skills
                          .slice(0, 5)
                          .map(
                            (
                              skillData: {
                                skill: { id: string; name: string };
                                proficiencyLevel: string;
                                yearsExperience?: number | null;
                              },
                              idx: number
                            ) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                              >
                                {skillData.skill.name}
                              </span>
                            )
                          )}
                        {application.candidate.skills.length > 5 && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            +{application.candidate.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Salary & Match Score */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Mức lương mong muốn:</span>
                        <span className="font-medium text-gray-900">
                          {formatSalary(
                            application.candidate.expectedSalaryMin,
                            application.candidate.expectedSalaryMax
                          )}
                        </span>
                      </div>
                      {application.matchScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Phù hợp:</span>
                          <span
                            className={`font-bold ${
                              application.matchScore >= 80
                                ? 'text-green-600'
                                : application.matchScore >= 60
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {application.matchScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-gray-600">Đánh giá:</span>
                      <RatingStars rating={application.rating} applicationId={application.id} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-2">
                  {application.cvFileUrl && (
                    <a
                      href={`/api/employer/applications/${application.id}/cv`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4" />
                      Xem CV
                    </a>
                  )}

                  {/* Quick Status Actions */}
                  {application.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusChange(application.id, 'REVIEWING')}
                      disabled={updateApplicationMutation.isPending}
                      className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4" />
                      Xem xét
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">
            Hiển thị{' '}
            <span className="font-medium text-gray-900">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            -
            <span className="font-medium text-gray-900">
              {' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            trong tổng số
            <span className="font-medium text-gray-900"> {pagination.total}</span> ứng viên
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1 || isLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                      pagination.page === pageNum
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages || isLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
