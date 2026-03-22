'use client';

import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Github, Globe2, Linkedin, Link2, MapPinHouse } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GENDER_LABELS, genderValues } from '@/lib/validations/candidate/profile.validation';
import type { CandidateProfileFormValues } from '@/types/candidate/profile.types';

import ProfileSectionCard from './ProfileSectionCard';

interface PersonalInfoSectionProps {
  control: Control<CandidateProfileFormValues>;
  register: UseFormRegister<CandidateProfileFormValues>;
  errors: FieldErrors<CandidateProfileFormValues>;
}

const inputClassName =
  'h-12 rounded-2xl border-violet-200/70 bg-white/90 px-4 shadow-[0_10px_30px_rgba(91,33,182,0.06)] placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-[3px] focus-visible:ring-violet-500/18';

const inputWithLeadingIconClassName = `${inputClassName} pl-12`;

const textareaClassName =
  'min-h-36 rounded-3xl border-violet-200/70 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(91,33,182,0.06)] placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-[3px] focus-visible:ring-violet-500/18';

const selectClassName =
  'h-12 rounded-2xl border-violet-200/70 bg-white/90 px-4 shadow-[0_10px_30px_rgba(91,33,182,0.06)] focus:ring-[3px] focus:ring-violet-500/18';

function FieldShell({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {helper ? <p className="text-xs leading-5 text-slate-500">{helper}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
}

function SocialField({
  label,
  icon,
  placeholder,
  registerPath,
  register,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  registerPath:
    | 'profile.websiteUrl'
    | 'profile.linkedinUrl'
    | 'profile.githubUrl'
    | 'profile.portfolioUrl';
  register: UseFormRegister<CandidateProfileFormValues>;
  error?: string;
}) {
  return (
    <FieldShell label={label} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-violet-500">
          {icon}
        </span>
        <Input
          {...register(registerPath)}
          placeholder={placeholder}
          className={inputWithLeadingIconClassName}
        />
      </div>
    </FieldShell>
  );
}

export default function PersonalInfoSection({
  control,
  register,
  errors,
}: PersonalInfoSectionProps) {
  return (
    <ProfileSectionCard
      id="personal-info"
      title="Thông tin cá nhân"
      description="Cung cấp dữ liệu nền tảng để hồ sơ của bạn chuyên nghiệp, đáng tin cậy và giàu tín hiệu cho matching."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <FieldShell
          label="Ngày sinh"
          helper="Sử dụng cho các quy trình xác thực và hồ sơ nội bộ."
          error={errors.profile?.dateOfBirth?.message}
        >
          <Input type="date" {...register('profile.dateOfBirth')} className={inputClassName} />
        </FieldShell>

        <FieldShell
          label="Giới tính"
          helper="Tùy chọn, chỉ hiển thị khi bạn muốn chia sẻ."
          error={errors.profile?.gender?.message}
        >
          <Controller
            control={control}
            name="profile.gender"
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger className={selectClassName}>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  {genderValues.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {GENDER_LABELS[gender]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldShell>

        <FieldShell
          label="Địa chỉ"
          helper="Địa chỉ liên hệ hoặc nơi ở hiện tại."
          error={errors.profile?.address?.message}
        >
          <Input
            {...register('profile.address')}
            placeholder="Số nhà, tên đường, phường/xã..."
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell label="Thành phố"      helper="Tỉnh/Thành phố nơi bạn sinh sống." error={errors.profile?.city?.message}>
          <Input
            {...register('profile.city')}
            placeholder="Ví dụ: Hồ Chí Minh"
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell label="Tỉnh/Thành khác" error={errors.profile?.province?.message}>
          <Input
            {...register('profile.province')}
            placeholder="Ví dụ: Bình Dương"
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell label="Quốc gia" error={errors.profile?.country?.message}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-violet-500">
              <MapPinHouse className="h-4 w-4" />
            </span>
            <Input
              {...register('profile.country')}
              placeholder="Vietnam"
              className={inputWithLeadingIconClassName}
            />
          </div>
        </FieldShell>
      </div>

      <div className="mt-6">
        <FieldShell
          label="Bio"
          helper="Tóm tắt 2-4 câu về điểm mạnh, định hướng và những gì bạn muốn nhà tuyển dụng nhớ."
          error={errors.profile?.bio?.message}
        >
          <Textarea
            {...register('profile.bio')}
            placeholder="Ví dụ: Product-minded frontend engineer tập trung vào trải nghiệm người dùng, thiết kế hệ thống component và tối ưu hiệu suất cho SaaS."
            className={textareaClassName}
          />
        </FieldShell>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-800">Social links</p>
          <p className="text-xs leading-5 text-slate-500">
            Gắn các liên kết uy tín để tăng độ tin cậy và giúp recruiter hiểu sâu hơn về năng lực
            của bạn.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SocialField
            label="Website"
            icon={<Globe2 className="h-4 w-4" />}
            placeholder="https://your-site.com"
            registerPath="profile.websiteUrl"
            register={register}
            error={errors.profile?.websiteUrl?.message}
          />
          <SocialField
            label="LinkedIn"
            icon={<Linkedin className="h-4 w-4" />}
            placeholder="https://linkedin.com/in/your-profile"
            registerPath="profile.linkedinUrl"
            register={register}
            error={errors.profile?.linkedinUrl?.message}
          />
          <SocialField
            label="GitHub"
            icon={<Github className="h-4 w-4" />}
            placeholder="https://github.com/your-handle"
            registerPath="profile.githubUrl"
            register={register}
            error={errors.profile?.githubUrl?.message}
          />
          <SocialField
            label="Portfolio"
            icon={<Link2 className="h-4 w-4" />}
            placeholder="https://portfolio.yourname.dev"
            registerPath="profile.portfolioUrl"
            register={register}
            error={errors.profile?.portfolioUrl?.message}
          />
        </div>
      </div>
    </ProfileSectionCard>
  );
}
