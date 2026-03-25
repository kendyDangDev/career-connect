'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';
import ModernJobCard from '@/components/candidate/jobs/ModernJobCard';
import { useCandidateRecommendations } from '@/hooks/candidate/useRecommendations';

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`recommended-jobs-skeleton-${index}`}
          className="h-[280px] animate-pulse rounded-[1.75rem] border border-purple-100 bg-white/80"
        />
      ))}
    </div>
  );
}

export default function RecommendedJobs() {
  const { data: session, status } = useSession();
  const isCandidate = session?.user?.userType === 'CANDIDATE';
  const recommendationsQuery = useCandidateRecommendations(
    status === 'authenticated' && isCandidate
  );

  if (status === 'loading' || !isCandidate) {
    return null;
  }

  const recommendation = recommendationsQuery.data;
  const jobs = recommendation?.jobs ?? [];
  const heading = recommendation?.title ?? 'Đề xuất dựa trên hoạt động ứng tuyển của bạn';
  const description =
    recommendation?.description ??
    'Hệ thống ưu tiên các vị trí gần với những công việc bạn đã xem, lưu và ứng tuyển gần đây.';
  const isProfileFallback = recommendation?.strategy === 'profile';

  return (
    <section className="py-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-purple-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(250,245,255,0.96))] p-6 shadow-[0_24px_60px_-38px_rgba(88,28,135,0.45)]">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-28 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="relative mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-purple-700 uppercase">
              <BrainCircuit className="h-3.5 w-3.5" />
              {isProfileFallback ? 'Profile Matching' : 'Personalized Matching'}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-[2rem]">
              {heading}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <Link
            href="/candidate/jobs"
            className="inline-flex items-center gap-2 self-start rounded-full border border-purple-200 bg-white/85 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:text-purple-800"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recommendationsQuery.isLoading ? <LoadingSkeleton /> : null}

        {!recommendationsQuery.isLoading && recommendationsQuery.isError ? (
          <div className="rounded-[1.75rem] border border-dashed border-purple-200 bg-white/80 px-5 py-6 text-sm text-slate-600">
            Không thể tải danh sách đề xuất lúc này. Bạn có thể thử lại sau ít phút.
          </div>
        ) : null}

        {!recommendationsQuery.isLoading && !recommendationsQuery.isError && jobs.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-purple-200/80 bg-white/80 px-5 py-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-purple-100 p-2 text-purple-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chưa đủ tín hiệu để cá nhân hóa
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Hãy xem, lưu hoặc ứng tuyển thêm vài công việc. Khi có đủ dữ liệu hành vi hoặc
                  thông tin hồ sơ, hệ thống sẽ bắt đầu đề xuất các vị trí sát hơn với mối quan tâm
                  của bạn.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!recommendationsQuery.isLoading && !recommendationsQuery.isError && jobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <ModernJobCard key={job.id} job={job} isUrgent={Boolean(job.urgent)} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
