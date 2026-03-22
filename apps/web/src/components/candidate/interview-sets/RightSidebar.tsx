'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Edit3,
  Hourglass,
  Info,
  Layers3,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface RecentHistoryItem {
  id: string;
  title: string;
  setStatus: 'GENERATING' | 'READY' | 'FAILED';
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
  primaryCategory: string | null;
  topCategories: string[];
  dominantDifficulty: QuestionDifficulty | null;
  sampleAnswerCount: number;
  latestSession: {
    id: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    answeredCount: number;
    overallScore: number | null;
    completedAt: string | null;
  } | null;
}

interface HistoryDisplay {
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  chipTone: string;
  statusLabel: string;
  detail: string;
  muted: boolean;
  spinning?: boolean;
}

function formatRelativeTime(value: string) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: vi,
  });
}

function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getDifficultyDisplay(difficulty: QuestionDifficulty | null) {
  if (difficulty === 'EASY') {
    return {
      label: 'Cơ bản',
      tone: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
    };
  }

  if (difficulty === 'HARD') {
    return {
      label: 'Nâng cao',
      tone: 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-200',
    };
  }

  return {
    label: 'Trung bình',
    tone: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
  };
}

function getHistoryDisplay(item: RecentHistoryItem): HistoryDisplay {
  const { setStatus, latestSession, totalQuestions } = item;

  if (setStatus === 'GENERATING') {
    return {
      icon: Loader2,
      iconTone:
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      chipTone:
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      statusLabel: 'Đang tạo',
      detail: 'AI đang tổng hợp câu hỏi từ CV và mô tả công việc của bạn.',
      muted: false,
      spinning: true,
    };
  }

  if (setStatus === 'FAILED') {
    return {
      icon: XCircle,
      iconTone:
        'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      chipTone:
        'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      statusLabel: 'Tạo thất bại',
      detail: 'Bộ câu hỏi chưa tạo thành công. Bạn có thể thử tạo lại với dữ liệu rõ hơn.',
      muted: true,
    };
  }

  if (!latestSession) {
    return {
      icon: Edit3,
      iconTone:
        'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
      chipTone:
        'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
      statusLabel: 'Sẵn sàng luyện tập',
      detail: `${totalQuestions} câu hỏi đã được chuẩn bị. Bạn có thể bắt đầu bất cứ lúc nào.`,
      muted: false,
    };
  }

  if (latestSession.status === 'COMPLETED') {
    return {
      icon: CheckCircle2,
      iconTone:
        'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
      chipTone:
        'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
      statusLabel: 'Hoàn thành',
      detail:
        latestSession.overallScore !== null
          ? `Bạn đã hoàn tất phiên luyện tập với điểm ${latestSession.overallScore.toFixed(1)}/10.`
          : `Bạn đã hoàn thành ${latestSession.answeredCount}/${totalQuestions} câu hỏi.`,
      muted: false,
    };
  }

  if (latestSession.status === 'IN_PROGRESS') {
    return {
      icon: Hourglass,
      iconTone:
        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300',
      chipTone:
        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300',
      statusLabel: 'Đang luyện tập',
      detail: `Bạn đã trả lời ${latestSession.answeredCount}/${totalQuestions} câu. Tiếp tục để hoàn thiện bộ đề.`,
      muted: false,
    };
  }

  return {
    icon: Edit3,
    iconTone:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    chipTone:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    statusLabel: 'Tạm dừng',
    detail: `Bạn đã dừng ở ${latestSession.answeredCount}/${totalQuestions} câu. Có thể quay lại bất cứ lúc nào.`,
    muted: true,
  };
}

