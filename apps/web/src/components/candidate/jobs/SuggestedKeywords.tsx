'use client';

import { Search } from 'lucide-react';

interface SuggestedKeywordsProps {
  onKeywordClick: (keyword: string) => void;
}

const keywords = [
  'tester',
  'business analyst',
  'lập trình viên',
  'lập trình frontend',
  'lập trình backend',
  'full stack developer',
  'it helpdesk',
  'nodejs',
  'reactjs',
  'java',
  // 'python',
  // 'devops',
  // 'ui/ux designer',
  // 'project manager',
  // 'data analyst',
];

export default function SuggestedKeywords({ onKeywordClick }: SuggestedKeywordsProps) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Search className="h-4 w-4 text-gray-400" />
        Từ khóa gợi ý:
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <button
            key={keyword}
            onClick={() => onKeywordClick(keyword)}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-700"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
