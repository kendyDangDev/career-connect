import {
  CandidateSkill,
  ProficiencyLevel,
  proficiencyLevelLabels,
} from '../../../admin/candidates/types';
import { SectionHeading } from './SectionHeading';

interface SkillsSectionProps {
  skills: CandidateSkill[];
}

const proficiencyBars: Record<ProficiencyLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills.length) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title="Kỹ năng & Chuyên môn" />

      <div className="shadow-sophisticated rounded-3xl border border-slate-100 bg-white p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {skills.map((jobSkill) => {
            const filled = proficiencyBars[jobSkill.proficiencyLevel];
            return (
              <div
                key={jobSkill.id}
                className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4"
              >
                <p className="text-primary mb-2 text-xs font-bold">{jobSkill.skill.name}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < filled ? 'bg-primary' : 'bg-violet-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-right text-[10px] font-medium text-slate-500">
                  {proficiencyLevelLabels[jobSkill.proficiencyLevel]}
                  {jobSkill.yearsExperience ? ` · ${jobSkill.yearsExperience}yr` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
