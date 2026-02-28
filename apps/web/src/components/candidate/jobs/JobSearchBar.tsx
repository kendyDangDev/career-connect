'use client';

import { Search, X, MapPin } from 'lucide-react';
import { useRef } from 'react';

interface JobSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function JobSearchBar({ value, onChange, onSubmit }: JobSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    onSubmit('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl transition focus-within:border-white/40 focus-within:bg-white/15"
    >
      <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm kiếm vị trí, công ty, kỹ năng..."
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none md:text-base"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-700 hover:to-indigo-700 md:px-8"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
