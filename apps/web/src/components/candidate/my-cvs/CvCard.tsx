'use client';

import {
  FileText,
  Calendar,
  Download,
  Pencil,
  Trash2,
  Eye,
  Star,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface CvData {
  id: string;
  cvName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  description?: string | null;
  uploadedAt: string;
  updatedAt: string;
  viewCount: number;
}

interface CvCardProps {
  cv: CvData;
  onEdit: (cv: CvData) => void;
  onDelete: (cv: CvData) => void;
  onSetPrimary: (cvId: string) => void;
  onPreview: (cvId: string) => void;
  onDownload: (cvId: string) => void;
  isActionLoading?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return 'Hôm nay';
  if (d === 1) return '1 ngày trước';
  if (d < 7) return `${d} ngày trước`;
  const w = Math.floor(d / 7);
  if (w === 1) return '1 tuần trước';
  if (w < 5) return `${w} tuần trước`;
  const m = Math.floor(d / 30);
  if (m === 1) return '1 tháng trước';
  return `${m} tháng trước`;
}

export default function CvCard({
  cv,
  onEdit,
  onDelete,
  onSetPrimary,
  onPreview,
  onDownload,
  isActionLoading,
}: CvCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        cv.isPrimary
          ? 'border-purple-300 dark:border-purple-600 shadow-sm shadow-purple-100 dark:shadow-purple-900/30'
          : 'border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700'
      }`}
    >
      {/* Primary badge */}
      {cv.isPrimary && (
        <div className="absolute -top-2.5 left-5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full shadow-md shadow-purple-500/30 tracking-wide">
            <Star className="h-2.5 w-2.5 fill-current" />
            CV CHÍNH
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* File icon */}
          <div
            className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
              cv.isPrimary
                ? 'bg-purple-100 dark:bg-purple-900/40'
                : 'bg-slate-100 dark:bg-slate-700/50'
            }`}
          >
            <FileText
              className={`h-6 w-6 ${cv.isPrimary ? 'text-purple-600' : 'text-slate-500 dark:text-slate-400'}`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight">
                  {cv.cvName}
                </h3>
                {cv.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {cv.description}
                  </p>
                )}
              </div>

              {/* More menu */}
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-40">
                    <button
                      onClick={() => { onEdit(cv); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                      Đổi tên
                    </button>
                    {!cv.isPrimary && (
                      <button
                        onClick={() => { onSetPrimary(cv.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                        Đặt làm CV chính
                      </button>
                    )}
                    <button
                      onClick={() => { onDownload(cv.id); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      Tải xuống
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={() => { onDelete(cv); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa CV
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Calendar className="h-3 w-3" />
                Cập nhật {timeAgo(cv.updatedAt)}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatFileSize(cv.fileSize)}
              </span>
              {cv.viewCount > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Eye className="h-3 w-3" />
                    {cv.viewCount} lượt xem
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <button
            onClick={() => onPreview(cv.id)}
            disabled={isActionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem trước
          </button>
          <button
            onClick={() => onDownload(cv.id)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Tải về
          </button>
          <button
            onClick={() => onEdit(cv)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(cv)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700/50 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
