'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, Building2, Users, TrendingUp } from 'lucide-react';

const stats = [
  {
    id: '1',
    label: 'Việc làm đang tuyển',
    target: 15,
    suffix: 'K+',
    decimals: 0,
    trend: '+12%',
    icon: Briefcase,
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    id: '2',
    label: 'Công ty tuyển dụng',
    target: 3.2,
    suffix: 'K',
    decimals: 1,
    trend: '+8%',
    icon: Building2,
    gradient: 'from-indigo-500 to-indigo-700',
  },
  {
    id: '3',
    label: 'Ứng viên tìm việc',
    target: 250,
    suffix: 'K+',
    decimals: 0,
    trend: '+25%',
    icon: Users,
    gradient: 'from-violet-500 to-violet-700',
  },
  {
    id: '4',
    label: 'Được tuyển tháng này',
    target: 5.8,
    suffix: 'K',
    decimals: 1,
    trend: '+18%',
    icon: TrendingUp,
    gradient: 'from-fuchsia-500 to-fuchsia-700',
  },
];

function useCountUp(target: number, decimals: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(parseFloat((ease * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, decimals, duration]);

  return count;
}

function StatCard({ stat, active }: { stat: (typeof stats)[0]; active: boolean }) {
  const count = useCountUp(stat.target, stat.decimals, 1800, active);
  const Icon = stat.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-lg hover:shadow-purple-900/30">
      {/* Icon */}
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      {/* Animated Value */}
      <div className="text-3xl font-extrabold text-white tabular-nums">
        {stat.decimals > 0 ? count.toFixed(stat.decimals) : Math.floor(count)}
        {stat.suffix}
      </div>
      {/* Label */}
      <div className="mt-1 text-sm text-purple-200">{stat.label}</div>
      {/* Trend badge */}
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-300">
        <TrendingUp className="h-3 w-3" />
        {stat.trend}
      </div>
      {/* Decorative corner */}
      <div className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/5 transition-colors group-hover:bg-white/10" />
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-14"
    >
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-purple-200 ring-1 ring-white/20 backdrop-blur-sm">
            Vietnam&apos;s #1 Job Platform
          </span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Kết nối tài năng với{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
              cơ hội
            </span>
          </h2>
          <p className="mt-2 text-purple-300">Số liệu cập nhật theo thời gian thực từ nền tảng</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} active={hasAnimated} />
          ))}
        </div>
      </div>
    </section>
  );
}
