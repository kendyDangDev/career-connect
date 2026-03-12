import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Use a client component shell for the scroll behavior if needed, or simple CSS.
export default async function FeaturedCompanies() {
  // Fetch up to 10 verified companies that have cover images / logos for featured section
  const companies = await prisma.company.findMany({
    where: {
      verificationStatus: 'VERIFIED',
    },
    include: {
      industry: true,
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (companies.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex w-full items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Star className="text-purple-600 fill-current h-6 w-6" /> Công ty Nổi bật
        </h2>
        <div className="flex gap-2">
          {/* Implement scroll buttons in a client component wrapper if interactability is desired, hiding for simplicity here as we use snap scrolling */}
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory">
        {companies.map((company, index) => {
          // Fallback gradients if no cover image
          const gradients = [
            'from-purple-600/80 to-purple-900/80',
            'from-blue-600/80 to-blue-900/80',
            'from-emerald-600/80 to-emerald-900/80',
            'from-rose-600/80 to-rose-900/80',
            'from-amber-600/80 to-amber-900/80',
          ];
          const fallBackGradient = gradients[index % gradients.length];

          return (
            <Link
              href={`/candidate/companies/${company.companySlug}`}
              key={company.id}
              className="flex-none w-72 snap-start group"
            >
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:-translate-y-1 bg-slate-100 dark:bg-slate-800">
                {company.coverImageUrl ? (
                  <Image
                    src={company.coverImageUrl}
                    alt={company.companyName}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${fallBackGradient} transition-transform duration-500 group-hover:scale-110`} />
                )}
                
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center gap-3 mb-2">
                    {company.logoUrl && (
                       <div className="h-8 w-8 rounded-lg bg-white p-1 overflow-hidden shrink-0">
                         <img src={company.logoUrl} alt="logo" className="h-full w-full object-contain" />
                       </div>
                    )}
                    <h3 className="text-white font-bold text-lg line-clamp-1">{company.companyName}</h3>
                  </div>
                  {company.industry && (
                    <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
                      {company.industry.name}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
