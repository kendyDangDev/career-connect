'use client';

import Link from 'next/link';
import { useId, useRef, type ChangeEvent, type ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  Camera,
  DownloadCloud,
  Info,
  Loader2,
  Mail,
  Phone,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAvatarUpload } from '@/hooks/candidate/useAvatarUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CandidateProfileFormValues } from '@/types/candidate/profile.types';
import {
  AVAILABILITY_STATUS_LABELS,
  candidatePhoneRegex,
  type AvailabilityStatusValue,
} from '@/lib/validations/candidate/profile.validation';
import { cn } from '@/lib/utils';

interface ProfileHeroCardProps {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  availabilityStatus: AvailabilityStatusValue;
  hasCv: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  lastSavedLabel: string;
  register: UseFormRegister<CandidateProfileFormValues>;
  errors: FieldErrors<CandidateProfileFormValues>;
  onAvatarUploaded: (avatarUrl: string) => void;
  onAvatarRemoved: () => void;
}

const statusStyles: Record<AvailabilityStatusValue, string> = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  NOT_AVAILABLE: 'border-slate-200 bg-slate-100 text-slate-700',
  PASSIVE: 'border-amber-200 bg-amber-50 text-amber-700',
};

const inputClassName =
  'h-12 rounded-2xl border-white/18 bg-white/10 px-4 text-white shadow-none backdrop-blur-sm placeholder:text-white/55 focus-visible:border-white/35 focus-visible:ring-white/15';

function EditableField({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
          {label}
        </label>
        {helper ? <p className="text-xs leading-5 text-white/58">{helper}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  );
}

export default function ProfileHeroCard({
  userId,
  firstName,
  lastName,
  email,
  phone,
  avatarUrl,
  availabilityStatus,
  hasCv,
  isDirty,
  isSubmitting,
  lastSavedLabel,
  register,
  errors,
  onAvatarUploaded,
  onAvatarRemoved,
}: ProfileHeroCardProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Ứng viên mới';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('');

  const { clearError, error, isUploading, previewUrl, removeAvatar, uploadAvatar } =
    useAvatarUpload({
      userId,
      initialAvatarUrl: avatarUrl,
      onUploaded: onAvatarUploaded,
      onRemoved: onAvatarRemoved,
    });

  const displayedAvatarUrl = previewUrl ?? avatarUrl ?? undefined;

  const handleUploadClick = () => {
    clearError();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await uploadAvatar(file);
      toast.success('Đã cập nhật ảnh đại diện');
    } catch {
      // Hook already exposes the error state for inline feedback.
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      toast.success('Đã xóa ảnh đại diện');
    } catch {
      // Hook already exposes the error state for inline feedback.
    }
  };

  return (
    <section
      id="profile-overview"
      className="relative overflow-hidden rounded-[32px] border border-violet-200/60 bg-[linear-gradient(145deg,rgba(109,40,217,0.96),rgba(99,102,241,0.92))] p-6 text-white shadow-[0_30px_100px_rgba(109,40,217,0.28)] sm:p-8"
    >
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20),transparent_58%)]" />
      <div className="absolute top-16 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-12 bottom-0 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <input type="hidden" {...register('user.avatarUrl')} />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="w-full max-w-[180px] space-y-3">
              <div className="relative w-fit">
                <Avatar className="h-28 w-28 rounded-[30px] border-4 border-white/40 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
                  <AvatarImage
                    src={displayedAvatarUrl}
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-[26px] bg-white/15 text-3xl font-semibold text-white">
                    {initials || 'CV'}
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  size="icon"
                  className="absolute -right-2 -bottom-2 rounded-2xl bg-white text-violet-700 shadow-[0_16px_30px_rgba(0,0,0,0.16)] hover:bg-violet-50"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>

                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 w-full rounded-2xl bg-white/16 text-white hover:bg-white/22"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải ảnh...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Đổi ảnh đại diện
                    </>
                  )}
                </Button>

                {displayedAvatarUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-full rounded-2xl text-white/85 hover:bg-white/12 hover:text-white"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa ảnh
                  </Button>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-2xl border border-rose-300/35 bg-rose-500/12 px-3 py-2 text-sm text-rose-100">
                  {error}
                </p>
              ) : (
                <p className="text-xs leading-5 text-white/62">
                  Ảnh sẽ được cắt vuông và tối ưu tự động sau khi tải lên.
                </p>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Badge
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold',
                    statusStyles[availabilityStatus]
                  )}
                >
                  {AVAILABILITY_STATUS_LABELS[availabilityStatus]}
                </Badge>


                <Badge className="rounded-full border border-white/14 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-white/92">
                  {isDirty ? 'Có thay đổi chưa lưu' : 'Đã đồng bộ'}
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {fullName}
                </h1>

              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <EditableField
                  label="Tên"
                  error={errors.user?.firstName?.message}
                >
                  <Input
                    {...register('user.firstName')}
                    placeholder="Ví dụ: An"
                    className={inputClassName}
                  />
                </EditableField>

                <EditableField
                  label="Họ"
                  error={errors.user?.lastName?.message}
                >
                  <Input
                    {...register('user.lastName')}
                    placeholder="Ví dụ: Nguyễn"
                    className={inputClassName}
                  />
                </EditableField>

                <EditableField
                  label="Số điện thoại"
                  helper={
                    phone
                      ? 'NTD có thể dùng số này để liên hệ nhanh hơn.'
                      : 'Thêm số điện thoại để tăng khả năng liên hệ.'
                  }
                  // Bỏ error={} ở đây để không hiển thị dòng text lỗi dưới cùng nữa
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/70">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input
                      {...register('user.phone', {
                        setValueAs: (value) =>
                          typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 10) : value,
                        validate: (value) =>
                          !value ||
                          candidatePhoneRegex.test(value) ||
                          'Số điện thoại không hợp lệ (Bắt đầu bằng 0, gồm 10 số)', // Nội dung sẽ hiển thị khi hover
                      })}
                      inputMode="numeric"
                      maxLength={10}
                      pattern={candidatePhoneRegex.source}
                      placeholder="Nhập số điện thoại"
                      className={cn(
                        `pl-12 pr-10`, // Thêm pr-10 để chừa khoảng trống cho icon (i)
                        inputClassName,
                        errors.user?.phone && 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-400/20' // Đổi màu border khi lỗi
                      )}
                    />

                    {/* Biểu tượng (i) hiển thị khi có lỗi */}
                    {errors.user?.phone?.message && (
                      <div
                        className="absolute inset-y-0 right-4 flex cursor-help items-center text-rose-300"
                        title={errors.user.phone.message as string}
                      >
                        <Info className="h-4 w-4 transition-colors hover:text-rose-200" />
                      </div>
                    )}
                  </div>
                </EditableField>

                <EditableField
                  label="Email"
                  helper="Địa chỉ email hiện tại của tài khoản ứng viên."
                >
                  <div className="inline-flex h-12 w-full items-center gap-3 rounded-2xl border border-white/14 bg-slate-950/18 px-4 text-sm text-white/86 backdrop-blur-sm">
                    <Mail className="h-4 w-4 shrink-0 text-white/68" />
                    <span className="truncate">{email}</span>
                  </div>
                </EditableField>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
