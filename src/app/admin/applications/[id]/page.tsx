'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  DocumentTextIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApplicationDetail } from '../../../../hooks/useApplicationDetail';
import { ApplicationStatus } from '@/generated/prisma';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApplicationMutations } from '@/hooks/useApplicationManagement';

const ApplicationDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.id as string;

  const { updateApplicationStatus, loading: updateLoading } = useApplicationMutations();

  const {
    data: applicationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useApplicationDetail(applicationId);

  const application = applicationData;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatDatetime = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getInitials = (
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ) => {
    const first = firstName || 'U';
    const last = lastName || 'N';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const formatSalary = (min?: number | null, max?: number | null, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('vi-VN').format(num);
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    } else if (min) {
      return `Từ ${formatNumber(min)} ${currency}`;
    } else if (max) {
      return `Tối đa ${formatNumber(max)} ${currency}`;
    }

    return 'Thỏa thuận';
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      APPLIED: { label: 'Đã ứng tuyển', color: 'bg-blue-100 text-blue-800' },
      SCREENING: { label: 'Sàng lọc', color: 'bg-yellow-100 text-yellow-800' },
      INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-800' },
      OFFERED: { label: 'Đã offer', color: 'bg-green-100 text-green-800' },
      HIRED: { label: 'Đã tuyển', color: 'bg-emerald-100 text-emerald-800' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
      WITHDRAWN: { label: 'Đã rút', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.APPLIED;
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (!application) return;

    try {
      await updateApplicationStatus({
        applicationId: application.id,
        status: newStatus,
        reason: `Status updated from candidate detail page`,
      });
      await refetch();
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <span className="ml-2 text-gray-600">Đang tải thông tin ứng viên...</span>
        </div>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <div className="text-red-500">
            <p className="mb-2 text-lg font-medium">Có lỗi xảy ra</p>
            <p className="text-sm">{error?.message || 'Không thể tải thông tin ứng viên'}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Application Data:', application);

  const candidate = application?.candidate;
  const job = application?.job;
  const user = candidate?.user;

  if (!candidate || !job || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <div className="text-red-500">
            <p className="mb-2 text-lg font-medium">Dữ liệu không đầy đủ</p>
            <p className="text-sm">Không thể tải thông tin ứng viên</p>
            <Button onClick={() => refetch()} className="mt-4">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log({ candidate, job, user });

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin ứng viên</h1>
            <p className="text-gray-600">
              Ứng tuyển vào vị trí: <span className="font-medium">{job.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(application.status)}
          <Select
            value={application.status}
            onValueChange={(newStatus: ApplicationStatus) => handleStatusUpdate(newStatus)}
            disabled={updateLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPLIED">Đã ứng tuyển</SelectItem>
              <SelectItem value="SCREENING">Sàng lọc</SelectItem>
              <SelectItem value="INTERVIEWING">Phỏng vấn</SelectItem>
              <SelectItem value="OFFERED">Đã offer</SelectItem>
              <SelectItem value="HIRED">Đã tuyển</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Candidate Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl || ''} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName || 'N/A'} {user.lastName || ''}
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="mr-3 h-5 w-5" />
                      <span>{user.email || 'N/A'}</span>
                    </div>

                    {user.phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="mr-3 h-5 w-5" />
                        <span>{user.phone}</span>
                      </div>
                    )}

                    {user.profile?.address && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="mr-3 h-5 w-5" />
                        <span>
                          {user.profile.address}
                          {user.profile.city && `, ${user.profile.city}`}
                          {user.profile.province && `, ${user.profile.province}`}
                        </span>
                      </div>
                    )}

                    {user.profile?.dateOfBirth && (
                      <div className="flex items-center text-gray-600">
                        <CalendarDaysIcon className="mr-3 h-5 w-5" />
                        <span>Sinh năm: {new Date(user.profile.dateOfBirth).getFullYear()}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {user.profile?.bio && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900">Giới thiệu</h3>
                      <p className="mt-2 text-gray-600">{user.profile.bio}</p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {user.profile?.linkedinUrl && (
                      <a
                        href={user.profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <LinkIcon className="mr-1 h-4 w-4" />
                        LinkedIn
                      </a>
                    )}

                    {user.profile?.githubUrl && (
                      <a
                        href={user.profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-gray-900"
                      >
                        <LinkIcon className="mr-1 h-4 w-4" />
                        GitHub
                      </a>
                    )}

                    {user.profile?.portfolioUrl && (
                      <a
                        href={user.profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-600 hover:text-purple-800"
                      >
                        <LinkIcon className="mr-1 h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BriefcaseIcon className="mr-2 h-5 w-5" />
                Kinh nghiệm làm việc ({candidate?.experienceYears || 0} năm)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.experience?.length > 0 ? (
                <div className="space-y-6">
                  {candidate?.experience.map((exp: any, index: number) => (
                    <div key={exp.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {exp.positionTitle || 'N/A'}
                            {exp.isCurrent && (
                              <Badge variant="secondary" className="ml-2">
                                Hiện tại
                              </Badge>
                            )}
                          </h3>
                          <p className="font-medium text-blue-600">{exp.companyName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(exp.startDate)} -{' '}
                            {exp.endDate ? formatDate(exp.endDate) : 'Hiện tại'}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {exp.employmentType?.toLowerCase().replace('_', ' ') || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {exp.description && <p className="mt-3 text-gray-600">{exp.description}</p>}

                      {exp.achievements && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-900">Thành tựu:</h4>
                          <p className="mt-1 text-gray-600">{exp.achievements}</p>
                        </div>
                      )}

                      {index < candidate?.experience?.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có thông tin kinh nghiệm làm việc</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AcademicCapIcon className="mr-2 h-5 w-5" />
                Học vấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.education?.length > 0 ? (
                <div className="space-y-6">
                  {candidate?.education?.map((edu: any, index: number) => (
                    <div key={edu.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {edu.degreeType || 'N/A'} - {edu.fieldOfStudy || 'N/A'}
                          </h3>
                          <p className="font-medium text-blue-600">
                            {edu.institutionName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(edu.startDate)} -{' '}
                            {edu.endDate ? formatDate(edu.endDate) : 'Đang học'}
                          </p>
                          {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                      </div>

                      {edu.description && <p className="mt-3 text-gray-600">{edu.description}</p>}

                      {index < candidate?.education?.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có thông tin học vấn</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <StarIcon className="mr-2 h-5 w-5" />
                Kỹ năng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.skills?.length > 0 ? (
                <div className="space-y-4">
                  {['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'].map((level) => {
                    const skillsAtLevel = candidate?.skills?.filter(
                      (s: any) => s.proficiencyLevel === level
                    );
                    if (skillsAtLevel.length === 0) return null;

                    return (
                      <div key={level}>
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                          {level === 'EXPERT'
                            ? 'Chuyên gia'
                            : level === 'ADVANCED'
                              ? 'Nâng cao'
                              : level === 'INTERMEDIATE'
                                ? 'Trung bình'
                                : 'Cơ bản'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsAtLevel.map((skill: any) => (
                            <Badge key={skill.skill.id} variant="secondary" className="text-sm">
                              {skill.skill.name}
                              {skill.yearsExperience && ` (${skill.yearsExperience} năm)`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có thông tin kỹ năng</p>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {candidate?.certifications?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="mr-2 h-5 w-5" />
                  Chứng chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidate.certifications.map((cert: any, index: number) => (
                    <div key={cert.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {cert.certificationName || 'N/A'}
                          </h3>
                          <p className="font-medium text-blue-600">
                            {cert.issuingOrganization || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cấp: {formatDate(cert.issueDate)}
                            {cert.expiryDate && ` - Hết hạn: ${formatDate(cert.expiryDate)}`}
                          </p>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <LinkIcon className="mr-1 h-3 w-3" />
                              Xem chứng chỉ
                            </a>
                          )}
                        </div>
                      </div>
                      {index < candidate.certifications.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Application Info & CVs */}
        <div className="space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin ứng tuyển</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Thời gian ứng tuyển</h4>
                <p className="text-gray-600">{formatDatetime(application.appliedAt)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Mức lương mong muốn</h4>
                <p className="text-gray-600">
                  {formatSalary(
                    candidate?.expectedSalaryMin,
                    candidate?.expectedSalaryMax,
                    candidate?.currency || 'VND'
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Tình trạng</h4>
                <p className="text-gray-600">
                  {candidate?.availabilityStatus === 'AVAILABLE'
                    ? 'Sẵn sàng làm việc'
                    : candidate?.availabilityStatus === 'EMPLOYED'
                      ? 'Đang có việc làm'
                      : candidate?.availabilityStatus === 'NOT_AVAILABLE'
                        ? 'Chưa sẵn sàng'
                        : 'Không xác định'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Hình thức làm việc mong muốn</h4>
                <p className="text-gray-600">
                  {candidate?.preferredWorkType === 'FULL_TIME'
                    ? 'Toàn thời gian'
                    : candidate?.preferredWorkType === 'PART_TIME'
                      ? 'Bán thời gian'
                      : candidate?.preferredWorkType === 'CONTRACT'
                        ? 'Hợp đồng'
                        : candidate?.preferredWorkType === 'FREELANCE'
                          ? 'Tự do'
                          : 'Không xác định'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Địa điểm làm việc</h4>
                <p className="text-gray-600">
                  {candidate?.preferredLocationType === 'ONSITE'
                    ? 'Tại văn phòng'
                    : candidate?.preferredLocationType === 'REMOTE'
                      ? 'Từ xa'
                      : candidate?.preferredLocationType === 'HYBRID'
                        ? 'Kết hợp'
                        : 'Không xác định'}
                </p>
              </div>

              {application.interviewScheduledAt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Lịch phỏng vấn</h4>
                  <p className="text-purple-600">
                    {formatDatetime(application.interviewScheduledAt)}
                  </p>
                </div>
              )}

              {application.rating && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Đánh giá</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-500">{'⭐'.repeat(application.rating)}</span>
                    <span className="ml-2 text-gray-600">({application.rating}/5)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Thư xin việc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-600">{application.coverLetter}</p>
              </CardContent>
            </Card>
          )}

          {/* CVs */}
          <Card>
            <CardHeader>
              <CardTitle>CV đã tải lên</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.cvs?.length > 0 ? (
                <div className="space-y-3">
                  {candidate.cvs.map((cv: any) => (
                    <div
                      key={cv.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center">
                        <DocumentTextIcon className="mr-3 h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {cv.cvName || 'CV'}
                            {cv.isPrimary && (
                              <Badge variant="secondary" className="ml-2">
                                Chính
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tải lên: {formatDate(cv.uploadedAt)} • Lượt xem: {cv.viewCount || 0}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cv.fileUrl, '_blank')}
                      >
                        Xem CV
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có CV nào được tải lên</p>
              )}
            </CardContent>
          </Card>

          {/* Recruiter Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú của HR</CardTitle>
            </CardHeader>
            <CardContent>
              {application.recruiterNotes ? (
                <p className="whitespace-pre-wrap text-gray-600">{application.recruiterNotes}</p>
              ) : (
                <p className="text-gray-500">Chưa có ghi chú nào</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
