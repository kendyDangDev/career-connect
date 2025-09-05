'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TablePagination } from './TablePagination';
import { Company, PaginationInfo } from '../types';
import { CompanySize, VerificationStatus } from '@/generated/prisma';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Building2,
  Users,
  Briefcase,
  Heart,
} from 'lucide-react';

interface CompaniesTableProps {
  companies: Company[];
  loading: boolean;
  pagination: PaginationInfo | null;
  filters: {
    search: string;
    status: string;
    companySize: string;
    industryId: string;
    sortBy: string;
    sortOrder: string;
  };
  onSearch: (search: string) => void;
  onFilter: (filterType: 'status' | 'companySize' | 'industryId', value: string) => void;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onAddNew: () => void;
  onEdit: (company: Company) => void;
  onView: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompaniesTable({
  companies,
  loading,
  pagination,
  filters,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  onPageSizeChange,
  onAddNew,
  onEdit,
  onView,
  onDelete,
}: CompaniesTableProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);

  // Load industries for filter
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch('/api/admin/system-categories/industries');
        if (response.ok) {
          const data = await response.json();
          setIndustries(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error);
      }
    };

    fetchIndustries();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'Đã xác minh';
      case 'PENDING':
        return 'Chờ xác minh';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return status;
    }
  };

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'STARTUP':
        return 'Startup';
      case 'SMALL':
        return 'Nhỏ';
      case 'MEDIUM':
        return 'Vừa';
      case 'LARGE':
        return 'Lớn';
      case 'ENTERPRISE':
        return 'Tập đoàn';
      default:
        return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return (
      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm công ty..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-[250px] pl-8"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => onFilter('status', value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value={VerificationStatus.VERIFIED}>Đã xác minh</SelectItem>
                <SelectItem value={VerificationStatus.PENDING}>Chờ xác minh</SelectItem>
                <SelectItem value={VerificationStatus.REJECTED}>Bị từ chối</SelectItem>
              </SelectContent>
            </Select>

            {/* Company Size Filter */}
            <Select
              value={filters.companySize}
              onValueChange={(value) => onFilter('companySize', value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Quy mô" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="STARTUP_1_10">Startup (1-10)</SelectItem>
                <SelectItem value="SMALL_11_50">Nhỏ (11-50)</SelectItem>
                <SelectItem value="MEDIUM_51_200">Vừa (51-200)</SelectItem>
                <SelectItem value="LARGE_201_500">Lớn (201-500)</SelectItem>
                <SelectItem value="ENTERPRISE_500_PLUS">Tập đoàn (500+)</SelectItem>
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select
              value={filters.industryId}
              onValueChange={(value) => onFilter('industryId', value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ngành nghề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add New Button */}
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm công ty
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('companyName')}
                  className="h-auto p-0 font-medium"
                >
                  Công ty
                  {getSortIcon('companyName')}
                </Button>
              </TableHead>
              <TableHead>Ngành nghề</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('verificationStatus')}
                  className="h-auto p-0 font-medium"
                >
                  Trạng thái
                  {getSortIcon('verificationStatus')}
                </Button>
              </TableHead>
              <TableHead>Quy mô</TableHead>
              <TableHead>Thống kê</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('createdAt')}
                  className="h-auto p-0 font-medium"
                >
                  Ngày tạo
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>
                    {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={company.logoUrl || ''} alt={company.companyName} />
                        <AvatarFallback className="text-xs">
                          {company.companyName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{company.companyName}</div>
                        <div className="text-muted-foreground text-sm">{company.companySlug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">{company.industry?.name || 'Chưa xác định'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(company.verificationStatus)}>
                      {getStatusLabel(company.verificationStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {company.companySize ? (
                      <span className="text-sm">{getCompanySizeLabel(company.companySize)}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex gap-4 text-sm">
                      <div className="flex items-center gap-1" title="Nhân viên">
                        <Users className="h-3 w-3" />
                        {company._count.companyUsers}
                      </div>
                      <div className="flex items-center gap-1" title="Việc làm">
                        <Briefcase className="h-3 w-3" />
                        {company._count.jobs}
                      </div>
                      <div className="flex items-center gap-1" title="Người theo dõi">
                        <Heart className="h-3 w-3" />
                        {company._count.companyFollowers}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(company.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(company)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(company)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(company)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
