'use client';

import React from 'react';

interface DifficultySelectorProps {
  value: 'EASY' | 'MEDIUM' | 'HARD';
  onChange: (value: 'EASY' | 'MEDIUM' | 'HARD') => void;
}

const options = [
  { value: 'EASY' as const, label: 'Cơ bản', description: 'Câu hỏi kiến thức nền tảng', color: 'green' },
  { value: 'MEDIUM' as const, label: 'Trung bình', description: 'Yêu cầu kinh nghiệm thực tế', color: 'orange' },
  { value: 'HARD' as const, label: 'Nâng cao', description: 'System design, case study phức tạp', color: 'red' },
];

const colorMap: Record<string, { selected: string; ring: string; dot: string }> = {
  green: {
    selected: 'border-green-500 bg-green-50/50 dark:bg-green-900/10',
    ring: 'ring-green-500/30',
    dot: 'bg-green-500',
  },
  orange: {
    selected: 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10',
    ring: 'ring-orange-500/30',
    dot: 'bg-orange-500',
  },
  red: {
    selected: 'border-red-500 bg-red-50/50 dark:bg-red-900/10',
    ring: 'ring-red-500/30',
    dot: 'bg-red-500',
  },
};

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const colors = colorMap[opt.color];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              p-4 rounded-xl border-2 text-left transition-all
              ${isSelected
                ? `${colors.selected} ${colors.ring} ring-2`
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? colors.dot : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{opt.label}</span>
            </div>
            <p className="text-xs text-slate-500 pl-[18px]">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
