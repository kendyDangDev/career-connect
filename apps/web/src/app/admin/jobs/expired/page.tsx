'use client';

import { JobStatusPage } from '@/components/admin/jobs/JobStatusPage';
import { JobStatus } from '@/generated/prisma';

export default function ExpiredJobsPage() {
  return (
    <JobStatusPage
      status={JobStatus.EXPIRED}
      title="Tin hết hạn"
      description="Các tin tuyển dụng đã quá hạn nộp hồ sơ hoặc đã ngừng hiển thị"
      bgColor="bg-red-50"
      borderColor="border-red-200"
      textColor="text-red-900"
      bulkActions={[
        {
          label: 'Gia hạn',
          action: 'UPDATE_STATUS',
          color: 'text-blue-600 hover:text-blue-800',
          confirm: true,
        },
        {
          label: 'Xóa vĩnh viễn',
          action: 'DELETE',
          color: 'text-red-600 hover:text-red-800',
          confirm: true,
        },
      ]}
    />
  );
}
