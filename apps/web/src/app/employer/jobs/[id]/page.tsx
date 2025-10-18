'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Eye,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreVertical,
  Play,
  Pause,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useJobDetail, useUpdateJobStatus, useDeleteJob, useDuplicateJob } from '@/hooks/useJob';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [showActions, setShowActions] = useState(false);

  // Fetch job detail
  const { data: jobData, isLoading, error } = useJobDetail(id);

  // Mutations
  const updateStatusMutation = useUpdateJobStatus(id);
  const deleteMutation = useDeleteJob();
  const duplicateMutation = useDuplicateJob();

  // Handle status change
  const handleStatusChange = (status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'REJECTED') => {
    if (confirm(`Bạn có chắc chắn muốn ${getStatusAction(status)} tin tuyển dụng này?`)) {
      updateStatusMutation.mutate(status);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (
      confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác!')
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    duplicateMutation.mutate(id);
  };

  // Get status action text
  const getStatusAction = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'kích hoạt';
      case 'CLOSED':
        return 'đóng';
      case 'PENDING':
        return 'chuyển sang chờ duyệt';
      case 'REJECTED':
        return 'từ chối';
      default:
        return 'cập nhật';
    }
  };

  // Format salary
  const formatSalary = () => {
    if (!job) return '';
    if (job.salaryNegotiable) return 'Thỏa thuận';
    if (!job.salaryMin && !job.salaryMax) return 'Không công bố';

    const min = job.salaryMin ? (job.salaryMin / 1000000).toFixed(0) : '';
    const max = job.salaryMax ? (job.salaryMax / 1000000).toFixed(0) : '';

    if (min && max) return `${min} - ${max} triệu ${job.currency}`;
    if (min) return `Từ ${min} triệu ${job.currency}`;
    if (max) return `Tới ${max} triệu ${job.currency}`;
    return '';
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không giới hạn';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  // Calculate days left
  const calculateDaysLeft = () => {
    if (!job?.applicationDeadline) return null;
    const deadline = new Date(job.applicationDeadline);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải thông tin công việc...</p>
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
          <h2 className="mb-2 text-xl font-bold text-gray-900">Không thể tải thông tin</h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const job = jobData?.data;
  if (!job) return null;

  const daysLeft = calculateDaysLeft();

  // Status badge component
  const StatusBadge = () => {
    const configs = {
      ACTIVE: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle2,
        label: 'Đang hoạt động',
      },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Chờ duyệt' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Đã đóng' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Bị từ chối' },
    };

    const config = configs[job.status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 rounded-lg ${config.bg} px-3 py-2`}>
        <Icon className={`h-4 w-4 ${config.text}`} />
        <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-4">
            <Link
              href="/employer/jobs"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex-1">
              <div className="mb-2 flex items-start gap-3">
                <Briefcase className="mt-1 h-8 w-8 shrink-0 text-white" />
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-white">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-purple-100">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">{job.company.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{job.locationCity || job.locationProvince}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">{formatSalary()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge />

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {showActions && (
                <div className="absolute top-12 right-0 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-1">
                    <Link
                      href={`/employer/jobs/${id}/edit`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </Link>

                    {job.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          handleStatusChange('CLOSED');
                          setShowActions(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pause className="h-4 w-4" />
                        Đóng tin
                      </button>
                    )}

                    {job.status === 'CLOSED' && (
                      <button
                        onClick={() => {
                          handleStatusChange('ACTIVE');
                          setShowActions(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Play className="h-4 w-4" />
                        Kích hoạt lại
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleDuplicate();
                        setShowActions(false);
                      }}
                      disabled={duplicateMutation.isPending}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                      Sao chép
                    </button>

                    <hr className="my-1 border-gray-200" />

                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa tin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deadline Warning */}
      {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && job.status === 'ACTIVE' && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <h3 className="font-semibold text-orange-900">Sắp hết hạn ứng tuyển</h3>
            <p className="mt-1 text-sm text-orange-700">
              Còn {daysLeft} ngày nữa là hết hạn nộp hồ sơ. Cân nhắc gia hạn nếu cần thêm ứng viên.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lượt xem</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{job.viewCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ứng viên</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{job._count.applications}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lưu tin</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{job._count.savedJobs}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="shadow-soft rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hạn nộp</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} ngày` : 'Đã hết hạn'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Description */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Mô tả công việc</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Yêu cầu công việc</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {job.requirements}
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Quyền lợi</h2>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {job.benefits}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Thông tin chung</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Loại hình</p>
                  <p className="text-sm font-medium text-gray-900">{job.jobType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Kinh nghiệm</p>
                  <p className="text-sm font-medium text-gray-900">{job.experienceLevel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Hình thức làm việc</p>
                  <p className="text-sm font-medium text-gray-900">{job.workLocationType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Hạn nộp hồ sơ</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(job.applicationDeadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày đăng</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(job.publishedAt || job.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Hành động nhanh</h3>

            <div className="space-y-2">
              <Link
                href={`/employer/jobs/${id}/applications`}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700"
              >
                <FileText className="h-4 w-4" />
                Xem danh sách ứng viên
              </Link>

              <Link
                href={`/employer/jobs/${id}/edit`}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa tin tuyển dụng
              </Link>
            </div>
          </div>

          {/* Created By */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Người đăng</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                {/* {job.createdBy.recruiterId.charAt(0).toUpperCase()} */}
                Tên người tạo công việc
              </div>
              <div>
                {/* <p className="text-sm font-medium text-gray-900">{job.createdBy.fullName}</p> */}
                {/* <p className="text-xs text-gray-500">{job.createdBy.email}</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
