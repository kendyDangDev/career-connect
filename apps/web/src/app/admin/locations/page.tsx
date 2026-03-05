'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocations } from '@/hooks/useLocations';
import { LocationsTable } from './components/LocationsTable';
import { LocationForm } from './components/LocationForm';
import { LocationDetail } from './components/LocationDetail';
import { LocationsAnalytics } from './components/LocationsAnalytics';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  LocationQuery,
} from '@/types/system-categories';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  ChevronRight,
  BarChart3,
  TableIcon,
  Trash2,
  Download,
  Upload,
  FileText,
  MapPin,
  Map,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/layout/AdminLayout/AdminPageHeader';

function LocationsManagementPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    locations,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    pageSize,
    filters,
    locationTree,
    parentLocations,
    typeStats,
    fetchLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    updateFilters,
    resetFilters,
    refreshData,
  } = useLocations();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    setFormMode('create');
    setSelectedLocation(null);
    setFormOpen(true);
  };

  // Xử lý mở form chỉnh sửa
  const handleEdit = (location: Location) => {
    setFormMode('edit');
    setSelectedLocation(location);
    setFormOpen(true);
  };

  // Xử lý xem chi tiết
  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setDetailOpen(true);
  };

  // Xử lý xóa
  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (locationToDelete) {
      const success = await deleteLocation(locationToDelete.id);
      if (success) {
        setDeleteConfirmOpen(false);
        setLocationToDelete(null);
      }
    }
  };

  // Xử lý submit form
  const handleFormSubmit = async (
    data: CreateLocationDto | UpdateLocationDto
  ): Promise<boolean> => {
    if (formMode === 'create') {
      return await createLocation(data as CreateLocationDto);
    } else if (selectedLocation) {
      return await updateLocation(selectedLocation.id, data as UpdateLocationDto);
    }
    return false;
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (location: Location, isActive: boolean) => {
    const success = await updateLocation(location.id, { isActive });
    if (success) {
      setDetailOpen(false);
      await refreshData();
    }
  };

  // Xử lý phân trang
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handlePageSizeChange = (size: number) => {
    updateFilters({ limit: size, page: 1 });
  };

  // Xử lý sắp xếp
  const handleSort = (field: string) => {
    const isCurrentSort = filters.sortBy === field;
    updateFilters({
      sortBy: field,
      sortOrder: isCurrentSort && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  // Xử lý tìm kiếm
  const handleSearch = (search: string) => {
    updateFilters({ search, page: 1 });
  };

  // Xử lý lọc
  const handleFilterChange = (newFilters: Partial<LocationQuery>) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  // Xử lý export
  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/system-categories/locations/export?${queryParams}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `locations-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export thành công');
    } catch (error) {
      toast.error('Lỗi khi export dữ liệu');
    }
  };

  // Xử lý import
  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/system-categories/locations/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      toast.success(result.message || 'Import thành công');
      setImportDialogOpen(false);
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi khi import dữ liệu');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-7xl space-y-5 p-4 md:p-6">
        <AdminPageHeader
          title="Quản lý địa điểm"
          description="📍 Quản lý cấu trúc địa điểm hành chính trong hệ thống"
          icon={MapPin}
          gradient="from-red-600 via-rose-600 to-pink-600"
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/15 text-destructive border-destructive/20 mb-6 rounded-lg border px-4 py-3">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="list" className="mb-6 space-y-2">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Danh sách
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="m-0 pb-6">
            <Card>
              <CardContent className="p-0">
                <LocationsTable
                  locations={locations}
                  loading={loading}
                  totalItems={totalItems}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  filters={filters}
                  typeStats={typeStats}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onSort={handleSort}
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                  onAddNew={handleAddNew}
                  onExport={handleExport}
                  onImport={() => setImportDialogOpen(true)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="m-0 border-t py-6">
            <LocationsAnalytics
              locations={locations}
              locationTree={locationTree}
              typeStats={typeStats}
            />
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <LocationForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          location={selectedLocation}
          parentLocations={parentLocations}
          mode={formMode}
        />

        {/* Detail Dialog */}
        <LocationDetail
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          location={selectedLocation}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa địa điểm <strong>{locationToDelete?.name}</strong>?
                {locationToDelete?._count?.children && locationToDelete._count.children > 0 && (
                  <span className="mt-2 block text-red-600">
                    Cảnh báo: Địa điểm này có {locationToDelete._count.children} địa điểm con!
                  </span>
                )}
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Dialog */}
        <Dialog
          open={importDialogOpen}
          onOpenChange={() => !importing && setImportDialogOpen(false)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import địa điểm</DialogTitle>
              <DialogDescription>
                Chọn file CSV hoặc JSON để import danh sách địa điểm. File phải có các cột: name,
                type, parentId (tùy chọn), latitude (tùy chọn), longitude (tùy chọn)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">File CSV/JSON cần có cấu trúc:</p>
                <ul className="mt-2 list-inside list-disc text-sm text-blue-700">
                  <li>name: Tên địa điểm (bắt buộc)</li>
                  <li>type: Loại địa điểm - COUNTRY, PROVINCE, CITY, DISTRICT (bắt buộc)</li>
                  <li>
                    parentId: ID địa điểm cha (tùy chọn, bắt buộc với PROVINCE, CITY, DISTRICT)
                  </li>
                  <li>latitude: Vĩ độ (tùy chọn)</li>
                  <li>longitude: Kinh độ (tùy chọn)</li>
                </ul>
              </div>

              <Button
                className="w-full"
                disabled={importing}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {importing ? 'Đang import...' : 'Chọn file'}
              </Button>

              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
              />

              {importing && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-muted-foreground text-center text-sm">Đang xử lý file...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function LocationsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      }
    >
      <LocationsManagementPageContent />
    </Suspense>
  );
}
