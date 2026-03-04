'use client';

import { Search, MapPin, SlidersHorizontal, X, Plus, Bell } from 'lucide-react';
import { JobListFilters } from './JobListPage';
import { useState } from 'react';

interface SearchFilterSectionProps {
  filters: JobListFilters;
  onFilterChange: (filters: Partial<JobListFilters>) => void;
  onClearAll: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

const workTypeOptions = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Contract', value: 'CONTRACT' },
];

const experienceLevels = [
  { label: 'Entry', value: 'ENTRY_LEVEL' },
  { label: 'Mid-Level', value: 'MID_LEVEL' },
  { label: 'Senior', value: 'SENIOR' },
];

const jobCategories = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Design', value: 'design' },
  { label: 'Product', value: 'product' },
  { label: 'Marketing', value: 'marketing' },
];

export default function SearchFilterSection({
  filters,
  onFilterChange,
  onClearAll,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: SearchFilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salaryValue, setSalaryValue] = useState(filters.salaryMin || 120);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Tailwind', 'Prisma']);
  const [skillInput, setSkillInput] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [locationInput, setLocationInput] = useState(filters.locationCity || '');

  const handleWorkTypeToggle = (value: string) => {
    onFilterChange({ jobType: filters.jobType === value ? undefined : value });
  };

  const handleExperienceSelect = (value: string) => {
    onFilterChange({ experienceLevel: filters.experienceLevel === value ? undefined : value });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSalaryValue(value);
    onFilterChange({ salaryMin: value * 1000 });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSearchClick = () => {
    onSearchSubmit(searchValue);
  };

  const activeFiltersText = () => {
    const parts: string[] = [];
    if (filters.jobType)
      parts.push(workTypeOptions.find((w) => w.value === filters.jobType)?.label || '');
    if (filters.salaryMin) parts.push(`$${salaryValue}k+`);
    if (filters.experienceLevel)
      parts.push(experienceLevels.find((e) => e.value === filters.experienceLevel)?.label || '');
    return parts.length > 0 ? `Applied: ${parts.join(', ')}` : '';
  };

  return (
    <section className="w-full px-6 py-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 p-1 shadow-2xl shadow-purple-600/20">
          <div className="rounded-[calc(1.5rem-2px)] bg-white p-6 lg:p-8 dark:bg-slate-900">
            {/* Search Bar */}
            <div className="flex flex-col items-stretch gap-4 lg:flex-row">
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:flex-row dark:border-slate-700 dark:bg-slate-800">
                <div className="relative flex flex-1 items-center border-b border-slate-200 px-4 py-3.5 md:border-r md:border-b-0 dark:border-slate-700">
                  <Search className="mr-3 h-5 w-5 text-purple-600/70" />
                  <input
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
                    placeholder="Job title, keywords, or company"
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  />
                </div>
                <div className="relative flex flex-1 items-center px-4 py-3.5">
                  <MapPin className="mr-3 h-5 w-5 text-purple-600/70" />
                  <input
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
                    placeholder="City, state, or remote"
                    type="text"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      onFilterChange({ locationCity: e.target.value || undefined });
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSearchClick}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-purple-600 px-10 py-3.5 font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 lg:flex-none"
                >
                  Search Jobs
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex flex-1 items-center justify-center gap-2 lg:flex-none ${
                    showAdvanced
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 dark:bg-slate-800 dark:text-purple-400'
                  } rounded-2xl border border-purple-100 px-6 py-3.5 font-bold transition-all hover:bg-purple-100 dark:border-slate-700`}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-10 border-t border-slate-100 pt-8 md:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                  {/* Work Type */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Work Type
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {workTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="group flex cursor-pointer items-center gap-2.5"
                        >
                          <input
                            checked={filters.jobType === option.value}
                            onChange={() => handleWorkTypeToggle(option.value)}
                            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                            type="checkbox"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-purple-600 dark:text-slate-400">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Salary Range
                    </h3>
                    <div className="space-y-4 pr-4">
                      <input
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-purple-200 accent-purple-600 dark:bg-purple-900"
                        max="300"
                        min="0"
                        type="range"
                        value={salaryValue}
                        onChange={handleSalaryChange}
                      />
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">$0</span>
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-purple-600">
                          ${salaryValue}k+
                        </span>
                        <span className="text-slate-400">$300k+</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Experience Level
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => handleExperienceSelect(level.value)}
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                            filters.experienceLevel === level.value
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2">
                      <select
                        className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm font-medium focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-800"
                        value={filters.categoryId || ''}
                        onChange={(e) =>
                          onFilterChange({ categoryId: e.target.value || undefined })
                        }
                      >
                        <option value="">All Categories</option>
                        {jobCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Skills & Tools */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Skills & Tools
                    </h3>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Type to add skills..."
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Plus
                        className="absolute top-2.5 right-3 h-5 w-5 cursor-pointer text-slate-400 hover:text-purple-600"
                        onClick={handleAddSkill}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-600 uppercase dark:bg-slate-800"
                        >
                          {skill}
                          <X
                            className="h-3.5 w-3.5 cursor-pointer"
                            onClick={() => handleRemoveSkill(skill)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                        Verified Companies Only
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="peer sr-only"
                          type="checkbox"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-purple-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
                      </label>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase transition-colors hover:text-purple-600">
                      <Bell className="h-[18px] w-[18px]" />
                      Save Search
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    {activeFiltersText() && (
                      <span className="text-xs font-medium text-slate-400 italic">
                        {activeFiltersText()}
                      </span>
                    )}
                    <button
                      onClick={onClearAll}
                      className="text-xs font-bold text-purple-600 hover:underline"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
