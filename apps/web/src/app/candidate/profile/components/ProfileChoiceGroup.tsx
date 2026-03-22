'use client';

import { cn } from '@/lib/utils';

interface ProfileChoiceGroupOption {
  label: string;
  value: string;
}

interface ProfileChoiceGroupProps {
  options: ProfileChoiceGroupOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
}

export default function ProfileChoiceGroup({
  options,
  value,
  onChange,
  allowClear = false,
}: ProfileChoiceGroupProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(active && allowClear ? null : option.value)}
            className={cn(
              'rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'border-violet-500 bg-violet-600 text-white shadow-[0_16px_36px_rgba(124,58,237,0.28)]'
                : 'border-violet-200/80 bg-white/70 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
