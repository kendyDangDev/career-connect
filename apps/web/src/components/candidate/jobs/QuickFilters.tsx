'use client';

import { MapPin, Clock, DollarSign, Briefcase, Users, Star } from 'lucide-react';
import type { JobListFilters } from './JobListPage';

interface QuickFiltersProps {
  currentFilters: JobListFilters;
  onFilter: (filters: Partial<JobListFilters>) => void;
}

const quickFilters = [
  {
    id: 'hanoi',
    label: 'Hà Nội',
    icon: MapPin,
    filter: { locationCity: 'Hà Nội' },
  },
  {
    id: 'hcm',
    label: 'Hồ Chí Minh',
    icon: MapPin,
    filter: { locationCity: 'Hồ Chí Minh' },
  },
  {
    id: 'fulltime',
    label: 'Full-time',
    icon: Clock,
    filter: { jobType: 'FULL_TIME' },
  },
  {
    id: 'senior',
    label: 'Senior',
    icon: Users,
    filter: { experienceLevel: 'SENIOR' },
  },
  {
    id: 'junior',
    label: 'Entry Level',
    icon: Star,
    filter: { experienceLevel: 'ENTRY' },
  },
  {
    id: 'highSalary',
    label: 'Lương cao',
    icon: DollarSign,
    filter: { salaryMin: 20_000_000 },
  },
  {
    id: 'tech',
    label: 'Tech Jobs',
    icon: Briefcase,
    filter: { categoryId: 'tech' },
  },
];

export default function QuickFilters({ currentFilters, onFilter }: QuickFiltersProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Bộ lọc nhanh</h3>
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((qf) => {
          const Icon = qf.icon;
          const isActive = Object.entries(qf.filter).some(
            ([key, value]) => currentFilters[key as keyof JobListFilters] === value
          );

          return (
            <button
              key={qf.id}
              onClick={() => onFilter(qf.filter)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
              {qf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
