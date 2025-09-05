'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CompaniesTable } from './components/CompaniesTable';
import { CompanyFormDialog } from './components/CompanyFormDialog';
import { CompanyDetailDialog } from './components/CompanyDetailDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { Company, CompanyFormData } from './types';
import { Loader2 } from 'lucide-react';

export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Parse URL params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const companySize = searchParams.get('companySize') || '';
  const industryId = searchParams.get('industryId') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const {
    companies,
    loading,
    pagination,
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    handleCompanySizeFilter,
    handleIndustryFilter,
    handleSort,
    createCompany,
    updateCompany,
    deleteCompany,
    refresh,
  } = useCompaniesData({
    page,
    limit,
    search,
    status,
    companySize,
    industryId,
    sortBy,
    sortOrder,
  });

  // Update URL params
  const updateURLParams = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value.toString());
        }
      });

      router.push(`/admin/companies?${newSearchParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handlers
  const handleFilter = (filterType: 'status' | 'companySize' | 'industryId', value: string) => {
    switch (filterType) {
      case 'status':
        handleStatusFilter(value);
        break;
      case 'companySize':
        handleCompanySizeFilter(value);
        break;
      case 'industryId':
        handleIndustryFilter(value);
        break;
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    updateURLParams({ limit: newSize, page: 1 });
  };

  const handleAddNew = () => {
    setSelectedCompany(null);
    setFormMode('create');
    setIsFormDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormMode('edit');
    setIsFormDialogOpen(true);
  };

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    try {
      setFormLoading(true);
      if (formMode === 'create') {
        await createCompany(data);
        toast.success('Tạo công ty thành công');
      } else if (selectedCompany) {
        await updateCompany(selectedCompany.id, data);
        toast.success('Cập nhật công ty thành công');
      }
      setIsFormDialogOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      try {
        setDeleteLoading(true);
        await deleteCompany(selectedCompany.id);
        toast.success('Xóa công ty thành công');
        setIsDeleteDialogOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error.message || 'Có lỗi xảy ra khi xóa');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý công ty</h1>
        <p className="text-muted-foreground">Quản lý tất cả công ty trong hệ thống</p>
      </div>

      <CompaniesTable
        companies={companies}
        loading={loading}
        pagination={pagination}
        filters={{
          search,
          status,
          companySize,
          industryId,
          sortBy,
          sortOrder,
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <CompanyFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        mode={formMode}
        company={selectedCompany}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <CompanyDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        company={selectedCompany}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        companyName={selectedCompany ? selectedCompany.companyName : ''}
        loading={deleteLoading}
      />
    </div>
  );
}
