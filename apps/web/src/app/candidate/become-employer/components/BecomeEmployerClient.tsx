'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  AlertCircle,
  Building2,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

import { CompanySize, VerificationStatus } from '@/generated/prisma';
import { candidateEmployerRequestClientSchema } from '@/lib/validations/company.validation';
import { getCompanySizeLabel, getCompanySizeOptions } from '@/lib/utils/company-size';
import type { EmployerRequestCompany, EmployerRequestState } from '@/types/employer-request';
import type { CandidateEmployerRequestClientValues } from '@/lib/validations/company.validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const EMPLOYER_REQUEST_CHANGED_EVENT = 'candidate-employer-request:changed';

interface IndustryOption {
  id: string;
  name: string;
}

interface BecomeEmployerClientProps {
  industries: IndustryOption[];
  initialState: EmployerRequestState;
}

function getStatusLabel(status: EmployerRequestState['status']) {
  switch (status) {
    case 'NONE':
      return 'Chưa tạo yêu cầu';
    case VerificationStatus.PENDING:
      return 'Chờ duyệt';
    case VerificationStatus.REJECTED:
      return 'Cần bổ sung';
    case VerificationStatus.VERIFIED:
      return 'Đã duyệt';
    default:
      return status;
  }
}

function getStatusClass(status: EmployerRequestState['status']) {
  switch (status) {
    case VerificationStatus.PENDING:
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
    case VerificationStatus.REJECTED:
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    case VerificationStatus.VERIFIED:
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }
}

function buildDefaultValues(
  company: EmployerRequestCompany | null
): CandidateEmployerRequestClientValues {
  return {
    companyName: company?.companyName ?? '',
    industryId: company?.industryId ?? '',
    companySize: company?.companySize ?? CompanySize.STARTUP_1_10,
    websiteUrl: company?.websiteUrl ?? '',
    description: company?.description ?? '',
    businessLicenseFile: undefined,
    logoFile: undefined,
  };
}

function extractErrorMessage(payload: any, fallback: string) {
  return payload?.error || payload?.message || fallback;
}

function buildRequestFormData(values: CandidateEmployerRequestClientValues) {
  const formData = new FormData();

  formData.append('companyName', values.companyName);
  formData.append('industryId', values.industryId);
  formData.append('companySize', values.companySize);

  if (values.websiteUrl) {
    formData.append('websiteUrl', values.websiteUrl);
  }

  if (values.description) {
    formData.append('description', values.description);
  }

  if (values.businessLicenseFile instanceof File) {
    formData.append('businessLicenseFile', values.businessLicenseFile);
  }

  if (values.logoFile instanceof File) {
    formData.append('logoFile', values.logoFile);
  }

  return formData;
}

