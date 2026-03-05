import Image from 'next/image';
import { Candidate, availabilityStatusLabels } from '../../../admin/candidates/types';

interface CandidateProfileHeaderProps {
  candidate: Candidate;
}

const availabilityConfig = {
  AVAILABLE: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-100',
  },
  NOT_AVAILABLE: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-100',
  },
  PASSIVE: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  },
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function CandidateProfileHeader({ candidate }: CandidateProfileHeaderProps) {
  const availability = candidate.candidateInfo?.availabilityStatus ?? 'NOT_AVAILABLE';
  const config = availabilityConfig[availability];

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm md:px-12">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
            <span className="material-symbols-outlined block text-2xl text-white">
              account_circle
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {candidate.firstName} {candidate.lastName}
            </h1>
            {candidate.candidateInfo?.currentPosition && (
              <p className="text-primary text-xs font-bold tracking-wider uppercase">
                {candidate.candidateInfo.currentPosition}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 ${config.badge}`}>
          <span className={`h-2 w-2 animate-pulse rounded-full ${config.dot}`} />
          <span className="text-xs font-bold tracking-wide">
            {availabilityStatusLabels[availability]}
          </span>
        </div>

        <div className="mx-2 h-10 w-px bg-slate-200" />

        <div className="ring-primary/5 size-11 overflow-hidden rounded-xl bg-slate-200 ring-4">
          {candidate.avatarUrl ? (
            <Image
              src={candidate.avatarUrl}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-bold text-white">
              {getInitials(candidate.firstName, candidate.lastName)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
