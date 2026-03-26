'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  CvOptimizationAnalysis,
  CvOptimizationSuggestion,
  CvOptimizationTagType,
} from '@/types/candidate/cv-optimization.types';

import { cn } from '@/lib/utils';

import SuggestionCard from './SuggestionCard';
import {
  clampScore,
  getPriorityConfig,
  getScoreConfig,
  getScoreInsight,
  getSuggestionSectionId,
  getTagMeta,
  SCORE_RING_CIRCUMFERENCE,
  SCORE_RING_RADIUS,
  type TagMeta,
} from './cv-optimizer-ui';

interface CvSidebarProps {
  completionScore: number;
  statistics: {
    totalCvs: number;
    totalFileSize: number;
    totalViews: number;
    primaryCvId: string | null;
  };
  aiAnalysisData: CvOptimizationAnalysis | null;
  optimizedCvName: string | null;
  isOptimizing: boolean;
  onRunAIOptimizer: () => void;
  canRunAIOptimizer: boolean;
}

interface GroupedSuggestionSection {
  items: Array<{
    index: number;
    suggestion: CvOptimizationSuggestion;
  }>;
  meta: TagMeta;
  sectionId: string;
  tagType: CvOptimizationTagType;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CvSidebar({
  completionScore,
  statistics,
  aiAnalysisData,
  optimizedCvName,
  isOptimizing,
  onRunAIOptimizer,
  canRunAIOptimizer,
}: CvSidebarProps) {
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<CvOptimizationTagType | null>(null);

  const sectionRefs = useRef<Partial<Record<CvOptimizationTagType, HTMLElement | null>>>({});

  const orderedSuggestions = useMemo(() => {
    if (!aiAnalysisData) {
      return [];
    }

    return [...aiAnalysisData.suggestions].sort(
      (left, right) => getPriorityConfig(left.impact).order - getPriorityConfig(right.impact).order
    );
  }, [aiAnalysisData]);

  const groupedSuggestions = useMemo<GroupedSuggestionSection[]>(() => {
    const sections: GroupedSuggestionSection[] = [];
    const sectionMap = new Map<CvOptimizationTagType, GroupedSuggestionSection>();

    orderedSuggestions.forEach((suggestion, index) => {
      const existingSection = sectionMap.get(suggestion.tagType);

      if (existingSection) {
        existingSection.items.push({ index, suggestion });
        return;
      }

      const newSection: GroupedSuggestionSection = {
        items: [{ index, suggestion }],
        meta: getTagMeta(suggestion.tagType),
        sectionId: getSuggestionSectionId(suggestion.tagType),
        tagType: suggestion.tagType,
      };

      sectionMap.set(suggestion.tagType, newSection);
      sections.push(newSection);
    });

    return sections;
  }, [orderedSuggestions]);

  useEffect(() => {
    if (!groupedSuggestions.length) {
      setActiveSection(null);
      return;
    }

    setActiveSection((current) =>
      current && groupedSuggestions.some((section) => section.tagType === current)
        ? current
        : groupedSuggestions[0].tagType
    );
  }, [groupedSuggestions]);

  const score = aiAnalysisData?.score ?? null;
  const scoreValue = clampScore(score);
  const scoreConfig = getScoreConfig(score);
  const scoreInsight = getScoreInsight(score, orderedSuggestions);
  const hasSuggestions = orderedSuggestions.length > 0;
  const strokeOffset = SCORE_RING_CIRCUMFERENCE - (scoreValue / 100) * SCORE_RING_CIRCUMFERENCE;

  const handleSectionSelect = (tagType: CvOptimizationTagType) => {
    setActiveSection(tagType);
    sectionRefs.current[tagType]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <aside className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-violet-500/20 bg-gradient-to-br from-violet-900 to-purple-950 p-5 text-white shadow-xl shadow-purple-900/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 ring-1 ring-white/10 ring-inset">
              <Sparkles className="size-4 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-balance">AI CV Optimizer</p>
              <p className="mt-1 text-xs leading-5 text-pretty text-slate-300">
                Điểm số, tóm tắt nhanh và việc cần ưu tiên cho CV của bạn.
              </p>
              {optimizedCvName && (
                <div className="mt-2 w-fit rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-100 ring-1 ring-white/10 ring-inset">
                  <p className="truncate">{optimizedCvName}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:grid-cols-[104px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <div className="relative flex size-24 items-center justify-center sm:size-[104px]">
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 size-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r={SCORE_RING_RADIUS}
                    className="stroke-white/10"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={SCORE_RING_RADIUS}
                    className={scoreConfig.ringClassName}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={SCORE_RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeOffset}
                  />
                </svg>

                <div className="relative flex size-[78px] flex-col items-center justify-center rounded-full bg-black/20 ring-1 ring-white/10 ring-inset">
                  <span
                    className={cn('text-[28px] font-black tabular-nums', scoreConfig.textClassName)}
                  >
                    {score === null ? '--' : score}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300">/100</span>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
                  scoreConfig.badgeClassName
                )}
              >
                {scoreConfig.label}
              </span>

              <p className="mt-3 text-sm leading-6 text-pretty text-slate-100">{scoreInsight}</p>

              <button
                type="button"
                onClick={onRunAIOptimizer}
                disabled={!canRunAIOptimizer || isOptimizing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-violet-950/20 transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-500/50"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tối ưu hóa...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Tối ưu hóa ngay
                  </>
                )}
              </button>

              {hasSuggestions && (
                <button
                  type="button"
                  onClick={() => setIsSuggestionDialogOpen(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
                >
                  <FileText className="size-4" />
                  Xem chi tiết
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="overflow-hidden border-slate-200 bg-white p-0 text-slate-900 sm:max-w-5xl dark:border-slate-800 dark:bg-slate-900 dark:text-white [&>button]:border [&>button]:border-white/10 [&>button]:bg-slate-950/85 [&>button]:text-white [&>button:hover]:bg-slate-900">
          <div className="flex max-h-[85vh] min-h-0 flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col overflow-hidden border-b border-slate-800 bg-slate-950 text-white lg:border-r lg:border-b-0">
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-violet-200 uppercase">
                    Điểm AI
                  </p>

                  <div className="mt-4 flex items-center justify-center">
                    <div className="relative flex size-32 items-center justify-center">
                      <svg
                        viewBox="0 0 140 140"
                        className="absolute inset-0 size-full -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="70"
                          cy="70"
                          r="56"
                          className="stroke-white/10"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r="56"
                          className={scoreConfig.ringClassName}
                          strokeWidth="12"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 56}
                          strokeDashoffset={
                            2 * Math.PI * 56 - (scoreValue / 100) * (2 * Math.PI * 56)
                          }
                        />
                      </svg>

                      <div className="relative flex size-[88px] flex-col items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/10 ring-inset">
                        <span
                          className={cn(
                            'text-[34px] font-black tabular-nums',
                            scoreConfig.textClassName
                          )}
                        >
                          {score === null ? '--' : score}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">/100</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                      scoreConfig.badgeClassName
                    )}
                  >
                    {scoreConfig.label}
                  </span>

                  <p className="mt-4 text-sm leading-6 text-pretty text-slate-300">
                    {scoreInsight}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-violet-200 uppercase">
                        Mục cần chỉnh sửa
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {groupedSuggestions.length} nhóm cần xem
                      </p>
                    </div>

                    <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-slate-100 ring-1 ring-white/10 ring-inset">
                      {groupedSuggestions.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {groupedSuggestions.map((section) => {
                      const Icon = section.meta.icon;
                      const isActive = activeSection === section.tagType;

                      return (
                        <button
                          key={section.tagType}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleSectionSelect(section.tagType)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                            isActive
                              ? 'border-violet-400/30 bg-violet-500/15 text-violet-50 shadow-sm'
                              : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-violet-400/25 hover:bg-violet-500/10'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                              isActive
                                ? 'bg-violet-100 text-violet-700 ring-violet-200'
                                : 'bg-white/8 text-slate-200 ring-white/10'
                            )}
                          >
                            <Icon className="size-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{section.meta.label}</p>
                            <p className="text-xs text-slate-400">{section.items.length} gợi ý</p>
                          </div>

                          <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] font-semibold text-slate-100 ring-1 ring-white/10 ring-inset">
                            {section.items.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-h-0 overflow-y-auto bg-slate-50/80 px-6 py-6 dark:bg-slate-900">
              <div className="space-y-6">
                {groupedSuggestions.map((section) => {
                  return (
                    <section
                      key={section.tagType}
                      id={section.sectionId}
                      ref={(node) => {
                        sectionRefs.current[section.tagType] = node;
                      }}
                      className="scroll-mt-6"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {section.meta.label}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {section.items.length} đề xuất cải tiến
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {section.items.length}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <SuggestionCard
                            key={`${section.tagType}-${item.index}`}
                            index={item.index}
                            suggestion={item.suggestion}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          Thống kê
        </h3>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-black text-purple-600 tabular-nums">
              {statistics.totalCvs}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">CV</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-black text-indigo-600 tabular-nums">
              {statistics.totalViews}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Lượt xem
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              {formatFileSize(statistics.totalFileSize)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Dung lượng
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
            <Eye className="h-3 w-3" /> Tổng lượt xem
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-700 tabular-nums dark:text-slate-300">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            {statistics.totalViews}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-1 text-sm font-bold text-balance text-slate-900 dark:text-white">
          Hoàn thiện hồ sơ
        </h3>
        <p className="mb-3 text-xs text-pretty text-slate-500 dark:text-slate-400">
          Hồ sơ đầy đủ giúp nhà tuyển dụng tìm thấy bạn nhanh hơn.
        </p>
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Mức độ hoàn thiện</span>
            <span className="text-purple-600 tabular-nums">{completionScore}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>
        <Link
          href="/candidate/profile"
          className="flex items-center justify-between text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
        >
          Cập nhật hồ sơ
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-600 dark:bg-slate-800/50">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="mb-1 text-sm font-bold text-balance text-slate-900 dark:text-white">
          Cần hỗ trợ chuyên sâu?
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-pretty text-slate-500 dark:text-slate-400">
          Các career coach của chúng tôi sẽ review CV của bạn trong vòng 24 giờ.
        </p>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-700">
          Đặt lịch review
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
