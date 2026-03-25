'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, SlidersHorizontal, X, Plus, Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useSession } from 'next-auth/react';
import { JobListFilters } from './JobListPage';
import { useDebounce } from '@/hooks/useDebounced';
import {
  normalizeVietnamProvinceName,
  vietnamProvincesApi,
  vietnamProvincesKeys,
} from '@/api/vietnam-provinces.api';
import RecentSearchesDropdown from '@/components/candidate/search/RecentSearchesDropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCandidateSearchHistory } from '@/hooks/candidate/useSearchHistory';

interface SearchFilterSectionProps {
  filters: JobListFilters;
  onFilterChange: (filters: Partial<JobListFilters>) => void;
  onClearAll: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

interface JobCategoryOption {
  id: string;
  name: string;
}

interface JobSkillOption {
  id: string;
  name: string;
  category: string;
}

const workTypeOptions = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
];

const experienceLevels = [
  { label: 'Entry', value: 'ENTRY' },
  { label: 'Mid-Level', value: 'MID' },
  { label: 'Senior', value: 'SENIOR' },
  { label: 'Lead', value: 'LEAD' },
  { label: 'Executive', value: 'EXECUTIVE' },
];

const ALL_LOCATIONS_VALUE = '__all_locations__';
const SALARY_RANGE_MIN = 1_000_000;
const SALARY_RANGE_MAX = 100_000_000;
const SALARY_RANGE_STEP = 1_000_000;

const normalizeSkillTerm = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const formatSkillTerm = (value: string) => value.trim().replace(/\s+/g, ' ');
const salaryFormatter = new Intl.NumberFormat('vi-VN');

const formatSalaryInputValue = (value: number) => salaryFormatter.format(value);
const formatSalaryCompact = (value: number) =>
  value % 1_000_000 === 0
    ? `${salaryFormatter.format(value / 1_000_000)} triệu`
    : `${salaryFormatter.format(value)} đ`;

const clampSalaryValue = (value: number) =>
  Math.min(
    Math.max(Math.round(value / SALARY_RANGE_STEP) * SALARY_RANGE_STEP, SALARY_RANGE_MIN),
    SALARY_RANGE_MAX
  );

const getSliderSalaryValue = (value: number | undefined, fallback: number) =>
  value !== undefined ? clampSalaryValue(value) : fallback;

const formatSalaryVnd = (value: number) => `${salaryFormatter.format(value)} VND`;

const parseSalaryInputValue = (value: string) => {
  const trimmedValue = value.replace(/[^\d]/g, '');
  if (!trimmedValue) return undefined;

  const parsedValue = Number(trimmedValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) return undefined;

  return parsedValue;
};

