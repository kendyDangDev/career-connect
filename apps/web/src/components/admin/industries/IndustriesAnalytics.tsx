'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  Area,
  AreaChart,
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChartIcon,
  Activity,
  Users,
  Briefcase,
  FileText
} from 'lucide-react'

interface AnalyticsData {
  industryDistribution: Array<{
    name: string
    value: number
    jobs: number
    applications: number
  }>
  monthlyTrends: Array<{
    month: string
    industries: number
    categories: number
    jobs: number
  }>
  topIndustries: Array<{
    name: string
    categories: number
    jobs: number
    applications: number
    growth: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']

export function IndustriesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        industryDistribution: [
          { name: 'Công nghệ thông tin', value: 35, jobs: 1234, applications: 5678 },
          { name: 'Kinh doanh', value: 25, jobs: 890, applications: 3456 },
          { name: 'Marketing', value: 20, jobs: 567, applications: 2345 },
          { name: 'Kế toán', value: 10, jobs: 234, applications: 1234 },
          { name: 'Nhân sự', value: 5, jobs: 123, applications: 567 },
          { name: 'Khác', value: 5, jobs: 100, applications: 400 },
        ],
        monthlyTrends: [
          { month: 'T1', industries: 10, categories: 45, jobs: 234 },
          { month: 'T2', industries: 12, categories: 52, jobs: 267 },
          { month: 'T3', industries: 11, categories: 48, jobs: 289 },
          { month: 'T4', industries: 14, categories: 61, jobs: 312 },
          { month: 'T5', industries: 15, categories: 68, jobs: 345 },
          { month: 'T6', industries: 18, categories: 75, jobs: 378 },
        ],
        topIndustries: [
          { name: 'IT', categories: 25, jobs: 456, applications: 2345, growth: 15.5 },
          { name: 'Sales', categories: 20, jobs: 345, applications: 1890, growth: 12.3 },
          { name: 'Marketing', categories: 18, jobs: 289, applications: 1567, growth: -5.2 },
          { name: 'Accounting', categories: 15, jobs: 234, applications: 1234, growth: 8.7 },
          { name: 'HR', categories: 12, jobs: 189, applications: 890, growth: 3.2 },
        ],
        statusDistribution: [
          { name: 'Hoạt động', value: 85 },
          { name: 'Ngưng', value: 15 },
        ],
      }
      setData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ngành</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.industryDistribution.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngành hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.industryDistribution.length * 0.85)}
            </div>
            <p className="text-xs text-muted-foreground">
              85% tổng số ngành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng việc làm</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.industryDistribution.reduce((sum, item) => sum + item.jobs, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Trên tất cả ngành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ứng tuyển</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.industryDistribution.reduce((sum, item) => sum + item.applications, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Trong 30 ngày qua
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Industry Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Phân bố ngành
            </CardTitle>
            <CardDescription>
              Tỷ lệ phân bố các ngành trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.industryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Xu hướng theo tháng
            </CardTitle>
            <CardDescription>
              Biến động số lượng ngành, danh mục và việc làm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="jobs" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  name="Việc làm"
                />
                <Area 
                  type="monotone" 
                  dataKey="categories" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  name="Danh mục"
                />
                <Area 
                  type="monotone" 
                  dataKey="industries" 
                  stackId="1"
                  stroke="#F97316" 
                  fill="#F97316"
                  name="Ngành"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Industries Bar Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top ngành hoạt động
            </CardTitle>
            <CardDescription>
              Các ngành có nhiều hoạt động nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topIndustries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="categories" fill="#3B82F6" name="Danh mục" />
                <Bar dataKey="jobs" fill="#10B981" name="Việc làm" />
                <Bar dataKey="applications" fill="#F97316" name="Ứng tuyển" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tăng trưởng theo ngành</CardTitle>
            <CardDescription>
              Tỷ lệ tăng trưởng của các ngành trong 30 ngày qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topIndustries.map((industry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{industry.name}</span>
                      <span className={`flex items-center text-sm ${
                        industry.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {industry.growth > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(industry.growth)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{industry.categories} danh mục</span>
                      <span>{industry.jobs} việc làm</span>
                      <span>{industry.applications} ứng tuyển</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
