import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  gradient = 'from-purple-500 to-purple-600'
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-soft-lg border border-purple-50 hover:border-purple-200">
      {/* Gradient Background Effect */}
      <div className={cn(
        'absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition-all duration-300 group-hover:scale-110 group-hover:opacity-20',
        gradient
      )} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <span className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          
          {/* Icon */}
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
            gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
