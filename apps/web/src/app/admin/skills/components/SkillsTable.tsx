'use client';

import React, { useState } from 'react';
import { Skill, SkillCategory, SkillQuery } from '@/types/system-categories';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  FolderOpen,
  Brain,
  Languages,
  Wrench,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SkillsTableProps {
  skills: Skill[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: SkillQuery;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (field: string) => void;
  onSearch: (search: string) => void;
  onFilterChange: (filters: Partial<SkillQuery>) => void;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onView: (skill: Skill) => void;
  onAddNew: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onExport?: () => void;
  onImport?: () => void;
}

const skillCategoryIcons: Record<SkillCategory, React.ReactElement> = {
  TECHNICAL: <FolderOpen className="h-4 w-4" />,
  SOFT: <Brain className="h-4 w-4" />,
  LANGUAGE: <Languages className="h-4 w-4" />,
  TOOL: <Wrench className="h-4 w-4" />,
};

const skillCategoryLabels: Record<SkillCategory, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT: 'Kỹ năng mềm',
  LANGUAGE: 'Ngôn ngữ',
  TOOL: 'Công cụ',
};

const skillCategoryColors: Record<
  SkillCategory,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  TECHNICAL: 'default',
  SOFT: 'secondary',
  LANGUAGE: 'outline',
  TOOL: 'destructive',
};

export const SkillsTable: React.FC<SkillsTableProps> = ({
  skills,
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
  onBulkDelete,
  onExport,
  onImport,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = skills.map((skill) => skill.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(searchValue);
  };

  const handleCategoryFilter = (value: string) => {
    onFilterChange({
      category: value === 'all' ? undefined : (value as SkillCategory),
    });
  };

  const handleStatusFilter = (value: string) => {
    onFilterChange({
      isActive: value === 'all' ? undefined : value === 'active',
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const newSelected = skills.map((skill) => skill.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSort = (field: string) => {
    onSort(field);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleBulkDelete = () => {
    if (onBulkDelete && selected.length > 0) {
      onBulkDelete(selected);
      setSelected([]);
    }
  };

  return (
    <div className="w-full space-y-4 p-6">
      <div
        className={`flex items-center justify-between ${selected.length > 0 ? 'bg-primary/10 rounded-lg' : ''}`}
      >
        {selected.length > 0 ? (
          <div className="text-sm font-medium">{selected.length} kỹ năng được chọn</div>
        ) : (
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Tìm kiếm kỹ năng..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="pl-9"
              />
            </div>

            <Select value={filters.category || 'all'} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Loại kỹ năng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(skillCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {skillCategoryIcons[value as SkillCategory]}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'
              }
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          {selected.length > 0 ? (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa ({selected.length})
            </Button>
          ) : (
            <>
              <Button onClick={onAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm mới
              </Button>

              {onImport && (
                <Button variant="outline" size="icon" onClick={onImport} title="Import">
                  <Upload className="h-4 w-4" />
                </Button>
              )}

              {onExport && (
                <Button variant="outline" size="icon" onClick={onExport} title="Export">
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={skills.length > 0 && selected.length === skills.length}
                    onCheckedChange={handleSelectAllChange}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>
                  <div
                    className="flex cursor-pointer items-center space-x-1"
                    onClick={() => handleSort('name')}
                  >
                    <span>Tên kỹ năng</span>
                    {filters.sortBy === 'name' &&
                      (filters.sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Sử dụng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead>
                  <div
                    className="flex cursor-pointer items-center space-x-1"
                    onClick={() => handleSort('createdAt')}
                  >
                    <span>Ngày tạo</span>
                    {filters.sortBy === 'createdAt' &&
                      (filters.sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => {
                const isItemSelected = isSelected(skill.id);
                const usageCount =
                  (skill._count?.candidateSkills || 0) + (skill._count?.jobSkills || 0);

                return (
                  <TableRow key={skill.id} className={isItemSelected ? 'bg-muted/50' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isItemSelected}
                        onCheckedChange={(checked: boolean) => handleSelectItem(skill.id, checked)}
                        aria-label={`Select ${skill.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {skill.iconUrl ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={skill.iconUrl} alt={skill.name} />
                            <AvatarFallback>{skill.name[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{skill.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-medium">{skill.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={skillCategoryColors[skill.category]}
                        className="flex w-fit items-center gap-1"
                      >
                        {skillCategoryIcons[skill.category]}
                        {skillCategoryLabels[skill.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground block max-w-[200px] truncate text-sm">
                        {skill.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{usageCount}</span>
                        <span className="text-muted-foreground text-xs">
                          {skill._count?.candidateSkills || 0} ứng viên
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {skill._count?.jobSkills || 0} việc làm
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={skill.isActive ? 'default' : 'secondary'}>
                        {skill.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(skill.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(skill)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(skill)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(skill)}
                          disabled={usageCount > 0}
                          title="Xóa"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {skills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-6 text-center">
                    Không có kỹ năng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground text-sm">
          Hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}{' '}
          trên {totalItems} kỹ năng
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Hiển thị</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
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
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
