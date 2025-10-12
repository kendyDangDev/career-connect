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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { User, UserType, UserStatus, PaginationInfo } from '../types';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  pagination: PaginationInfo;
  filters: {
    search: string;
    userType: string;
    status: string;
    sortBy: string;
    sortOrder: string;
  };
  onSearch: (search: string) => void;
  onFilter: (filterType: 'userType' | 'status', value: string) => void;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAddNew: () => void;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
}

const userTypeLabels: Record<UserType, string> = {
  ADMIN: 'Quản trị viên',
  EMPLOYER: 'Nhà tuyển dụng',
  CANDIDATE: 'Ứng viên',
};

const userTypeColors: Record<UserType, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  EMPLOYER: 'secondary',
  CANDIDATE: 'outline',
};

const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  SUSPENDED: 'Tạm khóa',
};

const userStatusColors: Record<UserStatus, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
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
}) => {
  console.log('pagination:', pagination);

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

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
          </div>

          {/* User Type Filter */}
          <Select
            value={filters.userType || 'all'}
            onValueChange={(value) => onFilter('userType', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {Object.entries(userTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-[180px]">
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
        </div>

        {/* Add New Button */}
        <Button onClick={onAddNew}>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => onSort('firstName')}>
                  <div className="flex items-center gap-1">
                    Tên
                    <SortIcon field="firstName" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSort('email')}>
                  <div className="flex items-center gap-1">
                    Email
                    <SortIcon field="email" />
                  </div>
                </TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Ngày tham gia
                    <SortIcon field="createdAt" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-6 text-center">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.phone && (
                          <div className="text-muted-foreground text-sm">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email}
                        {!user.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Chưa xác thực
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userTypeColors[user.userType]}>
                        {userTypeLabels[user.userType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.companyUsers && user.companyUsers.length > 0 ? (
                        <div className="text-sm">{user.companyUsers[0].company.companyName}</div>
                      ) : user.candidate ? (
                        <div className="text-muted-foreground text-sm">
                          {user.candidate.currentPosition || 'Ứng viên'}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={userStatusColors[user.status]}>
                        {userStatusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
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
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground text-sm">
          Hiển thị {(pagination?.page - 1) * pagination?.limit + 1}-
          {Math.min(pagination?.page * pagination?.limit, pagination?.totalCount)} trong{' '}
          {pagination?.totalCount} người dùng
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Hiển thị</p>
            <Select
              value={pagination?.limit.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination?.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination?.hasPreviousPage}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination?.hasNextPage}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
