'use client';

import Image from 'next/image';

interface Company {
  id: string;
  companyName: string;
  companySlug?: string | null;
  logoUrl?: string | null;
  verificationStatus?: string | null;
  websiteUrl?: string | null;
  city?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  province?: string | null;
}

interface CompanyProfileCardProps {
  company: Company;
}

const companySizeLabels: Record<string, string> = {
  STARTUP_1_10: '1 - 10 Employees',
  SMALL_11_50: '10 - 50 Employees',
  MEDIUM_51_200: '50 - 200 Employees',
  LARGE_201_500: '200 - 500 Employees',
  ENTERPRISE_501_PLUS: '500+ Employees',
};

export default function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  const isVerified = company.verificationStatus === 'VERIFIED';

  return (
    <div className="shadow-sophisticated rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Company Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="border-primary/20 bg-primary/10 text-primary flex size-16 items-center justify-center rounded-xl border">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.companyName}
              width={64}
              height={64}
              className="rounded-xl object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-3xl">business</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold">{company.companyName}</h3>
            {isVerified && (
              <span className="material-symbols-outlined fill-1 text-primary text-lg">
                verified
              </span>
            )}
          </div>
          {company.industry && <p className="text-sm text-slate-500">{company.industry}</p>}
        </div>
      </div>

      {/* Company Details */}
      <div className="mb-6 space-y-4">
        {company.websiteUrl && (
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-primary text-lg">public</span>
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              {company.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          </div>
        )}

        {(company.city || company.province) && (
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-primary text-lg">location_city</span>
            <span>
              {company.city && company.province
                ? `${company.city}, ${company.province}`
                : company.city || company.province}
            </span>
          </div>
        )}

        {company.companySize && (
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-primary text-lg">groups</span>
            <span>{companySizeLabels[company.companySize] || company.companySize}</span>
          </div>
        )}
      </div>

      {/* Company Description */}
      {company.description && (
        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {company.description.length > 150
            ? `${company.description.substring(0, 150)}...`
            : company.description}
        </p>
      )}

      {/* View Profile Button */}
      <button className="hover:bg-primary-light hover:text-primary w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
        View Full Profile
      </button>
    </div>
  );
}
