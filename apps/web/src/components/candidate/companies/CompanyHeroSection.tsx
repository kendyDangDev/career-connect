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
    <section className="relative mb-12 lg:mb-16">
      <div className="flex flex-col items-center text-center space-y-8 py-14 lg:py-20 px-4 rounded-3xl bg-gradient-to-br from-purple-500/5 via-purple-100 to-purple-500/5 dark:from-purple-900/20 dark:via-slate-900 dark:to-purple-900/20 border border-purple-500/10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl text-slate-900 dark:text-white">
          Khám phá <span className="text-purple-600">Thế hệ</span> Công ty hàng đầu
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
          Truy cập hệ thống dữ liệu doanh nghiệp lớn nhất, được thẩm định và xác minh đầy đủ.
        </p>
        
        <div className="w-full max-w-2xl relative group">
          <form onSubmit={handleSearch}>
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-purple-500 h-6 w-6" />
            </div>
            <input 
              className="w-full pl-14 pr-32 py-5 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-xl focus:ring-4 focus:ring-purple-600/20 transition-all text-lg placeholder:text-slate-400 outline-none text-slate-900 dark:text-white" 
              placeholder="Tìm kiếm công ty theo tên, ngành nghề..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700 transition-all"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
