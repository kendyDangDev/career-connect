'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, ChevronRight, Briefcase, BadgeCheck } from 'lucide-react';

interface Company {
  id: string;
  companySlug: string;
  companyName: string;
  logoUrl: string | null;
  activeJobCount: number;
  verificationStatus: string;
  industryCategory?: string | null;
}

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'verified', label: '✓ Đã xác thực' },
  { key: 'most_jobs', label: 'Nhiều việc nhất' },
  { key: 'tech', label: 'Công nghệ' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'healthcare', label: 'Y tế' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function TopCompaniesSection() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/companies?limit=8&sort=activeJobCount');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies ?? data.data ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return c.verificationStatus === 'VERIFIED';
    if (activeFilter === 'most_jobs') return c.activeJobCount >= 5;
    // industryCategory filter — chỉ hiện nếu API trả về field này
    return (c.industryCategory ?? '').toLowerCase().includes(activeFilter);
  });

  const skeletons = Array.from({ length: 8 });

  return (
    <section className="bg-gradient-to-b from-white to-gray-50/30 py-16">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="mb-2 inline-block text-sm font-semibold tracking-widest text-purple-500 uppercase">
            Nhà tuyển dụng hàng đầu
          </span>
          <h2 className="text-3xl font-bold text-gray-900">
            Công ty{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              uy tín
            </span>
          </h2>
          <p className="mt-1 text-gray-500">Đối tác tuyển dụng được xác thực trên CareerConnect</p>
        </div>
        <Link
          href="/companies"
          className="hidden items-center gap-1 text-sm font-semibold text-purple-600 transition hover:text-purple-800 md:flex"
        >
          Xem tất cả <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
              activeFilter === f.key
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {loading
          ? skeletons.map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="mb-3 h-12 w-12 rounded-xl bg-gray-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))
          : (filtered.length > 0 ? filtered : companies).map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.companySlug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50"
              >
                {/* Verified badge */}
                {company.verificationStatus === 'VERIFIED' && (
                  <span className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-600">
                    <BadgeCheck className="h-3 w-3" />
                  </span>
                )}

                {/* Logo */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {company.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt={company.companyName}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                {/* Name */}
                <p className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                  {company.companyName}
                </p>

                {/* Job count */}
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3 text-purple-400" />
                  <span>{company.activeJobCount} việc làm</span>
                </div>

                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/0 to-indigo-50/0 transition group-hover:from-purple-50/30 group-hover:to-indigo-50/20" />
              </Link>
            ))}
      </div>

      {/* Empty state khi filter không có kết quả */}
      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          Không có công ty nào trong danh mục này.
        </div>
      )}

      {/* Mobile see all */}
      <div className="mt-6 flex justify-center md:hidden">
        <Link
          href="/companies"
          className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-800"
        >
          Xem tất cả công ty <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
