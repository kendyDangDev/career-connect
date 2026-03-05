import Image from 'next/image';
import { MapPin, Globe, Briefcase, Heart, Bell } from 'lucide-react';

export interface CompanyHeroProps {
  name: string;
  tagline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  location?: string;
  websiteUrl?: string;
  industry?: string;
  activeJobsCount: number;
  employeesCount: string;
  followersCount: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  onAlert?: () => void;
}

export function CompanyHero({
  name,
  tagline,
  logoUrl,
  coverImageUrl,
  location,
  websiteUrl,
  industry,
  activeJobsCount,
  employeesCount,
  followersCount,
  isFollowing = false,
  onFollow,
  onAlert,
}: CompanyHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Cover Banner */}
      <div className="relative h-52 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        {coverImageUrl && (
          <Image
            src={coverImageUrl}
            alt={`${name} cover`}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Company Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Logo + Name */}
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
              {logoUrl ? (
                <Image src={logoUrl} alt={`${name} logo`} width={80} height={80} className="object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              {tagline && <p className="mt-0.5 text-sm text-gray-500">{tagline}</p>}
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {industry}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={onAlert}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Bell className="h-4 w-4" />
              Job Alerts
            </button>
            <button
              onClick={onFollow}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-5 flex flex-wrap gap-6 border-t border-gray-100 pt-5">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-700">{activeJobsCount}</span>
            <span className="mt-0.5 text-xs text-gray-500">Active Jobs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{employeesCount}</span>
            <span className="mt-0.5 text-xs text-gray-500">Employees</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{followersCount}</span>
            <span className="mt-0.5 text-xs text-gray-500">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
