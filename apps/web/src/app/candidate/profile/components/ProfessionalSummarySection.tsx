import { SectionHeading } from './SectionHeading';

interface ProfessionalSummarySectionProps {
  bio?: string | null;
}

export function ProfessionalSummarySection({ bio }: ProfessionalSummarySectionProps) {
  if (!bio) return null;

  return (
    <section className="space-y-4">
      <SectionHeading title="Giới thiệu bản thân" />
      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 leading-relaxed text-slate-600 shadow-sophisticated">
        {bio}
      </div>
    </section>
  );
}
