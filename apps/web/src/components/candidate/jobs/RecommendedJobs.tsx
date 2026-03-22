import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Building2 } from 'lucide-react';
import Image from 'next/image';

export default async function RecommendedJobs() {
  // Fetch up to 20 urgent and published jobs, then randomly select 5
  const activeJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      urgent: true,
    },
    include: {
      company: {
        select: {
          companyName: true,
          logoUrl: true,
        },
      },
    },
    take: 20,
    orderBy: {
      publishedAt: 'desc',
    },
  });

  // Randomize and take 5
  const recommendedJobs = [...activeJobs].sort(() => 0.5 - Math.random()).slice(0, 5);

  if (recommendedJobs.length === 0) return null;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} Triệu`;
    if (min) return `Từ ${(min / 1000000).toFixed(0)} Triệu`;
    if (max) return `Đến ${(max / 1000000).toFixed(0)} Triệu`;
    return 'Thỏa thuận';
  };

  const getJobTypeLabel = (type?: string | null) => {
    if (!type) return 'Toàn thời gian';
    const labels: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      REMOTE: 'Remote',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance',
    };
    return labels[type] || type;
  };

  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Việc làm đề xuất</h3>
      </div>

      <div className="space-y-4">
        {recommendedJobs.map((job) => (
          <Link
            key={job.id}
            href={`/candidate/jobs/${job.id}`}
            className="group flex flex-col gap-3 rounded-xl border border-transparent bg-slate-50 p-4 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:bg-slate-800/50 dark:hover:border-slate-700"
          >
            <div className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800">
                {job.company?.logoUrl ? (
                  <Image
                    src={job.company.logoUrl}
                    alt={job.company.companyName}
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
                <h4 className="line-clamp-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-purple-700 dark:text-white">
                  {job.title}
                </h4>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {job.company?.companyName}
                </p>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <DollarSign className="h-3 w-3 text-green-500" />
                {formatSalary(Number(job.salaryMin), Number(job.salaryMax))}
              </span>
              <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <MapPin className="h-3 w-3 text-purple-400" />
                {job.locationProvince || 'Remote'}
              </span>
              <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <Clock className="h-3 w-3 text-blue-400" />
                {getJobTypeLabel(job.jobType)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
