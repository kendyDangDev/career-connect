import Image from 'next/image';
import {
  Globe,
  Briefcase,
  Heart,
  Bell,
  Loader2,
  Users,
  BadgeCheck,
  Building2,
  Navigation,
} from 'lucide-react';

export interface CompanyHeroProps {
  name: string;
  logoUrl?: string;
  coverImageUrl?: string;
  location?: string;
  websiteUrl?: string;
  industry?: string;
  activeJobsCount: number;
  employeesCount: string;
  followersCount: string;
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollow?: () => void;
  onAlert?: () => void;
}

export function CompanyHero({
  name,
  logoUrl,
  coverImageUrl,
  location,
  websiteUrl,
  industry,
  activeJobsCount,
  employeesCount,
  followersCount,
  isFollowing = false,
  followLoading = false,
  onFollow,
  onAlert,
}: CompanyHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
      {/* Cover Banner */}
      <div className="relative h-52 w-full bg-gradient-to-br from-purple-700 via-purple-600 to-fuchsia-600">
        {coverImageUrl && (
          <Image src={coverImageUrl} alt={`${name} cover`} fill className="object-cover" priority />
        )}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Company Info */}
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Logo + Name */}
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-fuchsia-600">
                  <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <span>{name}</span>
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 ring-1 ring-purple-200"
                  title="Verified company"
                  aria-label={`${name} is verified`}
                >
                  <BadgeCheck className="h-4 w-4" />
                </span>
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                {industry && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 sm:text-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    {industry}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 sm:text-sm">
                    <Navigation className="h-3.5 w-3.5 text-purple-600" />
                    {location}
                  </span>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-purple-600 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={onAlert}
              className="flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-800"
            >
              <Bell className="h-4 w-4" />
              Job Alerts
            </button>
            <button
              onClick={onFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                isFollowing
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-300'
              }`}
            >
              {followLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
              )}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-5 flex flex-wrap gap-6 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-purple-700">{activeJobsCount}</span>
              <span className="mt-0.5 text-xs font-bold text-gray-500">Active Jobs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Users className="h-4 w-4" />
            </span>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-purple-800">{employeesCount}</span>
              <span className="mt-0.5 text-xs font-bold text-gray-500">Employees</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Heart className="h-4 w-4" />
            </span>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-purple-800">{followersCount}</span>
              <span className="mt-0.5 text-xs font-bold text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
