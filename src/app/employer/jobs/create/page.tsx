'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Briefcase,
  Save,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { AdminJobService } from '@/services/admin/job.service';
import type { CreateJobDTO } from '@/types/employer/job';
import Link from 'next/link';

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateJobDTO>({
    slug: '',
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    jobType: 'FULL_TIME',
    workLocationType: 'ONSITE',
    experienceLevel: 'MID',
    salaryMin: undefined,
    salaryMax: undefined,
    currency: 'VND',
    salaryNegotiable: false,
    address: '',
    locationProvince: '',
    locationCountry: 'Việt Nam',
    applicationDeadline: '',
    skills: [],
    categories: [],
    featured: false,
    urgent: false,
  });

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.title || formData.title.length < 10) {
      setError('Tiêu đề công việc phải có ít nhất 10 ký tự');
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.length < 50) {
      setError('Mô tả công việc phải có ít nhất 50 ký tự');
      setLoading(false);
      return;
    }

    if (!formData.requirements || formData.requirements.length < 50) {
      setError('Yêu cầu công việc phải có ít nhất 50 ký tự');
      setLoading(false);
      return;
    }

    try {
      // Get companyId from session
      if (!session?.user?.companyId) {
        setError('Không tìm thấy thông tin công ty. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const jobData: CreateJobDTO = {
        ...formData,
        companyId: session.user.companyId,
        salaryMin: formData.salaryNegotiable ? undefined : formData.salaryMin,
        salaryMax: formData.salaryNegotiable ? undefined : formData.salaryMax,
        // Convert date to ISO datetime format if provided
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : undefined,
      };

      const result = await AdminJobService.createJob(jobData);

      setSuccess(true);

      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        router.push(`/employer/jobs`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.message || 'Không thể tạo công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      router.push('/employer/jobs');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/employer/jobs"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-white" />
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white">Đăng tin tuyển dụng mới</h1>
                <p className="text-purple-100">Tạo tin tuyển dụng để tìm kiếm ứng viên phù hợp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Tạo công việc thành công!</h3>
            <p className="mt-1 text-sm text-green-700">
              Đang chuyển hướng về danh sách công việc...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Có lỗi xảy ra</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-4">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Tiêu đề công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Senior Frontend Developer"
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                required
                minLength={10}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">Ít nhất 10 ký tự, tối đa 200 ký tự</p>
            </div>

            {/* Job Type & Work Location Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="jobType" className="mb-2 block text-sm font-medium text-gray-700">
                  Loại hình công việc <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  required
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Hợp đồng</option>
                  <option value="INTERNSHIP">Thực tập</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="workLocationType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Hình thức làm việc <span className="text-red-500">*</span>
                </label>
                <select
                  id="workLocationType"
                  name="workLocationType"
                  value={formData.workLocationType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  required
                >
                  <option value="ONSITE">Tại văn phòng</option>
                  <option value="REMOTE">Làm việc từ xa</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label
                htmlFor="experienceLevel"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Cấp độ kinh nghiệm <span className="text-red-500">*</span>
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                required
              >
                <option value="ENTRY">Mới ra trường / Thực tập sinh</option>
                <option value="MID">Trung cấp (2-5 năm)</option>
                <option value="SENIOR">Cao cấp (5+ năm)</option>
                <option value="LEAD">Trưởng nhóm / Quản lý</option>
                <option value="EXECUTIVE">Giám đốc / Điều hành</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm và môi trường làm việc..."
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                required
                minLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">Ít nhất 50 ký tự</p>
            </div>

            {/* Requirements */}
            <div>
              <label
                htmlFor="requirements"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Yêu cầu công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={6}
                placeholder="Liệt kê các yêu cầu về kỹ năng, kinh nghiệm, trình độ..."
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                required
                minLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">Ít nhất 50 ký tự</p>
            </div>

            {/* Benefits */}
            <div>
              <label htmlFor="benefits" className="mb-2 block text-sm font-medium text-gray-700">
                Quyền lợi
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={4}
                placeholder="Mô tả các quyền lợi, phúc lợi dành cho nhân viên..."
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>
        </div>

        {/* Salary & Location */}
        <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Mức lương & Địa điểm</h2>
          </div>

          <div className="space-y-4">
            {/* Salary Negotiable Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="salaryNegotiable"
                name="salaryNegotiable"
                checked={formData.salaryNegotiable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="salaryNegotiable" className="text-sm font-medium text-gray-700">
                Lương thỏa thuận
              </label>
            </div>

            {/* Salary Range */}
            {!formData.salaryNegotiable && (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="salaryMin"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Mức lương tối thiểu
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="salaryMin"
                      name="salaryMin"
                      value={formData.salaryMin || ''}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="salaryMax"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Mức lương tối đa
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    value={formData.salaryMax || ''}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Đơn vị tiền tệ
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="VND">VND (triệu)</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="VD: 123 Đường ABC"
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="locationProvince"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  id="locationProvince"
                  name="locationProvince"
                  value={formData.locationProvince}
                  onChange={handleChange}
                  placeholder="VD: Hà Nội"
                  className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Cài đặt ứng tuyển</h2>
          </div>

          <div className="space-y-4">
            {/* Application Deadline */}
            <div>
              <label
                htmlFor="applicationDeadline"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Hạn nộp hồ sơ
              </label>
              <input
                type="date"
                id="applicationDeadline"
                name="applicationDeadline"
                value={
                  formData.applicationDeadline
                    ? typeof formData.applicationDeadline === 'string'
                      ? formData.applicationDeadline
                      : formData.applicationDeadline.toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2.5 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
              <p className="mt-1 text-xs text-gray-500">Để trống nếu không giới hạn thời gian</p>
            </div>

            {/* Featured & Urgent */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <label
                      htmlFor="featured"
                      className="cursor-pointer text-sm font-medium text-gray-900"
                    >
                      Tin nổi bật
                    </label>
                    <p className="mt-1 text-xs text-gray-500">Hiển thị ưu tiên trên trang chủ</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="urgent"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <label
                      htmlFor="urgent"
                      className="cursor-pointer text-sm font-medium text-gray-900"
                    >
                      Tuyển gấp
                    </label>
                    <p className="mt-1 text-xs text-gray-500">Đánh dấu công việc cần tuyển gấp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shadow-soft flex items-center justify-end gap-4 rounded-xl border border-gray-200 bg-white p-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Đăng tin tuyển dụng
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
