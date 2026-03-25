import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, MapPin, ShieldCheck } from 'lucide-react';

const getIndustryLabel = (industry?: { name: string; description: string | null } | null) => {
  if (!industry?.name) {
    return 'Lĩnh vực chưa cập nhật';
  }

  if (!industry.description) {
    return industry.name;
  }

  return `${industry.name} - ${industry.description}`;
};

export default async function RecommendedCompanies() {
  const recommendedCompanies = await prisma.company.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      companySize: {
        not: null,
      },
    },
    select: {
      id: true,
      companySlug: true,
      companyName: true,
      logoUrl: true,
      city: true,
      province: true,
      industry: {
        select: {
          name: true,
          description: true,
        },
      },
      _count: {
        select: {
          jobs: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      },
    },
    orderBy: [
      {
        companySize: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
    take: 5,
  });

  if (recommendedCompanies.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Công ty đề xuất</h3>
      </div>

      <div className="space-y-4">
        {recommendedCompanies.map((company) => {
          const industryLabel = getIndustryLabel(company.industry);

          return (
            <Link
              key={company.id}
              href={`/candidate/companies/${company.companySlug}`}
              className="group flex items-start gap-4 rounded-xl border border-transparent bg-slate-50 p-4 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:bg-slate-800/50 dark:hover:border-slate-700"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={company.companyName}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h4 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white">
                    {company.companyName}
                  </h4>
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{company.province}</span>
                  </div>

                  <span className="rounded bg-purple-100/60 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {company._count.jobs} việc làm
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  <span
                    title={industryLabel}
                    className="max-w-full truncate rounded bg-emerald-100/70 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {industryLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 border-t border-purple-100 pt-4 dark:border-slate-800">
        <Link
          href="/candidate/companies"
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition-colors hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
        >
          Xem tất cả các công ty đề xuất
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
