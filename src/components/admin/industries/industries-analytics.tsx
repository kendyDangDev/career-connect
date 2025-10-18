'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Building2, TrendingUp, TrendingDown, Activity, AlertCircle, Factory } from 'lucide-react';
import { useIndustriesAnalytics } from '@/hooks/use-industries';
import { cn } from '@/lib/utils';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
];

const IndustriesAnalytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useIndustriesAnalytics();

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="text-muted-foreground">Không thể tải dữ liệu phân tích</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for pie chart
  const statusData = [
    { name: 'Hoạt động', value: analytics.activeIndustries, color: '#10B981' },
    { name: 'Ngừng hoạt động', value: analytics.inactiveIndustries, color: '#EF4444' },
  ];

  // Prepare data for usage distribution
  const usageData = [
    {
      name: 'Có công ty',
      value: analytics.totalIndustries - analytics.industriesWithoutCompanies,
      percentage: (
        ((analytics.totalIndustries - analytics.industriesWithoutCompanies) /
          analytics.totalIndustries) *
        100
      ).toFixed(1),
    },
    {
      name: 'Chưa có công ty',
      value: analytics.industriesWithoutCompanies,
      percentage: (
        (analytics.industriesWithoutCompanies / analytics.totalIndustries) *
        100
      ).toFixed(1),
    },
  ];

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
  }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                'flex items-center text-xs',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-gray-600'
              )}
            >
              {trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="mr-1 h-3 w-3" />}
              {trend === 'neutral' && <Activity className="mr-1 h-3 w-3" />}
            </div>
          )}
        </div>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground text-sm">
            Số công ty: <span className="text-foreground font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng ngành nghề"
          value={analytics.totalIndustries}
          description="Tổng số ngành nghề trong hệ thống"
          icon={Factory}
        />
        <StatCard
          title="Đang hoạt động"
          value={analytics.activeIndustries}
          description={`${((analytics.activeIndustries / analytics.totalIndustries) * 100).toFixed(1)}% tổng số`}
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Chưa có công ty"
          value={analytics.industriesWithoutCompanies}
          description="Ngành nghề chưa được sử dụng"
          icon={AlertCircle}
          trend="neutral"
        />
        <StatCard
          title="Trung bình công ty"
          value={(
            analytics.companiesPerIndustry.reduce((sum, item) => sum + item.companies, 0) /
            analytics.totalIndustries
          ).toFixed(1)}
          description="Số công ty trung bình mỗi ngành"
          icon={Building2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái</CardTitle>
            <CardDescription>Tỷ lệ ngành nghề theo trạng thái hoạt động</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${((percent as number) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng sử dụng</CardTitle>
            <CardDescription>Phân bố ngành nghề theo việc có công ty sử dụng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {usageData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Industries Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 ngành nghề phổ biến</CardTitle>
          <CardDescription>Ngành nghề có nhiều công ty sử dụng nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={analytics.topIndustries}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="companies" fill="#0088FE" radius={[8, 8, 0, 0]}>
                {analytics.topIndustries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {analytics.topIndustries.length === 0 && (
            <div className="text-muted-foreground flex h-[400px] items-center justify-center">
              Chưa có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Industry Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết phân bố công ty</CardTitle>
          <CardDescription>Danh sách tất cả ngành nghề và số lượng công ty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {analytics.companiesPerIndustry.map((industry, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{industry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={industry.companies > 0 ? 'default' : 'secondary'}>
                    {industry.companies} công ty
                  </Badge>
                  {industry.companies > 10 && (
                    <Badge variant="outline" className="bg-green-50">
                      Phổ biến
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustriesAnalytics;
