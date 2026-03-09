import React from 'react';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

interface QuestionSetCardProps {
  id: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  estimatedDuration: number;
  createdAt: string;
  status: string;
}

const colorVariants: Record<string, string> = {
  primary: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
};

const levelColorMapping: Record<string, string> = {
  EASY: 'text-green-500',
  MEDIUM: 'text-orange-500',
  HARD: 'text-red-500',
};

const levelTextMapping: Record<string, string> = {
  EASY: 'Cơ bản',
  MEDIUM: 'Trung bình',
  HARD: 'Nâng cao',
};

const statusColorMapping: Record<string, string> = {
  GENERATING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  READY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function QuestionSetCard({
  id,
  title,
  difficulty,
  totalQuestions,
  estimatedDuration,
  createdAt,
  status,
}: QuestionSetCardProps) {
  const levelColorClass = levelColorMapping[difficulty] || 'text-purple-500';
  const levelText = levelTextMapping[difficulty] || difficulty;
  const dateStr = new Date(createdAt).toLocaleDateString('vi-VN');

  return (
    <Link
      href={`/candidate/interview-sets/${id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <BrainCircuit className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white">
        {title}
      </h3>
      <p className="mb-4 line-clamp-1 text-sm text-slate-500">Tạo ngày: {dateStr}</p>

      <div className="mb-6 flex flex-1 flex-wrap content-start items-start gap-2">
        <span
          className={`rounded px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase ${
            statusColorMapping[status] || colorVariants.slate
          }`}
        >
          {status === 'GENERATING' ? 'Đang tạo' : status === 'READY' ? 'Sẵn sàng' : 'Lỗi'}
        </span>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold tracking-tight text-slate-400 uppercase">
            Độ khó
          </p>
          <p className={`text-sm font-bold ${levelColorClass}`}>{levelText}</p>
        </div>
        <div className="border-x border-slate-100 text-center dark:border-slate-800">
          <p className="mb-0.5 text-[10px] font-bold tracking-tight text-slate-400 uppercase">
            Số câu
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {totalQuestions} câu
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold tracking-tight text-slate-400 uppercase">
            Thời gian
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {estimatedDuration} phút
          </p>
        </div>
      </div>
    </Link>
  );
}
