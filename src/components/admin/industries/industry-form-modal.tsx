'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Industry, CreateIndustryDto, UpdateIndustryDto } from '@/types/system-categories';

// Form validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên ngành nghề phải có ít nhất 2 ký tự')
    .max(100, 'Tên ngành nghề không được vượt quá 100 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  sortOrder: z.number().int('Thứ tự phải là số nguyên').min(0, 'Thứ tự không được âm').optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface IndustryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIndustryDto | UpdateIndustryDto) => void;
  industry?: Industry | null;
  loading?: boolean;
  mode: 'create' | 'edit';
}

const IndustryFormModal: React.FC<IndustryFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  industry,
  loading = false,
  mode,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      iconUrl: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  // Reset form when modal opens or industry changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && industry) {
        form.reset({
          name: industry.name,
          description: industry.description || '',
          iconUrl: industry.iconUrl || '',
          sortOrder: industry.sortOrder || 0,
          isActive: industry.isActive,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          iconUrl: '',
          sortOrder: 0,
          isActive: true,
        });
      }
    }
  }, [open, industry, mode, form]);

  const handleSubmit = (data: FormData) => {
    if (mode === 'create') {
      const createData: CreateIndustryDto = {
        name: data.name,
        description: data.description || undefined,
        iconUrl: data.iconUrl || undefined,
        sortOrder: data.sortOrder || undefined,
      };
      onSubmit(createData);
    } else {
      const updateData: UpdateIndustryDto = {
        name: data.name,
        description: data.description || undefined,
        iconUrl: data.iconUrl || undefined,
        sortOrder: data.sortOrder || undefined,
        isActive: data.isActive,
      };
      onSubmit(updateData);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm ngành nghề mới' : 'Chỉnh sửa ngành nghề'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền thông tin để tạo ngành nghề mới.'
              : 'Cập nhật thông tin ngành nghề.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên ngành nghề <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Công nghệ thông tin" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả về ngành nghề..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>Mô tả ngắn gọn về ngành nghề (tối đa 500 ký tự)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Icon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/icon.png"
                      type="url"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>Đường dẫn đến icon của ngành nghề</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự hiển thị</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} disabled={loading} />
                  </FormControl>
                  <FormDescription>
                    Thứ tự hiển thị của ngành nghề (số càng nhỏ càng ưu tiên)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                      <FormDescription>
                        Ngành nghề sẽ được hiển thị và sử dụng trong hệ thống
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IndustryFormModal;
