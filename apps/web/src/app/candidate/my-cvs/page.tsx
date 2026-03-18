import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import MyCVsClient from '@/components/candidate/my-cvs/MyCVsClient';

export const metadata = {
  title: 'Quản lý CV | CareerConnect',
  description: 'Quản lý và tối ưu hoá hồ sơ chuyên nghiệp của bạn.',
};

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center bg-slate-50 *:justify-center dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );
}

export default function MyCVsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyCVsClient />
    </Suspense>
  );
}
