import {
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  UserRound,
} from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProfileSidebarProps {
  completionScore: number;
  isDirty: boolean;
  statItems: Array<{ label: string; value: string }>;
}

const sectionLinks = [
  { href: '#profile-overview', label: 'Tổng quan', icon: UserRound },
  { href: '#personal-info', label: 'Thông tin cá nhân', icon: CheckCircle2 },
  { href: '#professional-info', label: 'Thông tin nghề nghiệp', icon: BriefcaseBusiness },
  { href: '#ai-resume-score', label: 'AI Resume Score', icon: BrainCircuit },
];

export default function ProfileSidebar({
  completionScore,
  isDirty,
  statItems,
}: ProfileSidebarProps) {
  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-[0_24px_80px_rgba(91,33,182,0.10)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-violet-500 uppercase">
              Profile map
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Bảng điều hướng</h2>
          </div>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              isDirty ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            )}
          >
            {isDirty ? 'Chưa lưu' : 'Đã đồng bộ'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-violet-100 bg-violet-50/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Mức hoàn thiện</p>
                <p className="text-xs text-slate-500">AI sử dụng tín hiệu này để gợi ý ưu tiên.</p>
              </div>
              <span className="text-2xl font-semibold text-violet-700">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2.5 bg-violet-200/70" />
          </div>

          <nav className="flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0">
            {sectionLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="group flex min-w-max items-center gap-3 rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 xl:min-w-0"
              >
                <span className="rounded-2xl bg-violet-100 p-2 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>

      </div>
    </aside>
  );
}
