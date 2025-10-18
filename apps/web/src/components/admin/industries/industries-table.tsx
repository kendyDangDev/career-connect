'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
  FileImage,
} from 'lucide-react';
import { Industry, SystemCategoryQuery } from '@/types/system-categories';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface IndustriesTableProps {
  data: Industry[];
  loading: boolean;
  filters: SystemCategoryQuery;
  totalPages: number;
  onFilterChange: (key: keyof SystemCategoryQuery, value: any) => void;
  onAddNew: () => void;
  onEdit: (industry: Industry) => void;
  onView: (industry: Industry) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const IndustriesTable: React.FC<IndustriesTableProps> = ({
  data,
  loading,
  filters,
  totalPages,
  onFilterChange,
  onAddNew,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSort = (column: string) => {
    if (filters.sortBy === column) {
      onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onFilterChange('sortBy', column);
      onFilterChange('sortOrder', 'asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange('search', searchValue);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      onDelete(selectedId);
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  const renderSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (loading && !data.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm ngành nghề..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Tìm kiếm
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            value={filters.isActive?.toString() || 'all'}
            onValueChange={(value) => {
              onFilterChange('isActive', value === 'all' ? undefined : value === 'true');
            }}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button onClick={onAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-[60px]">Icon</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('name')}
                >
                  Tên ngành nghề
                  {renderSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('sortOrder')}
                >
                  Thứ tự
                  {renderSortIcon('sortOrder')}
                </Button>
              </TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('createdAt')}
                >
                  Ngày tạo
                  {renderSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy ngành nghề nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((industry, index) => (
                <TableRow key={industry.id}>
                  <TableCell className="font-medium">
                    {(filters.page! - 1) * filters.limit! + index + 1}
                  </TableCell>
                  <TableCell>
                    {industry.iconUrl ? (
                      <img
                        src={industry.iconUrl}
                        alt={industry.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                        <FileImage className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{industry.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {industry.description || 'Chưa có mô tả'}
                    </p>
                  </TableCell>
                  <TableCell>{industry.sortOrder || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{industry._count?.companies || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={industry.isActive ? 'default' : 'secondary'}
                      className={cn(
                        industry.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {industry.isActive ? 'Hoạt động' : 'Ngừng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(industry.createdAt), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(industry)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(industry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(industry.id)}
                          className="text-red-600"
                          disabled={(industry._count?.companies || 0) > 0}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Hiển thị {data.length} / {filters.limit} mục
            </span>
            <Select
              value={filters.limit?.toString()}
              onValueChange={(value) => onFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange('page', filters.page! - 1)}
              disabled={filters.page === 1}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {filters.page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange('page', filters.page! + 1)}
              disabled={filters.page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ngành nghề này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IndustriesTable;
