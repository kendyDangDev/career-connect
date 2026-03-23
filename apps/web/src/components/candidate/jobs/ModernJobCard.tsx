'use client';

import { MapPin, TrendingUp, Clock, Users, Eye, Calendar, Zap, ShieldCheck } from 'lucide-react';
import { JobCardData } from '../home/JobCard';
import Link from 'next/link';

type ModernJobCardJob = JobCardData & {
  skills?: string[];
  jobSkills?: Array<{
    skill?: {
      id?: string;
      name?: string | null;
    } | null;
  }>;
};

interface ModernJobCardProps {
  job: ModernJobCardJob;
  isUrgent?: boolean;
}

function getVisibleRequiredSkills(job: ModernJobCardJob) {
  const seenSkills = new Set<string>();
  const normalizedSkills = [
    ...(job.skills ?? []),
    ...(job.jobSkills?.map((jobSkill) => jobSkill.skill?.name ?? '') ?? []),
  ]
    .map((skill) => skill.trim())
    .filter(Boolean)
    .filter((skill) => !/^\+\d+$/.test(skill))
    .filter((skill) => {
      const normalizedSkill = skill.toLowerCase();
      if (seenSkills.has(normalizedSkill)) return false;
      seenSkills.add(normalizedSkill);
      return true;
    });

  return {
    visibleSkills: normalizedSkills.slice(0, 3),
    remainingCount: Math.max(normalizedSkills.length - 3, 0),
  };
}

export default function ModernJobCard({ job, isUrgent = false }: ModernJobCardProps) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} Triệu`;
    if (min) return `${(min / 1000000).toFixed(0)} Triệu`;
    if (max) return `${(max / 1000000).toFixed(0)} Triệu`;
    return 'Thỏa thuận';
  };

  const getExperienceLabel = (level?: string | null) => {
    if (!level) return 'All Levels';
    const labels: Record<string, string> = {
      ENTRY_LEVEL: 'Entry Level',
      MID_LEVEL: 'Mid-Level',
      SENIOR: 'Senior Level',
      EXPERT: 'Expert',
    };
    return labels[level] || level;
  };

  const getJobTypeLabel = (type?: string | null) => {
    if (!type) return 'Full-time';
    const labels: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      REMOTE: 'Remote',
      INTERNSHIP: 'Internship',
    };
    return labels[type] || type;
  };

  const formatDeadline = (date?: string | Date | null) => {
    if (!date) return null;
    const deadline = new Date(date);
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isDeadlineSoon = (date?: string | Date | null) => {
    if (!date) return false;
    const deadline = new Date(date);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const location = job.locationProvince ? job.locationProvince : 'Remote';

  const isVerified = job.company?.verificationStatus === 'VERIFIED';
  const companyName = job.company?.companyName || 'Unknown Company';
  const companyLogo = job.company?.logoUrl;
  const companySlug = job.company?.companySlug;
  const { visibleSkills, remainingCount } = getVisibleRequiredSkills(job);

  // Use applicationDeadline if available, fallback to expiresAt
  const deadline = job.applicationDeadline || job.expiresAt;
  const viewsCount = job.viewCount || 0;
  const applicationsCount = job.applicationCount || 0;

  // Format view count (show as 1.2k format if > 1000)
  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="group rounded-2xl border border-purple-100 bg-white shadow-sm transition-all duration-300 hover:border-purple-600/50 hover:shadow-xl hover:shadow-purple-600/5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-center p-6 md:flex-row">
        {/* Company Logo */}
        <div className="relative mb-4 flex-shrink-0 text-center md:mr-8 md:mb-0 md:text-left">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-purple-100 bg-purple-50 dark:border-slate-700 dark:bg-slate-800">
            {companyLogo ? (
              <img alt={companyName} className="h-12 w-12 object-contain" src={companyLogo} />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-xl font-black text-white">
                {companyName?.charAt(0) || 'C'}
              </div>
            )}
          </div>
          {isUrgent && (
            <span className="absolute -top-2 -right-2 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black tracking-tighter text-white uppercase shadow-lg">
              Urgent
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
            <Link href={`/candidate/jobs/${job.id}`}>
              <h3 className="cursor-pointer text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white">
                {job.title}
              </h3>
            </Link>
            {isVerified && (
              <div className="flex items-center justify-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-purple-600 uppercase md:justify-start dark:bg-purple-900/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </div>
            )}
          </div>
          <Link href={`/candidate/companies/${companySlug}`}>
            <p className="mb-3 cursor-pointer font-bold text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-300">
              {companyName}
            </p>
          </Link>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 md:justify-start dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-[18px] w-[18px] text-slate-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-[18px] w-[18px] text-slate-400" />
              <span>{getExperienceLabel(job.experienceLevel)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-[18px] w-[18px] text-slate-400" />
              <span>{getJobTypeLabel(job.jobType)}</span>
            </div>
          </div>
          {visibleSkills.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              {visibleSkills.map((skill) => (
                <span
                  key={`${job.id}-${skill}`}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-[0.7rem] leading-none font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="rounded-md bg-fuchsia-50 px-2.5 py-1 text-[0.7rem] leading-none font-semibold text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-300">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Salary & Apply */}
        <div className="mt-6 flex flex-col items-center justify-between self-stretch text-center md:mt-0 md:ml-8 md:items-end md:text-right">
          <div className="mb-4">
            <span className="block text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            {job.salaryMin && job.salaryMax && (
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {`${Math.round(job.salaryMin / 2600000) * 100} - ${Math.round(job.salaryMax / 2600000) * 100} USD / Month`}
              </span>
            )}
          </div>
          <Link href={`/candidate/jobs/${job.id}`}>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3 font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 md:w-auto">
              Quick Apply
              <Zap className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-b-2xl border-t border-purple-50 bg-slate-50/50 px-6 py-3 md:justify-between dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Users className="h-[18px] w-[18px] text-slate-400" />
            {applicationsCount} Applications
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Eye className="h-[18px] w-[18px] text-slate-400" />
            {formatViewCount(viewsCount)} Views
          </div>
        </div>
        {deadline && (
          <div
            className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase ${
              isDeadlineSoon(deadline) ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            <Calendar className="h-[18px] w-[18px]" />
            Deadline: {formatDeadline(deadline)}
          </div>
        )}
      </div>
    </div>
  );
}
