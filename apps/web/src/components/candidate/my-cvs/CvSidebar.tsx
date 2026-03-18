import {
  Sparkles,
  TrendingUp,
  BarChart3,
  HardDrive,
  Eye,
  ChevronRight,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

interface CvSidebarProps {
  statistics: {
    totalCvs: number;
    totalFileSize: number;
    totalViews: number;
    primaryCvId: string | null;
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CvSidebar({ statistics }: CvSidebarProps) {
  return (
    <aside className="space-y-5">
      {/* AI CV Optimizer */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white shadow-lg shadow-purple-500/20">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">AI CV Optimizer</h3>
            <p className="text-[10px] font-medium text-purple-200">Tối ưu hoá hồ sơ của bạn</p>
          </div>
        </div>

        <div className="mb-4 space-y-2.5">
          {/* Suggestion 1 */}
          <div className="rounded-xl bg-white/10 p-3">
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-xs leading-snug font-semibold text-white">
                Thêm kỹ năng Cloud & DevOps
              </p>
              <span className="shrink-0 rounded-full bg-emerald-400/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-200">
                +15%
              </span>
            </div>
            <p className="text-[10px] text-purple-200">
              Thường xuyên được yêu cầu trong các tin tuyển dụng bạn đã xem.
            </p>
          </div>

          {/* Suggestion 2 */}
          <div className="rounded-xl bg-white/10 p-3">
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-xs leading-snug font-semibold text-white">Bổ sung System Design</p>
              <span className="shrink-0 rounded-full bg-amber-400/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                Kỹ năng
              </span>
            </div>
            <p className="text-[10px] text-purple-200">
              Dựa trên yêu cầu của các vị trí Senior Engineer bạn quan tâm.
            </p>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-2 text-xs font-bold text-white transition-colors hover:bg-white/30">
          <Sparkles className="h-3.5 w-3.5" />
          Chạy tối ưu hoá đầy đủ
        </button>
      </div>

      {/* Impact Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          Thống kê
        </h3>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-black text-purple-600">{statistics.totalCvs}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">CV</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
            <p className="text-2xl font-black text-indigo-600">{statistics.totalViews}</p>
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
          <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            {statistics.totalViews}
          </span>
        </div>
      </div>

      {/* Profile link */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Hoàn thiện hồ sơ</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Hồ sơ đầy đủ giúp nhà tuyển dụng tìm thấy bạn nhanh hơn.
        </p>
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Mức độ hoàn thiện</span>
            <span className="text-purple-600">85%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
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

      {/* Expert Help CTA */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-600 dark:bg-slate-800/50">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
          Cần hỗ trợ chuyên sâu?
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
