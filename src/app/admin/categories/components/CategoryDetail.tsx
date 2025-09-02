'use client';

import React from 'react';
import { Category } from '@/types/system-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Folder,
  FolderOpen,
  Calendar,
  Clock,
  Hash,
  Link,
  FileText,
  Image,
  Activity,
  TrendingUp,
  Users,
  Briefcase,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CategoryDetailProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onStatusChange: (category: Category, isActive: boolean) => void;
}

export function CategoryDetail({
  open,
  onClose,
  category,
  onEdit,
  onDelete,
  onStatusChange,
}: CategoryDetailProps) {
  if (!category) return null;

  // Render child categories tree
  const renderChildCategories = (children: Category[], level = 0): React.ReactNode => {
    if (!children || children.length === 0) return null;

    return (
      <ul className="space-y-2">
        {children.map((child) => (
          <li key={child.id} style={{ paddingLeft: `${level * 1.5}rem` }}>
            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                {child.children && child.children.length > 0 ? (
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{child.name}</span>
                <Badge variant={child.isActive ? 'default' : 'secondary'} className="ml-2">
                  {child.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {child._count && (
                  <>
                    <span>{child._count.jobCategories} việc làm</span>
                    {child._count.children > 0 && (
                      <span>• {child._count.children} danh mục con</span>
                    )}
                  </>
                )}
              </div>
            </div>
            {child.children && renderChildCategories(child.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{category.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Chi tiết thông tin danh mục
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={category.isActive ? 'outline' : 'default'}
                size="sm"
                onClick={() => onStatusChange(category, !category.isActive)}
              >
                {category.isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Vô hiệu hóa
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tên danh mục</p>
                      <p className="mt-1 font-medium">{category.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Slug</p>
                      <code className="mt-1 rounded bg-muted px-2 py-1 text-sm">{category.slug}</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Danh mục cha</p>
                      <p className="mt-1">
                        {category.parent ? (
                          <span className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {category.parent.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Không có (Danh mục gốc)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                      <div className="mt-1">
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Thứ tự sắp xếp</p>
                      <p className="mt-1">{category.sortOrder || 0}</p>
                    </div>
                    {category.iconUrl && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Icon URL</p>
                        <a
                          href={category.iconUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Image className="h-4 w-4" />
                          Xem icon
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {category.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                    <p className="mt-1 text-sm">{category.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Danh mục con</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{category._count?.children || 0}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Việc làm</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{category._count?.jobCategories || 0}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Tổng cộng</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {(category._count?.children || 0) + (category._count?.jobCategories || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Child Categories */}
            {category.children && category.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Danh mục con ({category.children.length})
                  </CardTitle>
                  <CardDescription>
                    Danh sách các danh mục con thuộc danh mục này
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderChildCategories(category.children)}
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Thông tin hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <code className="rounded bg-muted px-2 py-1 text-sm">{category.id}</code>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(category.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                      <span className="text-muted-foreground">
                        ({formatDistanceToNow(new Date(category.createdAt), { locale: vi, addSuffix: true })})
                      </span>
                    </div>
                  </div>
                  {category.updatedAt && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(category.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                          <span className="text-muted-foreground">
                            ({formatDistanceToNow(new Date(category.updatedAt), { locale: vi, addSuffix: true })})
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
