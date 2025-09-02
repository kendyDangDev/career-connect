'use client';

import React from 'react';
import { Skill, SkillCategory } from '@/types/system-categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  FolderOpen,
  Brain,
  Languages,
  Wrench,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

interface SkillsAnalyticsProps {
  skills: Skill[];
  categoryStats: Record<string, number>;
}

const skillCategoryIcons: Record<SkillCategory, React.ReactElement> = {
  TECHNICAL: <FolderOpen className="h-4 w-4" />,
  SOFT: <Brain className="h-4 w-4" />,
  LANGUAGE: <Languages className="h-4 w-4" />,
  TOOL: <Wrench className="h-4 w-4" />
};

const skillCategoryLabels: Record<SkillCategory, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT: 'Kỹ năng mềm',
  LANGUAGE: 'Ngôn ngữ',
  TOOL: 'Công cụ'
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  className?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className, trend }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                <TrendingUp 
                  className={`h-4 w-4 mr-1 ${
                    trend >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500 transform rotate-180'
                  }`}
                />
                <span className={`text-sm ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(trend)}% so với tháng trước
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-primary' })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SkillsAnalytics: React.FC<SkillsAnalyticsProps> = ({ skills, categoryStats }) => {
  // Tính toán thống kê
  const totalSkills = skills.length;
  const activeSkills = skills.filter(s => s.isActive).length;
  const inactiveSkills = totalSkills - activeSkills;
  const totalUsage = skills.reduce((sum, skill) => 
    sum + (skill._count?.candidateSkills || 0) + (skill._count?.jobSkills || 0), 0
  );

  // Dữ liệu cho biểu đồ tròn phân loại
  const categoryData = Object.entries(categoryStats).map(([category, count]) => ({
    name: skillCategoryLabels[category as SkillCategory],
    value: count,
    category: category as SkillCategory
  }));

  // Dữ liệu cho biểu đồ trạng thái
  const statusData = [
    { name: 'Hoạt động', value: activeSkills, color: '#22c55e' },
    { name: 'Không hoạt động', value: inactiveSkills, color: '#9ca3af' }
  ];

  // Top 10 kỹ năng được sử dụng nhiều nhất
  const topSkills = [...skills]
    .sort((a, b) => {
      const usageA = (a._count?.candidateSkills || 0) + (a._count?.jobSkills || 0);
      const usageB = (b._count?.candidateSkills || 0) + (b._count?.jobSkills || 0);
      return usageB - usageA;
    })
    .slice(0, 10)
    .map(skill => ({
      name: skill.name,
      candidates: skill._count?.candidateSkills || 0,
      jobs: skill._count?.jobSkills || 0,
      total: (skill._count?.candidateSkills || 0) + (skill._count?.jobSkills || 0)
    }));

  // Dữ liệu phân bố sử dụng theo loại
  const usageByCategory = Object.keys(SkillCategory).map(category => {
    const categorySkills = skills.filter(s => s.category === category);
    const candidateUsage = categorySkills.reduce((sum, s) => sum + (s._count?.candidateSkills || 0), 0);
    const jobUsage = categorySkills.reduce((sum, s) => sum + (s._count?.jobSkills || 0), 0);
    
    return {
      category: skillCategoryLabels[category as SkillCategory],
      candidates: candidateUsage,
      jobs: jobUsage
    };
  });

  const COLORS = {
    TECHNICAL: '#3b82f6',
    SOFT: '#8b5cf6',
    LANGUAGE: '#10b981',
    TOOL: '#f59e0b'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium mb-1">{label}</p>
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
    <div className="w-full space-y-6">
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số kỹ năng"
          value={totalSkills}
          icon={<BarChart3 />}
        />
        <StatCard
          title="Đang hoạt động"
          value={activeSkills}
          icon={<CheckCircle />}
        />
        <StatCard
          title="Tổng lượt sử dụng"
          value={totalUsage}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Tỷ lệ hoạt động (%)"
          value={totalSkills > 0 ? Math.round((activeSkills / totalSkills) * 100) : 0}
          icon={<Users />}
        />
      </div>

      {/* Biểu đồ phân loại và trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo loại kỹ năng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái kỹ năng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top kỹ năng được sử dụng nhiều nhất */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 kỹ năng được sử dụng nhiều nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topSkills}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="candidates" stackId="a" fill="#3b82f6" name="Ứng viên" />
              <Bar dataKey="jobs" stackId="a" fill="#8b5cf6" name="Việc làm" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Phân bố sử dụng theo loại */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố sử dụng theo loại kỹ năng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={usageByCategory}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="candidates" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                name="Ứng viên"
              />
              <Area 
                type="monotone" 
                dataKey="jobs" 
                stackId="1" 
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                name="Việc làm"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
