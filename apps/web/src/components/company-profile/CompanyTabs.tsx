'use client';

import { cn } from '@/lib/utils';

export type CompanyTabKey = 'overview' | 'jobs' | 'life' | 'reviews';

interface Tab {
  key: CompanyTabKey;
  label: string;
  count?: number;
}

interface CompanyTabsProps {
  activeTab: CompanyTabKey;
  jobsCount?: number;
  onTabChange: (tab: CompanyTabKey) => void;
}

export function CompanyTabs({ activeTab, jobsCount, onTabChange }: CompanyTabsProps) {
  const tabs: Tab[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'jobs', label: 'Jobs', count: jobsCount },
    { key: 'life', label: 'Life at Company' },
    { key: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-1 px-2" aria-label="Company tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-3.5 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
            )}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  activeTab === tab.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
