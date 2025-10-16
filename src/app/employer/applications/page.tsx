'use client';

import { useState } from 'react';
import { Users, Download, Upload, SlidersHorizontal } from 'lucide-react';
import { CandidateCard } from '@/components/employer/applications/CandidateCard';
import { FiltersPanel } from '@/components/employer/applications/FiltersPanel';

const mockCandidates = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    position: 'Senior Frontend Developer',
    location: 'Hà Nội',
    experience: '5+ năm',
    appliedDate: '15/01/2025',
    status: 'interview' as const,
    rating: 5,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'GraphQL'],
    notes: 'Ứng viên rất phù hợp với yêu cầu, có kinh nghiệm tốt với React và Next.js. Đã lên lịch phỏng vấn vào 20/01.',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987654321',
    position: 'Product Manager',
    location: 'Hồ Chí Minh',
    experience: '3-5 năm',
    appliedDate: '14/01/2025',
    status: 'reviewing' as const,
    rating: 4,
    skills: ['Product Management', 'Agile', 'Scrum', 'UX/UI', 'Analytics'],
    notes: 'Có background tốt về product, đang review CV.',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    position: 'Backend Developer',
    location: 'Đà Nẵng',
    experience: '1-3 năm',
    appliedDate: '13/01/2025',
    status: 'new' as const,
    skills: ['Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0912345678',
    position: 'UI/UX Designer',
    location: 'Hà Nội',
    experience: '3-5 năm',
    appliedDate: '12/01/2025',
    status: 'accepted' as const,
    rating: 5,
    skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'UX Research', 'Prototyping'],
    notes: 'Đã chấp nhận offer, bắt đầu làm việc từ 01/02.',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    position: 'DevOps Engineer',
    location: 'Hồ Chí Minh',
    experience: '5+ năm',
    appliedDate: '11/01/2025',
    status: 'new' as const,
    rating: 3,
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'AWS', 'Terraform'],
  },
  {
    id: '6',
    name: 'Võ Thị F',
    email: 'vothif@email.com',
    position: 'QA Engineer',
    location: 'Đà Nẵng',
    experience: '1-3 năm',
    appliedDate: '10/01/2025',
    status: 'reviewing' as const,
    skills: ['Manual Testing', 'Automation', 'Selenium', 'Jest', 'API Testing'],
  },
];

export default function ApplicationsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    rating: null as number | null,
    location: [] as string[],
    experience: [] as string[],
  });

  // Filter logic
  const filteredCandidates = mockCandidates.filter(candidate => {
    if (filters.search && !candidate.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !candidate.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(candidate.status)) {
      return false;
    }
    if (filters.rating && candidate.rating && candidate.rating < filters.rating) {
      return false;
    }
    if (filters.location.length > 0 && !filters.location.includes(candidate.location)) {
      return false;
    }
    if (filters.experience.length > 0 && !filters.experience.includes(candidate.experience)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Quản lý ứng viên</h1>
            <p className="text-purple-100">
              Tổng cộng <span className="font-semibold text-white">{filteredCandidates.length}</span> ứng viên
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/30"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </button>
            
            <button className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/30">
              <Upload className="h-4 w-4" />
              Import
            </button>
            
            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Mới', count: mockCandidates.filter(c => c.status === 'new').length, color: 'from-blue-500 to-indigo-600' },
          { label: 'Đang xem xét', count: mockCandidates.filter(c => c.status === 'reviewing').length, color: 'from-purple-500 to-purple-600' },
          { label: 'Phỏng vấn', count: mockCandidates.filter(c => c.status === 'interview').length, color: 'from-yellow-500 to-orange-500' },
          { label: 'Chấp nhận', count: mockCandidates.filter(c => c.status === 'accepted').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Từ chối', count: mockCandidates.filter(c => c.status === 'rejected').length, color: 'from-gray-400 to-gray-500' },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-soft transition-all duration-200 hover:shadow-md"
          >
            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
            <div className="relative">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FiltersPanel filters={filters} onFilterChange={setFilters} />
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {filteredCandidates.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Không tìm thấy ứng viên</h3>
              <p className="mt-2 text-sm text-gray-600">Thử thay đổi bộ lọc để xem thêm ứng viên</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusChange={(id, status) => console.log('Status changed:', id, status)}
                  onRatingChange={(id, rating) => console.log('Rating changed:', id, rating)}
                  onViewCV={(id) => console.log('View CV:', id)}
                  onSendMessage={(id) => console.log('Send message:', id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
