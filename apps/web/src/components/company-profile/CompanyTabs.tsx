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

  const sectionIdMap: Record<CompanyTabKey, string> = {
    overview: 'company-section-overview',
    jobs: 'company-section-jobs',
    life: 'company-section-life',
    reviews: 'company-section-reviews',
  };

  const handleTabClick = (tab: CompanyTabKey) => {
    onTabChange(tab);

    requestAnimationFrame(() => {
      const sectionId = sectionIdMap[tab];
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      window.history.replaceState(null, '', `#${sectionId}`);
    });
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-1 px-2" aria-label="Company tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-3.5 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:border-purple-200 hover:text-purple-700'
            )}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-purple-100 text-purple-600'
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
