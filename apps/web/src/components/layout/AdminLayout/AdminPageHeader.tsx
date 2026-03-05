import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  gradient = 'from-purple-600 via-blue-600 to-cyan-600',
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-4 shadow-xl md:p-5`}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="text-white">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            {title}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/90 md:text-base">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {/* Animated gradient background */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
