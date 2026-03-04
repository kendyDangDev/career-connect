'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Mail } from 'lucide-react';

interface JobAlertCardProps {
  jobTitle?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
}

export default function JobAlertCard({
  jobTitle,
  locationCity,
  locationProvince,
}: JobAlertCardProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white shadow-lg shadow-purple-500/30">
      {/* Icon */}

      <div>
        <h4 className="mb-2 text-lg font-bold">Never miss an update</h4>
        <p className="mb-5 text-sm leading-relaxed text-white/80">
          Subscribe to get notified whenever TechFlow Solutions posts new job opportunities.
        </p>
      </div>

      {/* Email input */}
      <div className="relative mb-3">
        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pr-3 pl-9 text-sm text-white placeholder-white/40 backdrop-blur-sm transition outline-none focus:border-white/50 focus:bg-white/20 disabled:opacity-50"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-purple-700 shadow-sm transition-all hover:scale-[1.02] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        Alert me
      </button>
    </div>
  );
}
