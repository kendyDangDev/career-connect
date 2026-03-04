'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Briefcase, ChevronRight, RefreshCw } from 'lucide-react';
import JobCard, { JobCardData } from './JobCard';
import CategoryFilter from './CategoryFilter';
import { Container } from '@/components/ui';

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export default function JobsGrid() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  const fetchJobs = useCallback(async (page: number, category: string, append = false) => {
    try {
      setError(false);
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (category !== 'all') params.set('categoryId', category);
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const newJobs: JobCardData[] = data.data.jobs ?? data.data ?? [];
      setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
      setPagination({
        page: data.page ?? data.pagination?.page ?? page,
        totalPages: data.totalPages ?? data.pagination?.totalPages ?? 1,
        total: data.total ?? data.pagination?.total ?? newJobs.length,
      });
    } catch {
      setError(true);
    }
  }, []);

  const fetchFirstPage = useCallback(() => {
    setLoading(true);
    fetchJobs(1, selectedCategory, false).finally(() => setLoading(false));
  }, [selectedCategory, fetchJobs]);

  // Reload when category changes
  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const handleLoadMore = async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    await fetchJobs(pagination.page + 1, selectedCategory, true);
    setLoadingMore(false);
  };

  const handleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100 pb-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-40 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-200/40 to-indigo-200/40 blur-3xl" />
        <div className="absolute top-96 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-3xl" />
        <div className="absolute top-[600px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-100/20 to-pink-100/20 blur-3xl" />
      </div>

      {/* Sticky category filter */}
      <div className="relative z-10">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <Container>
        <div className="relative z-10 pt-10 pb-6">
          {/* Section header */}
          <div className="flex items-end justify-between">
            <div className="relative">
              {/* Decorative dot pattern */}
              <div className="absolute -top-4 -left-4 grid grid-cols-3 gap-1.5 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                ))}
              </div>

              <span className="mb-2 inline-flex items-center gap-2 text-sm font-bold tracking-widest text-purple-600 uppercase">
                <Briefcase className="h-4 w-4" />
                Cơ hội việc làm
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                Việc làm{' '}
                <span className="relative inline-block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  mới nhất
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="8"
                    viewBox="0 0 200 8"
                    fill="none"
                  >
                    <path
                      d="M0 4C50 4 50 2 100 4C150 6 150 4 200 4"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h2>
              {!loading && (
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  Tìm thấy{' '}
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-purple-200">
                    {pagination.total}
                  </span>{' '}
                  việc làm phù hợp
                </p>
              )}
            </div>
            <Link
              href="/jobs"
              className="group hidden items-center gap-1.5 rounded-full border-2 border-purple-200 bg-white px-5 py-2.5 text-sm font-semibold text-purple-600 shadow-sm transition-all hover:border-purple-300 hover:bg-purple-50 hover:shadow-md md:flex"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="relative">
              <div className="relative grid grid-cols-1 gap-5 py-4 sm:grid-cols-2 sm:py-6 lg:grid-cols-3 lg:gap-6 lg:py-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex gap-3">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100" />
                      <div className="flex-1 space-y-2.5 pt-1">
                        <div className="h-3 w-1/3 rounded-full bg-gray-200" />
                        <div className="h-4 w-2/3 rounded-full bg-gray-300" />
                      </div>
                    </div>
                    <div className="mb-4 flex gap-2">
                      <div className="h-6 w-24 rounded-full bg-purple-100" />
                      <div className="h-6 w-28 rounded-full bg-indigo-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 rounded-full bg-gray-200" />
                      <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white/60 py-24 text-center shadow-xl shadow-red-100/50 backdrop-blur-sm">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
                <RefreshCw className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Không thể tải danh sách việc làm
              </h3>
              <p className="mb-6 text-gray-600">Vui lòng thử lại sau ít phút</p>
              <button
                onClick={fetchFirstPage}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                Thử lại
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white/60 py-24 text-center shadow-xl shadow-purple-100/50 backdrop-blur-sm">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg">
                <Briefcase className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Không tìm thấy việc làm</h3>
              <p className="mb-6 max-w-md text-gray-600">
                Hiện chưa có việc làm trong danh mục này. Hãy thử chọn danh mục khác hoặc quay lại
                sau nhé!
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="rounded-full border-2 border-purple-200 bg-white px-6 py-2.5 text-sm font-semibold text-purple-600 shadow-md transition-all hover:border-purple-300 hover:bg-purple-50"
              >
                Xem tất cả danh mục
              </button>
            </div>
          ) : (
            <>
              {/* Jobs Grid Container with enhanced styling */}
              <div className="relative">
                {/* Jobs Grid */}
                <div className="relative grid grid-cols-1 gap-5 py-4 sm:grid-cols-2 sm:py-6 lg:grid-cols-3 lg:gap-6 lg:py-8">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      saved={savedIds.has(job.id)}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>

              {/* Load More / See All */}
              <div className="flex justify-center gap-4">
                {pagination.page < pagination.totalPages && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-8 py-3.5 text-sm font-semibold text-purple-700 shadow-md shadow-purple-100 transition-all hover:border-purple-300 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-200 disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                        Tải thêm việc làm
                      </>
                    )}
                  </button>
                )}
                <Link
                  href="/jobs"
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-300 transition-all hover:from-purple-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-400"
                >
                  Xem tất cả
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
