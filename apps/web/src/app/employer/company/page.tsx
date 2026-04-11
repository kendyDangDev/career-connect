'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Eye,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Users,
} from 'lucide-react';

import { MediaUploader } from '@/components/employer/company/MediaUploader';
import {
  VerificationStatusAlert,
  VerificationStatusBadge,
} from '@/components/employer/company/VerificationStatus';
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
  useUploadCompanyMedia,
} from '@/hooks/useCompany';
import { useIndustries } from '@/hooks/useIndustries';
import { getCompanySizeOptions } from '@/lib/utils/company-size';
import { UpdateCompanyData } from '@/types/company.types';

export default function CompanyPage() {
  const { data: profileData, isLoading, error } = useCompanyProfile();
  const { data: industriesData, isLoading: industriesLoading } = useIndustries({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const updateMutation = useUpdateCompanyProfile();
  const uploadMediaMutation = useUploadCompanyMedia();

  const [formData, setFormData] = useState<UpdateCompanyData>({
    companyName: '',
    description: '',
    industryId: null,
    companySize: '',
    foundedYear: '',
    websiteUrl: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    const company = profileData?.data.company;

    if (!company) {
      return;
    }

    setFormData({
      companyName: company.companyName || '',
      description: company.description || '',
      industryId: company.industry?.id || null,
      companySize: company.companySize || '',
      foundedYear: company.foundedYear?.toString() || '',
      websiteUrl: company.websiteUrl || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      city: company.city || '',
    });
  }, [profileData]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogoUpload = (file: File) => {
    uploadMediaMutation.mutate({ file, type: 'logo' });
  };

  const handleCoverUpload = (file: File) => {
    uploadMediaMutation.mutate({ file, type: 'cover' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Không thể tải thông tin</h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const company = profileData?.data.company;
  const stats = profileData?.data.stats;
  const isSaving = updateMutation.isPending;

  if (!company) {
    return null;
  }

  const quickStats = [
    {
      label: 'Công việc đang tuyển',
      value: stats?.activeJobs ?? 0,
      icon: Briefcase,
      iconClassName: 'bg-purple-100 text-purple-600',
      valueClassName: 'text-purple-600',
    },
    {
      label: 'Tổng ứng tuyển',
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      iconClassName: 'bg-blue-100 text-blue-600',
      valueClassName: 'text-blue-600',
    },
    {
      label: 'Lượt xem 30 ngày',
      value: stats?.profileViews ?? 0,
      icon: Eye,
      iconClassName: 'bg-cyan-100 text-cyan-600',
      valueClassName: 'text-cyan-600',
    },
    {
      label: 'Người theo dõi',
      value: stats?.followers ?? 0,
      icon: Users,
      iconClassName: 'bg-emerald-100 text-emerald-600',
      valueClassName: 'text-emerald-600',
    },
    {
      label: 'Thành viên team',
      value: stats?.teamMembers ?? 0,
      icon: Calendar,
      iconClassName: 'bg-orange-100 text-orange-600',
      valueClassName: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-white" />
            <div>
              <h1 className="mb-1 text-2xl font-bold text-white">{company.companyName}</h1>
              <p className="text-purple-100">{company.industry?.name ?? 'Chưa có ngành nghề'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <VerificationStatusBadge status={company.verificationStatus} />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      <VerificationStatusAlert
        status={company.verificationStatus}
        verificationNotes={company.verificationNotes}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(event) =>
                    setFormData({ ...formData, companyName: event.target.value })
                  }
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mô tả công ty <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({ ...formData, description: event.target.value })
                  }
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="Giới thiệu về công ty..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ngành nghề</label>
                  <select
                    value={formData.industryId ?? ''}
                    onChange={(event) =>
                      setFormData({ ...formData, industryId: event.target.value || null })
                    }
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                    disabled={industriesLoading}
                  >
                    <option value="">Chọn ngành nghề</option>
                    {industriesLoading ? (
                      <option disabled>Đang tải...</option>
                    ) : (
                      industriesData?.data.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Quy mô</label>
                  <select
                    value={formData.companySize}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        companySize: event.target.value as UpdateCompanyData['companySize'],
                      })
                    }
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">Chọn quy mô công ty</option>
                    {getCompanySizeOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Năm thành lập
                </label>
                <input
                  type="text"
                  value={formData.foundedYear}
                  onChange={(event) =>
                    setFormData({ ...formData, foundedYear: event.target.value })
                  }
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Thông tin liên hệ</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Globe className="mr-1 inline h-4 w-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(event) => setFormData({ ...formData, websiteUrl: event.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Mail className="mr-1 inline h-4 w-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Phone className="mr-1 inline h-4 w-4" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <MediaUploader
              type="logo"
              currentImage={company.logoUrl || ''}
              onUpload={handleLogoUpload}
              onRemove={() => {
                /* Intentionally blank until delete-media UX is implemented. */
              }}
            />
          </div>

          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <MediaUploader
              type="cover"
              currentImage={company.coverImageUrl || ''}
              onUpload={handleCoverUpload}
              onRemove={() => {
                /* Intentionally blank until delete-media UX is implemented. */
              }}
            />
          </div>

          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Thống kê</h3>

            <div className="space-y-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconClassName}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${stat.valueClassName}`}>{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