export default function SearchFilterSection({
  filters,
  onFilterChange,
  onClearAll,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: SearchFilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salaryMinInput, setSalaryMinInput] = useState(
    formatSalaryInputValue(getSliderSalaryValue(filters.salaryMin, SALARY_RANGE_MIN))
  );
  const [salaryMaxInput, setSalaryMaxInput] = useState(
    formatSalaryInputValue(getSliderSalaryValue(filters.salaryMax, SALARY_RANGE_MAX))
  );
  const [salaryRange, setSalaryRange] = useState<[number, number]>([
    getSliderSalaryValue(filters.salaryMin, SALARY_RANGE_MIN),
    getSliderSalaryValue(filters.salaryMax, SALARY_RANGE_MAX),
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSalaryRange = useDebounce(salaryRange, 400);
  const debouncedSkillInput = useDebounce(skillInput, 250);
  const { data: session, status } = useSession();
  const isCandidate = status === 'authenticated' && session?.user?.userType === 'CANDIDATE';
  const { searches, isLoadingRecentSearches, trackSearch } = useCandidateSearchHistory(
    isCandidate
  );

  const provincesQuery = useQuery({
    queryKey: vietnamProvincesKeys.all,
    queryFn: ({ signal }) => vietnamProvincesApi.getAll({ signal }),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const categoriesQuery = useQuery<JobCategoryOption[]>({
    enabled: showAdvanced,
    queryKey: ['job-filter-categories'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/jobs/categories', { signal });
      if (!response.ok) throw new Error('Failed to load categories');

      const data = await response.json();
      return (data.categories ?? []) as JobCategoryOption[];
    },
    staleTime: 1000 * 60 * 60,
  });
  const skillsQuery = useQuery<JobSkillOption[]>({
    enabled: showAdvanced,
    queryKey: ['job-filter-skills', debouncedSkillInput],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      const trimmedSearch = debouncedSkillInput.trim();

      if (trimmedSearch) {
        params.set('search', trimmedSearch);
      }

      params.set('limit', trimmedSearch ? '12' : '24');

      const response = await fetch(`/api/jobs/skill-options?${params.toString()}`, { signal });
      if (!response.ok) throw new Error('Failed to load skills');

      const data = await response.json();
      return (data.skills ?? []) as JobSkillOption[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const selectedSkillTerms = filters.skills ?? [];
  const normalizedSelectedSkillTerms = useMemo(
    () => new Set(selectedSkillTerms.map((skillTerm) => normalizeSkillTerm(skillTerm))),
    [selectedSkillTerms]
  );
  const selectedSkills = useMemo(() => {
    const allSkills = skillsQuery.data ?? [];

    return selectedSkillTerms.map((skillTerm) => {
      const normalizedTerm = normalizeSkillTerm(skillTerm);
      const matchingSkill = allSkills.find(
        (skill) => skill.id === skillTerm || normalizeSkillTerm(skill.name) === normalizedTerm
      );

      return {
        key: skillTerm,
        label: matchingSkill?.name ?? skillTerm,
        category: matchingSkill?.category,
      };
    });
  }, [selectedSkillTerms, skillsQuery.data]);
  const skillSuggestions = useMemo(() => {
    const availableSkills = (skillsQuery.data ?? []).filter((skill) => {
      if (normalizedSelectedSkillTerms.has(normalizeSkillTerm(skill.name))) {
        return false;
      }

      return !selectedSkillTerms.includes(skill.id);
    });

    return availableSkills.slice(0, 6);
  }, [normalizedSelectedSkillTerms, selectedSkillTerms, skillsQuery.data]);
  const canAddCustomSkill = useMemo(() => {
    const formattedSkillTerm = formatSkillTerm(skillInput);
    if (!formattedSkillTerm) return false;

    return !normalizedSelectedSkillTerms.has(normalizeSkillTerm(formattedSkillTerm));
  }, [normalizedSelectedSkillTerms, skillInput]);
  const sliderTrackStart =
    ((salaryRange[0] - SALARY_RANGE_MIN) / (SALARY_RANGE_MAX - SALARY_RANGE_MIN)) * 100;
  const sliderTrackEnd =
    ((salaryRange[1] - SALARY_RANGE_MIN) / (SALARY_RANGE_MAX - SALARY_RANGE_MIN)) * 100;

  useEffect(() => {
    const nextMin = getSliderSalaryValue(filters.salaryMin, SALARY_RANGE_MIN);
    const nextMax = getSliderSalaryValue(filters.salaryMax, SALARY_RANGE_MAX);
    const [normalizedMin, normalizedMax] =
      nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin];

    setSalaryRange([normalizedMin, normalizedMax]);
    setSalaryMinInput(formatSalaryInputValue(normalizedMin));
    setSalaryMaxInput(formatSalaryInputValue(normalizedMax));
  }, [filters.salaryMin, filters.salaryMax]);

  useEffect(() => {
    if (!filters.skills || filters.skills.length === 0) {
      setSkillInput('');
    }
  }, [filters.skills]);

  useEffect(() => {
    if (!showRecentSearches) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRecentSearches]);

  useEffect(() => {
    const [nextMin, nextMax] = debouncedSalaryRange;
    const isFullRange = nextMin === SALARY_RANGE_MIN && nextMax === SALARY_RANGE_MAX;
    const nextSalaryMin = isFullRange ? undefined : nextMin;
    const nextSalaryMax = isFullRange ? undefined : nextMax;

    if (filters.salaryMin === nextSalaryMin && filters.salaryMax === nextSalaryMax) {
      return;
    }

    onFilterChange({
      salaryMin: nextSalaryMin,
      salaryMax: nextSalaryMax,
    });
  }, [debouncedSalaryRange, filters.salaryMax, filters.salaryMin, onFilterChange]);

  const handleWorkTypeToggle = (value: string) => {
    onFilterChange({ jobType: filters.jobType === value ? undefined : value });
  };

  const handleExperienceSelect = (value: string) => {
    onFilterChange({ experienceLevel: filters.experienceLevel === value ? undefined : value });
  };

  const applySalaryFilters = (nextMin?: number, nextMax?: number) => {
    let normalizedMin = nextMin !== undefined ? clampSalaryValue(nextMin) : undefined;
    let normalizedMax = nextMax !== undefined ? clampSalaryValue(nextMax) : undefined;

    if (
      normalizedMin !== undefined &&
      normalizedMax !== undefined &&
      normalizedMin > normalizedMax
    ) {
      [normalizedMin, normalizedMax] = [normalizedMax, normalizedMin];
    }

    const nextSliderMin = normalizedMin ?? SALARY_RANGE_MIN;
    const nextSliderMax = normalizedMax ?? SALARY_RANGE_MAX;
    setSalaryRange([nextSliderMin, nextSliderMax]);
    setSalaryMinInput(formatSalaryInputValue(nextSliderMin));
    setSalaryMaxInput(formatSalaryInputValue(nextSliderMax));
  };

  const handleSalaryMinChange = (value: string) => {
    const nextMin = parseSalaryInputValue(value);
    if (nextMin === undefined) {
      setSalaryMinInput('');
      return;
    }

    const normalizedMin = clampSalaryValue(nextMin);
    const nextMax = salaryRange[1] < normalizedMin ? normalizedMin : salaryRange[1];

    setSalaryMinInput(formatSalaryInputValue(normalizedMin));
    applySalaryFilters(nextMin, nextMax);
  };

  const handleSalaryMaxChange = (value: string) => {
    const nextMax = parseSalaryInputValue(value);
    if (nextMax === undefined) {
      setSalaryMaxInput('');
      return;
    }

    const normalizedMax = clampSalaryValue(nextMax);
    const nextMin = salaryRange[0] > normalizedMax ? normalizedMax : salaryRange[0];

    setSalaryMaxInput(formatSalaryInputValue(normalizedMax));
    applySalaryFilters(nextMin, nextMax);
  };

  const handleSalaryInputBlur = (boundary: 'min' | 'max') => {
    if (boundary === 'min') {
      setSalaryMinInput(formatSalaryInputValue(salaryRange[0]));
      return;
    }

    setSalaryMaxInput(formatSalaryInputValue(salaryRange[1]));
  };

  const handleSalarySliderMinChange = (value: string) => {
    const nextMin = Math.min(clampSalaryValue(Number(value)), salaryRange[1]);
    applySalaryFilters(nextMin, salaryRange[1]);
  };

  const handleSalarySliderMaxChange = (value: string) => {
    const nextMax = Math.max(clampSalaryValue(Number(value)), salaryRange[0]);
    applySalaryFilters(salaryRange[0], nextMax);
  };

  const handleAddSkill = (skill?: JobSkillOption) => {
    const nextSkillTerm = formatSkillTerm(skill?.name ?? skillInput);
    if (!nextSkillTerm) return;

    const normalizedTerm = normalizeSkillTerm(nextSkillTerm);
    if (normalizedSelectedSkillTerms.has(normalizedTerm)) {
      setSkillInput('');
      return;
    }

    onFilterChange({ skills: [...selectedSkillTerms, nextSkillTerm] });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillTerm: string) => {
    const normalizedTerm = normalizeSkillTerm(skillTerm);
    const nextSkills = selectedSkillTerms.filter(
      (currentSkillTerm) => normalizeSkillTerm(currentSkillTerm) !== normalizedTerm
    );
    onFilterChange({ skills: nextSkills.length > 0 ? nextSkills : undefined });
  };

  const handleSearchClick = () => {
    const trimmedSearchValue = searchValue.trim();

    if (trimmedSearchValue && isCandidate) {
      void trackSearch(trimmedSearchValue);
    }

    setShowRecentSearches(false);
    onSearchSubmit(trimmedSearchValue);
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    handleAddSkill();
  };

  const activeFiltersText = () => {
    const parts: string[] = [];

    if (filters.jobType) {
      parts.push(workTypeOptions.find((option) => option.value === filters.jobType)?.label || '');
    }

    if (filters.salaryMin !== undefined || filters.salaryMax !== undefined) {
      const salaryMin = filters.salaryMin;
      const salaryMax = filters.salaryMax;

      if (salaryMin !== undefined && salaryMax !== undefined) {
        parts.push(`${formatSalaryVnd(salaryMin)} - ${formatSalaryVnd(salaryMax)}`);
      } else if (salaryMin !== undefined) {
        parts.push(`>= ${formatSalaryVnd(salaryMin)}`);
      } else if (salaryMax !== undefined) {
        parts.push(`<= ${formatSalaryVnd(salaryMax)}`);
      }
    }

    if (filters.experienceLevel) {
      parts.push(
        experienceLevels.find((level) => level.value === filters.experienceLevel)?.label || ''
      );
    }

    if (filters.locationProvince) parts.push(filters.locationProvince);

    if (filters.categoryId) {
      const categoryName = categoriesQuery.data?.find(
        (category) => category.id === filters.categoryId
      )?.name;
      parts.push(categoryName || '1 category');
    }

    if (selectedSkillTerms.length > 0) {
      parts.push(`${selectedSkillTerms.length} skill term(s)`);
    }

    return parts.length > 0 ? `Applied: ${parts.join(', ')}` : '';
  };

  return (
    <section className="w-full px-6 py-8 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 p-1 shadow-2xl shadow-purple-600/20">
          <div className="rounded-[calc(1.5rem-2px)] bg-white p-6 lg:p-8 dark:bg-slate-900">
            <div className="flex flex-col items-stretch gap-4 lg:flex-row">
              <div className="flex flex-1 flex-col overflow-visible rounded-2xl border border-slate-200 bg-slate-50 md:flex-row dark:border-slate-700 dark:bg-slate-800">
                <div
                  ref={searchContainerRef}
                  className="relative flex flex-1 items-center border-b border-slate-200 px-4 py-3.5 md:border-r md:border-b-0 dark:border-slate-700"
                >
                  <Search className="mr-3 h-5 w-5 text-purple-600/70" />
                  <input
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-transparent focus:shadow-none focus:ring-0 focus:outline-none dark:text-white"
                    placeholder="Job title, keywords, or company"
                    type="text"
                    value={searchValue}
                    onFocus={() => isCandidate && setShowRecentSearches(true)}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSearchClick();
                      }

                      if (event.key === 'Escape') {
                        setShowRecentSearches(false);
                      }
                    }}
                  />
                  <RecentSearchesDropdown
                    visible={isCandidate && showRecentSearches}
                    searches={searches}
                    isLoading={isLoadingRecentSearches}
                    onSelect={(keyword) => {
                      onSearchChange(keyword);
                      const trimmedKeyword = keyword.trim();
                      if (trimmedKeyword && isCandidate) {
                        void trackSearch(trimmedKeyword);
                      }
                      setShowRecentSearches(false);
                      onSearchSubmit(trimmedKeyword);
                    }}
                    className="left-4 right-4"
                  />
                </div>
                <div className="relative flex flex-1 items-center px-4 py-3.5">
                  <MapPin className="mr-3 h-5 w-5 text-purple-600/70" />
                  {provincesQuery.isError ? (
                    <input
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-transparent focus:shadow-none focus:ring-0 focus:outline-none dark:text-white"
                      placeholder="Nhap tinh/thanh muon tim"
                      type="text"
                      value={filters.locationProvince || ''}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        onFilterChange({
                          locationProvince: event.target.value || undefined,
                          locationCity: undefined,
                        })
                      }
                    />
                  ) : (
                    <Select
                      value={filters.locationProvince ?? ALL_LOCATIONS_VALUE}
                      onValueChange={(value) =>
                        onFilterChange({
                          locationProvince: value === ALL_LOCATIONS_VALUE ? undefined : value,
                          locationCity: undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-auto w-full border-none bg-transparent p-0 text-left text-sm font-medium text-slate-900 shadow-none focus:ring-0 dark:text-white">
                        <SelectValue
                          placeholder={
                            provincesQuery.isLoading
                              ? 'Loading provinces...'
                              : 'Choose preferred province'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value={ALL_LOCATIONS_VALUE}>Toàn quốc</SelectItem>
                        {(provincesQuery.data || []).map((province) => (
                          <SelectItem
                            key={province.code}
                            value={normalizeVietnamProvinceName(province.name)}
                          >
                            {normalizeVietnamProvinceName(province.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border border-purple-100 px-6 py-3.5 font-bold transition-all hover:bg-purple-100 lg:flex-none dark:border-slate-700 ${
                    showAdvanced
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 dark:bg-slate-800 dark:text-purple-400'
                  }`}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>

            {showAdvanced && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-10 border-t border-slate-100 pt-8 md:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
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

                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Salary Range
                    </h3>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                          <span>{formatSalaryCompact(SALARY_RANGE_MIN)}</span>
                          <span>{formatSalaryCompact(SALARY_RANGE_MAX)}</span>
                        </div>
                        <div className="relative h-8">
                          <div className="absolute top-1/2 right-0 left-0 h-2 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <div
                            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-purple-600"
                            style={{
                              left: `${sliderTrackStart}%`,
                              width: `${Math.max(sliderTrackEnd - sliderTrackStart, 0)}%`,
                            }}
                          />
                          <input
                            aria-label="Minimum salary"
                            className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
                            max={salaryRange[1]}
                            min={SALARY_RANGE_MIN}
                            step={SALARY_RANGE_STEP}
                            type="range"
                            value={salaryRange[0]}
                            onChange={(event) => handleSalarySliderMinChange(event.target.value)}
                          />
                          <input
                            aria-label="Maximum salary"
                            className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
                            max={SALARY_RANGE_MAX}
                            min={salaryRange[0]}
                            step={SALARY_RANGE_STEP}
                            type="range"
                            value={salaryRange[1]}
                            onChange={(event) => handleSalarySliderMaxChange(event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-2">
                          <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Tối thiểu
                          </span>
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                            <input
                              className="w-full border-none bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
                              inputMode="numeric"
                              placeholder={formatSalaryInputValue(SALARY_RANGE_MIN)}
                              type="text"
                              value={salaryMinInput}
                              onChange={(event) => handleSalaryMinChange(event.target.value)}
                              onBlur={() => handleSalaryInputBlur('min')}
                            />
                            <span className="text-[11px] font-semibold text-slate-400 uppercase dark:text-slate-500">
                              ₫
                            </span>
                          </div>
                        </label>
                        <label className="space-y-2">
                          <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Tối đa
                          </span>
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                            <input
                              className="w-full border-none bg-transparent text-sm font-semibold text-slate-900 outline-hidden placeholder:text-slate-400 focus:ring-0 dark:text-white"
                              inputMode="numeric"
                              placeholder={formatSalaryInputValue(SALARY_RANGE_MAX)}
                              type="text"
                              value={salaryMaxInput}
                              onChange={(event) => handleSalaryMaxChange(event.target.value)}
                              onBlur={() => handleSalaryInputBlur('max')}
                            />
                            <span className="text-[11px] font-semibold text-slate-400 uppercase dark:text-slate-500">
                              ₫
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

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
                        onChange={(event) =>
                          onFilterChange({ categoryId: event.target.value || undefined })
                        }
                      >
                        <option value="">All Categories</option>
                        {(categoriesQuery.data ?? []).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      Skills &amp; Tools
                    </h3>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Search or add any skill/tool"
                        type="text"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                      <Plus
                        className="absolute top-2.5 right-3 h-5 w-5 cursor-pointer text-slate-400 hover:text-purple-600"
                        onClick={() => handleAddSkill()}
                      />
                    </div>
                    {skillsQuery.isLoading ? (
                      <p className="text-xs text-slate-400">Loading skills...</p>
                    ) : skillSuggestions.length > 0 ? (
                      <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                        {skillSuggestions.map((skill) => (
                          <button
                            key={skill.id}
                            onClick={() => handleAddSkill(skill)}
                            className="rounded-full border border-purple-100 bg-white px-3 py-1 text-[10px] font-bold text-slate-600 uppercase transition-colors hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    ) : canAddCustomSkill ? (
                      <p className="text-xs text-slate-400">
                        No exact suggestion found. You can still add this term as a custom filter.
                      </p>
                    ) : null}
                    {canAddCustomSkill && (
                      <button
                        onClick={() => handleAddSkill()}
                        className="inline-flex items-center gap-2 rounded-full border border-dashed border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-600 uppercase transition-colors hover:border-purple-300 hover:bg-purple-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Use &quot;{formatSkillTerm(skillInput)}&quot;
                      </button>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill.key}
                          className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-600 uppercase dark:bg-slate-800"
                          title={
                            skill.category ? `${skill.label} • ${skill.category}` : skill.label
                          }
                        >
                          {skill.label}
                          <X
                            className="h-3.5 w-3.5 cursor-pointer"
                            onClick={() => handleRemoveSkill(skill.key)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                        Verified Companies Only
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          checked={verifiedOnly}
                          onChange={(event) => setVerifiedOnly(event.target.checked)}
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
