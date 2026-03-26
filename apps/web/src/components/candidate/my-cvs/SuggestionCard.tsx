'use client';

import type { CvOptimizationSuggestion } from '@/types/candidate/cv-optimization.types';

import { cn } from '@/lib/utils';

import { getPriorityConfig, getSuggestionDiff, getTagMeta } from './cv-optimizer-ui';

interface SuggestionCardProps {
  index: number;
  suggestion: CvOptimizationSuggestion;
}

export default function SuggestionCard({ index, suggestion }: SuggestionCardProps) {
  const priority = getPriorityConfig(suggestion.impact);
  const tagMeta = getTagMeta(suggestion.tagType);
  const diff = getSuggestionDiff(suggestion.tagType);
  const Icon = tagMeta.icon;

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 ring-1 ring-violet-100 ring-inset dark:bg-violet-950/30 dark:ring-violet-900/70">
          <Icon className="size-[18px] text-violet-600 dark:text-violet-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Vấn đề {index + 1}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium',
                priority.badgeClassName
              )}
            >
              {priority.badgeLabel}
            </span>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-700 dark:bg-violet-950/30 dark:text-violet-200">
              {tagMeta.label}
            </span>
          </div>

          <h4 className="mt-3 text-base font-bold text-balance text-slate-900 dark:text-white">
            {suggestion.title}
          </h4>

          <p className="mt-1.5 text-sm leading-6 text-pretty text-slate-500 dark:text-slate-400">
            {suggestion.description}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-300">
            Bản cũ
          </p>
          <p className="mt-2 text-sm leading-6 text-rose-700 line-through decoration-rose-500/80 decoration-2 dark:text-rose-200">
            {diff.before}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-300">
            Gợi ý
          </p>
          <p className="mt-2 text-sm leading-6 font-medium text-emerald-800 dark:text-emerald-100">
            {diff.after}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-violet-700 uppercase dark:text-violet-300">
          Lý do đề xuất
        </p>
        <p className="mt-2 text-sm leading-6 text-pretty text-slate-700 dark:text-slate-200">
          {diff.why}
        </p>
      </div>
    </article>
  );
}
