'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Loader2, AlertCircle, RefreshCw, Trash2, X } from 'lucide-react';
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
  const [actionLoading, setActionLoading] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingCv, setEditingCv] = useState<CvData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ open: false, cv: null });

  const fetchCvs = useCallback(async (s?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50', sortBy: 'uploadedAt', sortOrder: 'desc' });
      if (s) params.set('search', s);
      const res = await fetch(`/api/candidate/cv?${params.toString()}`);
      const data: CvListResponse = await res.json();
      if (!res.ok) throw new Error('Không thể tải danh sách CV.');
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

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchCvs(search || undefined), 400);
    return () => clearTimeout(t);
  }, [search, fetchCvs]);

  const handleSetPrimary = async (cvId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/candidate/cv/${cvId}/primary`, { method: 'PUT' });
      if (!res.ok) throw new Error();
      await fetchCvs(search || undefined);
    } catch {
      // silent - user can retry
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.cv) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/candidate/cv/${deleteConfirm.cv.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteConfirm({ open: false, cv: null });
      await fetchCvs(search || undefined);
    } catch {
      // silent - let user retry
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (cvId: string) => {
    const selectedCv = cvs.find((cv) => cv.id === cvId);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/candidate/cv/${cvId}?action=download`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Empty download file');
      }
      const contentDisposition = res.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
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
      // Delay revoke: some browsers need time to finish reading blob data.
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch {
      // keep user on current page; do not navigate to Cloudinary URL
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
      if (!res.ok || !data.data?.url) throw new Error();
      window.open(data.data.url, '_blank');
    } catch {
      // silent
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 pt-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Quản lý CV
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Quản lý và tối ưu hoá hồ sơ chuyên nghiệp của bạn
                </p>
              </div>

              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Thêm CV mới
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-6 max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm CV theo tên..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main content */}
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
              ) : cvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                    <FileText className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                    {search ? 'Không tìm thấy CV' : 'Chưa có CV nào'}
                  </h3>
                  <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                    {search
                      ? 'Thử tìm kiếm với từ khoá khác.'
                      : 'Tải lên CV đầu tiên của bạn để bắt đầu.'}
                  </p>
                  {!search && (
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
                  {cvs.map((cv) => (
                    <CvCard
                      key={cv.id}
                      cv={cv}
                      onEdit={setEditingCv}
                      onDelete={(c) => setDeleteConfirm({ open: true, cv: c })}
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

            {/* Sidebar */}
            <div className="shrink-0 lg:w-80">
              <CvSidebar completionScore={initialCompletionScore} statistics={statistics} />
            </div>
          </div>
        </div>
      </div>

      {/* Upload modal */}
      <CvUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => fetchCvs(search || undefined)}
      />

      {/* Edit modal */}
      <CvEditModal
        cv={editingCv}
        onClose={() => setEditingCv(null)}
        onSaved={() => fetchCvs(search || undefined)}
      />

      {/* Delete confirmation */}
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
