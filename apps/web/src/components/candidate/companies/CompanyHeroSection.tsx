'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function CompanyHeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    // reset page to 1 when searching
    params.set('page', '1');
    router.push(`/candidate/companies?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="relative mb-6 lg:mb-16">
      <div className="flex flex-col items-center rounded-3xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 via-purple-100 to-purple-500/5 py-14 text-center lg:py-20 dark:from-purple-900/20 dark:via-slate-900 dark:to-purple-900/20">
        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl dark:text-white">
          Khám phá <span className="text-purple-600">Thế hệ</span> Công ty hàng đầu
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Tìm kiếm và kết nối với hàng ngàn doanh nghiệp uy tín, đã được xác minh.
        </p>

        <div className="group relative mt-8 w-full max-w-2xl">
          <form onSubmit={handleSearch}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
              <Search className="h-6 w-6 text-purple-500" />
            </div>
            <input
              className="w-full rounded-2xl border-none bg-white py-5 pr-32 pl-14 text-lg text-slate-900 shadow-xl transition-all outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-purple-600/20 dark:bg-slate-800 dark:text-white"
              placeholder="Tìm kiếm công ty theo tên, ngành nghề..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute top-3 right-3 bottom-3 rounded-xl bg-purple-600 px-6 font-bold text-white transition-all hover:bg-purple-700"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
