'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Database } from 'lucide-react';
import IndustriesTable from '@/components/admin/industries/industries-table';
import IndustryFormModal from '@/components/admin/industries/industry-form-modal';
import IndustryDetailsModal from '@/components/admin/industries/industry-details-modal';
import IndustriesAnalytics from '@/components/admin/industries/industries-analytics';
import {
  useIndustries,
  useIndustry,
  useCreateIndustry,
  useUpdateIndustry,
  useDeleteIndustry,
  useIndustriesTableState,
} from '@/hooks/use-industries';
import { Industry, CreateIndustryDto, UpdateIndustryDto } from '@/types/system-categories';

export default function IndustriesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewIndustryId, setViewIndustryId] = useState<string | null>(null);

  // Table state and filters
  const { filters, updateFilter, resetFilters } = useIndustriesTableState();

  // API queries and mutations
  const { data: industriesData, isLoading, refetch } = useIndustries(filters);
  const { data: viewIndustry, isLoading: viewLoading } = useIndustry(viewIndustryId);
  const createMutation = useCreateIndustry();
  const updateMutation = useUpdateIndustry();
  const deleteMutation = useDeleteIndustry();

  // Handle create new
  const handleAddNew = () => {
    setSelectedIndustry(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (industry: Industry) => {
    setSelectedIndustry(industry);
    setFormMode('edit');
    setFormModalOpen(true);
    setDetailsModalOpen(false);
  };

  // Handle view details
  const handleView = (industry: Industry) => {
    setViewIndustryId(industry.id);
    setDetailsModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateIndustryDto | UpdateIndustryDto) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync(data as CreateIndustryDto);
      } else if (selectedIndustry) {
        await updateMutation.mutateAsync({
          id: selectedIndustry.id,
          data: data as UpdateIndustryDto,
        });
      }
      setFormModalOpen(false);
      refetch();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDetailsModalOpen(false);
      refetch();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isActive },
      });
      setDetailsModalOpen(false);
      refetch();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý ngành nghề</h1>
        <p className="text-muted-foreground">
          Quản lý danh sách ngành nghề trong hệ thống
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="gap-2">
            <Database className="h-4 w-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Phân tích
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách ngành nghề</CardTitle>
              <CardDescription>
                Quản lý và theo dõi tất cả ngành nghề trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndustriesTable
                data={industriesData?.data || []}
                loading={isLoading}
                filters={filters}
                totalPages={industriesData?.meta.totalPages || 1}
                onFilterChange={updateFilter}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <IndustriesAnalytics />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <IndustryFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        industry={selectedIndustry}
        loading={createMutation.isPending || updateMutation.isPending}
        mode={formMode}
      />

      {/* Details Modal */}
      <IndustryDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setViewIndustryId(null);
        }}
        industry={viewIndustry || null}
        loading={viewLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
