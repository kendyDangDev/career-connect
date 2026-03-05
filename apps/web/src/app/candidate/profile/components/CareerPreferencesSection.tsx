import {
  Candidate,
  preferredWorkTypeLabels,
  preferredLocationTypeLabels,
  PreferredWorkType,
  PreferredLocationType,
} from '../../../admin/candidates/types';
import { SectionHeading } from './SectionHeading';

interface CareerPreferencesSectionProps {
  candidateInfo: NonNullable<Candidate['candidateInfo']>;
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return 'Thỏa thuận';
  const curr = currency || 'VND';
  const fmt = (n: number) => n.toLocaleString('vi-VN');
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${curr}`;
  if (min) return `Từ ${fmt(min)} ${curr}`;
  return `Đến ${fmt(max!)} ${curr}`;
}

const workTypeColors: Record<PreferredWorkType, string> = {
  FULL_TIME: 'bg-slate-100 text-slate-700',
  PART_TIME: 'bg-slate-100 text-slate-700',
  CONTRACT: 'bg-slate-100 text-slate-700',
  FREELANCE: 'bg-slate-100 text-slate-700',
};

const locationColors: Record<PreferredLocationType, string> = {
  REMOTE: 'border border-primary/10 bg-violet-100 text-primary',
  ONSITE: 'border border-slate-200 bg-slate-100 text-slate-700',
  HYBRID: 'border border-amber-200 bg-amber-50 text-amber-700',
};

export function CareerPreferencesSection({ candidateInfo }: CareerPreferencesSectionProps) {
  const hasSalary = candidateInfo.expectedSalaryMin || candidateInfo.expectedSalaryMax;
  const hasWorkType = !!candidateInfo.preferredWorkType;
  const hasLocationType = !!candidateInfo.preferredLocationType;
  const hasExperience = !!candidateInfo.experienceYears;

  if (!hasSalary && !hasWorkType && !hasLocationType && !hasExperience) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title="Mong muốn nghề nghiệp" />

      <div className="shadow-sophisticated grid grid-cols-1 gap-8 rounded-3xl border border-slate-100 bg-white p-8 md:grid-cols-3">
        {hasSalary && (
          <div className="space-y-3">
            <div className="text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">payments</span>
              <h5 className="text-sm font-bold tracking-wide uppercase">Mức lương mong muốn</h5>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {formatSalary(
                candidateInfo.expectedSalaryMin,
                candidateInfo.expectedSalaryMax,
                candidateInfo.currency
              )}
            </p>
          </div>
        )}

        {hasWorkType && (
          <div className="space-y-3">
            <div className="text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">work</span>
              <h5 className="text-sm font-bold tracking-wide uppercase">Loại hình làm việc</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-lg px-3 py-1 text-xs font-bold ${workTypeColors[candidateInfo.preferredWorkType!]}`}
              >
                {preferredWorkTypeLabels[candidateInfo.preferredWorkType!]}
              </span>
            </div>
          </div>
        )}

        {hasLocationType && (
          <div className="space-y-3">
            <div className="text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">distance</span>
              <h5 className="text-sm font-bold tracking-wide uppercase">Địa điểm</h5>
            </div>
            <span
              className={`inline-block rounded-lg px-3 py-1 text-xs font-bold ${locationColors[candidateInfo.preferredLocationType!]}`}
            >
              {preferredLocationTypeLabels[candidateInfo.preferredLocationType!]}
            </span>
          </div>
        )}

        {hasExperience && (
          <div className="space-y-3">
            <div className="text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">timeline</span>
              <h5 className="text-sm font-bold tracking-wide uppercase">Kinh nghiệm</h5>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {candidateInfo.experienceYears}{' '}
              <span className="ml-1 text-sm font-medium text-slate-400">năm</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
