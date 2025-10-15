'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  FileText,
  Download,
  Loader2,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Star,
} from 'lucide-react';
import {
  CandidateListItem,
  PaginationInfo,
  UserStatus,
  AvailabilityStatus,
  PreferredWorkType,
  availabilityStatusLabels,
  availabilityStatusColors,
  preferredWorkTypeLabels,
  userStatusLabels,
  userStatusColors,
} from '../types';
import { TablePagination } from './TablePagination';

interface CandidatesTableProps {
  candidates: CandidateListItem[];
  loading: boolean;
  pagination: PaginationInfo;
  filters: {
    search: string;
    status: string;
    availabilityStatus: string;
    preferredWorkType: string;
    sortBy: string;
    sortOrder: string;
  };
  onSearch: (search: string) => void;
  onFilter: (filterType: string, value: string) => void;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (candidate: CandidateListItem) => void;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  loading,
  pagination,
  filters,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  onPageSizeChange,
  onView,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(searchValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatExperience = (years?: number | null) => {
    if (!years) return '-';
    if (years === 0) return 'Mới vào nghề';
    if (years === 1) return '1 năm';
    return `${years} năm`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tên, email, vị trí..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full lg:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(userStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Status Filter */}
          <Select
            value={filters.availabilityStatus || 'all'}
            onValueChange={(value) => onFilter('availabilityStatus', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full lg:w-[180px]">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(availabilityStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Work Type Filter */}
          <Select
            value={filters.preferredWorkType || 'all'}
            onValueChange={(value) => onFilter('preferredWorkType', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full lg:w-[200px]">
              <Briefcase className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Loại công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(preferredWorkTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="text-muted-foreground/50 h-12 w-12" />
          <p className="mt-4 text-lg font-medium">Không tìm thấy ứng viên nào</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('firstName')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Ứng viên
                      <SortIcon field="firstName" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('currentPosition')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Vị trí hiện tại
                      <SortIcon field="currentPosition" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('experienceYears')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Kinh nghiệm
                      <SortIcon field="experienceYears" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">Kỹ năng</TableHead>
                  <TableHead className="w-[150px]">Tình trạng</TableHead>
                  <TableHead className="w-[150px]">Loại công việc</TableHead>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('createdAt')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Ngày tham gia
                      <SortIcon field="createdAt" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell onClick={() => onView(candidate)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={candidate.avatarUrl || undefined} />
                          <AvatarFallback>
                            {getInitials(candidate.firstName, candidate.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {candidate.firstName} {candidate.lastName}
                          </div>
                          <div className="flex-cols text-muted-foreground items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {candidate.email}
                            </span>
                            {candidate.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {candidate.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      {candidate.candidateInfo?.currentPosition || '-'}
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      {formatExperience(candidate.candidateInfo?.experienceYears)}
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      <div className="flex flex-wrap gap-1">
                        {candidate.candidateInfo?.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.skill.name}
                          </Badge>
                        ))}
                        {candidate.candidateInfo?.skills &&
                          candidate.candidateInfo.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.candidateInfo.skills.length - 3}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      {candidate.candidateInfo?.availabilityStatus && (
                        <Badge
                          variant={
                            availabilityStatusColors[
                              candidate.candidateInfo.availabilityStatus as AvailabilityStatus
                            ]
                          }
                        >
                          {
                            availabilityStatusLabels[
                              candidate.candidateInfo.availabilityStatus as AvailabilityStatus
                            ]
                          }
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      {candidate.candidateInfo?.preferredWorkType && (
                        <Badge variant="outline">
                          {
                            preferredWorkTypeLabels[
                              candidate.candidateInfo.preferredWorkType as PreferredWorkType
                            ]
                          }
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={() => onView(candidate)}>
                      {format(new Date(candidate.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(candidate)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Xem CV
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Tải CV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination
            page={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  );
};
