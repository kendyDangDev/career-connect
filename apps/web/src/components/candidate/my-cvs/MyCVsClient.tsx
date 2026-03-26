'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CvOptimizationAnalysis } from '@/types/candidate/cv-optimization.types';

import CvCard, { CvData } from './CvCard';
import CvUploadModal from './CvUploadModal';
import CvEditModal from './CvEditModal';
import CvSidebar from './CvSidebar';

interface Statistics {
  totalCvs: number;
  totalFileSize: number;
  totalViews: number;
  primaryCvId: string | null;
}

interface CvListResponse {
  success: boolean;
  data: {
    cvs: CvData[];
    pagination: {
      total: number;
      totalPages: number;
    };
    statistics: Statistics;
  };
}

interface OptimizeCvResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    analysis?: CvOptimizationAnalysis;
  };
}

interface DeleteConfirmState {
  open: boolean;
  cv: CvData | null;
}

interface MyCVsClientProps {
  initialCompletionScore: number;
}

export default function MyCVsClient({ initialCompletionScore }: MyCVsClientProps) {
  const [cvs, setCvs] = useState<CvData[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalCvs: 0,
    totalFileSize: 0,
    totalViews: 0,
    primaryCvId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'primary' | 'pdf'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'name'>('newest');
  const [actionLoading, setActionLoading] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState<CvOptimizationAnalysis | null>(null);
  const [optimizedCvName, setOptimizedCvName] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCvPickerOpen, setIsCvPickerOpen] = useState(false);
  const [selectedOptimizerCvId, setSelectedOptimizerCvId] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingCv, setEditingCv] = useState<CvData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ open: false, cv: null });

  const fetchCvs = useCallback(async (s?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '50', sortBy: 'uploadedAt', sortOrder: 'desc' });
      if (s) {
        params.set('search', s);
      }

      const res = await fetch(`/api/candidate/cv?${params.toString()}`);
      const data: CvListResponse = await res.json();

      if (!res.ok) {
        throw new Error('Không thể tải danh sách CV.');
      }

      setCvs(data.data.cvs);
      setStatistics(data.data.statistics);
    } catch {
      setError('Không thể tải danh sách CV. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCvs(search || undefined);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search, fetchCvs]);

  useEffect(() => {
    if (!cvs.length) {
      setSelectedOptimizerCvId('');
      setIsCvPickerOpen(false);
      setAiAnalysisData(null);
      setOptimizedCvName(null);
      return;
    }

    if (!cvs.some((cv) => cv.id === selectedOptimizerCvId)) {
      setSelectedOptimizerCvId(statistics.primaryCvId ?? cvs[0].id);
    }
  }, [cvs, selectedOptimizerCvId, statistics.primaryCvId]);

  const handleSetPrimary = async (cvId: string) => {
    setActionLoading(true);

    try {
      const res = await fetch(`/api/candidate/cv/${cvId}/primary`, { method: 'PUT' });
      if (!res.ok) {
        throw new Error();
      }
      await fetchCvs(search || undefined);
    } catch {
      // Silent retry path preserved.
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.cv) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/candidate/cv/${deleteConfirm.cv.id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error();
      }
      setDeleteConfirm({ open: false, cv: null });
      await fetchCvs(search || undefined);
    } catch {
      // Silent retry path preserved.
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (cvId: string) => {
    const selectedCv = cvs.find((cv) => cv.id === cvId);
    setActionLoading(true);

    try {
      const res = await fetch(`/api/candidate/cv/${cvId}?action=download`);
      if (!res.ok) {
        throw new Error();
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Empty download file');
      }

      const contentDisposition = res.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename=\"?([^\"]+)\"?/i);
      const fallbackExt = selectedCv?.mimeType?.split('/')[1] || 'pdf';
      const fallbackName = selectedCv ? `${selectedCv.cvName}.${fallbackExt}` : 'cv-download.pdf';
      const fileName = filenameMatch?.[1] || fallbackName;

      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.setAttribute('download', fileName);
      downloadLink.rel = 'noopener';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch {
      // Keep user on current page; do not navigate to Cloudinary URL.
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = async (cvId: string) => {
    const selectedCv = cvs.find((cv) => cv.id === cvId);

    if (selectedCv?.fileUrl) {
      window.open(selectedCv.fileUrl, '_blank');
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch(`/api/candidate/cv/${cvId}?action=preview`);
      const data = await res.json();
      if (!res.ok || !data.data?.url) {
        throw new Error();
      }
      window.open(data.data.url, '_blank');
    } catch {
      // Silent retry path preserved.
    } finally {
      setActionLoading(false);
    }
  };

  const runAiOptimizerForCv = useCallback(
    async (cvId: string) => {
      const optimizedCv = cvs.find((cv) => cv.id === cvId) ?? null;

      setIsOptimizing(true);
      toast.info('AI đang phân tích hồ sơ của bạn, có thể mất vài chục giây...');

      try {
        const res = await fetch(`/api/candidate/cv/${cvId}/optimize`, {
          method: 'POST',
        });

        const data = (await res.json().catch(() => null)) as OptimizeCvResponse | null;
        const analysis = data?.data?.analysis;

        if (!res.ok || !analysis) {
          throw new Error(data?.error || 'Không thể tối ưu hóa CV lúc này.');
        }

        setAiAnalysisData(analysis);
        setOptimizedCvName(optimizedCv?.cvName ?? null);
        toast.success(data?.message || 'Đã tạo gợi ý tối ưu hóa CV.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tối ưu hóa CV lúc này.';
        toast.error(message);
      } finally {
        setIsOptimizing(false);
      }
    },
    [cvs]
  );

  const handleRunAIOptimizer = useCallback(() => {
    if (isOptimizing) return;

    if (!cvs.length) {
      toast.error('Bạn chưa có CV nào để tối ưu hóa.');
      return;
    }

    const defaultCvId =
      selectedOptimizerCvId && cvs.some((cv) => cv.id === selectedOptimizerCvId)
        ? selectedOptimizerCvId
        : (statistics.primaryCvId ?? cvs[0].id);

    setSelectedOptimizerCvId(defaultCvId);
    setIsCvPickerOpen(true);
  }, [cvs, isOptimizing, runAiOptimizerForCv, selectedOptimizerCvId, statistics.primaryCvId]);

  const handleConfirmOptimizeSelection = () => {
    if (!selectedOptimizerCvId) {
      toast.error('Vui lòng chọn một CV để phân tích.');
      return;
    }

    setIsCvPickerOpen(false);
    void runAiOptimizerForCv(selectedOptimizerCvId);
  };

  const selectedOptimizerCv = cvs.find((cv) => cv.id === selectedOptimizerCvId) ?? null;
  const canRunAIOptimizer = cvs.length > 0;
  const displayedCvs = useMemo(() => {
    const filtered = cvs.filter((cv) => {
      if (quickFilter === 'primary') {
        return cv.isPrimary;
      }

      if (quickFilter === 'pdf') {
        return cv.mimeType.toLowerCase().includes('pdf');
      }

      return true;
    });

    return filtered.sort((left, right) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(left.uploadedAt).getTime() - new Date(right.uploadedAt).getTime();
        case 'views':
          return right.viewCount - left.viewCount;
        case 'name':
          return left.cvName.localeCompare(right.cvName, 'vi');
        default:
          return new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime();
      }
    });
  }, [cvs, quickFilter, sortBy]);
  const isFilteredView = Boolean(search) || quickFilter !== 'all';

  return (
    <>
      <div className="min-h-screen bg-slate-50 pt-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-5">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/candidate"
                className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
              >
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-semibold text-slate-900 dark:text-white">Hồ sơ CV</span>
            </nav>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Hồ sơ CV
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Tìm kiếm, sắp xếp và quản lý toàn bộ CV của bạn trong một nơi.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[720px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm CV..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <ListFilter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value as 'all' | 'primary' | 'pdf')}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm font-medium text-slate-700 transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Tất cả</option>
                    <option value="primary">CV chính</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'newest' | 'oldest' | 'views' | 'name')
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm font-medium text-slate-700 transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                    <option value="views">Sắp xếp: Lượt xem</option>
                    <option value="name">Sắp xếp: Tên A-Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-purple-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải CV...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/20">
                    <AlertCircle className="h-7 w-7 text-rose-500" />
                  </div>
                  <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">{error}</p>
                  <button
                    onClick={() => fetchCvs(search || undefined)}
                    className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                  </button>
                </div>
              ) : displayedCvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                    <FileText className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                    {isFilteredView ? 'Không tìm thấy CV' : 'Chưa có CV nào'}
                  </h3>
                  <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                    {isFilteredView
                      ? 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc để xem kết quả khác.'
                      : 'Tải lên CV đầu tiên của bạn để bắt đầu.'}
                  </p>
                  {!isFilteredView && (
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                      Tải lên CV
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {displayedCvs.map((cv) => (
                    <CvCard
                      key={cv.id}
                      cv={cv}
                      onEdit={setEditingCv}
                      onDelete={(currentCv) => setDeleteConfirm({ open: true, cv: currentCv })}
                      onSetPrimary={handleSetPrimary}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      isActionLoading={actionLoading}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="group flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50/50 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-purple-700"
                  >
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-transform group-hover:scale-105 dark:bg-purple-900/40">
                      <Plus className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Upload New CV
                    </span>
                    <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Tải PDF hoặc dùng builder
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="shrink-0 lg:w-[24rem] xl:w-[25rem]">
              <CvSidebar
                completionScore={initialCompletionScore}
                statistics={statistics}
                aiAnalysisData={aiAnalysisData}
                optimizedCvName={optimizedCvName}
                isOptimizing={isOptimizing}
                onRunAIOptimizer={handleRunAIOptimizer}
                canRunAIOptimizer={canRunAIOptimizer}
              />
            </div>
          </div>
        </div>
      </div>

      <CvUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => fetchCvs(search || undefined)}
      />

      <CvEditModal
        cv={editingCv}
        onClose={() => setEditingCv(null)}
        onSaved={() => fetchCvs(search || undefined)}
      />

      <Dialog open={isCvPickerOpen} onOpenChange={setIsCvPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn CV để AI phân tích</DialogTitle>
            <DialogDescription>
              Chọn bất kỳ CV nào trong danh sách để AI đánh giá và đề xuất tối ưu hóa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {cvs.map((cv) => {
              const isSelected = selectedOptimizerCvId === cv.id;

              return (
                <button
                  key={cv.id}
                  type="button"
                  onClick={() => setSelectedOptimizerCvId(cv.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20'
                      : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {cv.cvName}
                      </p>
                      {cv.isPrimary && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                          CV chính
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {cv.mimeType.includes('pdf') ? 'PDF' : cv.mimeType} · {cv.viewCount} lượt xem
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-slate-300 text-transparent dark:border-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsCvPickerOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmOptimizeSelection}
              disabled={!selectedOptimizerCv || isOptimizing}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Phân tích CV này
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteConfirm.open && deleteConfirm.cv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm({ open: false, cv: null })}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Xóa CV</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc muốn xóa{' '}
              <span className="font-semibold">"{deleteConfirm.cv.cvName}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, cv: null })}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
