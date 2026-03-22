'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Clock3, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { candidateProfileApi } from '@/api/candidate/profile.api';
import { Button } from '@/components/ui/button';
import type { CandidateProfileFormValues } from '@/types/candidate/profile.types';

import AIResumeCard from './AIResumeCard';
import PersonalInfoSection from './PersonalInfoSection';
import ProfessionalInfoSection from './ProfessionalInfoSection';
import ProfileHeroCard from './ProfileHeroCard';
import ProfileSidebar from './ProfileSidebar';

interface CandidateProfileClientProps {
  initialData: CandidateProfileFormValues;
}

const buildCompletionChecklist = (values: CandidateProfileFormValues) => [
  Boolean(values.user.firstName && values.user.lastName),
  Boolean(values.user.phone),
  Boolean(values.profile.city),
  Boolean(values.profile.country),
  Boolean(values.profile.bio),
  Boolean(values.profile.linkedinUrl),
  Boolean(values.profile.githubUrl),
  Boolean(values.candidate.currentPosition),
  typeof values.candidate.experienceYears === 'number',
  typeof values.candidate.expectedSalaryMin === 'number',
  typeof values.candidate.expectedSalaryMax === 'number',
  Boolean(values.candidate.preferredWorkType),
  Boolean(values.candidate.preferredLocationType),
  Boolean(values.candidate.cvFileUrl),
];

const buildSuggestions = (values: CandidateProfileFormValues) => {
  const suggestions: string[] = [];

  if (!values.candidate.cvFileUrl) {
    suggestions.push(
      'Tải CV chính lên để recruiter có thể preview hồ sơ chỉ trong một lần click.'
    );
  }

  if (!values.profile.bio) {
    suggestions.push(
      'Viết bio ngắn gọn nhưng sắc nét để nêu rõ định vị nghề nghiệp và thế mạnh khác biệt.'
    );
  }

  if (!values.profile.linkedinUrl) {
    suggestions.push(
      'Bổ sung LinkedIn để tăng mức độ tin cậy và tạo điểm chạm chuyên nghiệp với nhà tuyển dụng.'
    );
  }

  if (!values.candidate.preferredWorkType || !values.candidate.preferredLocationType) {
    suggestions.push(
      'Thiết lập work type và location preference để AI matching gợi ý đúng opportunity hơn.'
    );
  }

  if (!values.candidate.currentPosition || values.candidate.experienceYears === null) {
    suggestions.push(
      'Hoàn thiện snapshot nghề nghiệp hiện tại để profile có tín hiệu seniority rõ ràng.'
    );
  }

  return suggestions.slice(0, 4);
};

export default function CandidateProfileClient({ initialData }: CandidateProfileClientProps) {
  const [lastSavedLabel, setLastSavedLabel] = useState('Sẵn sàng cập nhật hồ sơ mới nhất.');

  const {
    control,
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CandidateProfileFormValues>({
    defaultValues: initialData,
    mode: 'onChange',
  });

  const values = watch();
  const completionChecklist = buildCompletionChecklist(values);
  const completionScore = Math.round(
    (completionChecklist.filter(Boolean).length / completionChecklist.length) * 100
  );
  const suggestions = buildSuggestions(values);

  const leftRailStats = [
    { label: 'Kỹ năng', value: String(initialData.stats.skills) },
    { label: 'Kinh nghiệm', value: String(initialData.stats.experience) },
    { label: 'Bằng cấp', value: String(initialData.stats.education) },
    { label: 'CV', value: String(initialData.stats.cvs) },
  ];

  const aiStats = [
    { label: 'Skills mapped', value: String(initialData.stats.skills) },
    { label: 'Experience items', value: String(initialData.stats.experience) },
    { label: 'Education items', value: String(initialData.stats.education) },
    { label: 'Certificates', value: String(initialData.stats.certifications) },
  ];

  const handleAvatarUploaded = (avatarUrl: string) => {
    resetField('user.avatarUrl', { defaultValue: avatarUrl });
    setLastSavedLabel('Ảnh đại diện đã được cập nhật thành công.');
  };

  const handleAvatarRemoved = () => {
    resetField('user.avatarUrl', { defaultValue: null });
    setLastSavedLabel('Ảnh đại diện đã được gỡ khỏi hồ sơ.');
  };

  const onSubmit = async (payload: CandidateProfileFormValues) => {
    try {
      const data = await candidateProfileApi.updateProfile(payload);

      reset(data);
      setLastSavedLabel('Đã lưu và đồng bộ thành công với hồ sơ ứng viên.');
      toast.success('Đã cập nhật hồ sơ ứng viên');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu hồ sơ';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_24%),linear-gradient(180deg,#f7f3ff_0%,#f5f3ff_36%,#ffffff_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <ProfileSidebar
            completionScore={completionScore}
            isDirty={isDirty}
            statItems={leftRailStats}
          />

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <ProfileHeroCard
              userId={values.user.id}
              firstName={values.user.firstName}
              lastName={values.user.lastName}
              email={values.user.email}
              phone={values.user.phone}
              avatarUrl={values.user.avatarUrl}
              availabilityStatus={values.candidate.availabilityStatus}
              hasCv={Boolean(values.candidate.cvFileUrl)}
              isDirty={isDirty}
              isSubmitting={isSubmitting}
              lastSavedLabel={lastSavedLabel}
              register={register}
              errors={errors}
              onAvatarUploaded={handleAvatarUploaded}
              onAvatarRemoved={handleAvatarRemoved}
            />

            <PersonalInfoSection control={control} register={register} errors={errors} />
            <ProfessionalInfoSection control={control} register={register} errors={errors} />

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(91,33,182,0.10)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Ready to publish your latest profile?
                  </p>
                  <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4 text-violet-500" />
                    {isDirty
                      ? 'Bạn đang có thay đổi chưa lưu. Lưu lại để recruiter nhìn thấy phiên bản mới nhất.'
                      : 'Không có thay đổi chưa lưu. Bạn có thể tiếp tục tinh chỉnh hoặc chuyển sang tối ưu CV.'}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    className="h-12 rounded-2xl border-violet-200 bg-white px-5 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Hoàn tác thay đổi
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 text-white shadow-[0_18px_40px_rgba(124,58,237,0.24)] hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <AIResumeCard
            completionScore={completionScore}
            suggestions={suggestions}
            stats={aiStats}
          />
        </div>
      </div>
    </div>
  );
}
