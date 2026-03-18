'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

export interface CompanyCardData {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  companySize?: string | null;
  activeJobsCount?: number | null;
  industry?: {
    name: string;
  } | null;
}

interface ModernCompanyCardProps {
  company: CompanyCardData;
}

export default function ModernCompanyCard({ company }: ModernCompanyCardProps) {
  const formatCompanySize = (size?: string | null) => {
    if (!size) return 'N/A';
    const mapping: Record<string, string> = {
      STARTUP_1_10: '1-10',
      SMALL_11_50: '11-50',
      MEDIUM_51_200: '51-200',
      LARGE_201_500: '201-500',
      ENTERPRISE_500_PLUS: '500+',
    };

    return mapping[size] || size;
  };

  const defaultCoverGradient = 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700';
  const logoBackgrounds = [
    'from-emerald-500 to-teal-500',
    'from-sky-500 to-blue-500',
    'from-violet-500 to-fuchsia-500',
    'from-orange-500 to-amber-500',
  ];

  const logoColorIndex = company.companyName.charCodeAt(0) % logoBackgrounds.length;
  const activeJobsValue =
    typeof company.activeJobsCount === 'number' ? String(company.activeJobsCount) : '--';
  const industryLabel = company.industry?.name || 'Company';

  return (
    <Link href={`/candidate/companies/${company.companySlug}`} className="block">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(124,58,237,0.2)]">
        <div className="relative h-36 overflow-hidden bg-slate-900">
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

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />

          <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-slate-900/65 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.22)]" />
            VERIFIED
          </div>
        </div>

        <div
          className={`absolute top-[108px] left-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br p-1.5 shadow-lg ${logoBackgrounds[logoColorIndex]}`}
        >
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-5 w-5 text-white" />
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pt-6 pb-4">
          <h3 className="line-clamp-1 text-2xl leading-tight font-extrabold tracking-tight text-slate-900">
            {company.companyName}
          </h3>
          <p className="mt-1 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            {industryLabel}
          </p>

          <p className="mt-3 line-clamp-3 min-h-[58px] text-[13px] leading-5 text-slate-600">
            {company.description || 'Company has not added a detailed description yet.'}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3">
            <div>
              <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                EMPLOYEES
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">
                {formatCompanySize(company.companySize)}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                ACTIVE JOBS
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">{activeJobsValue}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
              {industryLabel}
            </span>

            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-500 px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(168,85,247,0.42)] transition-transform group-hover:scale-105">
              View Profile
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
