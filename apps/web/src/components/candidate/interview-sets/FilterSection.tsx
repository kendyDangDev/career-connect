import React, { useState, KeyboardEvent } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

interface FilterSectionProps {
  onSearch: (q: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

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
      {/* Search Input */}
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

      {/* Action Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Difficulty filter */}
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-purple-500/50 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-600 dark:text-slate-400">Mức độ:</span>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="appearance-none bg-transparent font-semibold text-purple-600 focus:outline-none dark:text-purple-400"
          >
            <option value="">Tất cả</option>
            <option value="EASY">Cơ bản</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Nâng cao</option>
          </select>
          <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
        </label>

        {/* Status filter */}
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-purple-500/50 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-600 dark:text-slate-400">Trạng thái:</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-transparent font-semibold text-purple-600 focus:outline-none dark:text-purple-400"
          >
            <option value="">Tất cả</option>
            <option value="READY">Sẵn sàng</option>
            <option value="GENERATING">Đang tạo</option>
            <option value="FAILED">Lỗi</option>
          </select>
          <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
        </label>

        <button className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-bold text-purple-600">
          <SlidersHorizontal className="h-4 w-4" /> Bộ lọc nâng cao
        </button>
      </div>
    </div>
  );
}
