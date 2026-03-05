import { HeartPulse, MonitorSmartphone, BookOpen, Dumbbell, LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const DEFAULT_BENEFITS: Benefit[] = [
  {
    icon: HeartPulse,
    title: 'Premium Healthcare',
    description: 'Top-tier health, dental, and vision insurance for you and your dependents.',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    icon: MonitorSmartphone,
    title: 'Remote Flexibility',
    description: 'Work from anywhere or join us in our beautiful global office spaces.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: BookOpen,
    title: 'Learning Stipend',
    description: '$3,000 annual budget for conferences, courses, and personal growth.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Dumbbell,
    title: 'Wellness Program',
    description: 'Monthly fitness allowance and access to mental health support tools.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

interface CompanyKeyBenefitsProps {
  benefits?: Array<{ title: string; description: string }>;
}

export function CompanyKeyBenefits({ benefits }: CompanyKeyBenefitsProps) {
  const displayBenefits = benefits
    ? benefits.map((b, i) => ({
        ...DEFAULT_BENEFITS[i % DEFAULT_BENEFITS.length],
        title: b.title,
        description: b.description,
      }))
    : DEFAULT_BENEFITS;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-gray-900">Key Benefits</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {displayBenefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-xl border border-gray-100 p-4 transition-all hover:border-indigo-100 hover:shadow-sm"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${benefit.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${benefit.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