export default function BecomeEmployerClient({
  industries,
  initialState,
}: BecomeEmployerClientProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [requestState, setRequestState] = useState<EmployerRequestState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingSession, setRefreshingSession] = useState(false);

  const form = useForm<CandidateEmployerRequestClientValues>({
    defaultValues: buildDefaultValues(initialState.company),
  });

  useEffect(() => {
    form.reset(buildDefaultValues(requestState.company));
  }, [form, requestState.company, requestState.status]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(EMPLOYER_REQUEST_CHANGED_EVENT, {
        detail: { status: requestState.status },
      })
    );
  }, [requestState.status]);

  const businessLicenseFile = form.watch('businessLicenseFile');
  const logoFile = form.watch('logoFile');
  const isRejected = requestState.status === VerificationStatus.REJECTED && requestState.canEdit;
  const isPending = requestState.status === VerificationStatus.PENDING;

  const refreshRequestState = useCallback(async (options?: { silent?: boolean }) => {
    const response = await fetch('/api/candidate/employer-request', {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = extractErrorMessage(payload, 'Không thể tải trạng thái yêu cầu');
      if (!options?.silent) {
        toast.error(message);
      }
      throw new Error(message);
    }

    const nextState = payload.data as EmployerRequestState;
    setRequestState(nextState);
    return nextState;
  }, []);

  const refreshSessionAndRedirect = useCallback(async () => {
    if (refreshingSession) {
      return;
    }

    setRefreshingSession(true);

    try {
      await updateSession();
      router.replace('/employer/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Không thể làm mới phiên đăng nhập nhà tuyển dụng. Vui lòng thử lại.');
      setRefreshingSession(false);
    }
  }, [refreshingSession, router, updateSession]);

  useEffect(() => {
    if (
      requestState.requiresSessionRefresh ||
      requestState.status === VerificationStatus.VERIFIED
    ) {
      void refreshSessionAndRedirect();
    }
  }, [refreshSessionAndRedirect, requestState.requiresSessionRefresh, requestState.status]);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const poll = () => {
      void refreshRequestState({ silent: true }).catch(() => {
        // Ignore transient polling errors to avoid noisy UX.
      });
    };

    const intervalId = window.setInterval(poll, 15000);
    window.addEventListener('focus', poll);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', poll);
    };
  }, [isPending, refreshRequestState]);

  const onSubmit = form.handleSubmit(async (values) => {
    const parsedValues = candidateEmployerRequestClientSchema.safeParse(values);

    if (!parsedValues.success) {
      const fieldErrors = parsedValues.error.flatten().fieldErrors;

      Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
        const message = messages?.[0];
        if (!message) {
          return;
        }

        form.setError(fieldName as keyof CandidateEmployerRequestClientValues, {
          type: 'validate',
          message,
        });
      });

      return;
    }

    const parsedFormValues = parsedValues.data;
    const currentBusinessLicenseUrl = requestState.company?.businessLicenseUrl ?? null;
    const needsBusinessLicense = !currentBusinessLicenseUrl;

    if (needsBusinessLicense && !(parsedFormValues.businessLicenseFile instanceof File)) {
      form.setError('businessLicenseFile', {
        type: 'required',
        message: 'Vui lòng tải lên tài liệu pháp lý bắt buộc.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/candidate/employer-request', {
        method: isRejected ? 'PUT' : 'POST',
        body: buildRequestFormData(parsedFormValues),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(payload, 'Không thể gửi yêu cầu trở thành nhà tuyển dụng')
        );
      }

      const nextState = payload.data as EmployerRequestState;
      setRequestState(nextState);
      form.reset(buildDefaultValues(nextState.company));

      toast.success(
        isRejected
          ? 'Đã cập nhật và gửi lại yêu cầu xét duyệt.'
          : 'Đã gửi yêu cầu trở thành nhà tuyển dụng.'
      );
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  });

  const summaryRows = useMemo(() => {
    const company = requestState.company;

    if (!company) {
      return [];
    }

    return [
      { label: 'Tên công ty', value: company.companyName },
      { label: 'Ngành nghề', value: company.industryName ?? 'Chưa cập nhật' },
      {
        label: 'Quy mô',
        value: company.companySize ? getCompanySizeLabel(company.companySize) : 'Chưa cập nhật',
      },
      { label: 'Website', value: company.websiteUrl ?? 'Chưa cập nhật' },
    ];
  }, [requestState.company]);

  if (refreshingSession || requestState.status === VerificationStatus.VERIFIED) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-24 pb-16">
        <div className="mx-auto max-w-3xl">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Yêu cầu đã được phê duyệt</h1>
                <p className="text-sm text-slate-600">
                  Hệ thống đang làm mới phiên đăng nhập để đưa bạn vào trang quản trị Nhà tuyển
                  dụng.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] px-4 pt-24 pb-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.16em] text-indigo-100 uppercase">
                Candidate only flow
              </div>
              <CardTitle className="text-3xl font-semibold">
                Trở thành nhà tuyển dụng từ tài khoản ứng viên
              </CardTitle>
              <CardDescription className="max-w-2xl text-slate-300">
                Tạo hồ sơ công ty, tải lên 1 tài liệu pháp lý bắt buộc và chờ admin xét duyệt. Trong
                lúc chờ duyệt, tài khoản của bạn vẫn giữ vai trò Ứng viên.
              </CardDescription>
            </div>

            <Badge className={getStatusClass(requestState.status)}>
              {getStatusLabel(requestState.status)}
            </Badge>
          </CardHeader>
        </Card>

        {requestState.status === VerificationStatus.REJECTED &&
        requestState.company?.verificationNotes ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Yêu cầu trước đã bị từ chối. Ghi chú của admin:{' '}
              {requestState.company.verificationNotes}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {isRejected ? 'Cập nhật và gửi lại hồ sơ công ty' : 'Hồ sơ doanh nghiệp'}
              </CardTitle>
              <CardDescription>
                {isPending
                  ? 'Bạn đã có một yêu cầu đang chờ admin xét duyệt. Không thể tạo yêu cầu thứ hai.'
                  : 'Nhập thông tin công ty và tài liệu pháp lý để admin xác minh.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {isPending ? (
                <div className="space-y-5">
                  <Alert>
                    <Clock3 className="h-4 w-4" />
                    <AlertDescription>
                      Yêu cầu của bạn đang ở trạng thái chờ duyệt. Trang này sẽ tự động cập nhật khi
                      admin phê duyệt.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {summaryRows.map((row) => (
                      <div key={row.label} className="rounded-lg border bg-slate-50 px-4 py-3">
                        <p className="text-xs tracking-wide text-slate-500 uppercase">
                          {row.label}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{row.value}</p>
                      </div>
                    ))}
                  </div>

                  {requestState.company?.description ? (
                    <div className="rounded-lg border px-4 py-3">
                      <p className="text-xs tracking-wide text-slate-500 uppercase">Mô tả</p>
                      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-700">
                        {requestState.company.description}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <form className="space-y-5" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Tên công ty</Label>
                    <Input
                      id="companyName"
                      placeholder="VD: Career Connect Vietnam"
                      {...form.register('companyName')}
                    />
                    {form.formState.errors.companyName ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.companyName.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="industryId">Ngành nghề</Label>
                      <Controller
                        control={form.control}
                        name="industryId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="industryId">
                              <SelectValue placeholder="Chọn ngành nghề" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry.id} value={industry.id}>
                                  {industry.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.industryId ? (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.industryId.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Quy mô công ty</Label>
                      <Controller
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as CompanySize)}
                          >
                            <SelectTrigger id="companySize">
                              <SelectValue placeholder="Chọn quy mô" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCompanySizeOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.companySize ? (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.companySize.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website công ty (tùy chọn)</Label>
                    <Input
                      id="websiteUrl"
                      placeholder="https://example.com"
                      {...form.register('websiteUrl')}
                    />
                    {form.formState.errors.websiteUrl ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.websiteUrl.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả công ty (tùy chọn)</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Tóm tắt về công ty, sản phẩm, team và nhu cầu tuyển dụng..."
                      {...form.register('description')}
                    />
                    {form.formState.errors.description ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.description.message}
                      </p>
                    ) : null}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="businessLicenseFile">
                      Tài liệu pháp lý{' '}
                      {requestState.company?.businessLicenseUrl
                        ? '(tải lại nếu cần cập nhật)'
                        : '*'}
                    </Label>
                    <Input
                      id="businessLicenseFile"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        form.setValue('businessLicenseFile', file, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <p className="text-xs text-slate-500">
                      Chấp nhận PDF/JPG/JPEG/PNG, tối đa 5MB.
                    </p>
                    {businessLicenseFile instanceof File ? (
                      <p className="text-sm text-slate-700">
                        Đang chọn: {businessLicenseFile.name}
                      </p>
                    ) : requestState.company?.businessLicenseUrl ? (
                      <a
                        href={requestState.company.businessLicenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Xem tài liệu hiện tại
                      </a>
                    ) : null}
                    {form.formState.errors.businessLicenseFile ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.businessLicenseFile.message as string}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoFile">Logo công ty (tùy chọn)</Label>
                    <Input
                      id="logoFile"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        form.setValue('logoFile', file, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <p className="text-xs text-slate-500">
                      Tải lên nếu bạn muốn hiển thị logo ngay khi được duyệt.
                    </p>
                    {logoFile instanceof File ? (
                      <p className="text-sm text-slate-700">Đang chọn: {logoFile.name}</p>
                    ) : requestState.company?.logoUrl ? (
                      <a
                        href={requestState.company.logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem logo hiện tại
                      </a>
                    ) : null}
                    {form.formState.errors.logoFile ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.logoFile.message as string}
                      </p>
                    ) : null}
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isRejected ? (
                        <RefreshCcw className="h-4 w-4" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      {isRejected ? 'Cập nhật và gửi lại' : 'Gửi yêu cầu'}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Quy trình xét duyệt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>Ứng viên tạo 1 hồ sơ công ty duy nhất gắn với tài khoản hiện tại.</p>
                </div>
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>Giấy phép kinh doanh là tài liệu bắt buộc để admin xét duyệt.</p>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>Trong lúc chờ duyệt, vai trò vẫn là Ứng viên (Candidate).</p>
                </div>
                <div className="flex gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>
                    Sau khi được duyệt, phiên đăng nhập sẽ được làm mới và chuyển hướng sang Trang
                    quản trị Nhà tuyển dụng.
                  </p>
                </div>
              </CardContent>
            </Card>

            {requestState.company ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Thông tin yêu cầu hiện tại</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500">Công ty</p>
                    <p className="font-medium text-slate-900">{requestState.company.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Trạng thái</p>
                    <Badge className={getStatusClass(requestState.status)}>
                      {getStatusLabel(requestState.status)}
                    </Badge>
                  </div>
                  {requestState.company.businessLicenseUrl ? (
                    <div className="space-y-1">
                      <p className="text-slate-500">Giấy phép kinh doanh</p>
                      <a
                        href={requestState.company.businessLicenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Mở tài liệu đã tải lên
                      </a>
                    </div>
                  ) : null}
                  {requestState.company.logoUrl ? (
                    <div className="space-y-1">
                      <p className="text-slate-500">Logo</p>
                      <a
                        href={requestState.company.logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Mở logo hiện tại
                      </a>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!isPending ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void refreshRequestState()}
                className="w-full"
              >
                <RefreshCcw className="h-4 w-4" />
                Làm mới trạng thái yêu cầu
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
