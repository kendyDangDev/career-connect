'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Category, CategoryQuery } from '@/types/system-categories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  Upload,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderTree,
  Folder,
  FolderOpen,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: CategoryQuery;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (field: string) => void;
  onSearch: (search: string) => void;
  onFilterChange: (filters: Partial<CategoryQuery>) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onView: (category: Category) => void;
  onAddNew: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function CategoriesTable({
  categories,
  loading,
  totalItems,
  currentPage,
  pageSize,
  filters,
  onPageChange,
  onPageSizeChange,
  onSort,
  onSearch,
  onFilterChange,
  onEdit,
  onDelete,
  onView,
  onAddNew,
  onExport,
  onImport,
}: CategoriesTableProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(totalItems / pageSize);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onSearch(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onSearch]);

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Render categories with hierarchy
  const renderCategoryRows = (categoryList: Category[], level = 0): React.ReactNode[] => {
    return categoryList.reduce((rows: React.ReactNode[], category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      rows.push(
        <TableRow key={category.id} className={cn(level > 0 && 'bg-muted/30')}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpanded(category.id)}
                >
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')}
                  />
                </Button>
              )}
              {!hasChildren && level > 0 && <div className="w-6" />}
              <div className="flex items-center gap-2">
                {level === 0 ? (
                  <Folder className="text-muted-foreground h-4 w-4" />
                ) : (
                  <FolderOpen className="text-muted-foreground h-4 w-4" />
                )}
                <span className="font-medium">{category.name}</span>
              </div>
            </div>
          </TableCell>
          <TableCell className="max-w-[300px]">
            <span className="text-muted-foreground truncate text-sm">
              {category.description || 'Không có mô tả'}
            </span>
          </TableCell>
          <TableCell className="text-center">{category._count?.children || 0}</TableCell>
          <TableCell className="text-center">{category._count?.jobCategories || 0}</TableCell>
          <TableCell>
            <Badge variant={category.isActive ? 'default' : 'secondary'}>
              {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(category.createdAt), {
              locale: vi,
              addSuffix: true,
            })}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView(category)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(category)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );

      // Add children rows if expanded
      if (hasChildren && isExpanded) {
        rows.push(...renderCategoryRows(category.children!, level + 1));
      }

      return rows;
    }, []);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="text-muted-foreground ml-2 h-4 w-4" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-muted')}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button> */}
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={filters.isActive?.toString() || 'all'}
                onValueChange={(value) =>
                  onFilterChange({
                    isActive: value === 'all' ? undefined : value === 'true',
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Danh mục cha</label>
              <Select
                value={filters.parentId || 'all'}
                onValueChange={(value) =>
                  onFilterChange({
                    parentId: value === 'all' ? undefined : value === 'root' ? 'null' : value,
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="root">Danh mục gốc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Hiển thị</label>
              <Select
                value={filters.includeChildren ? 'tree' : 'flat'}
                onValueChange={(value) =>
                  onFilterChange({
                    includeChildren: value === 'tree',
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Danh sách phẳng</SelectItem>
                  <SelectItem value="tree">Cây thư mục</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onFilterChange({
                    isActive: undefined,
                    parentId: undefined,
                    includeChildren: false,
                  });
                  setSearchValue('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort('name')}
                >
                  Tên danh mục
                  <SortIcon field="name" />
                </Button>
              </TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Danh mục con</TableHead>
              <TableHead className="text-center">Việc làm</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort('isActive')}
                >
                  Trạng thái
                  <SortIcon field="isActive" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort('createdAt')}
                >
                  Ngày tạo
                  <SortIcon field="createdAt" />
                </Button>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[300px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="text-muted-foreground">
                    {filters.search ||
                    Object.keys(filters).some(
                      (key) =>
                        filters[key as keyof CategoryQuery] !== undefined &&
                        key !== 'page' &&
                        key !== 'limit' &&
                        key !== 'sortBy' &&
                        key !== 'sortOrder'
                    )
                      ? 'Không tìm thấy danh mục phù hợp'
                      : 'Chưa có danh mục nào'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              renderCategoryRows(categories)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} mục
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
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
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">{currentPage}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
