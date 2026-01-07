'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndustriesDataTable } from '@/components/admin/industries/IndustriesDataTable';
import { IndustryForm } from '@/components/admin/industries/IndustryForm';
import { IndustryDeleteDialog } from '@/components/admin/industries/IndustryDeleteDialog';
import { IndustryDetailView } from '@/components/admin/industries/IndustryDetailView';
import { IndustriesAnalytics } from '@/components/admin/industries/IndustriesAnalytics';
import { Industry } from '@/types/system-categories';
import {
  BarChart3,
  FileText,
  Plus,
  Download,
  Upload,
  ChevronRight,
  Home,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function IndustriesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedIndustry(null);
    setFormOpen(true);
  };

  const handleEdit = (industry: Industry) => {
    setSelectedIndustry(industry);
    setFormOpen(true);
  };

  const handleDelete = (industry: Industry) => {
    setSelectedIndustry(industry);
    setDeleteOpen(true);
  };

  const handleView = (industry: Industry) => {
    setSelectedIndustryId(industry.id);
    setDetailOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = async () => {
    // try {
    //   const response = await fetch('/api/admin/system-categories/industries/export');
    //   if (!response.ok) throw new Error('Export failed');
    //   const blob = await response.blob();
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = `industries-${new Date().toISOString().split('T')[0]}.csv`;
    //   document.body.appendChild(a);
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    //   document.body.removeChild(a);
    // } catch (error) {
    //   console.error('Export error:', error);
    // }
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clicked');
  };

  return (
    <div className="space-y-6">
      {/* <nav className="mb-6 flex items-center space-x-2 text-sm">
        <a
          href="/admin"
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <Home className="mr-1 h-4 w-4" />
          Trang chủ
        </a>
        <ChevronRight className="text-muted-foreground h-4 w-4" />
        <span className="text-foreground">Quản lý ngành nghề</span>
      </nav> */}
      {/* Page Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý ngành</h1>
          <p className="text-muted-foreground">Quản lý danh sách các ngành nghề trong hệ thống</p>
        </div> */}
      {/* <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
        </div> */}
      {/* </div> */}

      <AdminPageHeader
        title="Quản lý ngành nghề"
        description="📊 Quản lý tất cả ngành nghề trong hệ thống"
        icon={Building2}
        gradient="from-yellow-600 via-orange-600 to-red-600"
      />

      {/* Main Content */}
      {/* <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-fit">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Danh sách
          </TabsTrigger> */}
      {/* <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống kê
          </TabsTrigger> */}
      {/* </TabsList> */}

      {/* <TabsContent value="list"> */}
      <Card>
        {/* <CardHeader>
              <CardTitle>Danh sách ngành</CardTitle>
              <CardDescription>Quản lý và theo dõi tất cả các ngành trong hệ thống</CardDescription>
            </CardHeader> */}
        <CardContent>
          <IndustriesDataTable
            key={refreshKey}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </CardContent>
      </Card>
      {/* </TabsContent> */}

      {/* <TabsContent value="analytics" className="space-y-4">
          <IndustriesAnalytics />
        </TabsContent>
      </Tabs> */}

      {/* Modals */}
      <IndustryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleSuccess}
        industry={selectedIndustry}
      />

      <IndustryDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSuccess={handleSuccess}
        industry={selectedIndustry}
      />

      <IndustryDetailView
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        industryId={selectedIndustryId}
      />
    </div>
  );
}
