'use client';

import { RotateCcw, Download, TrendingUp, TrendingDown, Star, Target, Lightbulb } from 'lucide-react';

interface FeedbackCategory {
  name: string;
  score: number;
  comment: string;
}

interface InterviewFeedbackProps {
  overallScore: number;
  categories: FeedbackCategory[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  onTryAgain: () => void;
}

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? 'text-emerald-500'
      : score >= 60
        ? 'text-amber-500'
        : 'text-red-500';
  const strokeColor =
    score >= 80
      ? '#10b981'
      : score >= 60
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  );
}

function CategoryBar({ category }: { category: FeedbackCategory }) {
  const color =
    category.score >= 80
      ? 'bg-emerald-500'
      : category.score >= 60
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{category.name}</span>
        <span className="text-sm font-semibold text-slate-600">{category.score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${category.score}%`,
            transition: 'width 1s ease-in-out',
          }}
        />
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{category.comment}</p>
    </div>
  );
}

export default function InterviewFeedback({
  overallScore,
  categories,
  strengths,
  weaknesses,
  suggestions,
  summary,
  onTryAgain,
}: InterviewFeedbackProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 text-center shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-800">Kết quả phỏng vấn</h2>
        <p className="mb-6 text-sm text-slate-500">Phân tích chi tiết buổi phỏng vấn của bạn</p>
        <ScoreGauge score={overallScore} />
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{summary}</p>
      </div>

      {/* ─── Categories ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Target size={20} className="text-blue-500" />
          Đánh giá chi tiết
        </h3>
        <div className="space-y-5">
          {categories.map((cat, idx) => (
            <CategoryBar key={idx} category={cat} />
          ))}
        </div>
      </div>

      {/* ─── Strengths & Weaknesses ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-700">
            <TrendingUp size={20} />
            Điểm mạnh
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                <Star size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-700">
            <TrendingDown size={20} />
            Cần cải thiện
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Suggestions ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-700">
          <Lightbulb size={20} />
          Gợi ý cải thiện
        </h3>
        <ul className="space-y-2">
          {suggestions.map((s, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
              <span className="mt-0.5 flex-shrink-0 font-bold text-blue-500">{idx + 1}.</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Actions ─────────────────────────────────────────── */}
      <div className="flex justify-center gap-4 pb-8">
        <button
          onClick={onTryAgain}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <RotateCcw size={18} />
          Phỏng vấn lại
        </button>
      </div>
    </div>
  );
}
