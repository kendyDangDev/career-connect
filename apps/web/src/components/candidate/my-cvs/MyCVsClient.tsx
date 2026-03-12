'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
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

export default function MyCVsClient() {
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
    setActionLoading(true);
    try {
      const res = await fetch(`/api/candidate/cv/${cvId}?action=download`);
      const data = await res.json();
      if (!res.ok || !data.data?.url) throw new Error();
      window.open(data.data.url, '_blank');
    } catch {
      // silent
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = async (cvId: string) => {
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Thêm CV mới
              </button>
            </div>

            {/* Search */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm CV theo tên..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải CV...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
                    <AlertCircle className="h-7 w-7 text-rose-500" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{error}</p>
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
                  <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {search ? 'Không tìm thấy CV' : 'Chưa có CV nào'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                    {search
                      ? 'Thử tìm kiếm với từ khoá khác.'
                      : 'Tải lên CV đầu tiên của bạn để bắt đầu.'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Tải lên CV
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
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
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 shrink-0">
              <CvSidebar statistics={statistics} />
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
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, cv: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Xóa CV</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Bạn có chắc muốn xóa <span className="font-semibold">"{deleteConfirm.cv.cvName}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, cv: null })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
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
