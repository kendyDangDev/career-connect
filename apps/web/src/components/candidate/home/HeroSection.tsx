'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, MapPin, Search, Sparkles, TrendingUp } from 'lucide-react';
import {
  normalizeVietnamProvinceName,
  vietnamProvincesApi,
  vietnamProvincesKeys,
} from '@/api/vietnam-provinces.api';
import RecentSearchesDropdown from '@/components/candidate/search/RecentSearchesDropdown';
import { useCandidateSearchHistory } from '@/hooks/candidate/useSearchHistory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const popularSearches = [
  'Frontend Developer',
  'UI/UX Designer',
  'Data Analyst',
  'Product Manager',
  'Backend Engineer',
];

const typewriterSuggestions = [
  'Frontend Developer',
  'Backend Engineer',
  'UI/UX Designer',
  'Data Analyst',
  'Product Manager',
  'DevOps Engineer',
  'Mobile Developer',
];

const ALL_LOCATIONS_VALUE = '__all_locations__';

function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 40, pauseMs = 2000) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && display.length < current.length) {
      timeout = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), typingSpeed);
    } else if (!isDeleting && display.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && display.length > 0) {
      timeout = setTimeout(() => setDisplay(display.slice(0, -1)), deletingSpeed);
    } else {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [display, isDeleting, wordIdx, words, typingSpeed, deletingSpeed, pauseMs]);

  return display;
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationProvince, setLocationProvince] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const typewriterText = useTypewriter(typewriterSuggestions);
  const isCandidate = status === 'authenticated' && session?.user?.userType === 'CANDIDATE';
  const { searches, isLoadingRecentSearches, trackSearch } = useCandidateSearchHistory(
    isCandidate
  );
  const provincesQuery = useQuery({
    queryKey: vietnamProvincesKeys.all,
    queryFn: ({ signal }) => vietnamProvincesApi.getAll({ signal }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (!showRecentSearches) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRecentSearches]);

  const buildSearchUrl = (query: string, nextLocationProvince = locationProvince) => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();
    const trimmedLocationProvince = nextLocationProvince.trim();

    if (trimmedQuery) params.set('search', trimmedQuery);
    if (trimmedLocationProvince) params.set('locationProvince', trimmedLocationProvince);

    const queryString = params.toString();
    return `/candidate/jobs${queryString ? `?${queryString}` : ''}`;
  };

  const submitSearch = (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery && isCandidate) {
      void trackSearch(trimmedQuery);
    }

    setShowRecentSearches(false);
    router.push(buildSearchUrl(trimmedQuery));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/20 px-4 py-1.5 text-sm font-medium text-purple-100 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            Nền tảng tuyển dụng #1 Việt Nam
            <TrendingUp className="h-3.5 w-3.5 text-green-300" />
          </span>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Tìm công việc{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              mơ ước
            </span>{' '}
            của bạn
          </h1>
          <p className="mb-8 text-lg text-purple-200 md:text-xl">
            Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu. Kết nối tài năng với cơ
            hội toàn quốc.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-3 rounded-2xl bg-white/15 p-3 shadow-2xl ring-1 shadow-purple-900/30 ring-white/30 backdrop-blur-xl md:flex-row">
            <div
              ref={searchContainerRef}
              className="relative flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <Search className="h-5 w-5 shrink-0 text-purple-400" />
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => isCandidate && setShowRecentSearches(true)}
                  placeholder=" "
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-transparent outline-none md:text-base"
                />
                {!searchQuery && (
                  <span className="pointer-events-none absolute inset-0 flex items-center text-sm text-gray-400 md:text-base">
                    Tìm&nbsp;
                    <span className="font-medium text-purple-500">{typewriterText}</span>
                    <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-purple-400" />
                  </span>
                )}
              </div>
              <RecentSearchesDropdown
                visible={isCandidate && showRecentSearches}
                searches={searches}
                isLoading={isLoadingRecentSearches}
                onSelect={(keyword) => {
                  setSearchQuery(keyword);
                  submitSearch(keyword);
                }}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm md:w-52">
              <MapPin className="h-5 w-5 shrink-0 text-purple-400" />
              {provincesQuery.isError ? (
                <input
                  type="text"
                  value={locationProvince}
                  onChange={(e) => setLocationProvince(e.target.value)}
                  placeholder="Địa điểm..."
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none md:text-base"
                />
              ) : (
                <Select
                  value={locationProvince || ALL_LOCATIONS_VALUE}
                  onValueChange={(value) =>
                    setLocationProvince(value === ALL_LOCATIONS_VALUE ? '' : value)
                  }
                >
                  <SelectTrigger className="h-auto w-full border-none bg-transparent p-0 text-left text-sm text-gray-800 shadow-none focus:ring-0 focus:outline-none md:text-base">
                    <SelectValue
                      placeholder={
                        provincesQuery.isLoading ? 'Đang tải tỉnh/thành...' : 'Địa điểm...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value={ALL_LOCATIONS_VALUE}>Toàn quốc</SelectItem>
                    {(provincesQuery.data || []).map((province) => (
                      <SelectItem
                        key={province.code}
                        value={normalizeVietnamProvinceName(province.name)}
                      >
                        {normalizeVietnamProvinceName(province.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-indigo-600 hover:shadow-purple-500/30 active:scale-95"
            >
              <Search className="h-4 w-4" />
              <span>Tìm việc</span>
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-purple-300">Tìm kiếm phổ biến:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                submitSearch(term);
              }}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-purple-100 shadow-inner shadow-white/5 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white/25 hover:text-white hover:shadow-white/10"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/candidate/jobs"
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-purple-700 shadow-lg transition hover:shadow-purple-300/40"
          >
            Khám phá tất cả <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/auth/signup"
            className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Đăng ký miễn phí
          </a>
        </div>
      </div>
    </section>
  );
}
