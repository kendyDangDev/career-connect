'use client';

import { useState } from 'react';
import { Building2, Users, MapPin, Calendar, Globe, Mail, Twitter, Github, Bell } from 'lucide-react';

interface CompanyOverviewItem {
  label: string;
  value: string;
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
    ...(industry ? [{ label: 'Industry', value: industry }] : []),
    ...(companySize ? [{ label: 'Company Size', value: companySize }] : []),
    ...(headquarters ? [{ label: 'Headquarters', value: headquarters }] : []),
    ...(foundedYear ? [{ label: 'Founded', value: foundedYear }] : []),
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
        <h3 className="mb-4 text-sm font-bold text-gray-900">Company Overview</h3>

        <dl className="space-y-3">
          {overviewItems.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-gray-400">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* Social / Follow Links */}
        {(websiteUrl || email || twitterUrl || githubUrl) && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow Us</p>
            <div className="flex flex-wrap gap-2">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Twitter className="h-3.5 w-3.5" /> Twitter
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Alerts */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-600" />
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
            className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
