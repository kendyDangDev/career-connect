'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Company } from '../types';
import { VerificationStatus } from '@/generated/prisma';
import { getCompanySizeLabel } from '@/lib/utils/company-size';

interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  loading?: boolean;
  verificationLoading?: boolean;
  onVerificationChange?: (
    status: VerificationStatus,
    verificationNotes?: string | null
  ) => Promise<void> | void;
}

function getStatusColor(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case VerificationStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case VerificationStatus.REJECTED:
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

function getStatusLabel(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return 'Đã xác minh';
    case VerificationStatus.PENDING:
      return 'Chờ xác minh';
    case VerificationStatus.REJECTED:
      return 'Bị từ chối';
    default:
      return status;
  }
}

function isImageDocument(url: string) {
  return /\.(png|jpe?g|webp|gif)(?:$|\?)/i.test(url);
}

function formatDate(dateString?: string) {
  if (!dateString) {
    return 'N/A';
  }

  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CompanyDetailDialog({
  open,
  onOpenChange,
  company,
  loading = false,
  verificationLoading = false,
  onVerificationChange,
}: CompanyDetailDialogProps) {
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setRejectionNotes(company?.verificationNotes ?? '');
  }, [company?.id, company?.verificationNotes, open]);

  const primaryContact = useMemo(() => {
    if (!company) {
      return null;
    }

    if (company.stats?.primaryContact) {
      return company.stats.primaryContact;
    }

    const contact =
      company.companyUsers?.find((companyUser) => companyUser.isPrimaryContact) ??
      company.companyUsers?.find((companyUser) => companyUser.role === 'ADMIN');

    if (!contact) {
      return null;
    }

    return {
      id: contact.user.id,
      name:
        [contact.user.firstName, contact.user.lastName].filter(Boolean).join(' ').trim() ||
        contact.user.email,
      email: contact.user.email,
      phone: contact.user.phone ?? undefined,
    };
  }, [company]);

  if (!company) {
    return null;
  }

  const documentUrl = company.businessLicenseUrl ?? null;
  const moderationEnabled = Boolean(onVerificationChange);

  const handleApprove = async () => {
    await onVerificationChange?.(VerificationStatus.VERIFIED, null);
  };

  const handleReject = async () => {
    await onVerificationChange?.(VerificationStatus.REJECTED, rejectionNotes.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết công ty</DialogTitle>
          <DialogDescription>
            Xem tài liệu xác minh, thông tin liên hệ chính và duyệt hồ sơ doanh nghiệp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border bg-slate-50/70 p-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logoUrl || ''} alt={company.companyName} />
                <AvatarFallback className="text-lg font-semibold">
                  {company.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{company.companyName}</h3>
                  <p className="text-sm text-slate-500">Slug: {company.companySlug}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  {company.industry?.name ? (
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {company.industry.name}
                    </span>
                  ) : null}

                  {company.companySize ? (
                    <span>{getCompanySizeLabel(company.companySize)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <Badge className={getStatusColor(company.verificationStatus)}>
                {getStatusLabel(company.verificationStatus)}
              </Badge>
              <span className="text-xs text-slate-500">
                Cập nhật lần cuối: {formatDate(company.updatedAt)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed py-12">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải chi tiết công ty...
              </div>
            </div>
          ) : null}

          {company.verificationNotes ? (
            <Alert
              variant={
                company.verificationStatus === VerificationStatus.REJECTED
                  ? 'destructive'
                  : 'default'
              }
            >
              <AlertDescription>
                <strong>Ghi chú xác minh:</strong> {company.verificationNotes}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin doanh nghiệp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.websiteUrl ? (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Website</p>
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {company.websiteUrl}
                      </a>
                    </div>
                  </div>
                ) : null}

                {company.email ? (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Email công ty</p>
                      <p className="text-sm text-slate-600">{company.email}</p>
                    </div>
                  </div>
                ) : null}

                {company.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Số điện thoại</p>
                      <p className="text-sm text-slate-600">{company.phone}</p>
                    </div>
                  </div>
                ) : null}

                {company.address || company.city || company.province || company.country ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Địa chỉ</p>
                      <p className="text-sm text-slate-600">
                        {[company.address, company.city, company.province, company.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Ngày tạo yêu cầu</p>
                    <p className="text-sm text-slate-600">{formatDate(company.createdAt)}</p>
                  </div>
                </div>

                {company.description ? (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Mô tả</p>
                      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-600">
                        {company.description}
                      </p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Người liên hệ chính</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {primaryContact ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{primaryContact.name}</p>
                        <p className="text-sm text-slate-600">{primaryContact.email}</p>
                      </div>
                      {primaryContact.phone ? (
                        <p className="text-sm text-slate-600">SĐT: {primaryContact.phone}</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Chưa có thông tin liên hệ chính.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu pháp lý</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {documentUrl ? (
                    <>
                      <div className="overflow-hidden rounded-lg border bg-slate-50">
                        {isImageDocument(documentUrl) ? (
                          <img
                            src={documentUrl}
                            alt="Business license"
                            className="h-[320px] w-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={documentUrl}
                            title="Business license preview"
                            className="h-[320px] w-full"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                          <a href={documentUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Xem trước
                          </a>
                        </Button>
                        <Button asChild variant="outline">
                          <a href={documentUrl} download>
                            <Download className="h-4 w-4" />
                            Tải file
                          </a>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                      <FileText className="mx-auto mb-3 h-5 w-5" />
                      Chưa có tài liệu pháp lý được tải lên.
                    </div>
                  )}
                </CardContent>
              </Card>

              {company.stats ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Thống kê nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Nhân viên</p>
                      <p className="font-semibold text-slate-900">{company._count.companyUsers}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tin tuyển dụng</p>
                      <p className="font-semibold text-slate-900">{company.stats.totalJobs}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Ứng viên</p>
                      <p className="font-semibold text-slate-900">
                        {company.stats.totalApplications}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Người theo dõi</p>
                      <p className="font-semibold text-slate-900">{company.stats.totalFollowers}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          {moderationEnabled ? (
            <>
              <Separator />

              <div className="space-y-4 rounded-xl border bg-white p-5">
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">Kiểm duyệt</h4>
                  <p className="text-sm text-slate-500">
                    Ghi chú này sẽ được lưu ở thông tin công ty và gửi cho ứng viên nếu bị từ chối.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-notes">Ghi chú xác minh</Label>
                  <Textarea
                    id="verification-notes"
                    placeholder="Nhập lý do từ chối hoặc ghi chú cho team..."
                    value={rejectionNotes}
                    onChange={(event) => setRejectionNotes(event.target.value)}
                    rows={4}
                    disabled={verificationLoading}
                  />
                </div>
              </div>

              <DialogFooter className="gap-3 sm:justify-between">
                <div className="text-xs text-slate-500">
                  {company.verificationStatus === VerificationStatus.VERIFIED
                    ? 'Công ty này đã được xác minh.'
                    : 'Duyệt (Approve) sẽ đổi quyền quản lý sang EMPLOYER. Từ chối (Reject) sẽ giữ quyền CANDIDATE.'}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={verificationLoading || !rejectionNotes.trim()}
                  >
                    {verificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldX className="h-4 w-4" />
                    )}
                    Từ chối
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={
                      verificationLoading ||
                      company.verificationStatus === VerificationStatus.VERIFIED
                    }
                  >
                    {verificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Phê duyệt
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
