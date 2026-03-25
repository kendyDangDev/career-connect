import React, { useState, KeyboardEvent } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterSectionProps {
  onSearch: (q: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

function InlineFilter({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-purple-500/50 dark:border-slate-800 dark:bg-slate-900">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <Select value={value || 'all'} onValueChange={(nextValue) => onChange(nextValue === 'all' ? '' : nextValue)}>
        <SelectTrigger className="h-auto min-h-0 w-auto min-w-[96px] border-0 bg-transparent p-0 font-semibold text-purple-600 shadow-none focus:ring-0 focus:ring-offset-0 dark:text-purple-400 [&>svg]:opacity-100 [&>svg]:text-slate-400">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const difficultyOptions = [
  { label: 'Cơ bản', value: 'EASY' },
  { label: 'Trung bình', value: 'MEDIUM' },
  { label: 'Nâng cao', value: 'HARD' },
];

const statusOptions = [
  { label: 'Sẵn sàng', value: 'READY' },
  { label: 'Đang tạo', value: 'GENERATING' },
  { label: 'Lỗi', value: 'FAILED' },
];

export default function FilterSection({
  onSearch,
  difficulty,
  onDifficultyChange,
  status,
  onStatusChange,
}: FilterSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => onSearch(inputValue.trim());

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            className="w-full border-none bg-transparent text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-200"
            placeholder="Tìm kiếm theo vị trí, kỹ năng hoặc từ khóa..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {inputValue && (
            <button onClick={handleClear} className="shrink-0 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-purple-600 px-8 py-2.5 font-bold text-white transition-colors hover:bg-purple-700"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <InlineFilter
          label="Mức độ:"
          value={difficulty}
          placeholder="Tất cả"
          options={difficultyOptions}
          onChange={onDifficultyChange}
        />

        <InlineFilter
          label="Trạng thái:"
          value={status}
          placeholder="Tất cả"
          options={statusOptions}
          onChange={onStatusChange}
        />

        <button className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-bold text-purple-600">
          <SlidersHorizontal className="h-4 w-4" /> Bộ lọc nâng cao
        </button>
      </div>
    </div>
  );
}
