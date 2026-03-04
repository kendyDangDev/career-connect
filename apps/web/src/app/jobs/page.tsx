import JobListPage from '@/components/candidate/jobs/JobListPage';
import CandidateHomeFooter from '@/components/candidate/home/CandidateHomeFooter';
import ScrollToTop from '@/components/candidate/home/ScrollToTop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tìm kiếm việc làm | CareerConnect',
  description:
    'Tìm kiếm hàng ngàn cơ hội việc làm mới nhất trên CareerConnect. Lọc theo loại công việc, mức lương, kinh nghiệm và vị trí.',
  keywords: 'tìm việc làm, việc làm mới nhất, tuyển dụng, job search, CareerConnect',
};

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-white pt-16 antialiased">
      {/* <div className="pt-16"> */}
      <JobListPage />
      <CandidateHomeFooter />
      <ScrollToTop />
      {/* </div> */}
    </div>
  );
}
