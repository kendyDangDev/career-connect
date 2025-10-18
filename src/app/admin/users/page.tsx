'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { UsersTable } from './components/UsersTable';
import { UserFormDialog } from './components/UserFormDialog';
import { UserDetailDialog } from './components/UserDetailDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useUsersData } from '@/hooks/useUsersData';
import { User, UserFormData } from './types';
import { Loader2 } from 'lucide-react';

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Parse URL params
  const page = parseInt(searchParams?.get('page') || '1');
  const limit = parseInt(searchParams?.get('limit') || '10');
  const search = searchParams?.get('search') || '';
  const userType = searchParams?.get('userType') || '';
  const status = searchParams?.get('status') || '';
  const sortBy = searchParams?.get('sortBy') || 'createdAt';
  const sortOrder = searchParams?.get('sortOrder') || 'desc';

  const { users, loading, pagination, createUser, updateUser, deleteUser, refresh } = useUsersData({
    page,
    limit,
    search,
    userType,
    status,
    sortBy,
    sortOrder,
  });

  // Update URL params
  const updateURLParams = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value.toString());
        }
      });

      router.push(`/admin/users?${newSearchParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handlers
  const handleSearch = (value: string) => {
    updateURLParams({ search: value, page: 1 });
  };

  const handleFilter = (filterType: 'userType' | 'status', value: string) => {
    updateURLParams({ [filterType]: value, page: 1 });
  };

  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateURLParams({ sortBy: field, sortOrder: newSortOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateURLParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateURLParams({ limit: newSize, page: 1 });
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (formMode === 'create') {
        await createUser(data);
        toast.success('Tạo người dùng thành công');
      } else if (selectedUser) {
        await updateUser(selectedUser.id, data);
        toast.success('Cập nhật người dùng thành công');
      }
      setIsFormDialogOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        toast.success('Xóa người dùng thành công');
        setIsDeleteDialogOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        pagination={pagination}
        filters={{
          search,
          userType,
          status,
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

      <UserFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        mode={formMode}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />

      <UserDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        userName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    }>
      <UsersPageContent />
    </Suspense>
  );
}
