'use client';

import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/system-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { AlertDialog, AlertDescription } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Save, X, Folder, FileText, Settings, Image, Hash } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
  parentId: z.string().optional().nullable(),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional().nullable(),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().nullable().or(z.literal('')),
  sortOrder: z
    .number()
    .int('Thứ tự sắp xếp phải là số nguyên')
    .min(0, 'Thứ tự sắp xếp không được âm')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<boolean>;
  category?: Category | null;
  parentCategories?: Category[];
  mode?: 'create' | 'edit';
  isPage?: boolean; // For dedicated page mode
}

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  category,
  parentCategories = [],
  mode = 'create',
  isPage = false,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: null,
      description: '',
      iconUrl: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const parentId = watch('parentId');

  // Reset form when category changes
  useEffect(() => {
    if (category && mode === 'edit') {
      reset({
        name: category.name,
        parentId: category.parentId || null,
        description: category.description || '',
        iconUrl: category.iconUrl || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        parentId: null,
        description: '',
        iconUrl: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [category, mode, reset]);

  // Handle form submission
  const onFormSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data
      const submitData: CreateCategoryDto | UpdateCategoryDto = {
        name: data.name.trim(),
        parentId: data.parentId || undefined,
        description: data.description?.trim() || undefined,
        iconUrl: data.iconUrl?.trim() || undefined,
        sortOrder: data.sortOrder || undefined,
      };

      if (mode === 'edit') {
        (submitData as UpdateCategoryDto).isActive = data.isActive;
      }

      const success = await onSubmit(submitData);

      if (success) {
        if (!isPage) {
          onClose();
        }
        reset();
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category and its children from parent selection
  const availableParents = parentCategories.filter((parent) => {
    if (mode === 'edit' && category) {
      // Cannot select itself or its children as parent
      return parent.id !== category.id && !isChildOf(parent, category.id);
    }
    return true;
  });

  // Helper function to check if a category is a child of another
  function isChildOf(cat: Category, parentId: string): boolean {
    if (cat.parentId === parentId) return true;
    if (cat.parent) return isChildOf(cat.parent, parentId);
    return false;
  }

  const formContent = (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <FileText className="mr-2 h-4 w-4" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="display">
            <Image className="mr-2 h-4 w-4" />
            Hiển thị
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ví dụ: Công nghệ thông tin"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Danh mục cha</Label>
            <Select
              value={parentId || 'none'}
              onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Không có (Danh mục gốc)
                  </div>
                </SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {parent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả ngắn về danh mục này..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="display" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iconUrl">URL Icon</Label>
            <Input
              id="iconUrl"
              {...register('iconUrl')}
              placeholder="https://example.com/icon.png"
              className={errors.iconUrl ? 'border-red-500' : ''}
            />
            {errors.iconUrl && <p className="text-sm text-red-500">{errors.iconUrl.message}</p>}
            <p className="text-muted-foreground text-sm">
              URL của icon đại diện cho danh mục (tùy chọn)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
            <Input
              id="sortOrder"
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
              placeholder="0"
              className={errors.sortOrder ? 'border-red-500' : ''}
            />
            {errors.sortOrder && <p className="text-sm text-red-500">{errors.sortOrder.message}</p>}
            <p className="text-muted-foreground text-sm">
              Số thứ tự để sắp xếp danh mục (số nhỏ hơn sẽ hiển thị trước)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={watch('isActive') ? 'true' : 'false'}
                onValueChange={(value) => setValue('isActive', value === 'true')}
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <Badge variant="default">Hoạt động</Badge>
                  </SelectItem>
                  <SelectItem value="false">
                    <Badge variant="secondary">Không hoạt động</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">
                Danh mục không hoạt động sẽ không hiển thị trên hệ thống
              </p>
            </div>
          )}

          {mode === 'edit' && category && (
            <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Thông tin hệ thống</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <code className="bg-muted rounded px-1">{category.id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <code className="bg-muted rounded px-1">{category.slug}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{new Date(category.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                {category.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                    <span>{new Date(category.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isPage ? (
        <div className="flex items-center gap-2 pt-4">
          <Button type="submit" disabled={loading || !isDirty}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
        </div>
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading || !isDirty}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isPage) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền thông tin để tạo danh mục mới trong hệ thống.'
              : `Chỉnh sửa thông tin danh mục "${category?.name}".`}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
