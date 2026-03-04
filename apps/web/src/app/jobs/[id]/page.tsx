import JobDetailPage from '@/components/candidate/jobs/detail/JobDetailPage';
import CandidateHomeFooter from '@/components/candidate/home/CandidateHomeFooter';
import ScrollToTop from '@/components/candidate/home/ScrollToTop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi tiết việc làm | CareerConnect',
  description: 'Xem chi tiết việc làm, yêu cầu và quyền lợi. Ứng tuyển ngay trên CareerConnect.',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailRoute({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <div className="pt-16">
        <JobDetailPage jobId={id} />
        <CandidateHomeFooter />
        <ScrollToTop />
      </div>
    </div>
  );
}
