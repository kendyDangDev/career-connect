'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Edit,
  Trash2,
  Building2,
  Hash,
  Link2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Industry } from '@/types/system-categories';

interface IndustryDetailViewProps {
  open: boolean;
  onClose: () => void;
  onEdit: (industry: Industry) => void;
  onDelete: (industry: Industry) => void;
  industryId: string | null;
}

export function IndustryDetailView({
  open,
  onClose,
  onEdit,
  onDelete,
  industryId,
}: IndustryDetailViewProps) {
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (industryId) {
      fetchIndustryDetails();
    }
  }, [industryId]);

  const fetchIndustryDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/system-categories/industries/${industryId}`);
      if (!response.ok) throw new Error('Failed to fetch industry details');

      const data = await response.json();

      // Fix: API trả về data.data, không phải data.industry
      const industry = data.data;
      setIndustry(industry);
    } catch (error) {
      console.error('Error fetching industry details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!industry && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết ngành</DialogTitle>
          <DialogDescription>Thông tin chi tiết và thống kê về ngành</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : industry ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
                  <Badge variant={industry.isActive ? 'default' : 'secondary'}>
                    {industry.isActive ? 'Hoạt động' : 'Ngưng'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Tên ngành</p>
                    <p className="font-medium">{industry.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="text-muted-foreground h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-sm">Slug</p>
                      <p className="font-mono text-sm font-medium">{industry.slug}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-sm">Thứ tự sắp xếp</p>
                      <p className="font-medium">{industry.sortOrder ?? '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-sm">Số công ty</p>
                      <p className="font-medium">{industry._count?.companies ?? 0}</p>
                    </div>
                  </div>
                </div>

                {industry.iconUrl && (
                  <div>
                    <p className="text-muted-foreground text-sm">Icon URL</p>
                    <p className="truncate font-medium text-sm">{industry.iconUrl}</p>
                  </div>
                )}

                {industry.description && (
                  <div>
                    <p className="text-muted-foreground text-sm">Mô tả</p>
                    <p className="mt-1">{industry.description}</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Ngày tạo</p>
                    <p className="font-medium">
                      {industry.createdAt
                        ? format(new Date(industry.createdAt), 'dd/MM/yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onEdit(industry)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button variant="destructive" onClick={() => onDelete(industry)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
