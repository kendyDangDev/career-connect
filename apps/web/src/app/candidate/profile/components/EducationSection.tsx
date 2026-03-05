import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CandidateEducation, degreeTypeLabels } from '../../../admin/candidates/types';
import { SectionHeading } from './SectionHeading';

interface EducationSectionProps {
  education: CandidateEducation[];
}

const degreeIcons: Record<string, string> = {
  HIGH_SCHOOL: 'menu_book',
  ASSOCIATE: 'school',
  BACHELOR: 'history_edu',
  MASTER: 'school',
  DOCTORATE: 'workspace_premium',
  OTHER: 'school',
};

export function EducationSection({ education }: EducationSectionProps) {
  if (!education.length) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title="Học vấn" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {education.map((edu) => {
          const startYear = format(new Date(edu.startDate), 'yyyy', { locale: vi });
          const endYear = edu.endDate
            ? format(new Date(edu.endDate), 'yyyy', { locale: vi })
            : 'Hiện tại';

          return (
            <div
              key={edu.id}
              className="flex items-start gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {degreeIcons[edu.degreeType] || 'school'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">
                  {degreeTypeLabels[edu.degreeType]} – {edu.fieldOfStudy}
                </h4>
                <p className="mb-2 text-sm text-slate-500">{edu.institutionName}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {edu.gpa && (
                    <span className="text-primary rounded-md bg-violet-50 px-2 py-1 text-xs font-bold">
                      GPA {edu.gpa}
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-400">
                    {startYear} – {endYear}
                  </span>
                </div>
                {edu.description && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{edu.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
