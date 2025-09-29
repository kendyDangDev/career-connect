'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Company, CompanyFormData } from '../types';
import { CompanySize, VerificationStatus } from '@/generated/prisma';

const companySchema = z.object({
  companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  industryId: z.string().optional(),
  companySize: z.nativeEnum(CompanySize).optional(),
  websiteUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
});

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  company?: Company | null;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  loading?: boolean;
}

export function CompanyFormDialog({
  open,
  onOpenChange,
  mode,
  company,
  onSubmit,
  loading = false,
}: CompanyFormDialogProps) {
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: '',
      industryId: undefined,
      companySize: undefined,
      websiteUrl: '',
      description: '',
      address: '',
      city: '',
      province: '',
      country: '',
      phone: '',
      email: '',
      foundedYear: undefined,
      verificationStatus: VerificationStatus.PENDING,
    },
  });

  // Load industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const response = await fetch('/api/admin/system-categories/industries');
        if (response.ok) {
          const data = await response.json();
          setIndustries(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error);
      } finally {
        setLoadingIndustries(false);
      }
    };

    if (open) {
      fetchIndustries();
    }
  }, [open]);

  // Set form values when company changes
  useEffect(() => {
    if (company && mode === 'edit') {
      form.reset({
        companyName: company.companyName || '',
        industryId: company.industry?.id || undefined,
        companySize: company.companySize || undefined,
        websiteUrl: company.websiteUrl || '',
        description: company.description || '',
        address: company.address || '',
        city: company.city || '',
        province: company.province || '',
        country: company.country || '',
        phone: company.phone || '',
        email: company.email || '',
        foundedYear: company.foundedYear || undefined,
        verificationStatus: company.verificationStatus,
      });
    } else {
      form.reset({
        companyName: '',
        industryId: undefined,
        companySize: undefined,
        websiteUrl: '',
        description: '',
        address: '',
        city: '',
        province: '',
        country: '',
        phone: '',
        email: '',
        foundedYear: undefined,
        verificationStatus: VerificationStatus.PENDING,
      });
    }
  }, [company, mode, form]);

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanData = {
        ...data,
        websiteUrl: data.websiteUrl || undefined,
        email: data.email || undefined,
        industryId: data.industryId || undefined,
        companySize: data.companySize || undefined,
        description: data.description || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        country: data.country || undefined,
        phone: data.phone || undefined,
        foundedYear: data.foundedYear || undefined,
      };

      await onSubmit(cleanData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const companySizeOptions = [
    { value: CompanySize.STARTUP, label: '1-10 nhân viên' },
    { value: CompanySize.SMALL, label: '11-50 nhân viên' },
    { value: CompanySize.MEDIUM, label: '51-200 nhân viên' },
    { value: CompanySize.LARGE, label: '201-1000 nhân viên' },
    { value: CompanySize.ENTERPRISE, label: '1000+ nhân viên' },
  ];

  const verificationStatusOptions = [
    { value: VerificationStatus.PENDING, label: 'Chờ xác minh' },
    { value: VerificationStatus.VERIFIED, label: 'Đã xác minh' },
    { value: VerificationStatus.REJECTED, label: 'Bị từ chối' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm công ty mới' : 'Chỉnh sửa công ty'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tên công ty *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên công ty" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Industry */}
              <FormField
                control={form.control}
                name="industryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành nghề</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngành nghề" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Không chọn</SelectItem>
                        {loadingIndustries ? (
                          <SelectItem value="all" disabled>
                            Đang tải...
                          </SelectItem>
                        ) : (
                          industries.map((industry) => (
                            <SelectItem key={industry.id} value={industry.id}>
                              {industry.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Size */}
              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quy mô công ty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quy mô" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Không chọn</SelectItem>
                        {companySizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website URL */}
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Founded Year */}
              <FormField
                control={form.control}
                name="foundedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm thành lập</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa chỉ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Hồ Chí Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Hồ Chí Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quốc gia</FormLabel>
                    <FormControl>
                      <Input placeholder="Việt Nam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Verification Status - Only for admin */}
              <FormField
                control={form.control}
                name="verificationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái xác minh</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {verificationStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả công ty</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về công ty..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
