'use client';

import React, { useMemo } from 'react';
import { Location, LocationType } from '@/types/system-categories';
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
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  TrendingUp,
  MapPin,
  Globe,
  Map as MapIcon,
  Building,
  Home,
  Activity,
  BarChart3,
  PieChartIcon,
  Navigation,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LocationsAnalyticsProps {
  locations: Location[];
  locationTree?: Location[];
  typeStats: Record<string, number>;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
];

const locationTypeLabels: Record<LocationType, string> = {
  [LocationType.COUNTRY]: 'Quốc gia',
  [LocationType.PROVINCE]: 'Tỉnh/Thành phố',
  [LocationType.CITY]: 'Quận/Huyện',
  [LocationType.DISTRICT]: 'Phường/Xã',
};

export function LocationsAnalytics({
  locations,
  locationTree = [],
  typeStats,
}: LocationsAnalyticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalLocations = locations.length;
    const activeLocations = locations.filter((l) => l.isActive).length;
    const inactiveLocations = totalLocations - activeLocations;
    const locationsWithCoordinates = locations.filter((l) => l.latitude && l.longitude).length;
    const coordinatesCoverage =
      totalLocations > 0 ? ((locationsWithCoordinates / totalLocations) * 100).toFixed(1) : '0';

    // Calculate by type
    const byType = Object.entries(LocationType).reduce(
      (acc, [key, value]) => {
        acc[value] = locations.filter((l) => l.type === value).length;
        return acc;
      },
      {} as Record<LocationType, number>
    );

    return {
      totalLocations,
      activeLocations,
      inactiveLocations,
      locationsWithCoordinates,
      coordinatesCoverage,
      byType,
    };
  }, [locations]);

  // Prepare data for status pie chart
  const statusData = [
    {
      name: 'Hoạt động',
      value: stats.activeLocations,
      percentage: ((stats.activeLocations / stats.totalLocations) * 100).toFixed(1),
    },
    {
      name: 'Không hoạt động',
      value: stats.inactiveLocations,
      percentage: ((stats.inactiveLocations / stats.totalLocations) * 100).toFixed(1),
    },
  ];

  // Prepare data for type distribution
  const typeDistributionData = Object.entries(stats.byType).map(([type, count]) => ({
    name: locationTypeLabels[type as LocationType],
    value: count,
    percentage: ((count / stats.totalLocations) * 100).toFixed(1),
  }));

  // Prepare data for coordinates coverage
  const coordinatesData = [
    { name: 'Có tọa độ', value: stats.locationsWithCoordinates },
    { name: 'Không có tọa độ', value: stats.totalLocations - stats.locationsWithCoordinates },
  ];

  // Top provinces by child count
  const topProvincesByChildren = useMemo(() => {
    return locations
      .filter((l) => l.type === LocationType.PROVINCE)
      .sort((a, b) => (b._count?.children || 0) - (a._count?.children || 0))
      .slice(0, 10)
      .map((l) => ({
        name: l.name,
        children: l._count?.children || 0,
      }));
  }, [locations]);

  // Location hierarchy depth analysis
  const depthAnalysis = useMemo(() => {
    const depthCount: Record<string, number> = {
      [LocationType.COUNTRY]: 0,
      [LocationType.PROVINCE]: 0,
      [LocationType.CITY]: 0,
      [LocationType.DISTRICT]: 0,
    };

    locations.forEach((loc) => {
      depthCount[loc.type]++;
    });

    return Object.entries(depthCount).map(([type, count]) => ({
      type: locationTypeLabels[type as LocationType],
      count,
      fullMark: Math.max(...Object.values(depthCount)),
    }));
  }, [locations]);

  // Treemap data for location distribution
  const treemapData = useMemo(() => {
    const data: any[] = [];

    const processLocation = (loc: Location, parentName = '') => {
      const size = 1 + (loc._count?.children || 0) * 0.5;
      data.push({
        name: loc.name,
        size,
        type: loc.type,
        children: loc._count?.children || 0,
        parent: parentName,
      });
      if (loc.children) {
        loc.children.forEach((child) => processLocation(child, loc.name));
      }
    };

    locationTree.forEach((loc) => processLocation(loc));
    return data;
  }, [locationTree]);

  // Monthly trend data (simulated for demo)
  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return months.map((month) => ({
      month: format(month, 'MMM yyyy', { locale: vi }),
      locations: Math.floor(Math.random() * 20) + stats.totalLocations - 10,
      active: Math.floor(Math.random() * 15) + stats.activeLocations - 7,
    }));
  }, [stats]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background rounded-lg border p-3 shadow-lg">
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
            <CardTitle className="text-sm font-medium">Tổng địa điểm</CardTitle>
            <MapPin className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-muted-foreground text-xs">{stats.activeLocations} hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phủ sóng tọa độ</CardTitle>
            <Navigation className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coordinatesCoverage}%</div>
            <p className="text-muted-foreground text-xs">
              {stats.locationsWithCoordinates}/{stats.totalLocations} có tọa độ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỉnh/Thành phố</CardTitle>
            <MapIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType[LocationType.PROVINCE]}</div>
            <p className="text-muted-foreground text-xs">
              {stats.byType[LocationType.CITY]} quận/huyện
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phường/Xã</CardTitle>
            <Home className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType[LocationType.DISTRICT]}</div>
            <p className="text-muted-foreground text-xs">Đơn vị hành chính nhỏ nhất</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="distribution">Phân bố</TabsTrigger>
          <TabsTrigger value="hierarchy">Cấu trúc</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái</CardTitle>
                <CardDescription>Tỷ lệ địa điểm hoạt động và không hoạt động</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
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

            {/* Coordinates Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Phủ sóng tọa độ</CardTitle>
                <CardDescription>Tỷ lệ địa điểm có thông tin tọa độ</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={coordinatesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }: any) => String(value)}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {coordinatesData.map((entry, index) => (
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

          {/* Type Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo loại địa điểm</CardTitle>
              <CardDescription>Số lượng địa điểm theo từng loại</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={typeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" name="Số lượng">
                    {typeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {/* Top Provinces by Children */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Tỉnh/Thành phố theo số địa điểm con</CardTitle>
              <CardDescription>Các tỉnh/thành phố có nhiều quận/huyện nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProvincesByChildren} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="children" fill="#00C49F" name="Địa điểm con" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Treemap */}
          <Card>
            <CardHeader>
              <CardTitle>Bản đồ phân bố địa điểm</CardTitle>
              <CardDescription>Kích thước dựa trên số lượng địa điểm con</CardDescription>
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
                          <div className="bg-background rounded-lg border p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">
                              Loại: {locationTypeLabels[data.type as LocationType]}
                            </p>
                            <p className="text-sm">Địa điểm con: {data.children}</p>
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

        <TabsContent value="hierarchy" className="space-y-4">
          {/* Radial Bar Chart for Type Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Cấu trúc phân cấp địa điểm</CardTitle>
              <CardDescription>Số lượng địa điểm theo từng cấp độ</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="90%"
                  data={depthAnalysis}
                >
                  <RadialBar dataKey="count" fill="#8884d8">
                    {depthAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </RadialBar>
                  <PolarAngleAxis type="number" domain={[0, 'dataMax']} />
                  <Tooltip />
                  <Legend
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <ul className="mt-4 flex flex-wrap justify-center gap-4">
                          {payload?.map((entry: any, index: number) => (
                            <li key={`item-${index}`} className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">
                                {depthAnalysis[index].type}: {depthAnalysis[index].count}
                              </span>
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng theo tháng</CardTitle>
              <CardDescription>Biến động số lượng địa điểm 6 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="locations"
                    stroke="#8884d8"
                    name="Tổng địa điểm"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#82ca9d"
                    name="Hoạt động"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
