'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxDisplay?: number;
  disabled?: boolean;
  loading?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyMessage = 'Không tìm thấy kết quả',
  maxDisplay = 3,
  disabled = false,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options?.filter((option) => selected.includes(option.id));
  const filteredOptions = options?.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  console.log('SKILL:', options);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];

    onSelectionChange(newSelected);
  };

  const handleRemove = (optionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectionChange(selected.filter((id) => id !== optionId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-auto min-h-[40px] w-full justify-between"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selected.length <= maxDisplay ? (
            selectedOptions?.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                {option.name}
                <button
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                  onClick={(e) => handleRemove(option.id, e)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">{selected.length} mục đã chọn</span>
          )}
          {selected.length === 0 && <span className="text-sm text-gray-500">{placeholder}</span>}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b p-2">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {loading ? (
              <div className="p-2 text-sm text-gray-500">Đang tải...</div>
            ) : filteredOptions?.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">{emptyMessage}</div>
            ) : (
              filteredOptions?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-100',
                    selected.includes(option.id) && 'bg-blue-50'
                  )}
                  onClick={() => handleSelect(option.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
