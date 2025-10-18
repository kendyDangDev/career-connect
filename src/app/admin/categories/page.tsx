'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryForm } from './components/CategoryForm';
import { CategoryDetail } from './components/CategoryDetail';
import { CategoriesAnalytics } from './components/CategoriesAnalytics';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryQuery } from '@/types/system-categories';
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
  FolderTree,
} from 'lucide-react';

function CategoriesManagementPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    categories,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    pageSize,
    filters,
    categoryTree,
    parentCategories,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    resetFilters,
    refreshData,
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    setFormMode('create');
    setSelectedCategory(null);
    setFormOpen(true);
  };

  // Xử lý mở form chỉnh sửa
  const handleEdit = (category: Category) => {
    setFormMode('edit');
    setSelectedCategory(category);
    setFormOpen(true);
  };

  // Xử lý xem chi tiết
  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setDetailOpen(true);
  };

  // Xử lý xóa
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      const success = await deleteCategory(categoryToDelete.id);
      if (success) {
        setDeleteConfirmOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  // Xử lý submit form
  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto): Promise<boolean> => {
    if (formMode === 'create') {
      return await createCategory(data as CreateCategoryDto);
    } else if (selectedCategory) {
      return await updateCategory(selectedCategory.id, data as UpdateCategoryDto);
    }
    return false;
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (category: Category, isActive: boolean) => {
    const success = await updateCategory(category.id, { isActive });
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
  const handleFilterChange = (newFilters: Partial<CategoryQuery>) => {
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

      const response = await fetch(`/api/admin/system-categories/categories/export?${queryParams}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-export-${new Date().toISOString().split('T')[0]}.csv`;
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

      const response = await fetch('/api/admin/system-categories/categories/import', {
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
    <div className="container mx-auto max-w-7xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-2 text-sm">
        <a
          href="/admin"
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <Home className="mr-1 h-4 w-4" />
          Trang chủ
        </a>
        <ChevronRight className="text-muted-foreground h-4 w-4" />
        <span className="text-foreground">Quản lý danh mục</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        <p className="text-muted-foreground">Quản lý cây danh mục cho việc làm trong hệ thống</p>
      </div>

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
            <FolderTree className="h-4 w-4" />
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
              <CategoriesTable
                categories={categories}
                loading={loading}
                totalItems={totalItems}
                currentPage={currentPage}
                pageSize={pageSize}
                filters={filters}
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
          <CategoriesAnalytics categories={categories} categoryTree={categoryTree} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        parentCategories={parentCategories}
        mode={formMode}
      />

      {/* Detail Dialog */}
      <CategoryDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        category={selectedCategory}
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
              Bạn có chắc chắn muốn xóa danh mục <strong>{categoryToDelete?.name}</strong>? 
              {categoryToDelete?._count?.children && categoryToDelete._count.children > 0 && (
                <span className="block mt-2 text-red-600">
                  Cảnh báo: Danh mục này có {categoryToDelete._count.children} danh mục con!
                </span>
              )}
              {categoryToDelete?._count?.jobCategories && categoryToDelete._count.jobCategories > 0 && (
                <span className="block mt-2 text-red-600">
                  Cảnh báo: Danh mục này có {categoryToDelete._count.jobCategories} việc làm!
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
      <Dialog open={importDialogOpen} onOpenChange={() => !importing && setImportDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import danh mục</DialogTitle>
            <DialogDescription>
              Chọn file CSV hoặc JSON để import danh sách danh mục. File phải có các cột: name,
              parentId (tùy chọn), description (tùy chọn), iconUrl (tùy chọn), sortOrder (tùy chọn)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                File CSV/JSON cần có cấu trúc:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>name: Tên danh mục (bắt buộc)</li>
                <li>parentId: ID danh mục cha (tùy chọn)</li>
                <li>description: Mô tả (tùy chọn)</li>
                <li>iconUrl: URL icon (tùy chọn)</li>
                <li>sortOrder: Thứ tự sắp xếp (tùy chọn)</li>
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
  );
}

export default function CategoriesManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CategoriesManagementPageContent />
    </Suspense>
  );
}
