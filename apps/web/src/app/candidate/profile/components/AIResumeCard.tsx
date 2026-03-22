import Link from 'next/link';
import { ArrowUpRight, Target } from 'lucide-react';

interface AIResumeCardProps {
  completionScore: number;
  suggestions: string[];
  stats: Array<{ label: string; value: string }>;
}

const scoreTone = (score: number) => {
  if (score >= 80) {
    return {
      chip: 'bg-emerald-100 text-emerald-700',
      title: 'Rất tốt',
      body: 'Hồ sơ của bạn đã đủ mạnh để recruiter đọc nhanh và nắm ý chính.',
    };
  }

  if (score >= 55) {
    return {
      chip: 'bg-amber-100 text-amber-700',
      title: 'Cần hoàn thiện thêm',
      body: 'Bạn đã có nền tảng tốt, nhưng vài tín hiệu quan trọng vẫn đang thiếu.',
    };
  }

  return {
    chip: 'bg-rose-100 text-rose-700',
    title: 'Ưu tiên nâng cấp',
    body: 'Hãy lấp đầy các trường cốt lõi để tăng độ tin cậy và tỷ lệ phản hồi.',
  };
};

export default function AIResumeCard({ completionScore, suggestions, stats }: AIResumeCardProps) {
  const tone = scoreTone(completionScore);

  return (
    <aside id="ai-resume-score" className="w-full xl:sticky xl:top-24 xl:self-start">
      <div className="w-full rounded-[28px] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_24px_90px_rgba(15,23,42,0.32)]">

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/4 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-300" />
            <p className="text-sm font-semibold text-white">AI suggestions</p>
          </div>

          <div className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={suggestion} className="rounded-2xl border border-white/10 bg-white/4 p-3">
                  <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/18 text-xs font-semibold text-violet-200">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{suggestion}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-sm leading-6 text-emerald-100">
                  Hồ sơ của bạn đã khá gọn gàng. Bước tiếp theo là tinh chỉnh CV và portfolio theo
                  từng nhóm job mục tiêu.
                </p>
              </div>
            )}
          </div>
        </div>


        <Link
          href="/candidate/my-cvs"
          className="mt-5 inline-flex w-full items-center justify-between rounded-2xl border border-violet-400/30 bg-violet-500/12 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/18"
        >
          Tối ưu CV trong workspace riêng
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
