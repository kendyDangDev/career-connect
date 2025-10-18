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
  CheckCircle,
  XCircle,
  Briefcase,
  FileText,
  Users,
  Clock,
  Activity,
  BarChart3,
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

interface IndustryStats {
  totalCategories: number;
  activeCategories: number;
  totalJobs: number;
  totalApplications: number;
}

export function IndustryDetailView({
  open,
  onClose,
  onEdit,
  onDelete,
  industryId,
}: IndustryDetailViewProps) {
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [stats, setStats] = useState<IndustryStats | null>(null);
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
      setIndustry(data.industry);

      // Mock stats - replace with actual API call
      setStats({
        totalCategories: data.industry.categoryCount || 0,
        activeCategories: Math.floor((data.industry.categoryCount || 0) * 0.8),
        totalJobs: Math.floor(Math.random() * 1000) + 100,
        totalApplications: Math.floor(Math.random() * 5000) + 1000,
      });
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
                    <p className="text-muted-foreground text-sm">Mã ngành</p>
                    <p className="font-medium">{industry.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Tên ngành</p>
                    <p className="font-medium">{industry.name}</p>
                  </div>
                </div>
                {industry.description && (
                  <div>
                    <p className="text-muted-foreground text-sm">Mô tả</p>
                    <p className="mt-1">{industry.description}</p>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">Cập nhật lần cuối</p>
                      <p className="font-medium">
                        {industry.updatedAt
                          ? format(new Date(industry.updatedAt), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-5 w-5" />
                    Thống kê
                  </CardTitle>
                  <CardDescription>Tổng quan về hoạt động của ngành</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="text-primary h-8 w-8" />
                          <div>
                            <p className="text-muted-foreground text-sm">Tổng danh mục</p>
                            <p className="text-2xl font-bold">{stats.totalCategories}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-muted-foreground text-sm">Việc làm</p>
                            <p className="text-2xl font-bold">{stats.totalJobs}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Activity className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-muted-foreground text-sm">Danh mục hoạt động</p>
                            <p className="text-2xl font-bold">{stats.activeCategories}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-orange-500" />
                          <div>
                            <p className="text-muted-foreground text-sm">Ứng tuyển</p>
                            <p className="text-2xl font-bold">{stats.totalApplications}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
