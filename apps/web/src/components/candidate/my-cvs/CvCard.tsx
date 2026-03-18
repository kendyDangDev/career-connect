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
  User,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

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

function getCvPreviewImageUrl(fileUrl: string, mimeType: string): string | null {
  try {
    if (!fileUrl) return null;
    if (!mimeType.toLowerCase().includes('pdf')) return null;
    if (!fileUrl.includes('res.cloudinary.com')) return null;

    const parsedUrl = new URL(fileUrl);
    parsedUrl.hash = 'page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0';
    return parsedUrl.toString();
  } catch {
    return null;
  }
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
  const [previewImageError, setPreviewImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewImageUrl = useMemo(
    () => getCvPreviewImageUrl(cv.fileUrl, cv.mimeType),
    [cv.fileUrl, cv.mimeType]
  );
  const shouldShowImagePreview = Boolean(previewImageUrl && !previewImageError);

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

  useEffect(() => {
    setPreviewImageError(false);
  }, [previewImageUrl, cv.id]);

  return (
    <div
      className={`group relative rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 ${
        cv.isPrimary
          ? 'border-purple-300 shadow-sm shadow-purple-100 dark:border-purple-600 dark:shadow-purple-900/30'
          : 'border-slate-200 hover:border-purple-200 dark:border-slate-700 dark:hover:border-purple-700'
      }`}
    >
      {/* Primary badge */}
      {cv.isPrimary && (
        <div className="absolute -top-2.5 left-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-md shadow-purple-500/30">
            <Star className="h-2.5 w-2.5 fill-current" />
            CV CHÍNH
          </span>
        </div>
      )}

      {/* Preview */}
      <div className="px-5 pt-5">
        <div
          className={`relative h-48 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 ${
            shouldShowImagePreview
              ? 'bg-slate-100 dark:bg-slate-800'
              : 'bg-slate-50/80 p-4 dark:bg-slate-900/40'
          }`}
        >
          {shouldShowImagePreview ? (
            <>
              <iframe
                src={previewImageUrl!}
                loading="lazy"
                onError={() => setPreviewImageError(true)}
                scrolling="no"
                className="pointer-events-none h-[110%] w-[106%] -translate-x-[2%] -translate-y-[2%] border-0"
                title={`CV preview - ${cv.cvName}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
              <div className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                PDF Preview
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="h-2.5 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
                <div className="h-2.5 w-5/6 rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
                <div className="h-2.5 w-3/4 rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-28 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
                  <div className="h-2.5 w-20 rounded-full bg-slate-200/60 dark:bg-slate-700/50" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-5 pt-4">
        <div className="flex items-start gap-4">
          {/* File icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
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
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base leading-tight font-bold text-slate-900 dark:text-white">
                  {cv.cvName}
                </h3>
                {cv.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {cv.description}
                  </p>
                )}
              </div>

              {/* More menu */}
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute top-8 right-0 z-20 min-w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => {
                        onEdit(cv);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                      Đổi tên
                    </button>
                    {!cv.isPrimary && (
                      <button
                        onClick={() => {
                          onSetPrimary(cv.id);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                        Đặt làm CV chính
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDownload(cv.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      Tải xuống
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        onDelete(cv);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa CV
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
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
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
          <button
            onClick={() => onPreview(cv.id)}
            disabled={isActionLoading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-50 py-2 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 disabled:opacity-50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem trước
          </button>
          <button
            onClick={() => onDownload(cv.id)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            Tải về
          </button>
          <button
            onClick={() => onEdit(cv)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(cv)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:bg-slate-700/50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
