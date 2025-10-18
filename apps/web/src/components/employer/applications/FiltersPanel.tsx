import { Search, Filter, X, Star, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  filters: {
    search: string;
    status: string[];
    rating: number | null;
    location: string[];
    experience: string[];
  };
  onFilterChange: (filters: any) => void;
  isSearching?: boolean;
}

const statusOptions = [
  { value: 'APPLIED', label: 'Mới', color: 'bg-blue-500' },
  { value: 'SCREENING', label: 'Đang xem xét', color: 'bg-purple-500' },
  { value: 'INTERVIEWING', label: 'Phỏng vấn', color: 'bg-yellow-500' },
  { value: 'OFFERED', label: 'Đã gửi Offer', color: 'bg-orange-500' },
  { value: 'HIRED', label: 'Tuyển dụng', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Từ chối', color: 'bg-red-500' },
];

const locationOptions = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
const experienceOptions = ['0-1 năm', '1-3 năm', '3-5 năm', '5+ năm'];

export function FiltersPanel({ filters, onFilterChange, isSearching = false }: FiltersPanelProps) {
  const toggleFilter = (key: string, value: string) => {
    const currentValues = filters[key as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({ ...filters, [key]: newValues });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: [],
      rating: null,
      location: [],
      experience: [],
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.rating !== null ||
    filters.location.length > 0 ||
    filters.experience.length > 0;

  return (
    <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">Tìm kiếm</label>
        <div className="relative">
          {isSearching ? (
            <Loader2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin text-purple-600" />
          ) : (
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          )}
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Tên, email, kỹ năng..."
            className="w-full rounded-lg border border-purple-100 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">Trạng thái</label>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleFilter('status', option.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                filters.status.includes(option.value)
                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-100 hover:bg-purple-50/50'
              )}
            >
              <div className={cn('h-2.5 w-2.5 rounded-full', option.color)} />
              <span className="flex-1 text-left">{option.label}</span>
              {filters.status.includes(option.value) && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">Đánh giá</label>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onFilterChange({ ...filters, rating: filters.rating === rating ? null : rating })
              }
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                filters.rating === rating
                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-100 hover:bg-purple-50/50'
              )}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star key={i + rating} className="h-3.5 w-3.5 text-gray-300" />
                ))}
              </div>
              <span className="flex-1 text-left">Từ {rating} sao trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <MapPin className="mr-1 inline h-4 w-4" />
          Địa điểm
        </label>
        <div className="flex flex-wrap gap-2">
          {locationOptions.map((location) => (
            <button
              key={location}
              onClick={() => toggleFilter('location', location)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                filters.location.includes(location)
                  ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50'
              )}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <Briefcase className="mr-1 inline h-4 w-4" />
          Kinh nghiệm
        </label>
        <div className="flex flex-wrap gap-2">
          {experienceOptions.map((exp) => (
            <button
              key={exp}
              onClick={() => toggleFilter('experience', exp)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                filters.experience.includes(exp)
                  ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50'
              )}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
