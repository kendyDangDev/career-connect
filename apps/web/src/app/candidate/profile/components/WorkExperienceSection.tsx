import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CandidateExperience, employmentTypeLabels } from '../../../admin/candidates/types';
import { SectionHeading } from './SectionHeading';

interface WorkExperienceSectionProps {
  experience: CandidateExperience[];
}

function formatDateRange(startDate: string, endDate?: string, isCurrent?: boolean) {
  const start = format(new Date(startDate), 'MMM yyyy', { locale: vi });
  if (isCurrent) return `${start} – Hiện tại`;
  if (!endDate) return start;
  return `${start} – ${format(new Date(endDate), 'MMM yyyy', { locale: vi })}`;
}

export function WorkExperienceSection({ experience }: WorkExperienceSectionProps) {
  if (!experience.length) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title="Kinh nghiệm làm việc" />

      <div className="relative space-y-8 pl-9 before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-0.5 before:bg-violet-100">
        {experience.map((exp, index) => {
          const isCurrent = exp.isCurrent;
          return (
            <div key={exp.id} className="relative">
              <div
                className={`absolute top-1 left-[-35px] size-5 rounded-full border-4 border-white ring-4 ${
                  isCurrent ? 'bg-primary ring-primary/10' : 'bg-slate-200 ring-slate-100'
                }`}
              />
              <div
                className={`rounded-3xl border p-8 transition-transform hover:-translate-y-1 ${
                  isCurrent
                    ? 'border-primary/10 shadow-sophisticated bg-white'
                    : 'border-slate-100 bg-violet-50/30'
                }`}
              >
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{exp.positionTitle}</h4>
                    <p className={`font-semibold ${isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                      {exp.companyName}
                      {exp.employmentType && (
                        <>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="font-medium text-slate-500">
                            {employmentTypeLabels[exp.employmentType]}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={`self-start rounded-xl px-4 py-2 text-xs font-bold ${
                      isCurrent
                        ? 'text-primary border border-violet-200 bg-violet-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </span>
                </div>

                {exp.description && (
                  <p className="mb-3 text-sm leading-relaxed text-slate-600">{exp.description}</p>
                )}

                {exp.achievements && (
                  <ul className="space-y-2">
                    {exp.achievements
                      .split('\n')
                      .filter(Boolean)
                      .map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-primary mt-0.5 text-sm">
                            verified
                          </span>
                          {item.replace(/^[-•*]\s*/, '')}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
