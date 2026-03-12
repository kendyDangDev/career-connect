'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Hourglass,
  Edit3,
  Info,
  Building2,
  DollarSign,
  MapPin,
  XCircle,
  Loader2,
} from 'lucide-react';

interface RecentHistoryItem {
  id: string;
  title: string;
  setStatus: 'GENERATING' | 'READY' | 'FAILED';
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
  latestSession: {
    id: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    answeredCount: number;
    overallScore: number | null;
    completedAt: string | null;
  } | null;
}

function getHistoryDisplay(item: RecentHistoryItem): {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  statusText: string;
  muted: boolean;
  spinning?: boolean;
} {
  const { setStatus, latestSession, totalQuestions } = item;

  if (setStatus === 'GENERATING') {
    return {
      icon: Loader2,
      iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
      statusText: 'Đang tạo bộ đề...',
      muted: false,
      spinning: true,
    };
  }

  if (setStatus === 'FAILED') {
    return {
      icon: XCircle,
      iconBg: 'bg-red-100 text-red-500 dark:bg-red-900/30',
      statusText: 'Tạo bộ đề thất bại',
      muted: true,
    };
  }

  if (!latestSession) {
    return {
      icon: Edit3,
      iconBg: 'bg-slate-200 text-slate-500 dark:bg-slate-800',
      statusText: 'Chưa bắt đầu',
      muted: true,
    };
  }

  if (latestSession.status === 'COMPLETED') {
    const score =
      latestSession.overallScore !== null ? ` • ${latestSession.overallScore.toFixed(1)}/10` : '';
    return {
      icon: CheckCircle2,
      iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      statusText: `Hoàn thành${score}`,
      muted: false,
    };
  }

  if (latestSession.status === 'IN_PROGRESS') {
    return {
      icon: Hourglass,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      statusText: `${latestSession.answeredCount}/${totalQuestions} câu đã trả lời`,
      muted: false,
    };
  }

  // ABANDONED
  return {
    icon: Edit3,
    iconBg: 'bg-slate-200 text-slate-500 dark:bg-slate-800',
    statusText: `Đã dừng • ${latestSession.answeredCount}/${totalQuestions} câu`,
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
        /* silent */
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
        /* silent */
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-80px)] w-80 flex-col gap-6 overflow-y-auto border-l border-slate-200 bg-white p-6 xl:flex dark:border-slate-800 dark:bg-slate-900">
      {/* Recent History Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử gần đây</h2>
          <Link className="text-xs font-bold text-purple-600" href="/candidate/interview-sets">
            Xem hết
          </Link>
        </div>
        {historyLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
              >
                <div className="h-8 w-8 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentHistory.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">Chưa có lịch sử phỏng vấn.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentHistory.map((item) => {
              const { icon: Icon, iconBg, statusText, muted, spinning } = getHistoryDisplay(item);
              const progress =
                item.latestSession && item.setStatus === 'READY'
                  ? Math.round(
                      (item.latestSession.answeredCount / Math.max(item.totalQuestions, 1)) * 100
                    )
                  : null;
              return (
                <Link
                  key={item.id}
                  href={`/candidate/interview-sets/${item.id}`}
                  className={`group flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-purple-50 dark:bg-slate-800/50 dark:hover:bg-purple-900/20 ${
                    muted ? 'opacity-60' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{statusText}</p>
                    {progress !== null && progress > 0 && progress < 100 && (
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Jobs Section */}
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

      {/* Bottom Promo */}
      <div className="mt-auto rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/10">
        <p className="mb-2 text-[10px] font-bold text-purple-600 uppercase">Quick Tip</p>
        <p className="text-xs leading-relaxed text-slate-600 italic dark:text-slate-400">
          "Kết hợp kỹ năng kỹ thuật với câu hỏi văn hóa để đánh giá ứng viên toàn diện hơn."
        </p>
      </div>
    </aside>
  );
}
