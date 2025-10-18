'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '../types';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Heart,
} from 'lucide-react';

interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export function CompanyDetailDialog({
  open,
  onOpenChange,
  company,
}: CompanyDetailDialogProps) {
  if (!company) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'Đã xác minh';
      case 'PENDING':
        return 'Chờ xác minh';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return status;
    }
  };

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'STARTUP':
        return '1-10 nhân viên';
      case 'SMALL':
        return '11-50 nhân viên';
      case 'MEDIUM':
        return '51-200 nhân viên';
      case 'LARGE':
        return '201-1000 nhân viên';
      case 'ENTERPRISE':
        return '1000+ nhân viên';
      default:
        return 'Chưa xác định';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết công ty</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage src={company.logoUrl || ''} alt={company.companyName} />
                <AvatarFallback className="text-lg font-semibold">
                  {company.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold">{company.companyName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Slug: {company.companySlug}
                  </p>
                </div>
                <Badge className={getStatusColor(company.verificationStatus)}>
                  {getStatusLabel(company.verificationStatus)}
                </Badge>
              </div>
              {company.industry && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {company.industry.name}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Thông tin cơ bản</h4>
              
              {company.websiteUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.websiteUrl}
                    </a>
                  </div>
                </div>
              )}

              {company.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{company.email}</p>
                  </div>
                </div>
              )}

              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Điện thoại</p>
                    <p className="text-sm">{company.phone}</p>
                  </div>
                </div>
              )}

              {company.companySize && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quy mô</p>
                    <p className="text-sm">{getCompanySizeLabel(company.companySize)}</p>
                  </div>
                </div>
              )}

              {company.foundedYear && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Năm thành lập</p>
                    <p className="text-sm">{company.foundedYear}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Thống kê</h4>
              
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số nhân viên</p>
                  <p className="text-sm">{company._count.companyUsers}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số việc làm</p>
                  <p className="text-sm">{company._count.jobs}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Người theo dõi</p>
                  <p className="text-sm">{company._count.companyFollowers}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="text-sm">{formatDate(company.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="text-sm">{formatDate(company.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          {(company.address || company.city || company.province || company.country) && (
            <div className="space-y-4">
              <h4 className="font-semibold">Địa chỉ</h4>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="space-y-1">
                  {company.address && <p className="text-sm">{company.address}</p>}
                  <div className="text-sm text-muted-foreground">
                    {[company.city, company.province, company.country]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {company.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold">Mô tả công ty</h4>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {company.description}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
