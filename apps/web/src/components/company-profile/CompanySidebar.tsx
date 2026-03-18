'use client';

import { useState } from 'react';
import {
  AtSign,
  Bell,
  Building,
  Building2,
  CalendarDays,
  Globe,
  Link2,
  Mail,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CompanyOverviewItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface CompanySidebarProps {
  industry?: string;
  companySize?: string;
  headquarters?: string;
  foundedYear?: string;
  websiteUrl?: string;
  email?: string;
  twitterUrl?: string;
  githubUrl?: string;
  onSubscribeJobAlert?: (email: string) => void;
}

export function CompanySidebar({
  industry,
  companySize,
  headquarters,
  foundedYear,
  websiteUrl,
  email,
  twitterUrl,
  githubUrl,
  onSubscribeJobAlert,
}: CompanySidebarProps) {
  const [alertEmail, setAlertEmail] = useState('');

  const overviewItems: CompanyOverviewItem[] = [
    ...(industry ? [{ label: 'Industry', value: industry, icon: Building2 }] : []),
    ...(companySize ? [{ label: 'Company Size', value: companySize, icon: UsersRound }] : []),
    ...(headquarters ? [{ label: 'Headquarters', value: headquarters, icon: Building }] : []),
    ...(foundedYear ? [{ label: 'Founded', value: foundedYear, icon: CalendarDays }] : []),
  ];

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail.trim()) {
      onSubscribeJobAlert?.(alertEmail.trim());
      setAlertEmail('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Company Overview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-5 text-[1.55rem] font-extrabold tracking-tight text-slate-900">
          Company Overview
        </h3>

        <dl className="space-y-4">
          {overviewItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-purple-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold tracking-[0.11em] text-slate-400 uppercase">
                  {item.label}
                </dt>
                <dd className="mt-0.5 text-sm leading-tight font-bold text-slate-800">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {/* Social / Follow Links */}
        {(websiteUrl || email || twitterUrl || githubUrl) && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="mb-3 text-[0.78rem] font-bold tracking-[0.11em] text-slate-400 uppercase">
              Follow Us
            </p>
            <div className="flex flex-wrap gap-3">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label="Email"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <AtSign className="h-5 w-5" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Link2 className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Alerts */}
      <div className="rounded-2xl border border-purple-200 bg-purple-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">Job Alerts</h3>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-gray-600">
          Subscribe to get notified whenever this company posts new roles.
        </p>
        <form onSubmit={handleAlertSubmit} className="space-y-2">
          <input
            type="email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="focus:purple-indigo-400 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition-all outline-none focus:ring-2 focus:ring-purple-200"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-purple-600 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md active:scale-95"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
