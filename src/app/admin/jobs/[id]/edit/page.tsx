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
import { useConfirm } from '@/hooks/useConfirm';
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
  jobType: z.nativeEnum(JobType),
  workLocationType: z.nativeEnum(WorkLocationType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryMin: z.number().min(0, 'Lương tối thiểu không được âm').optional().nullable(),
  salaryMax: z.number().min(0, 'Lương tối đa không được âm').optional().nullable(),
  currency: z.string().default('VND'),
  salaryNegotiable: z.boolean().default(false),
  locationCity: z.string().optional(),
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
  status: z.nativeEnum(JobStatus),
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
  const { confirmUnsavedChanges } = useConfirm();
  const { skills, loading: skillsLoading, error: skillsError } = useSkills();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
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
      locationCity: '',
      locationProvince: '',
      applicationDeadline: undefined,
      skills: [],
      categories: [],
    },
  });

  // Debug useEffect to monitor skills and categories data
  useEffect(() => {
    console.log('=== SKILLS DEBUG ===');
    console.log('Skills:', skills);
    console.log('Skills loading:', skillsLoading);
    console.log('Skills error:', skillsError);
    console.log('Skills length:', skills?.length);

    console.log('=== CATEGORIES DEBUG ===');
    console.log('Categories:', categories);
    console.log('Categories loading:', categoriesLoading);
    console.log('Categories error:', categoriesError);
    console.log('Categories length:', categories?.length);
  }, [skills, categories, skillsLoading, categoriesLoading, skillsError, categoriesError]);

  // Watch salary negotiable to conditionally show salary fields
  const salaryNegotiable = watch('salaryNegotiable');

  // Reset form when job data is loaded
  useEffect(() => {
    if (job) {
      reset({
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
        locationCity: job.locationCity || '',
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
      });
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
        // Categories are already in correct format (array of IDs)
        categories: data.categories || [],
      };

      await jobMutations.updateJob(jobId, submitData as any);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  const handleCancel = async () => {
    if (isDirty) {
      await confirmUnsavedChanges(() => {
        router.push(`/admin/jobs/${jobId}`);
      });
    } else {
      router.push(`/admin/jobs/${jobId}`);
    }
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <div className="flex">
              <button
                onClick={() => router.push('/admin/jobs')}
                className="text-gray-500 hover:text-gray-700"
              >
                Quản lý việc làm
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <button
                onClick={() => router.push(`/admin/jobs/${jobId}`)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                {job.title}
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-4 font-medium text-gray-900">Chỉnh sửa</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa việc làm</h1>
          <p className="text-gray-500">{job.title}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit(onSubmit as any)}
            disabled={jobMutations.loading || !isDirty}
            className="min-w-[120px]"
          >
            {jobMutations.loading ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Cập nhật việc làm thành công!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {jobMutations.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{jobMutations.error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Tiêu đề việc làm *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="Nhập tiêu đề việc làm"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả công việc *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  error={errors.description?.message}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                />
              </div>

              <div>
                <Label htmlFor="requirements">Yêu cầu ứng viên *</Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  rows={6}
                  error={errors.requirements?.message}
                  placeholder="Yêu cầu về kinh nghiệm, kỹ năng, bằng cấp..."
                />
              </div>

              <div>
                <Label htmlFor="benefits">Quyền lợi</Label>
                <Textarea
                  id="benefits"
                  {...register('benefits')}
                  rows={4}
                  placeholder="Các quyền lợi, phúc lợi dành cho ứng viên..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết công việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Loại hình công việc *</Label>
                <Controller
                  name="jobType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={JobType.FULL_TIME}>Toàn thời gian</SelectItem>
                        <SelectItem value={JobType.PART_TIME}>Bán thời gian</SelectItem>
                        <SelectItem value={JobType.CONTRACT}>Hợp đồng</SelectItem>
                        <SelectItem value={JobType.INTERNSHIP}>Thực tập</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.jobType && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
                )}
              </div>

              <div>
                <Label>Hình thức làm việc *</Label>
                <Controller
                  name="workLocationType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hình thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={WorkLocationType.ONSITE}>Tại văn phòng</SelectItem>
                        <SelectItem value={WorkLocationType.REMOTE}>Từ xa</SelectItem>
                        <SelectItem value={WorkLocationType.HYBRID}>Linh hoạt</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.workLocationType && (
                  <p className="mt-1 text-sm text-red-600">{errors.workLocationType.message}</p>
                )}
              </div>

              <div>
                <Label>Cấp độ kinh nghiệm *</Label>
                <Controller
                  name="experienceLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExperienceLevel.ENTRY}>Mới ra trường</SelectItem>
                        <SelectItem value={ExperienceLevel.MID}>Trung cấp</SelectItem>
                        <SelectItem value={ExperienceLevel.SENIOR}>Cao cấp</SelectItem>
                        <SelectItem value={ExperienceLevel.LEAD}>Trưởng nhóm</SelectItem>
                        <SelectItem value={ExperienceLevel.EXECUTIVE}>Điều hành</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.experienceLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Địa điểm làm việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="locationCity">Thành phố</Label>
                <Input
                  id="locationCity"
                  {...register('locationCity')}
                  placeholder="Ví dụ: Hồ Chí Minh"
                />
              </div>

              <div>
                <Label htmlFor="locationProvince">Tỉnh/Thành phố</Label>
                <Input
                  id="locationProvince"
                  {...register('locationProvince')}
                  placeholder="Ví dụ: Hồ Chí Minh"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills and Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Kỹ năng và Danh mục</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Kỹ năng yêu cầu</Label>
                <Controller
                  name="skills"
                  control={control}
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
                  <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              <div>
                <Label>Danh mục công việc</Label>
                <Controller
                  name="categories"
                  control={control}
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
                  <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
                )}
              </div>
            </div>

            {(skillsError || categoriesError) && (
              <Alert className="border-red-200 bg-red-50">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Không thể tải danh sách: {skillsError || categoriesError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader>
            <CardTitle>Mức lương</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="salaryNegotiable"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label>Lương thỏa thuận</Label>
            </div>

            {!salaryNegotiable && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="salaryMin">Lương tối thiểu (VND)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    {...register('salaryMin', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.salaryMin?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="salaryMax">Lương tối đa (VND)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    {...register('salaryMax', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.salaryMax?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <Input id="currency" {...register('currency')} placeholder="VND" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deadline & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Hạn nộp hồ sơ & Trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="applicationDeadline">Hạn nộp hồ sơ</Label>
                <Input
                  id="applicationDeadline"
                  type="datetime-local"
                  {...register('applicationDeadline')}
                  error={errors.applicationDeadline?.message}
                />
              </div>

              <div>
                <Label>Trạng thái *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={JobStatus.PENDING}>Chờ duyệt</SelectItem>
                        <SelectItem value={JobStatus.ACTIVE}>Đang tuyển</SelectItem>
                        <SelectItem value={JobStatus.CLOSED}>Đã đóng</SelectItem>
                        <SelectItem value={JobStatus.EXPIRED}>Hết hạn</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn bổ sung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label>Việc làm nổi bật</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="urgent"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label>Tuyển gấp</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={jobMutations.loading || !isDirty}
            className="min-w-[120px]"
          >
            {jobMutations.loading ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;
