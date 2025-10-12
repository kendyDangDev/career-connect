'use client';

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowUpDownIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useJobsList, useJobMutations } from '@/hooks/useJobManagement';
import { AdminJobListParams } from '@/services/admin/job.service';

// Components
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CLOSED: 'bg-red-100 text-red-800 border-red-200',
    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const labels = {
    ACTIVE: 'Đang tuyển',
    DRAFT: 'Nháp',
    CLOSED: 'Đã đóng',
    EXPIRED: 'Hết hạn'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

const JobsListPage: React.FC = () => {
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<string>('');

  // Initial filters
  const initialFilters: AdminJobListParams = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // Hooks
  const { jobs, loading, error, refetch, updateFilters, filters } = useJobsList(initialFilters);
  const mutations = useJobMutations((operation, data) => {
    // Handle successful operations
    if (operation === 'bulkUpdateStatus' || operation === 'bulkDelete') {
      setSelectedJobs([]);
      refetch();
    }
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    updateFilters({ ...filters, [filterKey]: value, page: 1 });
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    updateFilters({ ...filters, sortBy, sortOrder: newSortOrder });
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (!jobs?.jobs) return;
    
    if (selectedJobs.length === jobs.jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.jobs.map(job => job.id));
    }
  };

  const handleBulkOperation = async () => {
    if (selectedJobs.length === 0 || !bulkOperation) return;

    try {
      switch (bulkOperation) {
        case 'activate':
          await mutations.bulkUpdateStatus(selectedJobs, 'ACTIVE');
          break;
        case 'draft':
          await mutations.bulkUpdateStatus(selectedJobs, 'DRAFT');
          break;
        case 'close':
          await mutations.bulkUpdateStatus(selectedJobs, 'CLOSED');
          break;
        case 'delete':
          if (window.confirm('Bạn có chắc chắn muốn xóa các việc làm đã chọn?')) {
            await mutations.bulkDelete(selectedJobs);
          }
          break;
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
    }

    setBulkOperation('');
  };

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page });
  };

  // Computed values
  const totalPages = jobs?.pagination.totalPages || 1;
  const currentPage = jobs?.pagination.page || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách việc làm</h1>
          <p className="mt-1 text-gray-600">
            Quản lý tất cả việc làm trong hệ thống ({jobs?.pagination.total || 0} việc làm)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo việc làm mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề, công ty, địa điểm..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Bộ lọc
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang tuyển</option>
                  <option value="DRAFT">Nháp</option>
                  <option value="CLOSED">Đã đóng</option>
                  <option value="EXPIRED">Hết hạn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại công việc
                </label>
                <select
                  value={filters.jobType || ''}
                  onChange={(e) => handleFilterChange('jobType', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả loại</option>
                  <option value="FULL_TIME">Toàn thời gian</option>
                  <option value="PART_TIME">Bán thời gian</option>
                  <option value="CONTRACT">Hợp đồng</option>
                  <option value="INTERNSHIP">Thực tập</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinh nghiệm
                </label>
                <select
                  value={filters.experienceLevel || ''}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả cấp độ</option>
                  <option value="ENTRY">Mới ra trường</option>
                  <option value="MID">Trung cấp</option>
                  <option value="SENIOR">Cao cấp</option>
                  <option value="LEAD">Trưởng nhóm</option>
                  <option value="EXECUTIVE">Điều hành</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    updateFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="createdAt_asc">Cũ nhất</option>
                  <option value="title_asc">Tên A-Z</option>
                  <option value="title_desc">Tên Z-A</option>
                  <option value="applicationCount_desc">Nhiều ứng viên nhất</option>
                  <option value="viewCount_desc">Nhiều lượt xem nhất</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations */}
      {selectedJobs.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Đã chọn {selectedJobs.length} việc làm
            </span>
            <div className="flex items-center space-x-3">
              <select
                value={bulkOperation}
                onChange={(e) => setBulkOperation(e.target.value)}
                className="text-sm border border-blue-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thao tác...</option>
                <option value="activate">Kích hoạt</option>
                <option value="draft">Chuyển về nháp</option>
                <option value="close">Đóng tuyển dụng</option>
                <option value="delete">Xóa</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkOperation || mutations.loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {mutations.loading ? <LoadingSpinner size="sm" /> : 'Thực hiện'}
              </button>
              <button
                onClick={() => setSelectedJobs([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : jobs?.jobs?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy việc làm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === jobs?.jobs?.length && jobs?.jobs?.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Việc làm
                      <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('applicationCount')}
                  >
                    <div className="flex items-center">
                      Ứng viên
                      <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('viewCount')}
                  >
                    <div className="flex items-center">
                      Lượt xem
                      <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Ngày tạo
                      <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs?.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">
                          {job.locationCity && `${job.locationCity}, `}
                          {job.locationProvince}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {job.jobType} • {job.experienceLevel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {job.applicationCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {job.viewCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600">
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {jobs && jobs.pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * (jobs.pagination.limit || 10)) + 1}
                  </span>{' '}
                  đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * (jobs.pagination.limit || 10), jobs.pagination.total)}
                  </span>{' '}
                  trong tổng số{' '}
                  <span className="font-medium">{jobs.pagination.total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, currentPage - 2);
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsListPage;