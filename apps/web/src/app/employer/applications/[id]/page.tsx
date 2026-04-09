'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Star,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  MessageSquare,
  History,
  Eye,
} from 'lucide-react';
import { useApplicationDetail, useUpdateApplication } from '@/hooks/useJob';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ApplicationDetailAPI, UpdateApplicationData } from '@/types/job.types';
import type { ApplicationStatus } from '@/generated/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id: applicationId } = use(params);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [interviewDateTime, setInterviewDateTime] = useState('');

  // Fetch application detail
  const { data: applicationData, isLoading, error } = useApplicationDetail(applicationId);

  // Get jobId from application data
  const jobId = applicationData?.data?.jobId || '';

  // Mutation
  const updateApplicationMutation = useUpdateApplication(jobId);

  // Handle status change
  const handleStatusChange = (status: ApplicationStatus) => {
    if (confirm(`Bạn có chắc chắn muốn chuyển trạng thái ứng viên này?`)) {
      updateApplicationMutation.mutate({
        applicationId,
        data: { status },
      });
    }
  };

  // Handle rating - Đánh giá ứng viên từ 1-5 sao
  const handleRating = (rating: number) => {
    // Validate rating range
    if (rating < 1 || rating > 5) {
      console.error('Rating must be between 1 and 5');
      return;
    }

    // Show confirmation for rating
    const ratingLabels: Record<number, string> = {
      1: 'Không phù hợp',
      2: 'Dưới mong đợi',
      3: 'Đạt yêu cầu',
      4: 'Tốt',
      5: 'Xuất sắc',
    };

    const confirmMessage = `Bạn muốn đánh giá ứng viên ${rating} sao (${ratingLabels[rating]})?`;

    if (confirm(confirmMessage)) {
      updateApplicationMutation.mutate(
        {
          applicationId,
          data: { rating },
        },
        {
          onSuccess: () => {
            console.log(`Successfully rated application ${applicationId} with ${rating} stars`);
          },
          onError: (error) => {
            console.error('Failed to update rating:', error);
          },
        }
      );
    }
  };

  // Handle save notes
  const handleSaveNotes = () => {
    if (!notes.trim()) return;
    updateApplicationMutation.mutate({
      applicationId,
      data: { notes },
    });
    setShowNotesInput(false);
    setNotes('');
  };

  // Handle schedule interview
  const handleScheduleInterview = () => {
    if (!interviewDateTime) {
      alert('Vui lòng chọn ngày giờ phỏng vấn');
      return;
    }

    const confirmMessage = `Bạn muốn lên lịch phỏng vấn vào ${format(
      new Date(interviewDateTime),
      "dd/MM/yyyy 'lúc' HH:mm",
      { locale: vi }
    )}?`;

    if (confirm(confirmMessage)) {
      updateApplicationMutation.mutate(
        {
          applicationId,
          data: {
            interviewScheduledAt: interviewDateTime,
            notifyCandidate: true, // Notify candidate about interview
          },
        },
        {
          onSuccess: () => {
            setShowInterviewScheduler(false);
            setInterviewDateTime('');
          },
        }
      );
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  // Get candidate full name
  const getCandidateName = (candidate: ApplicationDetailAPI['candidate']) => {
    const { firstName, lastName } = candidate.user;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return candidate.user.email.split('@')[0];
  };

  // Format salary
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)} triệu VND`;
    if (min) return `Từ ${(min / 1000000).toFixed(0)} triệu VND`;
    if (max) return `Đến ${(max / 1000000).toFixed(0)} triệu VND`;
    return 'Thỏa thuận';
  };

  // Calculate experience duration
  const calculateDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) return `${years} năm ${remainingMonths} tháng`;
    if (years > 0) return `${years} năm`;
    return `${remainingMonths} tháng`;
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      APPLIED: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'Chờ xét duyệt',
      },
      SCREENING: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: FileText,
        label: 'Đang xem xét',
      },
      INTERVIEWING: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: MessageSquare,
        label: 'Phỏng vấn',
      },
      OFFERED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle2,
        label: 'Đã offer',
      },
      HIRED: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle2,
        label: 'Đã tuyển',
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Từ chối',
      },
      WITHDRAWN: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: XCircle,
        label: 'Đã rút',
      },
    };

    const config = configs[status] || configs.APPLIED;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 rounded-lg ${config.bg} px-4 py-2`}>
        <Icon className={`h-5 w-5 ${config.text}`} />
        <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
      </div>
    );
  };

  // Rating stars - Component đánh giá ứng viên
  const RatingStars = ({ rating }: { rating?: number | null }) => {
    const currentRating = rating || 0;
    const [hoverRating, setHoverRating] = useState(0);

    const ratingLabels: Record<number, string> = {
      1: 'Không phù hợp',
      2: 'Dưới mong đợi',
      3: 'Đạt yêu cầu',
      4: 'Tốt',
      5: 'Xuất sắc',
    };

    const displayRating = hoverRating || currentRating;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={updateApplicationMutation.isPending}
              className="group relative transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              title={ratingLabels[star]}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 group-hover:text-gray-400'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-gray-700">
            {currentRating > 0 ? `${currentRating}/5` : 'Chưa đánh giá'}
          </span>
        </div>

        {/* Display rating label */}
        {displayRating > 0 && (
          <p className="text-xs text-gray-500 italic">{ratingLabels[displayRating]}</p>
        )}

        {/* Loading indicator */}
        {updateApplicationMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Đang cập nhật...</span>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải thông tin ứng viên...</p>
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
            href={`/employer/jobs/${applicationData?.data?.jobId}/applications`}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const application = applicationData?.data;
  if (!application) return null;

  const candidate = application.candidate;
  const candidateName = getCandidateName(candidate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-4">
            <Link
              href={`/employer/jobs/${application.jobId}/applications`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-white">Thông tin ứng viên</h1>
              <div className="flex flex-wrap items-center gap-3 text-purple-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">{application.job.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Ứng tuyển: {formatDate(application.appliedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Candidate Profile */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              {candidate.user.avatarUrl ? (
                <img
                  src={candidate.user.avatarUrl}
                  alt={candidateName}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">{candidateName}</h2>
                {candidate.currentPosition && (
                  <p className="mb-3 text-lg text-gray-700">{candidate.currentPosition}</p>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {candidate.user.email}
                  </div>
                  {candidate.user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {candidate.user.phone}
                    </div>
                  )}
                  {candidate.user.profile?.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {candidate.user.profile.city}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-4 flex items-center gap-3">
                  {candidate.user.profile?.linkedinUrl && (
                    <a
                      href={candidate.user.profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {candidate.user.profile?.githubUrl && (
                    <a
                      href={candidate.user.profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {candidate.user.profile?.portfolioUrl && (
                    <a
                      href={candidate.user.profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-all hover:bg-purple-100"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {candidate.user.profile?.bio && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Giới thiệu</h3>
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {candidate.user.profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Thư xin việc</h3>
              <p className="text-sm whitespace-pre-wrap text-gray-700">{application.coverLetter}</p>
            </div>
          )}

          {/* Work Experience */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Kinh nghiệm làm việc</h3>
              </div>

              <div className="space-y-6">
                {candidate.experience.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="relative pl-8 before:absolute before:top-2 before:left-0 before:h-full before:w-0.5 before:bg-gray-200 last:before:hidden"
                  >
                    <div className="absolute top-2 left-0 h-3 w-3 -translate-x-1/2 rounded-full bg-purple-600 ring-4 ring-white" />

                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{exp.positionTitle}</h4>
                      <p className="mb-1 text-sm text-gray-600">{exp.companyName}</p>
                      <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDate(exp.startDate)} -{' '}
                          {exp.isCurrent ? 'Hiện tại' : formatDate(exp.endDate)}
                        </span>
                        <span>
                          ({calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)})
                        </span>
                        <span className="capitalize">{exp.employmentType}</span>
                      </div>
                      {exp.description && (
                        <p className="text-sm whitespace-pre-wrap text-gray-700">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Học vấn</h3>
              </div>

              <div className="space-y-4">
                {candidate.education.map((edu: any) => (
                  <div key={edu.id} className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{edu.institutionName}</h4>
                      <p className="text-sm text-gray-700">
                        {edu.degreeType} - {edu.fieldOfStudy}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDate(edu.startDate)} -{' '}
                          {edu.endDate ? formatDate(edu.endDate) : 'Hiện tại'}
                        </span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Kỹ năng</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {candidate.skills.map((skillData: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{skillData.skill.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {skillData.proficiencyLevel}
                      </p>
                    </div>
                    {skillData.yearsExperience && (
                      <span className="text-xs text-gray-600">{skillData.yearsExperience} năm</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Thông tin nhanh</h3>

            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-gray-500">Kinh nghiệm</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.experienceYears ? `${candidate.experienceYears} năm` : 'Chưa cập nhật'}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500">Mức lương mong muốn</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatSalary(candidate.expectedSalaryMin, candidate.expectedSalaryMax)}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500">Trạng thái</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {candidate.availabilityStatus}
                </p>
              </div>

              {candidate.preferredWorkType && (
                <div>
                  <p className="mb-1 text-xs text-gray-500">Loại hình mong muốn</p>
                  <p className="text-sm font-medium text-gray-900">{candidate.preferredWorkType}</p>
                </div>
              )}

              {application.interviewScheduledAt && (
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs text-purple-700">
                    <Calendar className="h-3.5 w-3.5" />
                    Lịch phỏng vấn
                  </p>
                  <p className="text-sm font-semibold text-purple-900">
                    {formatDateTime(application.interviewScheduledAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Hành động</h3>

            <div className="space-y-2">
              {application.status === 'APPLIED' && (
                <button
                  onClick={() => handleStatusChange('SCREENING')}
                  disabled={updateApplicationMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  Bắt đầu xem xét
                </button>
              )}

              {application.status === 'SCREENING' && (
                <>
                  <button
                    onClick={() => handleStatusChange('INTERVIEWING')}
                    disabled={updateApplicationMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700 disabled:opacity-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Mời phỏng vấn
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={updateApplicationMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                </>
              )}

              {application.status === 'INTERVIEWING' && (
                <>
                  <button
                    onClick={() => handleStatusChange('OFFERED')}
                    disabled={updateApplicationMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Gửi offer
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={updateApplicationMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                </>
              )}

              {application.status === 'OFFERED' && (
                <button
                  onClick={() => handleStatusChange('HIRED')}
                  disabled={updateApplicationMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Xác nhận tuyển dụng
                </button>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Đánh giá</h3>
            <RatingStars rating={application.rating} />
          </div>

          {/* Interview Schedule */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Lịch phỏng vấn</h3>

            {application.interviewScheduledAt && (
              <div className="mb-4 rounded-lg bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(application.interviewScheduledAt)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Đã lên lịch phỏng vấn</p>
                  </div>
                </div>
              </div>
            )}

            {!showInterviewScheduler ? (
              <button
                onClick={() => setShowInterviewScheduler(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-purple-700 transition-colors hover:border-purple-400 hover:bg-purple-100"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {application.interviewScheduledAt ? 'Thay đổi lịch' : 'Lên lịch phỏng vấn'}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Chọn ngày & giờ phỏng vấn
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDateTime}
                    onChange={(e) => setInterviewDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScheduleInterview}
                    disabled={!interviewDateTime || updateApplicationMutation.isPending}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updateApplicationMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      'Xác nhận'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowInterviewScheduler(false);
                      setInterviewDateTime('');
                    }}
                    disabled={updateApplicationMutation.isPending}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CV Download */}
          {application.cvFileUrl && (
            <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Hồ sơ</h3>
              <a
                href={`/api/employer/applications/${applicationId}/cv`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700"
              >
                <Eye className="h-4 w-4" />
                Xem CV ứng viên
              </a>
            </div>
          )}

          {/* Notes */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Ghi chú</h3>

            {application.recruiterNotes && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {application.recruiterNotes}
                </p>
              </div>
            )}

            {!showNotesInput ? (
              <button
                onClick={() => setShowNotesInput(true)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                {application.recruiterNotes ? 'Cập nhật ghi chú' : 'Thêm ghi chú'}
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Nhập ghi chú về ứng viên..."
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={!notes.trim() || updateApplicationMutation.isPending}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700 disabled:opacity-50"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setShowNotesInput(false);
                      setNotes('');
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