interface RecommendedJob {
  id: string;
  title: string;
  company: {
    companyName: string;
    logoUrl: string | null;
  };
  locationCity: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryNegotiable: boolean;
  jobType: string;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
  negotiable: boolean
) {
  if (negotiable) return 'Thỏa thuận';
  if (!min && !max) return null;
  const fmt = (n: number) =>
    currency === 'VND' ? `${(n / 1_000_000).toFixed(0)}` : `${(n / 1_000).toFixed(0)}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

export default function RightSidebar() {
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [recentHistory, setRecentHistory] = useState<RecentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/jobs?limit=3&status=OPEN');
        const json = await res.json();
        if (json.success) {
          setRecommendedJobs(json.data?.jobs ?? json.data ?? []);
        }
      } catch {
        // Silent failure for sidebar suggestions.
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/interview/recent-history');
        const json = await res.json();
        if (json.success) {
          setRecentHistory(json.data ?? []);
        }
      } catch {
        // Silent failure for recent history.
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  return (
    <aside className="sticky top-20 hidden w-80 shrink-0 self-start border-l border-slate-200 bg-white p-6 xl:flex xl:flex-col xl:gap-6 dark:border-slate-800 dark:bg-slate-900">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử gần đây</h2>
          <Link className="text-xs font-bold text-purple-600" href="/candidate/interview-sets">
            Xem hết
          </Link>
        </div>

        {historyLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[24px] border border-purple-100/80 bg-white p-4 shadow-sm dark:border-purple-950/60 dark:bg-[#140f1d]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-28 animate-pulse rounded-full bg-purple-100 dark:bg-purple-900/30" />
                    <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="size-11 animate-pulse rounded-2xl bg-purple-100 dark:bg-purple-900/30" />
                </div>
                <div className="mb-4 h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="mb-4 flex gap-2">
                  <div className="h-7 w-20 animate-pulse rounded-full bg-purple-100 dark:bg-purple-900/30" />
                  <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-purple-100/70 bg-purple-50/70 p-3 dark:border-purple-950/60 dark:bg-purple-950/20">
                  {[1, 2, 3].map((cell) => (
                    <div key={cell} className="space-y-2">
                      <div className="h-2.5 w-12 animate-pulse rounded bg-purple-100 dark:bg-purple-900/30" />
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-purple-200 bg-purple-50/60 p-5 text-center dark:border-purple-800/50 dark:bg-purple-950/15">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Chưa có lịch sử phỏng vấn.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Tạo bộ câu hỏi đầu tiên để bắt đầu luyện tập và lưu lại tiến trình của bạn.
            </p>
            <Link
              href="/candidate/interview-sets/create"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-700"
            >
              Tạo bộ câu hỏi
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentHistory.map((item) => {
              const display = getHistoryDisplay(item);
              const StatusIcon = display.icon;
              const difficulty = getDifficultyDisplay(item.dominantDifficulty);
              const answeredCount = item.latestSession?.answeredCount ?? 0;
              const hasOverallScore = item.latestSession?.overallScore != null;
              const progress =
                item.setStatus === 'READY'
                  ? Math.round((answeredCount / Math.max(item.totalQuestions, 1)) * 100)
                  : null;
              const statItems = [
                {
                  label: 'Câu hỏi',
                  value: `${item.totalQuestions}`,
                },
                {
                  label: 'Gợi ý mẫu',
                  value: `${item.sampleAnswerCount}`,
                },
                {
                  label: hasOverallScore ? 'Điểm' : 'Tiến độ',
                  value: hasOverallScore
                    ? item.latestSession!.overallScore!.toFixed(1)
                    : progress !== null
                      ? `${progress}%`
                      : 'Mới',
                },
              ];

              return (
                <Link
                  key={item.id}
                  href={`/candidate/interview-sets/${item.id}`}
                  className={cn(
                    'group relative overflow-hidden rounded-[24px] border border-purple-100/80 bg-white p-4 shadow-[0_12px_30px_rgba(109,40,217,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-[0_18px_38px_rgba(109,40,217,0.14)] dark:border-purple-950/60 dark:bg-[#140f1d] dark:hover:border-purple-700/50',
                    display.muted && 'opacity-80'
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-purple-200/80 dark:bg-purple-500/20" />

                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase',
                              display.chipTone
                            )}
                          >
                            <StatusIcon
                              className={cn('size-3.5', display.spinning && 'animate-spin')}
                            />
                            {display.statusLabel}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            {formatRelativeTime(item.updatedAt)}
                          </span>
                        </div>

                        <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-balance text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300">
                          {item.title}
                        </h3>
                      </div>

                      <div
                        className={cn(
                          'flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm',
                          display.iconTone
                        )}
                      >
                        <StatusIcon className={cn('size-5', display.spinning && 'animate-spin')} />
                      </div>
                    </div>

                    <p className="mb-4 text-[11px] leading-5 text-pretty text-slate-500 dark:text-slate-400">
                      {display.detail}
                    </p>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {item.primaryCategory && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">
                          <Layers3 className="size-3.5" />
                          {item.primaryCategory}
                        </span>
                      )}

                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                          difficulty.tone
                        )}
                      >
                        <Target className="size-3.5" />
                        {difficulty.label}
                      </span>

                      {item.sampleAnswerCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                          <Sparkles className="size-3.5" />
                          {item.sampleAnswerCount} gợi ý
                        </span>
                      )}

                      {item.topCategories.slice(item.primaryCategory ? 1 : 0, 2).map((category) => (
                        <span
                          key={category}
                          className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                        >
                          {category}
                        </span>
                      ))}

                      {item.topCategories.length > 2 && (
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                          +{item.topCategories.length - 2} chủ đề
                        </span>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-purple-100/70 bg-purple-50/70 p-3 dark:border-purple-950/60 dark:bg-purple-950/20">
                      {statItems.map((stat) => (
                        <div key={stat.label} className="min-w-0">
                          <p className="mb-1 text-[10px] font-semibold text-slate-400 uppercase dark:text-slate-500">
                            {stat.label}
                          </p>
                          <p className="truncate text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {progress !== null && (
                      <div className="mb-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase dark:text-slate-500">
                          <span>Tiến độ</span>
                          <span className="text-purple-700 tabular-nums dark:text-purple-300">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-slate-800">
                          <div
                            className={cn(
                              'h-full rounded-full bg-purple-600 transition-[width] duration-200',
                              progress === 100 && 'bg-fuchsia-500'
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      <span>Tạo ngày {formatCalendarDate(item.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300">
                        Xem chi tiết
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Việc làm gợi ý</h2>
          <Info className="h-4 w-4 cursor-pointer text-slate-400" />
        </div>
        {recommendedJobs.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">Chưa có gợi ý phù hợp.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendedJobs.map((job) => {
              const salary = formatSalary(
                job.salaryMin,
                job.salaryMax,
                job.currency,
                job.salaryNegotiable
              );
              return (
                <Link key={job.id} href={`/candidate/jobs/${job.id}`} className="group block">
                  <div className="mb-1.5 flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                      {job.company.logoUrl ? (
                        <Image
                          src={job.company.logoUrl}
                          alt={job.company.companyName}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <Building2 className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="truncate text-[10px] text-slate-500">
                        {job.company.companyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {salary && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-600">
                        {salary} Triệu
                      </span>
                    )}
                    {job.locationCity && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {job.locationCity}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <Link
          href="/candidate/jobs"
          className="mt-5 block w-full rounded-lg border border-purple-200 py-2 text-center text-xs font-bold text-purple-600 transition-all hover:bg-purple-600 hover:text-white dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white"
        >
          Xem tất cả gợi ý
        </Link>
      </section>

      <div className="mt-auto rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/10">
        <p className="mb-2 text-[10px] font-bold text-purple-600 uppercase">Quick Tip</p>
        <p className="text-xs leading-relaxed text-slate-600 italic dark:text-slate-400">
          "Kết hợp kỹ năng kỹ thuật với câu hỏi văn hóa để đánh giá ứng viên toàn diện hơn."
        </p>
      </div>
    </aside>
  );
}
