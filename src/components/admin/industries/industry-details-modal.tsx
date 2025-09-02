'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Calendar,
  FileImage,
  Hash,
  Link,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
} from 'lucide-react';
import { Industry } from '@/types/system-categories';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IndustryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  industry: Industry | null;
  loading?: boolean;
  onEdit?: (industry: Industry) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
}

const IndustryDetailsModal: React.FC<IndustryDetailsModalProps> = ({
  open,
  onClose,
  industry,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!industry && !loading) return null;

  const canDelete = industry && (industry._count?.companies || 0) === 0;

  const DetailItem = ({ icon: Icon, label, value, className }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="p-2 bg-gray-100 rounded-md">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'Không có thông tin'}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết ngành nghề</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về ngành nghề và các thống kê liên quan
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : industry ? (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Header with name and status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {industry.iconUrl ? (
                    <img
                      src={industry.iconUrl}
                      alt={industry.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileImage className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{industry.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {industry.id}</p>
                  </div>
                </div>
                <Badge
                  variant={industry.isActive ? 'default' : 'secondary'}
                  className={cn(
                    industry.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {industry.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Badge>
              </div>

              <Separator />

              {/* Description */}
              {industry.description && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Mô tả</h4>
                    <p className="text-sm text-muted-foreground">
                      {industry.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Link}
                  label="Slug"
                  value={industry.slug}
                />
                <DetailItem
                  icon={Hash}
                  label="Thứ tự hiển thị"
                  value={industry.sortOrder || 0}
                />
                <DetailItem
                  icon={Building2}
                  label="Số lượng công ty"
                  value={
                    <span className="flex items-center gap-2">
                      {industry._count?.companies || 0} công ty
                      {(industry._count?.companies || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Đang sử dụng
                        </Badge>
                      )}
                    </span>
                  }
                />
                <DetailItem
                  icon={FileImage}
                  label="Icon URL"
                  value={
                    industry.iconUrl ? (
                      <a
                        href={industry.iconUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {industry.iconUrl}
                      </a>
                    ) : (
                      'Chưa có icon'
                    )
                  }
                />
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="space-y-3">
                <DetailItem
                  icon={Calendar}
                  label="Ngày tạo"
                  value={format(new Date(industry.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                />
                {industry.updatedAt && (
                  <DetailItem
                    icon={Clock}
                    label="Cập nhật lần cuối"
                    value={format(new Date(industry.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  />
                )}
              </div>
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            {industry && onToggleStatus && (
              <Button
                variant="outline"
                onClick={() => onToggleStatus(industry.id, !industry.isActive)}
                className="gap-2"
              >
                {industry.isActive ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    Ngừng hoạt động
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </Button>
            )}
            {industry && onDelete && canDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(industry.id)}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {industry && onEdit && (
              <Button onClick={() => onEdit(industry)} className="gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IndustryDetailsModal;
