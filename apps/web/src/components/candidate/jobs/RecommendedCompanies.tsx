import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';
import Image from 'next/image';

export default async function RecommendedCompanies() {
  // Fetch up to 20 verified companies, then randomly select 5
  const companies = await prisma.company.findMany({
    where: {
      verificationStatus: 'VERIFIED',
    },
    include: {
      _count: {
        select: { jobs: { where: { status: 'ACTIVE' } } },
      },
    },
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Randomize and take 5
  const recommendedCompanies = [...companies].sort(() => 0.5 - Math.random()).slice(0, 5);

  if (recommendedCompanies.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Công ty đề xuất</h3>
      </div>

      <div className="space-y-4">
        {recommendedCompanies.map((company) => (
          <Link
            key={company.id}
            href={`/candidate/companies/${company.companySlug}`}
            className="group flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-4 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:bg-slate-800/50 dark:hover:border-slate-700"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800">
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

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1">
                <h4 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white">
                  {company.companyName}
                </h4>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-purple-500" />
              </div>

              <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 rounded bg-purple-100/50 px-1.5 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {company._count.jobs} việc làm
                </span>
                {company.city && (
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="h-3 w-3" />
                    {company.city}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
