'use client';

import React, { useMemo } from 'react';
import { Category } from '@/types/system-categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Folder,
  Briefcase,
  Activity,
  BarChart3,
  PieChartIcon,
  TreePine,
  Calendar,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CategoriesAnalyticsProps {
  categories: Category[];
  categoryTree?: Category[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export function CategoriesAnalytics({ categories, categoryTree = [] }: CategoriesAnalyticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const inactiveCategories = totalCategories - activeCategories;
    const rootCategories = categories.filter(c => !c.parentId).length;
    const childCategories = totalCategories - rootCategories;
    const totalJobs = categories.reduce((sum, c) => sum + (c._count?.jobCategories || 0), 0);
    const categoriesWithJobs = categories.filter(c => (c._count?.jobCategories || 0) > 0).length;
    const avgJobsPerCategory = totalCategories > 0 ? (totalJobs / totalCategories).toFixed(1) : '0';

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      rootCategories,
      childCategories,
      totalJobs,
      categoriesWithJobs,
      avgJobsPerCategory,
    };
  }, [categories]);

  // Prepare data for status pie chart
  const statusData = [
    { name: 'Hoạt động', value: stats.activeCategories, percentage: ((stats.activeCategories / stats.totalCategories) * 100).toFixed(1) },
    { name: 'Không hoạt động', value: stats.inactiveCategories, percentage: ((stats.inactiveCategories / stats.totalCategories) * 100).toFixed(1) },
  ];

  // Prepare data for hierarchy pie chart
  const hierarchyData = [
    { name: 'Danh mục gốc', value: stats.rootCategories, percentage: ((stats.rootCategories / stats.totalCategories) * 100).toFixed(1) },
    { name: 'Danh mục con', value: stats.childCategories, percentage: ((stats.childCategories / stats.totalCategories) * 100).toFixed(1) },
  ];

  // Top categories by job count
  const topCategoriesByJobs = useMemo(() => {
    return [...categories]
      .sort((a, b) => (b._count?.jobCategories || 0) - (a._count?.jobCategories || 0))
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        jobs: c._count?.jobCategories || 0,
        children: c._count?.children || 0,
      }));
  }, [categories]);

  // Category depth analysis
  const depthAnalysis = useMemo(() => {
    const depthCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    
    const calculateDepth = (cat: Category, depth = 0): void => {
      if (depth <= 3) {
        depthCount[depth]++;
      }
      if (cat.children) {
        cat.children.forEach(child => calculateDepth(child, depth + 1));
      }
    };

    categoryTree.forEach(cat => calculateDepth(cat));

    return Object.entries(depthCount).map(([depth, count]) => ({
      depth: `Cấp ${depth}`,
      count,
    }));
  }, [categoryTree]);

  // Treemap data for category distribution
  const treemapData = useMemo(() => {
    const data: any[] = [];
    
    const processCategory = (cat: Category, parentName = '') => {
      const size = (cat._count?.jobCategories || 0) + (cat._count?.children || 0) * 10;
      if (size > 0) {
        data.push({
          name: cat.name,
          size,
          jobs: cat._count?.jobCategories || 0,
          children: cat._count?.children || 0,
          parent: parentName,
        });
      }
      if (cat.children) {
        cat.children.forEach(child => processCategory(child, cat.name));
      }
    };

    categoryTree.forEach(cat => processCategory(cat));
    return data;
  }, [categoryTree]);

  // Monthly trend data (simulated for demo)
  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return months.map(month => ({
      month: format(month, 'MMM yyyy', { locale: vi }),
      categories: Math.floor(Math.random() * 20) + stats.totalCategories - 10,
      jobs: Math.floor(Math.random() * 100) + stats.totalJobs - 50,
    }));
  }, [stats]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCategories} hoạt động
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng việc làm</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {stats.avgJobsPerCategory}/danh mục
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục gốc</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rootCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.childCategories} danh mục con
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục có việc làm</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesWithJobs}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.categoriesWithJobs / stats.totalCategories) * 100).toFixed(1)}% tổng số
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="distribution">Phân bố</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
          <TabsTrigger value="hierarchy">Cấu trúc</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái</CardTitle>
                <CardDescription>Tỷ lệ danh mục hoạt động và không hoạt động</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hierarchy Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân cấp danh mục</CardTitle>
                <CardDescription>Tỷ lệ danh mục gốc và danh mục con</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={hierarchyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {hierarchyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 danh mục theo số lượng việc làm</CardTitle>
              <CardDescription>Các danh mục có nhiều việc làm nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCategoriesByJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="jobs" fill="#8884d8" name="Việc làm" />
                  <Bar dataKey="children" fill="#82ca9d" name="Danh mục con" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {/* Treemap */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố danh mục theo kích thước</CardTitle>
              <CardDescription>Kích thước dựa trên số lượng việc làm và danh mục con</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                >
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Việc làm: {data.jobs}</p>
                            <p className="text-sm">Danh mục con: {data.children}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng theo tháng</CardTitle>
              <CardDescription>Biến động số lượng danh mục và việc làm 6 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="categories"
                    stroke="#8884d8"
                    name="Danh mục"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="jobs"
                    stroke="#82ca9d"
                    name="Việc làm"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          {/* Depth Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Phân tích độ sâu cây danh mục</CardTitle>
              <CardDescription>Số lượng danh mục theo từng cấp độ</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={depthAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="depth" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8884d8" name="Số lượng">
                    {depthAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
