import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/generated/prisma';

interface CandidateCardProps {
  candidate: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    position: string;
    location: string;
    experience: string;
    appliedDate: string;
    status: ApplicationStatus;
    rating?: number;
    avatarUrl?: string;
    skills?: string[];
    notes?: string;
    cvFileUrl?: string;
    coverLetter?: string;
  };
  onStatusChange?: (id: string, status: string) => void;
  onRatingChange?: (id: string, rating: number) => void;
  onViewCV?: (id: string) => void;
  onSendMessage?: (id: string) => void;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  [ApplicationStatus.APPLIED]: { label: 'Mới', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  [ApplicationStatus.SCREENING]: {
    label: 'Đang xem xét',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: 'Phỏng vấn',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  [ApplicationStatus.OFFERED]: {
    label: 'Đã gửi offer',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  [ApplicationStatus.HIRED]: {
    label: 'Tuyển dụng',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Đã rút',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function CandidateCard({
  candidate,
  onStatusChange,
  onRatingChange,
  onViewCV,
  onSendMessage,
}: CandidateCardProps) {
  const status = statusConfig[candidate.status];

  // Get full name from firstName and lastName
  const getFullName = () => {
    const { firstName, lastName } = candidate;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return candidate.email.split('@')[0];
  };

  const fullName = getFullName();

  // Get initials for avatar
  const getInitials = () => {
    const { firstName, lastName } = candidate;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (lastName) return lastName.slice(0, 2).toUpperCase();
    return candidate.email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-lg font-bold text-white shadow-md">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start gap-2">
              <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-700">
                {fullName}
              </h3>
              {candidate.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4 cursor-pointer transition-colors',
                        i < candidate.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                      onClick={() => onRatingChange?.(candidate.id, i + 1)}
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="mb-2 text-sm font-medium text-purple-600">{candidate.position}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {candidate.location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {candidate?.experience === 'null+ năm'
                  ? 'Chưa có kinh nghiệm'
                  : candidate.experience}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {candidate.appliedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
              status.color
            )}
          >
            {status.label}
          </span>

          <div className="group/menu relative">
            <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown */}
            <div className="invisible absolute top-full right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/menu:visible group-hover/menu:opacity-100">
              <div className="p-1">
                {Object.entries(statusConfig).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => onStatusChange?.(candidate.id, key)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        value.color.split(' ')[0].replace('bg-', 'bg-')
                      )}
                    />
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          href={`mailto:${candidate.email}`}
          className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-600"
        >
          <Mail className="h-4 w-4" />
          {candidate.email}
        </a>
        {candidate.phone && (
          <a
            href={`tel:${candidate.phone}`}
            className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-600"
          >
            <Phone className="h-4 w-4" />
            {candidate.phone}
          </a>
        )}
      </div>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              +{candidate.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {candidate.notes && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
          <p className="line-clamp-2">{candidate.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
        <a
          // onClick={() => onViewCV?.(candidate.id)}
          href={candidate.cvFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-medium ${candidate.cvFileUrl ? 'text-purple-700 hover:shadow-sm' : 'cursor-not-allowed text-gray-400 hover:shadow-none'}`}
        >
          <FileText className="h-4 w-4" />
          {candidate.cvFileUrl ? 'Xem CV' : 'CV Not Available'}
        </a>
        <button
          onClick={() => onSendMessage?.(candidate.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
        >
          <MessageSquare className="h-4 w-4" />
          Nhắn tin
        </button>
      </div>
    </div>
  );
}
