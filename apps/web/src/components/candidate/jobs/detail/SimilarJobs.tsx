'use client';

import { Loader2, Orbit } from 'lucide-react';
import ModernJobCard from '@/components/candidate/jobs/ModernJobCard';
import { useSimilarJobs } from '@/hooks/candidate/useRecommendations';

function SimilarJobsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`similar-jobs-skeleton-${index}`}
          className="h-[320px] w-full animate-pulse rounded-[1.75rem] border border-purple-100 bg-white/80"
        />
      ))}
    </div>
  );
}

export default function SimilarJobs({ currentJobId }: { currentJobId: string }) {
  const { data: jobs = [], isLoading, isError } = useSimilarJobs(currentJobId);

  if (!currentJobId) {
    return null;
  }

  if (!isLoading && (isError || jobs.length === 0)) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-purple-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(250,245,255,0.96))] p-6 shadow-[0_24px_60px_-38px_rgba(88,28,135,0.35)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-purple-700 uppercase">
            <Orbit className="h-3.5 w-3.5" />
            Similarity Graph
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Việc làm đề xuất dựa trên hành vi ứng viên
          </h2>
        </div>

        {isLoading ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/85 px-3 py-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            Đang tải
          </div>
        ) : null}
      </div>

      {isLoading ? <SimilarJobsSkeleton /> : null}

      {!isLoading && jobs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="w-full">
              <ModernJobCard job={job} isUrgent={Boolean(job.urgent)} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
