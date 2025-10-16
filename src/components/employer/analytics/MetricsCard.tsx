import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  description?: string;
  gradient?: string;
}

export function MetricsCard({ title, value, change, icon: Icon, description, gradient = 'from-purple-500 to-purple-600' }: MetricsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-md hover:border-purple-200">
      {/* Background gradient */}
      <div className={cn(
        'absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:scale-110 group-hover:opacity-20',
        gradient
      )} />

      <div className="relative">
        {/* Icon */}
        <div className={cn(
          'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-all duration-300 group-hover:scale-110',
          gradient
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

        {/* Value & Change */}
        <div className="flex items-baseline gap-3 mb-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold',
              change.isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}>
              {change.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {change.value}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
