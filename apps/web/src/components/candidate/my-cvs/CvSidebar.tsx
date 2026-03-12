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
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI CV Optimizer</h3>
            <p className="text-purple-200 text-[10px] font-medium">Tối ưu hoá hồ sơ của bạn</p>
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          {/* Suggestion 1 */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-white leading-snug">
                Thêm kỹ năng Cloud & DevOps
              </p>
              <span className="shrink-0 text-[10px] font-bold bg-emerald-400/30 text-emerald-200 px-1.5 py-0.5 rounded-full">+15%</span>
            </div>
            <p className="text-[10px] text-purple-200">Thường xuyên được yêu cầu trong các tin tuyển dụng bạn đã xem.</p>
          </div>

          {/* Suggestion 2 */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-white leading-snug">
                Bổ sung System Design
              </p>
              <span className="shrink-0 text-[10px] font-bold bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded-full">Kỹ năng</span>
            </div>
            <p className="text-[10px] text-purple-200">Dựa trên yêu cầu của các vị trí Senior Engineer bạn quan tâm.</p>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          Chạy tối ưu hoá đầy đủ
        </button>
      </div>

      {/* Impact Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          Thống kê
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-black text-purple-600">{statistics.totalCvs}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">CV</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-black text-indigo-600">{statistics.totalViews}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Lượt xem</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
              {formatFileSize(statistics.totalFileSize)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Dung lượng</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Eye className="h-3 w-3" /> Tổng lượt xem
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            {statistics.totalViews}
          </span>
        </div>
      </div>

      {/* Profile link */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Hoàn thiện hồ sơ</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Hồ sơ đầy đủ giúp nhà tuyển dụng tìm thấy bạn nhanh hơn.
        </p>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">Mức độ hoàn thiện</span>
            <span className="text-purple-600">85%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
          </div>
        </div>
        <Link
          href="/candidate/profile"
          className="flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
        >
          Cập nhật hồ sơ
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Expert Help CTA */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-5 text-center">
        <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Cần hỗ trợ chuyên sâu?</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
          Các career coach của chúng tôi sẽ review CV của bạn trong vòng 24 giờ.
        </p>
        <button className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5">
          Đặt lịch review
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
