import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Bookmark,
  BadgeCheck,
  Flame,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export interface JobCardData {
  id: string;
  title: string;
  company?: {
    companyName: string;
    logoUrl?: string | null;
    verificationStatus?: string;
    companySlug?: string;
  } | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  createdAt?: string | Date | null;
  expiresAt?: string | Date | null;
  isFeatured?: boolean;
  isUrgent?: boolean;
}

interface JobCardProps {
  job: JobCardData;
  saved?: boolean;
  onSave?: (id: string) => void;
}

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  REMOTE: 'Remote',
  FREELANCE: 'Freelance',
};

const jobTypeColor: Record<string, string> = {
  FULL_TIME: 'bg-purple-50 text-purple-700 border-purple-100',
  PART_TIME: 'bg-blue-50 text-blue-700 border-blue-100',
  CONTRACT: 'bg-orange-50 text-orange-700 border-orange-100',
  INTERNSHIP: 'bg-green-50 text-green-700 border-green-100',
  REMOTE: 'bg-teal-50 text-teal-700 border-teal-100',
  FREELANCE: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const curr = currency ?? 'VND';
  const fmt = (n: number) =>
    curr === 'VND' ? `${(n / 1_000_000).toFixed(0)}M` : `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  if (max) return `Đến ${fmt(max)}`;
}

function timeAgo(date?: string | Date | null) {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

function isNewJob(date?: string | Date | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return Date.now() - d.getTime() < 3 * 86_400_000; // < 3 ngày
}

function daysUntilExpiry(date?: string | Date | null): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86_400_000);
}

export default function JobCard({ job, saved, onSave }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const when = timeAgo(job.createdAt);
  const isNew = isNewJob(job.createdAt);
  const daysLeft = daysUntilExpiry(job.expiresAt);
  const typeLabel = job.jobType ? (jobTypeLabel[job.jobType] ?? job.jobType) : null;
  const typeColor = job.jobType
    ? (jobTypeColor[job.jobType] ?? 'bg-gray-50 text-gray-600 border-gray-100')
    : '';
  const location = [job.locationCity, job.locationProvince].filter(Boolean).join(', ');

  return (
    <div className="group backdrop-bltop-0 ur-smition-all relative flex flex-col gap-4 rounded-2xl border border-gray-100/80 bg-white/95 p-5 shadow-sm duration-300 hover:-translate-y-1 hover:border-purple-200/70 hover:bg-white hover:shadow-lg hover:ring-1 hover:shadow-purple-200/40 hover:ring-purple-100/50">
      {/* Badges — góc trên phải (ưu tiên: Featured > Urgent > Mới) */}
      {job.isFeatured ? (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
          <Flame className="h-3 w-3" /> Nổi bật
        </span>
      ) : job.isUrgent ? (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
          <AlertCircle className="h-3 w-3" /> Gấp
        </span>
      ) : isNew ? (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
          <Sparkles className="h-3 w-3" /> Mới
        </span>
      ) : null}

      {/* Top row: logo + meta */}
      <div className="flex items-start gap-3">
        {/* Company logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          {job.company?.logoUrl ? (
            <Image
              src={job.company.logoUrl}
              alt={job.company.companyName}
              width={48}
              height={48}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Company name */}
          {job.company && (
            <div className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate">{job.company.companyName}</span>
              {job.company.verificationStatus === 'VERIFIED' && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-purple-500" />
              )}
            </div>
          )}
          {/* Job Title */}
          <Link
            href={`/jobs/${job.id}`}
            className="line-clamp-2 leading-snug font-semibold text-gray-900 transition group-hover:text-purple-700"
          >
            {job.title}
          </Link>
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave?.(job.id)}
          className={`shrink-0 rounded-full p-2 transition ${
            saved
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-50 text-gray-400 hover:bg-purple-50 hover:text-purple-500'
          }`}
          aria-label="Save job"
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2">
        {typeLabel && (
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
            {typeLabel}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            <DollarSign className="h-3 w-3" />
            {salary}
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
            <MapPin className="h-3 w-3 text-gray-400" />
            {location}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="flex flex-col gap-1">
          {when && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {when}
            </span>
          )}
          {daysLeft !== null && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <AlertCircle className="h-3 w-3" />
              {daysLeft === 0 ? 'Hết hạn hôm nay' : `Còn ${daysLeft} ngày`}
            </span>
          )}
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="ml-auto rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-700 transition group-hover:bg-purple-600 group-hover:text-white"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
