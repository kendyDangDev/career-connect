import Link from 'next/link';
import { Sparkles, Target, Zap, ArrowRight } from 'lucide-react';

export default function JobMatchBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 py-16">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl md:p-12">
          {/* Decorative */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center">
            {/* Left content */}
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-400/20 px-3 py-1 text-sm font-medium text-yellow-100 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Được hỗ trợ bởi AI
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                Công việc phù hợp với bạn
              </h2>
              <p className="text-purple-200 md:text-lg">
                Để AI phân tích hồ sơ và gợi ý những cơ hội việc làm tốt nhất dựa trên kỹ năng và
                kinh nghiệm của bạn.
              </p>
            </div>

            {/* Stats cards */}
            <div className="flex gap-3 md:gap-4">
              {[
                { icon: Target, value: '85%', label: 'Độ phù hợp', color: 'text-yellow-300' },
                { icon: Zap, value: '12', label: 'Việc mới', color: 'text-green-300' },
                { icon: ArrowRight, value: '3', label: 'Đã ứng tuyển', color: 'text-blue-300' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-white/20 bg-white/15 px-5 py-4 shadow-inner ring-1 shadow-white/5 ring-white/25 backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:ring-white/40"
                  >
                    <Icon className={`mb-1 h-5 w-5 ${item.color}`} />
                    <span className="text-2xl font-extrabold text-white">{item.value}</span>
                    <span className="text-xs text-purple-200">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-purple-700 shadow-md transition hover:bg-purple-50 hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Tìm việc phù hợp ngay
            </Link>
            <Link
              href="/jobs"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Xem tất cả việc làm <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
