'use client';

interface Category {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  skill: {
    id: string;
    name: string;
  };
  requiredLevel: string;
  minYearsExperience?: number;
}

interface JobDetailAboutSectionProps {
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  categories: Category[];
  skills: Skill[];
}

function isHtml(text: string) {
  return /<[^>]+>/.test(text);
}

function sanitize(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s*(onclick|onload|onerror|onmouseover)[^>]*/gi, '')
    .replace(/javascript:/gi, '');
}

const categoryColors = [
  {
    bg: 'bg-primary-light dark:bg-primary/10',
    text: 'text-primary dark:text-primary-light',
    border: 'border-primary/10',
  },
  {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-800',
  },
  {
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-100 dark:border-fuchsia-800',
  },
];

const categoryIcons: Record<string, string> = {
  // English
  'Software Development': 'code',
  'SaaS Products': 'layers',
  'Cloud Computing': 'cloud',
  Design: 'palette',
  'Project Management': 'task_alt',
  Business: 'trending_up',
  'Human Resources': 'people',
  Accounting: 'account_balance',
  Marketing: 'campaign',
  Operations: 'settings',
  // Vietnamese
  'Lập trình': 'code',
  'Thiết kế': 'palette',
  'Quản lý dự án': 'task_alt',
  'Kinh doanh': 'trending_up',
  'Nhân sự': 'people',
  'Kế toán': 'account_balance',
  'Vận hành': 'settings',
  default: 'work',
};

function parseRequirements(text: string): string[] {
  return text
    .replace(/\\n/g, '\n')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBenefits(text: string): string[] {
  return text
    .replace(/\\n/g, '\n')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function JobDetailAboutSection({
  description,
  requirements,
  benefits,
  categories,
  skills,
}: JobDetailAboutSectionProps) {
  const html = description && isHtml(description);
  const requirementItems = requirements ? parseRequirements(requirements) : [];
  const benefitItems = benefits ? parseBenefits(benefits) : [];

  return (
    <div className="shadow-sophisticated overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="px-8 pt-8">
        <h3 className="mb-3 text-2xl font-bold">Job Description</h3>

        {/* Main Description */}
        <div className="prose dark:prose-invert max-w-none space-y-5 leading-relaxed text-slate-600 dark:text-slate-300">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: sanitize(description!) }} />
          ) : (
            <p className="whitespace-pre-wrap">{description?.replace(/\\n /g, '\n')}</p>
          )}

          {/* Candidate requirement */}
          {requirementItems.length > 0 && (
            <div>
              <h4 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                Candidate Requirements
              </h4>
              <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
                {requirementItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5 text-xl">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {benefitItems.length > 0 && (
            <div>
              <h4 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Benefits</h4>
              <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
                {benefitItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="material-symbols-outlined fill-1 mt-0.5 text-xl text-amber-500">
                      star_shine
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-10">
            <h4 className="mb-3 text-sm font-bold tracking-widest text-slate-400 uppercase">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => {
                const colors = categoryColors[index % categoryColors.length];
                const icon = categoryIcons[category.name] || categoryIcons.default;

                return (
                  <span
                    key={category.id}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                    {category.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {skills.length > 0 && (
          <div className="mt-8 pb-8">
            <h4 className="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((jobSkill) => (
                <span
                  key={jobSkill.id}
                  className="hover:bg-primary-light hover:text-primary cursor-default rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  {jobSkill.skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
