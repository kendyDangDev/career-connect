'use client';

import React, { useState, useEffect } from 'react';
import { Location, LocationQuery, LocationType } from '@/types/system-categories';
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
  MapPin,
  Globe,
  Map,
  Building,
  Home,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LocationsTableProps {
  locations: Location[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: LocationQuery;
  typeStats: Record<string, number>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (field: string) => void;
  onSearch: (search: string) => void;
  onFilterChange: (filters: Partial<LocationQuery>) => void;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onView: (location: Location) => void;
  onAddNew: () => void;
  onExport: () => void;
  onImport: () => void;
}

const locationTypeLabels: Record<LocationType, string> = {
  [LocationType.COUNTRY]: 'Quốc gia',
  [LocationType.PROVINCE]: 'Tỉnh/Thành phố',
  [LocationType.CITY]: 'Quận/Huyện',
  [LocationType.DISTRICT]: 'Phường/Xã',
};

const locationTypeIcons: Record<LocationType, React.ComponentType<{ className?: string }>> = {
  [LocationType.COUNTRY]: Globe,
  [LocationType.PROVINCE]: Map,
  [LocationType.CITY]: Building,
  [LocationType.DISTRICT]: Home,
};

export function LocationsTable({
  locations,
  loading,
  totalItems,
  currentPage,
  pageSize,
  filters,
  typeStats,
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
}: LocationsTableProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
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

  // Toggle location expansion
  const toggleExpanded = (locationId: string) => {
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId);
    } else {
      newExpanded.add(locationId);
    }
    setExpandedLocations(newExpanded);
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: LocationType) => {
    switch (type) {
      case LocationType.COUNTRY:
        return 'default';
      case LocationType.PROVINCE:
        return 'secondary';
      case LocationType.CITY:
        return 'outline';
      case LocationType.DISTRICT:
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Render locations with hierarchy
  const renderLocationRows = (locationList: Location[], level = 0): React.ReactNode[] => {
    return locationList.reduce((rows: React.ReactNode[], location) => {
      const hasChildren = location.children && location.children.length > 0;
      const isExpanded = expandedLocations.has(location.id);
      const TypeIcon = locationTypeIcons[location.type];

      rows.push(
        <TableRow key={location.id} className={cn(level > 0 && 'bg-muted/30')}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpanded(location.id)}
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      !isExpanded && '-rotate-90'
                    )}
                  />
                </Button>
              )}
              {!hasChildren && level > 0 && <div className="w-6" />}
              <div className="flex items-center gap-2">
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{location.name}</span>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={getTypeBadgeVariant(location.type)}>
              {locationTypeLabels[location.type]}
            </Badge>
          </TableCell>
          <TableCell>
            {location.parent ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{location.parent.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </TableCell>
          <TableCell className="text-center">
            {location._count?.children || 0}
          </TableCell>
          <TableCell>
            {location.latitude && location.longitude ? (
              <div className="text-xs">
                <div>{location.latitude.toFixed(6)}°</div>
                <div>{location.longitude.toFixed(6)}°</div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </TableCell>
          <TableCell>
            <Badge variant={location.isActive ? 'default' : 'secondary'}>
              {location.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </Badge>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(location.createdAt), {
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
                <DropdownMenuItem onClick={() => onView(location)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(location)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(location)}
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
        rows.push(...renderLocationRows(location.children!, level + 1));
      }

      return rows;
    }, []);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm địa điểm..."
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
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-sm font-medium">Loại địa điểm</label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  onFilterChange({
                    type: value === 'all' ? undefined : (value as LocationType),
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tất cả ({Object.values(typeStats).reduce((a, b) => a + b, 0)})
                  </SelectItem>
                  {Object.entries(locationTypeLabels).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      {label} ({typeStats[type] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <label className="text-sm font-medium">Địa điểm cha</label>
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
                  <SelectItem value="root">Địa điểm gốc</SelectItem>
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
                    type: undefined,
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
                  Tên địa điểm
                  <SortIcon field="name" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                  onClick={() => onSort('type')}
                >
                  Loại
                  <SortIcon field="type" />
                </Button>
              </TableHead>
              <TableHead>Địa điểm cha</TableHead>
              <TableHead className="text-center">Địa điểm con</TableHead>
              <TableHead>Tọa độ</TableHead>
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
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px] mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
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
            ) : locations.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {filters.search || Object.keys(filters).some(key => filters[key as keyof LocationQuery] !== undefined && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder')
                      ? 'Không tìm thấy địa điểm phù hợp'
                      : 'Chưa có địa điểm nào'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              renderLocationRows(locations)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalItems)} trong tổng số{' '}
              {totalItems} mục
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
