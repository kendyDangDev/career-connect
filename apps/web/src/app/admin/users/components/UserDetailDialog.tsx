'use client';

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { User as UserType, UserType as UserTypeEnum, UserStatus } from '../types';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

const userTypeLabels: Record<UserTypeEnum, string> = {
  ADMIN: 'Quản trị viên',
  EMPLOYER: 'Nhà tuyển dụng',
  CANDIDATE: 'Ứng viên',
};

const userTypeColors: Record<UserTypeEnum, 'default' | 'secondary' | 'outline'> = {
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

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của người dùng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant={userTypeColors[user.userType]}>
                    {userTypeLabels[user.userType]}
                  </Badge>
                  <Badge variant={userStatusColors[user.status]}>
                    {userStatusLabels[user.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="grid gap-4">
            <div>
              <Label className="text-muted-foreground">Thông tin liên hệ</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  {user.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Info */}
          {user.profile && (
            <>
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Địa chỉ</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[user.profile.city, user.profile.province, user.profile.country]
                        .filter(Boolean)
                        .join(', ') || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Company Info */}
          {user.companyUsers && user.companyUsers.length > 0 && (
            <>
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Công ty</Label>
                  <div className="mt-2 space-y-2">
                    {user.companyUsers.map((companyUser, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {companyUser.company.companyName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Candidate Info */}
          {user.candidate && (
            <>
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Thông tin ứng viên</Label>
                  <div className="mt-2 space-y-2">
                    {user.candidate.currentPosition && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {user.candidate.currentPosition}
                        </span>
                      </div>
                    )}
                    {user.candidate.experienceYears !== null && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Kinh nghiệm: {user.candidate.experienceYears} năm
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timestamps */}
          <div className="grid gap-4">
            <div>
              <Label className="text-muted-foreground">Thời gian</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ngày tạo: {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Cập nhật: {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
