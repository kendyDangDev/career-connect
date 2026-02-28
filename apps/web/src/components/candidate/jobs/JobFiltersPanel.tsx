'use client';

import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { JobListFilters } from './JobListPage';

interface JobFiltersPanelProps {
  filters: JobListFilters;
  onApply: (filters: Partial<JobListFilters>) => void;
  onClose: () => void;
  /** Renders inline (no close header) when true — used for desktop sidebar */
  inline?: boolean;
}

const jobTypes = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'CONTRACT', label: 'Hợp đồng' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const experienceLevels = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const locations = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Nha Trang',
  'Huế',
  'Buôn Ma Thuột',
  'Vũng Tàu',
];

export default function JobFiltersPanel({
  filters,
  onApply,
  onClose,
  inline = false,
}: JobFiltersPanelProps) {
  const [temp, setTemp] = useState<Partial<JobListFilters>>({ ...filters });

  const handleApply = () => {
    onApply(temp);
  };

  const handleReset = () => {
    setTemp({ page: 1, limit: 12 });
  };

  const toggleValue = (key: keyof JobListFilters, value: string | undefined) => {
    setTemp((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  return (
    <div
      className={`flex flex-col ${
        inline
          ? 'sticky top-24 rounded-2xl border border-gray-100 bg-white shadow-sm'
          : 'h-full bg-white'
      }`}
    >
      {/* Header */}
      {!inline && (
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {inline && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Bộ lọc tìm kiếm</h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
          >
            <RotateCcw className="h-3 w-3" />
            Đặt lại
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Job Type */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Loại công việc</h4>
          <div className="flex flex-wrap gap-2">
            {jobTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleValue('jobType', type.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  temp.jobType === type.value
                    ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Cấp độ kinh nghiệm</h4>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => toggleValue('experienceLevel', level.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  temp.experienceLevel === level.value
                    ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Địa điểm</h4>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => toggleValue('locationCity', loc)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  temp.locationCity === loc
                    ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Khoảng lương (VND)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tối thiểu</label>
              <input
                type="number"
                placeholder="VD: 15000000"
                value={temp.salaryMin ?? ''}
                onChange={(e) =>
                  setTemp((prev) => ({
                    ...prev,
                    salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tối đa</label>
              <input
                type="number"
                placeholder="VD: 30000000"
                value={temp.salaryMax ?? ''}
                onChange={(e) =>
                  setTemp((prev) => ({
                    ...prev,
                    salaryMax: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none"
              />
            </div>
          </div>
          {/* Quick salary presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: '10M+', min: 10_000_000 },
              { label: '15M+', min: 15_000_000 },
              { label: '20M+', min: 20_000_000 },
              { label: '30M+', min: 30_000_000 },
              { label: '50M+', min: 50_000_000 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  setTemp((prev) => ({
                    ...prev,
                    salaryMin: preset.min,
                    salaryMax: undefined,
                  }))
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  temp.salaryMin === preset.min
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-4">
        {!inline && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Đặt lại
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-indigo-700"
            >
              Áp dụng
            </button>
          </div>
        )}
        {inline && (
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-indigo-700"
          >
            Áp dụng bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
