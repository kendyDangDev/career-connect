'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Users } from 'lucide-react';

export interface CompanyCardData {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  companySize?: string | null;
  industry?: {
    name: string;
  } | null;
}

interface ModernCompanyCardProps {
  company: CompanyCardData;
}

export default function ModernCompanyCard({ company }: ModernCompanyCardProps) {
  // Convert enum formats like SMALL_11_50 to readable
  const formatCompanySize = (size?: string | null) => {
    if (!size) return 'Chưa cập nhật';
    const mapping: Record<string, string> = {
      STARTUP_1_10: '1-10 Nhân viên',
      SMALL_11_50: '11-50 Nhân viên',
      MEDIUM_51_200: '51-200 Nhân viên',
      LARGE_201_500: '201-500 Nhân viên',
      ENTERPRISE_500_PLUS: '500+ Nhân viên',
    };
    return mapping[size] || size;
  };

  const defaultCoverGradient =
    'bg-gradient-to-br from-purple-500/20 to-purple-800/20 dark:from-purple-900/40 dark:to-slate-900/80';

  return (
    <Link href={`/candidate/companies/${company.companySlug}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(127,19,236,0.15)] dark:border-slate-700/50 dark:bg-slate-800/50">
        {/* Cover Image & Glass Overlays */}
        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {company.coverImageUrl ? (
            <Image
              src={company.coverImageUrl}
              alt={`${company.companyName} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 ${defaultCoverGradient}`} />
          )}

          {/* Floating Logo - Glass styled */}
          <div className="absolute top-4 left-4 z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/70 p-2 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-purple-600" />
            )}
          </div>

          {/* Company Info Glass Overlay at Bottom */}
          <div className="absolute right-4 bottom-4 left-4 z-10 rounded-xl border border-white/30 bg-white/80 p-3 shadow-lg backdrop-blur-md transition-colors group-hover:bg-white/90 dark:border-slate-700/50 dark:bg-slate-900/80 dark:group-hover:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <h4 className="truncate leading-tight font-bold text-slate-900 dark:text-white">
                  {company.companyName}
                </h4>
                {company.industry && (
                  <span className="mt-0.5 block truncate text-[10px] font-semibold tracking-wider text-purple-600 uppercase dark:text-purple-400">
                    {company.industry.name}
                  </span>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 text-[10px] font-bold whitespace-nowrap text-slate-600 dark:text-slate-300">
                  <Users className="h-3 w-3" />
                  {formatCompanySize(company.companySize).split(' ')[0]} Emp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="space-y-4 border-t border-slate-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
            {company.description || 'Công ty chưa cập nhật mô tả chi tiết.'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {company.industry && (
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-purple-600 uppercase dark:bg-purple-900/20 dark:text-purple-300">
                {company.industry.name}
              </span>
            )}
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-600 uppercase dark:bg-slate-700/50 dark:text-slate-300">
              Verified
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
