'use client';

import { useState } from 'react';
import { Building2, Save, CheckCircle, AlertCircle, Users, Globe, MapPin, Calendar, Mail, Phone, Image as ImageIcon, X } from 'lucide-react';
import { MediaUploader } from '@/components/employer/company/MediaUploader';

export default function CompanyPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: 'Tech Innovation Corp',
    description: 'Chúng tôi là công ty công nghệ hàng đầu chuyên về phát triển phần mềm và AI',
    industry: 'Công nghệ thông tin',
    size: '100-500 nhân viên',
    founded: '2015',
    website: 'https://techinnovation.com',
    email: 'contact@techinnovation.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    logo: '/placeholder-logo.png',
    coverImage: '/placeholder-cover.png',
    galleryImages: ['/placeholder-1.png', '/placeholder-2.png', '/placeholder-3.png'],
    verified: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Đã lưu thông tin công ty!');
    }, 1500);
  };

  const handleLogoUpload = (file: File) => {
    console.log('Logo uploaded:', file);
    // TODO: Upload to server
  };

  const handleCoverUpload = (file: File) => {
    console.log('Cover uploaded:', file);
    // TODO: Upload to server
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Quản lý công ty</h1>
              <p className="text-purple-100">Cập nhật thông tin và hình ảnh công ty</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {companyData.verified && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/20 backdrop-blur-sm px-4 py-2 border border-green-400">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium text-white">Đã xác minh</span>
              </div>
            )}
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

      {/* Verification Status */}
      {!companyData.verified && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">Công ty chưa được xác minh</h3>
              <p className="text-sm text-orange-700 mb-3">
                Hãy hoàn thiện thông tin và gửi yêu cầu xác minh để tăng độ tin cậy với ứng viên
              </p>
              <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg">
                Gửi yêu cầu xác minh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mô tả công ty <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="Giới thiệu về công ty..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ngành nghề</label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  >
                    <option>Công nghệ thông tin</option>
                    <option>Tài chính - Ngân hàng</option>
                    <option>Y tế</option>
                    <option>Giáo dục</option>
                    <option>Bất động sản</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Quy mô</label>
                  <select
                    value={companyData.size}
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  >
                    <option>1-50 nhân viên</option>
                    <option>50-100 nhân viên</option>
                    <option>100-500 nhân viên</option>
                    <option>500-1000 nhân viên</option>
                    <option>1000+ nhân viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Năm thành lập</label>
                <input
                  type="text"
                  value={companyData.founded}
                  onChange={(e) => setCompanyData({ ...companyData, founded: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thư viện ảnh</h2>
                <p className="text-sm text-gray-500 mt-1">Thêm ảnh về văn phòng, team, sự kiện</p>
              </div>
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {companyData.galleryImages.map((img, index) => (
                <div key={index} className="group relative aspect-video">
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <MediaUploader
                type="gallery"
                onUpload={(file) => console.log('Gallery image:', file)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Media & Stats */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <MediaUploader
              type="logo"
              currentImage={companyData.logo}
              onUpload={handleLogoUpload}
              onRemove={() => setCompanyData({ ...companyData, logo: '' })}
            />
          </div>

          {/* Cover */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <MediaUploader
              type="cover"
              currentImage={companyData.coverImage}
              onUpload={handleCoverUpload}
              onRemove={() => setCompanyData({ ...companyData, coverImage: '' })}
            />
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Thống kê</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Công việc đang tuyển</span>
                </div>
                <span className="text-lg font-bold text-purple-600">8</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Lượt xem công ty</span>
                </div>
                <span className="text-lg font-bold text-blue-600">2.4K</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Thành viên team</span>
                </div>
                <span className="text-lg font-bold text-green-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
