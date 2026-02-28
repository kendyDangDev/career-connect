'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Users,
  Globe,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { MediaUploader } from '@/components/employer/company/MediaUploader';
import {
  VerificationStatusBadge,
  VerificationStatusAlert,
} from '@/components/employer/company/VerificationStatus';
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
  useUploadCompanyMedia,
} from '@/hooks/useCompany';
import { UpdateCompanyData, CompanyProfile } from '@/types/company.types';
import { CompanySize } from '@/generated/prisma';
import { getCompanySizeOptions } from '@/lib/utils/company-size';
import { useIndustries } from '@/hooks/useIndustries';

export default function CompanyPage() {
  // Fetch company profile
  const { data: profileData, isLoading, error } = useCompanyProfile();

  // Fetch industries
  const { data: industriesData, isLoading: industriesLoading } = useIndustries({
    page: 1,
    limit: 100,
    isActive: true,
  });

  // Mutations
  const updateMutation = useUpdateCompanyProfile();
  const uploadMediaMutation = useUploadCompanyMedia();

  // Local state for form
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

  // Initialize form data when company profile loads
  useEffect(() => {
    if (profileData?.data.company) {
      const company = profileData.data.company;
      setFormData({
        companyName: company.companyName || '',
        description: company.description || '',
        industryId: company.industry?.id || null,
        companySize: company.companySize || '',
        foundedYear: company.foundedYear || '',
        websiteUrl: company.websiteUrl || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
      });
    }
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

  const handleGalleryUpload = (file: File) => {
    uploadMediaMutation.mutate({ file, type: 'gallery' });
  };

  const handleRequestVerification = () => {
    // TODO: Implement verification request
    console.log('Request verification');
  };

  const handleResendVerificationRequest = () => {
    // TODO: Implement resend verification request
    console.log('Resend verification request');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Đang tải thông tin công ty...</p>
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

  const company = profileData?.data.company as CompanyProfile | undefined;
  const stats = profileData?.data.stats;
  const isSaving = updateMutation.isPending;
  const isUploading = uploadMediaMutation.isPending;

  if (!company) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
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
            {/* Verification Status Badge */}
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

      {/* Verification Status Alert */}
      <VerificationStatusAlert
        status={company.verificationStatus}
        onRequestVerification={handleRequestVerification}
        onResendRequest={handleResendVerificationRequest}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
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
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="Giới thiệu về công ty..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ngành nghề</label>
                  <select
                    value={formData.industryId ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, industryId: e.target.value || null })
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
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
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
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>

          {/* Gallery */}
          {/* <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thư viện ảnh</h2>
                <p className="mt-1 text-sm text-gray-500">Thêm ảnh về văn phòng, team, sự kiện</p>
              </div>
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MediaUploader type="gallery" onUpload={handleGalleryUpload} />
            </div>
          </div> */}
        </div>

        {/* Sidebar - Media & Stats */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <MediaUploader
              type="logo"
              currentImage={company.logoUrl || ''}
              onUpload={handleLogoUpload}
              onRemove={() => {
                /* Handle logo removal */
              }}
            />
          </div>

          {/* Cover */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <MediaUploader
              type="cover"
              currentImage={company.coverImageUrl || ''}
              onUpload={handleCoverUpload}
              onRemove={() => {
                /* Handle cover removal */
              }}
            />
          </div>

          {/* Quick Stats */}
          <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Thống kê</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Công việc đang tuyển</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats?.activeJobs || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Lượt xem công ty</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats?.profileViews || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Thành viên team</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.teamMembers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
