'use client';

import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  availabilityStatusValues,
  AVAILABILITY_STATUS_LABELS,
  preferredLocationTypeValues,
  PREFERRED_LOCATION_TYPE_LABELS,
  preferredWorkTypeValues,
  PREFERRED_WORK_TYPE_LABELS,
} from '@/lib/validations/candidate/profile.validation';
import type { CandidateProfileFormValues } from '@/types/candidate/profile.types';

import ProfileChoiceGroup from './ProfileChoiceGroup';
import ProfileSectionCard from './ProfileSectionCard';

interface ProfessionalInfoSectionProps {
  control: Control<CandidateProfileFormValues>;
  register: UseFormRegister<CandidateProfileFormValues>;
  errors: FieldErrors<CandidateProfileFormValues>;
}

const inputClassName =
  'h-12 rounded-2xl border-violet-200/70 bg-white/90 px-4 shadow-[0_10px_30px_rgba(91,33,182,0.06)] placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-[3px] focus-visible:ring-violet-500/18';

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

const numberFieldOptions = {
  setValueAs: (value: string) => {
    if (value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
};

export default function ProfessionalInfoSection({
  control,
  register,
  errors,
}: ProfessionalInfoSectionProps) {
  return (
    <ProfileSectionCard
      id="professional-info"
      title="Thông tin nghề nghiệp"
      description="Thiết lập đúng tín hiệu công việc giúp hệ thống matching và recruiter hiểu rõ bạn đang muốn gì, ở mức nào."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <FieldShell
          label="Vị trí hiện tại"
          helper="Tên role đang làm hoặc role mục tiêu gần nhất."
          error={errors.candidate?.currentPosition?.message}
        >
          <Input
            {...register('candidate.currentPosition')}
            placeholder="Ví dụ: Senior Frontend Engineer"
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell
          label="Số năm kinh nghiệm"
          helper="Nhập số nguyên. Dữ liệu này được dùng để lọc shortlist nhanh."
          error={errors.candidate?.experienceYears?.message}
        >
          <Input
            type="number"
            min={0}
            step={1}
            {...register('candidate.experienceYears', numberFieldOptions)}
            placeholder="5"
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell
          label="Mức lương kỳ vọng từ"
          helper="Nhập mức sàn bạn cảm thấy hợp lý."
          error={errors.candidate?.expectedSalaryMin?.message}
        >
          <Input
            type="number"
            min={0}
            step={100000}
            {...register('candidate.expectedSalaryMin', numberFieldOptions)}
            placeholder="20000000"
            className={inputClassName}
          />
        </FieldShell>

        <FieldShell
          label="Mức lương kỳ vọng đến"
          helper="Khoảng kỳ vọng rõ giúp NTD phản hồi nhanh hơn."
          error={errors.candidate?.expectedSalaryMax?.message}
        >
          <Input
            type="number"
            min={0}
            step={100000}
            {...register('candidate.expectedSalaryMax', numberFieldOptions)}
            placeholder="35000000"
            className={inputClassName}
          />
        </FieldShell>
      </div>

      <div className="mt-6 space-y-6">
        <FieldShell
          label="Availability status"
          helper="Hiển thị rõ tình trạng sẵn sàng để hệ thống ưu tiên lead đúng thời điểm."
          error={errors.candidate?.availabilityStatus?.message}
        >
          <Controller
            control={control}
            name="candidate.availabilityStatus"
            render={({ field }) => (
              <ProfileChoiceGroup
                options={availabilityStatusValues.map((value) => ({
                  value,
                  label: AVAILABILITY_STATUS_LABELS[value],
                }))}
                value={field.value}
                onChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
              />
            )}
          />
        </FieldShell>

        <FieldShell
          label="Hình thức làm việc mong muốn"
          helper="Bạn có thể bỏ chọn để giữ trạng thái linh hoạt."
          error={errors.candidate?.preferredWorkType?.message}
        >
          <Controller
            control={control}
            name="candidate.preferredWorkType"
            render={({ field }) => (
              <ProfileChoiceGroup
                options={preferredWorkTypeValues.map((value) => ({
                  value,
                  label: PREFERRED_WORK_TYPE_LABELS[value],
                }))}
                value={field.value ?? null}
                onChange={field.onChange}
                allowClear
              />
            )}
          />
        </FieldShell>

        <FieldShell
          label="Địa điểm làm việc ưu tiên"
          helper="Thiết lập để hệ thống gợi ý job phù hợp hơn với lifestyle của bạn."
          error={errors.candidate?.preferredLocationType?.message}
        >
          <Controller
            control={control}
            name="candidate.preferredLocationType"
            render={({ field }) => (
              <ProfileChoiceGroup
                options={preferredLocationTypeValues.map((value) => ({
                  value,
                  label: PREFERRED_LOCATION_TYPE_LABELS[value],
                }))}
                value={field.value ?? null}
                onChange={field.onChange}
                allowClear
              />
            )}
          />
        </FieldShell>
      </div>
    </ProfileSectionCard>
  );
}
