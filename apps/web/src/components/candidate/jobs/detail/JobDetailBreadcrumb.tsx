'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

interface JobDetailBreadcrumbProps {
  category?: string;
  jobTitle: string;
}

export default function JobDetailBreadcrumb({ category, jobTitle }: JobDetailBreadcrumbProps) {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
      <Link href="/" className="hover:text-primary flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-sm">home</span>
        <span>Home</span>
      </Link>

      <span className="material-symbols-outlined text-xs">chevron_right</span>

      {category && (
        <>
          <Link
            href={`/candidate/jobs?category=${category}`}
            className="hover:text-primary transition-colors"
          >
            {category}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
        </>
      )}

      <span className="text-slate-900 dark:text-white">{jobTitle}</span>
    </nav>
  );
}
