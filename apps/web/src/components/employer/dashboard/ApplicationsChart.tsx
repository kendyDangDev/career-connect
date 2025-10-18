'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { ApplicationsChartSummary } from '@/types/employer/dashboard.types';

interface ApplicationsChartProps {
  data: ApplicationsChartSummary | null;
  isLoading?: boolean;
}

export function ApplicationsChart({ data, isLoading }: ApplicationsChartProps) {
  if (isLoading || !data) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="space-y-3 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const chartData = data.monthlyData;
  const maxValue = Math.max(...chartData.map(d => d.applications));
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Thống kê ứng tuyển</h2>
          <p className="text-sm text-gray-500 mt-1">6 tháng gần đây</p>
        </div>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
          data.trend.isPositive ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {data.trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${
            data.trend.isPositive ? 'text-green-700' : 'text-red-700'
          }`}>{data.trend.value}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
          <span className="text-sm text-gray-600">Ứng tuyển</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600" />
          <span className="text-sm text-gray-600">Phỏng vấn</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((data) => {
          const appHeight = (data.applications / maxValue) * 100;
          const intHeight = (data.interviews / maxValue) * 100;
          
          return (
            <div key={data.month} className="flex items-end gap-3">
              <div className="w-12 text-sm font-medium text-gray-600">
                {data.month}
              </div>
              
              <div className="flex-1 flex items-end gap-2">
                {/* Applications Bar */}
                <div className="group relative flex-1">
                  <div className="overflow-hidden rounded-t-lg bg-gray-100">
                    <div
                      className="bg-gradient-to-t from-purple-500 to-purple-600 transition-all duration-500 hover:from-purple-600 hover:to-purple-700"
                      style={{ height: `${appHeight}%`, minHeight: '24px' }}
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="rounded-lg bg-gray-900 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                      {data.applications}
                    </div>
                  </div>
                </div>
                
                {/* Interviews Bar */}
                <div className="group relative flex-1">
                  <div className="overflow-hidden rounded-t-lg bg-gray-100">
                    <div
                      className="bg-gradient-to-t from-pink-500 to-rose-600 transition-all duration-500 hover:from-pink-600 hover:to-rose-700"
                      style={{ height: `${intHeight}%`, minHeight: '24px' }}
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="rounded-lg bg-gray-900 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                      {data.interviews}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 text-right text-sm font-medium text-gray-900">
                {data.applications}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{data.totalApplications}</p>
          <p className="text-xs text-gray-500 mt-1">Tổng ứng tuyển</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{data.totalInterviews}</p>
          <p className="text-xs text-gray-500 mt-1">Phỏng vấn</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{data.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Tỷ lệ chuyển đổi</p>
        </div>
      </div>
    </div>
  );
}
