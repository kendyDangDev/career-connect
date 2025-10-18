'use client';

import React from 'react';
import { JobStatusPage } from '@/components/admin/jobs/JobStatusPage';
import { JobStatus } from '@/generated/prisma';

export default function ApprovedJobsPage() {
  return (
    <JobStatusPage
      status={JobStatus.ACTIVE}
      title="Tin đã duyệt"
      description="Các tin tuyển dụng đã được duyệt và đang hiển thị trên hệ thống"
      bgColor="bg-green-50"
      borderColor="border-green-200"
      textColor="text-green-900"
      bulkActions={[
        { 
          label: 'Tạm dừng', 
          action: 'UPDATE_STATUS', 
          color: 'text-yellow-600 hover:text-yellow-800',
          confirm: true
        },
        { 
          label: 'Đóng tin', 
          action: 'UPDATE_STATUS', 
          color: 'text-red-600 hover:text-red-800',
          confirm: true
        },
        {
          label: 'Đánh dấu nổi bật',
          action: 'FEATURE',
          color: 'text-purple-600 hover:text-purple-800',
          confirm: false
        }
      ]}
    />
  );
}