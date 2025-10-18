'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Industry } from '@/types/system-categories';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên ngành phải có ít nhất 3 ký tự')
    .max(100, 'Tên ngành không được vượt quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
  iconUrl: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  sortOrder: z.number().int('Thứ tự phải là số nguyên').min(0, 'Thứ tự không được âm').optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface IndustryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  industry?: Industry | null;
}

export function IndustryForm({ open, onClose, onSuccess, industry }: IndustryFormProps) {
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!industry;

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

  useEffect(() => {
    if (industry) {
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
  }, [industry, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/admin/system-categories/industries/${industry.id}`
        : '/api/admin/system-categories/industries';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }

      toast.success(isEdit ? 'Cập nhật ngành thành công' : 'Thêm ngành mới thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa ngành' : 'Thêm ngành mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin ngành. Nhấn lưu khi hoàn tất.'
              : 'Nhập thông tin ngành mới. Nhấn lưu khi hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên ngành <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Công nghệ thông tin" {...field} />
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
                      placeholder="Mô tả chi tiết về ngành..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Mô tả không bắt buộc, tối đa 500 ký tự</FormDescription>
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
                    <Input placeholder="https://example.com/icon.png" type="url" {...field} />
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
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Thứ tự hiển thị của ngành nghề (số càng nhỏ càng ưu tiên)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái hoạt động</FormLabel>
                    <FormDescription>
                      Ngành sẽ hiển thị trong hệ thống khi được kích hoạt
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
