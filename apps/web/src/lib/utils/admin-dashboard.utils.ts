/**
 * Admin Dashboard Utility Functions
 * Helper functions để tính toán metrics và format data cho admin dashboard
 */

import { subDays, subMonths, format, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { TimeRange } from '@/types/admin/dashboard.types';

/**
 * Get date range từ TimeRange parameter
 */
export function getDateRangeFromTimeRange(timeRange: TimeRange, customFrom?: string, customTo?: string): { from: Date; to: Date } {
  const now = new Date();
  
  switch (timeRange) {
    case '7days':
      return {
        from: startOfDay(subDays(now, 7)),
        to: endOfDay(now),
      };
    case '30days':
      return {
        from: startOfDay(subDays(now, 30)),
        to: endOfDay(now),
      };
    case '90days':
      return {
        from: startOfDay(subDays(now, 90)),
        to: endOfDay(now),
      };
    case '6months':
      return {
        from: startOfDay(subMonths(now, 6)),
        to: endOfDay(now),
      };
    case 'year':
      return {
        from: startOfDay(subMonths(now, 12)),
        to: endOfDay(now),
      };
    case 'custom':
      if (!customFrom || !customTo) {
        throw new Error('Custom range requires dateFrom and dateTo parameters');
      }
      return {
        from: startOfDay(new Date(customFrom)),
        to: endOfDay(new Date(customTo)),
      };
    case 'all':
      return {
        from: new Date(0), // Beginning of time
        to: endOfDay(now),
      };
    default:
      return {
        from: startOfDay(subDays(now, 30)),
        to: endOfDay(now),
      };
  }
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousPeriodRange(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - duration);
  
  return {
    from: startOfDay(prevFrom),
    to: endOfDay(prevTo),
  };
}

/**
 * Generate daily intervals for time series
 */
export function generateDailyIntervals(from: Date, to: Date): Date[] {
  return eachDayOfInterval({ start: from, end: to });
}

/**
 * Generate weekly intervals for time series
 */
export function generateWeeklyIntervals(from: Date, to: Date): Array<{ start: Date; end: Date }> {
  const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 }); // Monday
  
  return weeks.map(weekStart => ({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  }));
}

/**
 * Generate monthly intervals for time series
 */
export function generateMonthlyIntervals(from: Date, to: Date): Array<{ start: Date; end: Date; label: string }> {
  const months = eachMonthOfInterval({ start: from, end: to });
  
  return months.map(monthDate => ({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
    label: format(monthDate, 'MMM yyyy', { locale: vi }),
  }));
}

/**
 * Calculate growth rate và format output
 */
export function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return {
      current,
      previous,
      growthRate: current > 0 ? 100 : 0,
      growthCount: current,
      isPositive: current > 0,
    };
  }
  
  const growthCount = current - previous;
  const growthRate = (growthCount / previous) * 100;
  
  return {
    current,
    previous,
    growthRate: parseFloat(growthRate.toFixed(1)),
    growthCount,
    isPositive: growthRate >= 0,
  };
}

/**
 * Group salary vào ranges
 */
export function groupSalariesIntoRanges(salaries: number[]): Array<{
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}> {
  const ranges = [
    { min: 0, max: 10000000, label: '< 10M' },
    { min: 10000000, max: 20000000, label: '10-20M' },
    { min: 20000000, max: 30000000, label: '20-30M' },
    { min: 30000000, max: 50000000, label: '30-50M' },
    { min: 50000000, max: 100000000, label: '50-100M' },
    { min: 100000000, max: Infinity, label: '> 100M' },
  ];
  
  const total = salaries.length;
  
  return ranges.map(range => {
    const count = salaries.filter(s => s >= range.min && s < range.max).length;
    
    return {
      range: range.label,
      min: range.min,
      max: range.max === Infinity ? 999999999 : range.max,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    };
  }).filter(r => r.count > 0);
}

/**
 * Calculate median từ array of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate time difference in hours
 */
export function calculateHoursDifference(from: Date, to: Date): number {
  return Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate time difference in days
 */
export function calculateDaysDifference(from: Date, to: Date): number {
  return Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Get appropriate grouping based on date range
 */
export function getRecommendedGrouping(from: Date, to: Date): 'day' | 'week' | 'month' {
  const days = calculateDaysDifference(from, to);
  
  if (days <= 31) return 'day';
  if (days <= 90) return 'week';
  return 'month';
}

/**
 * Normalize data to 0-100 scale for charting
 */
export function normalizeToScale(values: number[]): number[] {
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  if (max === min) return values.map(() => 50); // All same value
  
  return values.map(v => ((v - min) / (max - min)) * 100);
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(converted: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((converted / total) * 100).toFixed(2));
}

/**
 * Get trend indicator text
 */
export function getTrendText(growthRate: number): string {
  if (growthRate > 10) return 'Tăng mạnh';
  if (growthRate > 0) return 'Tăng nhẹ';
  if (growthRate === 0) return 'Không đổi';
  if (growthRate > -10) return 'Giảm nhẹ';
  return 'Giảm mạnh';
}

/**
 * Calculate average từ array
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Map<any, T[]> {
  return array.reduce((map, item) => {
    const keyValue = item[key];
    const group = map.get(keyValue) || [];
    group.push(item);
    map.set(keyValue, group);
    return map;
  }, new Map<any, T[]>());
}

/**
 * Calculate percentage distribution
 */
export function calculateDistribution<T>(
  items: T[],
  getValue: (item: T) => any
): Array<{ value: any; count: number; percentage: number }> {
  const total = items.length;
  const grouped = groupBy(items, getValue as any);
  
  return Array.from(grouped.entries()).map(([value, items]) => ({
    value,
    count: items.length,
    percentage: total > 0 ? parseFloat(((items.length / total) * 100).toFixed(1)) : 0,
  }));
}

/**
 * Safe divide to avoid division by zero
 */
export function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  return denominator === 0 ? defaultValue : numerator / denominator;
}

/**
 * Round to decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}
