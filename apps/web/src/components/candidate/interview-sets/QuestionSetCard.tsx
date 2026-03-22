import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowUpRight,
  BrainCircuit,
  Clock3,
  FileQuestion,
  Loader2,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
type QuestionSetStatus = 'GENERATING' | 'READY' | 'FAILED';

interface QuestionSetCardProps {
  id: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  estimatedDuration: number;
  createdAt: string;
  status: string;
}

function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getDifficultyConfig(difficulty: QuestionDifficulty | string) {
  if (difficulty === 'EASY') {
    return {
      label: 'Cơ bản',
      tone: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
      emphasis: 'Nền tảng',
    };
  }

  if (difficulty === 'HARD') {
    return {
      label: 'Nâng cao',
      tone: 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-200',
      emphasis: 'Thử thách',
    };
  }

  return {
    label: 'Trung bình',
    tone: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
    emphasis: 'Cân bằng',
  };
}

function getStatusConfig(status: QuestionSetStatus | string) {
  if (status === 'GENERATING') {
    return {
      label: 'Đang tạo',
      description: 'AI đang phân tích CV và mô tả công việc để hoàn thiện bộ câu hỏi.',
      badgeTone:
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      panelTone:
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      icon: Loader2,
      spinning: true,
    };
  }

  if (status === 'FAILED') {
    return {
      label: 'Cần tạo lại',
      description: 'Quá trình tạo chưa hoàn tất. Kiểm tra lại dữ liệu và thử lại khi cần.',
      badgeTone:
        'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      panelTone:
        'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      icon: TriangleAlert,
      spinning: false,
    };
  }

  return {
    label: 'Sẵn sàng',
    description: 'Bộ câu hỏi đã sẵn sàng để bạn bắt đầu một phiên luyện tập mới.',
    badgeTone:
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
    panelTone:
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
    icon: BrainCircuit,
    spinning: false,
  };
}

export default function QuestionSetCard({
  id,
  title,
  difficulty,
  totalQuestions,
  estimatedDuration,
  createdAt,
  status,
}: QuestionSetCardProps) {
  const difficultyConfig = getDifficultyConfig(difficulty);
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const relativeTime = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
  const createdDate = formatCalendarDate(createdAt);
  const statItems = [
    {
      label: 'Độ khó',
      value: difficultyConfig.label,
    },
    {
      label: 'Số câu',
      value: `${totalQuestions}`,
    },
    {
      label: 'Thời gian',
      value: `${estimatedDuration} phút`,
    },
  ];

  return (
    <Link
      href={`/candidate/interview-sets/${id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-purple-100/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl dark:border-purple-950/60 dark:bg-[#140f1d] dark:hover:border-purple-700/50"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-purple-200/80 dark:bg-purple-500/20" />

      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase',
                  statusConfig.badgeTone
                )}
              >
                <StatusIcon
                  className={cn('size-3.5', statusConfig.spinning && 'animate-spin')}
                />
                {statusConfig.label}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {relativeTime}
              </span>
            </div>

            <h3 className="line-clamp-2 text-balance text-xl font-bold leading-7 text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300">
              {title}
            </h3>
          </div>

          <div
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm',
              statusConfig.panelTone
            )}
          >
            <StatusIcon className={cn('size-6', statusConfig.spinning && 'animate-spin')} />
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-pretty text-slate-500 dark:text-slate-400">
          {statusConfig.description}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
              difficultyConfig.tone
            )}
          >
            <Target className="size-3.5" />
            {difficultyConfig.label}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Clock3 className="size-3.5" />
            {estimatedDuration} phút
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <FileQuestion className="size-3.5" />
            {difficultyConfig.emphasis}
          </span>
        </div>

        <div className="mt-auto rounded-2xl border border-purple-100/70 bg-purple-50/70 p-4 dark:border-purple-950/60 dark:bg-purple-950/20">
          <div className="grid grid-cols-3 gap-3">
            {statItems.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500">
                  {stat.label}
                </p>
                <p className="truncate text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span>Tạo ngày {createdDate}</span>
          <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300">
            Xem chi tiết
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
