import JobListPage from '@/components/candidate/jobs/JobListPage';
import ScrollToTop from '@/components/candidate/home/ScrollToTop';
import RecommendedJobs from '@/components/candidate/jobs/RecommendedJobs';
import RecommendedCompanies from '@/components/candidate/jobs/RecommendedCompanies';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tìm kiếm việc làm | CareerConnect',
  description:
    'Tìm kiếm hàng ngàn cơ hội việc làm mới nhất trên CareerConnect. Lọc theo loại công việc, mức lương, kinh nghiệm và vị trí.',
  keywords: 'tìm việc làm, việc làm mới nhất, tuyển dụng, job search, CareerConnect',
};

export const dynamic = 'force-dynamic';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-white pt-16 antialiased">
      <Suspense>
        <JobListPage
          rightSidebar={
            <>
              <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />}>
                <RecommendedJobs />
              </Suspense>
              <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 animate-pulse mt-6" />}>
                <RecommendedCompanies />
              </Suspense>
            </>
          }
        />
      </Suspense>
      <ScrollToTop />
    </div>
  );
}
