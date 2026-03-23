import { Skeleton } from '@/components/ui/skeleton';

interface SavedJobsSkeletonProps {
  count?: number;
}

export default function SavedJobsSkeleton({ count = 3 }: SavedJobsSkeletonProps) {
  return (
    <div className="grid gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`saved-job-skeleton-${index}`}
          className="rounded-[28px] border border-purple-100 bg-white/95 p-6 shadow-sm shadow-purple-900/5"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-8 w-3/5 rounded-xl" />
                <Skeleton className="h-5 w-1/3 rounded-xl" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-28 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-4 w-28 rounded-full" />
                </div>
              </div>
            </div>

            <div className="w-full max-w-[260px] space-y-3 rounded-3xl border border-purple-100 bg-purple-50/70 p-5">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
