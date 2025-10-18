'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  JobStatus,
  JobType,
  WorkLocationType,
  ExperienceLevel,
  RequiredLevel,
} from '@/generated/prisma';
import { useJobDetail, useJobMutations } from '@/hooks/useJobManagementWithNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useSkills, useCategories } from '@/hooks/useSystemCategories';

const jobSchema = z.object({
  title: z
    .string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(200, 'Tiêu đề không được quá 200 ký tự'),
  description: z.string().min(50, 'Mô tả công việc phải có ít nhất 50 ký tự'),
  requirements: z.string().min(50, 'Yêu cầu ứng viên phải có ít nhất 50 ký tự'),
  benefits: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  workLocationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  salaryMin: z.number().min(0, 'Lương tối thiểu không được âm').optional().nullable(),
  salaryMax: z.number().min(0, 'Lương tối đa không được âm').optional().nullable(),
  currency: z.string().default('VND'),
  salaryNegotiable: z.boolean().default(false),
  address: z.string().optional(),
  locationProvince: z.string().optional(),
  locationCountry: z.string().default('Vietnam'),
  applicationDeadline: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
      },
      {
        message: 'Hạn nộp hồ sơ phải là ngày trong tương lai',
      }
    ),
  status: z.enum(['PENDING', 'ACTIVE', 'CLOSED', 'EXPIRED']),
  featured: z.boolean().default(false),
  urgent: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
});

type JobFormData = z.infer<typeof jobSchema>;

const EditJobPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const { job, loading, error } = useJobDetail(jobId);
  const jobMutations = useJobMutations();
  const { skills, loading: skillsLoading, error: skillsError } = useSkills();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0); // Add key to force re-render

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,
    mode: 'onChange',
    defaultValues: {
      currency: 'VND',
      locationCountry: 'Vietnam',
      salaryNegotiable: false,
      featured: false,
      urgent: false,
      benefits: '',
      address: '',
      locationProvince: '',
      applicationDeadline: undefined,
      skills: [],
      categories: [],
      // Add default values for enum fields to prevent uncontrolled -> controlled warning
      jobType: 'FULL_TIME' as const,
      workLocationType: 'ONSITE' as const,
      experienceLevel: 'ENTRY' as const,
      status: 'PENDING' as const,
    },
  });

  // Watch salary negotiable to conditionally show salary fields
  const salaryNegotiable = watch('salaryNegotiable');

  // Watch form values to debug Select updates
  const watchedValues = watch(['jobType', 'workLocationType', 'experienceLevel', 'status']);

  useEffect(() => {
    console.log('🔍 Current form values:', {
      jobType: watchedValues[0],
      workLocationType: watchedValues[1],
      experienceLevel: watchedValues[2],
      status: watchedValues[3],
    });
  }, [watchedValues]);

  // Reset form when job data is loaded
  useEffect(() => {
    if (job) {
      console.log('🔍 Raw API job data:', job); // Debug log

      const formData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits || '',
        jobType: job.jobType,
        workLocationType: job.workLocationType,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryMin
          ? typeof job.salaryMin === 'object' && job.salaryMin.toNumber
            ? job.salaryMin.toNumber()
            : Number(job.salaryMin)
          : null,
        salaryMax: job.salaryMax
          ? typeof job.salaryMax === 'object' && job.salaryMax.toNumber
            ? job.salaryMax.toNumber()
            : Number(job.salaryMax)
          : null,
        currency: job.currency || 'VND',
        salaryNegotiable: job.salaryNegotiable || false,
        address: job.address || '',
        locationProvince: job.locationProvince || '',
        locationCountry: job.locationCountry || 'Vietnam',
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
          : undefined,
        status: job.status,
        featured: job.featured || false,
        urgent: job.urgent || false,
        skills: job.jobSkills?.map((jobSkill: any) => jobSkill.skill.id) || [],
        categories: job.jobCategories?.map((jobCategory: any) => jobCategory.category.id) || [],
      };

      console.log('📝 Form data before reset:', formData); // Debug log
      console.log('🔍 Enum values from API:', {
        jobType: job.jobType,
        workLocationType: job.workLocationType,
        experienceLevel: job.experienceLevel,
        status: job.status,
      });

      reset(formData);
      setSaveSuccess(false);
      const newFormKey = Date.now(); // Use timestamp as unique key
      setFormKey(newFormKey);

      console.log('✅ Form reset completed with key:', newFormKey);
      console.log('✅ Form will re-render - enum values should now display correctly');
    }
  }, [job, reset]);

  const onSubmit = async (data: JobFormData) => {
    try {
      // Clean up data
      const submitData = {
        ...data,
        salaryMin: salaryNegotiable ? null : data.salaryMin,
        salaryMax: salaryNegotiable ? null : data.salaryMax,
        applicationDeadline: data.applicationDeadline
          ? new Date(data.applicationDeadline).toISOString()
          : null,
        benefits: data.benefits || null,
        // Convert skills to API format
        skills:
          data.skills?.map((skillId) => ({
            skillId,
            requiredLevel: RequiredLevel.PREFERRED, // Default required level
            minYearsExperience: 0, // Default years experience
          })) || [],
        // Categories are already in correct format (array of IDs) - send as categoryIds to match backend API
        categoryIds: data.categories || [],
      };

      console.log('🔍 Submit data being sent to API:', {
        skills: submitData.skills,
        categoryIds: submitData.categoryIds,
        formCategories: data.categories,
      });

      await jobMutations.updateJob(jobId, submitData as any);

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="py-12 text-center">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-4 text-gray-500">{error || 'Không tìm thấy việc làm'}</p>
        <Button onClick={() => router.push('/admin/jobs')}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <button
                onClick={() => router.push('/admin/jobs')}
                className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
              >
                <DocumentIcon className="mr-2 h-4 w-4" />
                Quản lý việc làm
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <button
                onClick={() => router.push(`/admin/jobs/${jobId}`)}
                className="ml-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                {job.title}
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 font-medium text-gray-900">Chỉnh sửa</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <DocumentIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Chỉnh sửa việc làm
                  </h1>
                  <p className="mt-1 max-w-2xl truncate text-sm text-gray-600" title={job.title}>
                    {job.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <Button variant="outline" onClick={handleCancel} className="min-w-[100px]">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit(onSubmit as any)}
                disabled={jobMutations.loading}
                className="min-w-[140px] bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {jobMutations.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50 shadow-sm">
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <AlertDescription className="font-medium text-green-800">
              Cập nhật việc làm thành công! Tất cả thay đổi đã được lưu.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {jobMutations.error && (
          <Alert className="mb-6 border-red-200 bg-red-50 shadow-sm">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="font-medium text-red-800">
              {jobMutations.error}
            </AlertDescription>
          </Alert>
        )}

        <form
          key={`form-${formKey}`}
          onSubmit={handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          {/* Basic Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <DocumentIcon className="h-5 w-5 text-blue-600" />
                </div>
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                  Tiêu đề việc làm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="Nhập tiêu đề việc làm"
                  className="focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mô tả công việc <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  error={errors.description?.message}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                  className="resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="requirements"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Yêu cầu ứng viên <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  rows={6}
                  error={errors.requirements?.message}
                  placeholder="Yêu cầu về kinh nghiệm, kỹ năng, bằng cấp..."
                  className="resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="benefits" className="mb-2 block text-sm font-medium text-gray-700">
                  Quyền lợi
                </Label>
                <Textarea
                  id="benefits"
                  {...register('benefits')}
                  rows={4}
                  placeholder="Các quyền lợi, phúc lợi dành cho ứng viên..."
                  className="resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 py-3">
              <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                Chi tiết công việc
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Loại hình công việc <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="jobType"
                    control={control}
                    key={`jobType-${formKey}`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Chọn loại hình" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              Toàn thời gian
                            </div>
                          </SelectItem>
                          <SelectItem value="PART_TIME">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              Bán thời gian
                            </div>
                          </SelectItem>
                          <SelectItem value="CONTRACT">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              Hợp đồng
                            </div>
                          </SelectItem>
                          <SelectItem value="INTERNSHIP">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              Thực tập
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.jobType && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.jobType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Hình thức làm việc <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="workLocationType"
                    control={control}
                    key={`workLocationType-${formKey}`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Chọn hình thức" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONSITE">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              Tại văn phòng
                            </div>
                          </SelectItem>
                          <SelectItem value="REMOTE">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                                />
                              </svg>
                              Từ xa
                            </div>
                          </SelectItem>
                          <SelectItem value="HYBRID">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Linh hoạt
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.workLocationType && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.workLocationType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Cấp độ kinh nghiệm <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="experienceLevel"
                    control={control}
                    key={`experienceLevel-${formKey}`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Chọn cấp độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENTRY">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              Mới ra trường
                            </div>
                          </SelectItem>
                          <SelectItem value="MID">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              Trung cấp
                            </div>
                          </SelectItem>
                          <SelectItem value="SENIOR">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              Cao cấp
                            </div>
                          </SelectItem>
                          <SelectItem value="LEAD">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              Trưởng nhóm
                            </div>
                          </SelectItem>
                          <SelectItem value="EXECUTIVE">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              Điều hành
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.experienceLevel && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.experienceLevel.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills and Categories */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 py-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-100">
                  <svg
                    className="h-3 w-3 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                Kỹ năng và Danh mục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Kỹ năng yêu cầu</Label>
                  <Controller
                    name="skills"
                    control={control}
                    key={`skills-${formKey}`}
                    render={({ field }) => (
                      <MultiSelect
                        options={skills}
                        selected={field.value}
                        onSelectionChange={field.onChange}
                        placeholder="Chọn kỹ năng..."
                        searchPlaceholder="Tìm kiếm kỹ năng..."
                        emptyMessage="Không tìm thấy kỹ năng nào"
                        loading={skillsLoading}
                        disabled={skillsLoading}
                      />
                    )}
                  />
                  {errors.skills && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.skills.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Danh mục công việc</Label>
                  <Controller
                    name="categories"
                    control={control}
                    key={`categories-${formKey}`}
                    render={({ field }) => (
                      <MultiSelect
                        options={categories}
                        selected={field.value}
                        onSelectionChange={field.onChange}
                        placeholder="Chọn danh mục..."
                        searchPlaceholder="Tìm kiếm danh mục..."
                        emptyMessage="Không tìm thấy danh mục nào"
                        loading={categoriesLoading}
                        disabled={categoriesLoading}
                      />
                    )}
                  />
                  {errors.categories && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.categories.message}
                    </p>
                  )}
                </div>
              </div>

              {(skillsError || categoriesError) && (
                <Alert className="border-red-200 bg-red-50 shadow-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  <AlertDescription className="font-medium text-red-800">
                    Không thể tải danh sách: {skillsError || categoriesError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Salary */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 py-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100">
                  <svg
                    className="h-3 w-3 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Mức lương
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2">
                <div className="flex items-center gap-2">
                  <Controller
                    name="salaryNegotiable"
                    control={control}
                    key={`salaryNegotiable-${formKey}`}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    )}
                  />
                  <Label className="text-sm font-medium text-gray-900">Lương thỏa thuận</Label>
                </div>
                {salaryNegotiable && (
                  <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    Thỏa thuận
                  </div>
                )}
              </div>

              {!salaryNegotiable && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="salaryMin" className="text-xs font-medium text-gray-700">
                      Lương tối thiểu (VND)
                    </Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...register('salaryMin', { valueAsNumber: true })}
                      placeholder="0"
                      error={errors.salaryMin?.message}
                      className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="salaryMax" className="text-xs font-medium text-gray-700">
                      Lương tối đa (VND)
                    </Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      {...register('salaryMax', { valueAsNumber: true })}
                      placeholder="0"
                      error={errors.salaryMax?.message}
                      className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="currency" className="text-xs font-medium text-gray-700">
                      Đơn vị tiền tệ
                    </Label>
                    <Input
                      id="currency"
                      {...register('currency')}
                      placeholder="VND"
                      className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 py-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                  <svg
                    className="h-3 w-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Thông tin bổ sung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs font-medium text-gray-700">
                    Địa Chỉ
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Hồ Chí Minh"
                    className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="locationProvince" className="text-xs font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </Label>
                  <Input
                    id="locationProvince"
                    {...register('locationProvince')}
                    placeholder="Hồ Chí Minh"
                    className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="applicationDeadline"
                    className="text-xs font-medium text-gray-700"
                  >
                    Hạn nộp hồ sơ
                  </Label>
                  <Input
                    id="applicationDeadline"
                    type="datetime-local"
                    {...register('applicationDeadline')}
                    error={errors.applicationDeadline?.message}
                    className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.applicationDeadline && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {errors.applicationDeadline.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Trạng thái <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    key={`status-${formKey}`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              Chờ duyệt
                            </div>
                          </SelectItem>
                          <SelectItem value="ACTIVE">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              Đang tuyển
                            </div>
                          </SelectItem>
                          <SelectItem value="CLOSED">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                              Đã đóng
                            </div>
                          </SelectItem>
                          <SelectItem value="EXPIRED">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              Hết hạn
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Options Row */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2">
                  <Label className="text-xs font-medium text-gray-900">Việc làm nổi bật</Label>
                  <Controller
                    name="featured"
                    control={control}
                    key={`featured-${formKey}`}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-yellow-600"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2">
                  <Label className="text-xs font-medium text-gray-900">Tuyển gấp</Label>
                  <Controller
                    name="urgent"
                    control={control}
                    key={`urgent-${formKey}`}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px]"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={jobMutations.loading}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {jobMutations.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPage;
