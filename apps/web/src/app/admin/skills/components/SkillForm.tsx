'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skill, CreateSkillDto, UpdateSkillDto, SkillCategory } from '@/types/system-categories';
import { createSkillSchema, updateSkillSchema } from '@/lib/validations/system-categories';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  X,
  Save,
  XCircle,
  FolderOpen,
  Brain,
  Languages,
  Wrench,
  ImageIcon,
  Link2,
  Loader2
} from 'lucide-react';

interface SkillFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSkillDto | UpdateSkillDto) => Promise<boolean>;
  skill?: Skill | null;
  mode: 'create' | 'edit';
}

const skillCategoryIcons: Record<SkillCategory, React.ReactElement> = {
  TECHNICAL: <FolderOpen className="h-4 w-4" />,
  SOFT: <Brain className="h-4 w-4" />,
  LANGUAGE: <Languages className="h-4 w-4" />,
  TOOL: <Wrench className="h-4 w-4" />,
};

const skillCategoryLabels: Record<SkillCategory, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT: 'Kỹ năng mềm',
  LANGUAGE: 'Ngôn ngữ',
  TOOL: 'Công cụ',
};

const skillCategoryDescriptions: Record<SkillCategory, string> = {
  TECHNICAL: 'Kỹ năng lập trình, công nghệ, framework...',
  SOFT: 'Kỹ năng giao tiếp, quản lý, làm việc nhóm...',
  LANGUAGE: 'Tiếng Anh, tiếng Nhật, tiếng Trung...',
  TOOL: 'Các công cụ phần mềm, IDE, phần mềm thiết kế...',
};

export const SkillForm: React.FC<SkillFormProps> = ({ open, onClose, onSubmit, skill, mode }) => {
  const [submitting, setSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>('');

  const formSchema = mode === 'create' ? createSkillSchema : updateSkillSchema;

  const form = useForm<CreateSkillDto | UpdateSkillDto>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill?.name || '',
      category: skill?.category || SkillCategory.TECHNICAL,
      description: skill?.description || '',
      iconUrl: skill?.iconUrl || '',
      ...(mode === 'edit' && { isActive: skill?.isActive ?? true }),
    },
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty } } = form;

  const watchedIconUrl = watch('iconUrl');
  const watchedCategory = watch('category');

  useEffect(() => {
    if (watchedIconUrl && watchedIconUrl.startsWith('http')) {
      setIconPreview(watchedIconUrl);
    } else {
      setIconPreview('');
    }
  }, [watchedIconUrl]);

  useEffect(() => {
    if (skill && mode === 'edit') {
      reset({
        name: skill.name,
        category: skill.category,
        description: skill.description || '',
        iconUrl: skill.iconUrl || '',
        isActive: skill.isActive,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        category: SkillCategory.TECHNICAL,
        description: '',
        iconUrl: '',
      });
    }
  }, [skill, mode, reset]);

  const handleFormSubmit = async (data: CreateSkillDto | UpdateSkillDto) => {
    setSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      setIconPreview('');
      onClose();
    }
  };

  const handleIconError = () => {
    setIconPreview('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Save className="h-5 w-5" />
                Thêm kỹ năng mới
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Chỉnh sửa kỹ năng
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Tạo mới một kỹ năng trong hệ thống.'
              : `Chỉnh sửa thông tin kỹ năng "${skill?.name}".`
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'edit' && skill && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-800">
              <strong>Chú ý:</strong> Đang chỉnh sửa kỹ năng "{skill.name}"
            </div>
            {skill._count && (skill._count.candidateSkills > 0 || skill._count.jobSkills > 0) && (
              <div className="text-xs text-blue-600 mt-1">
                Kỹ năng này đang được sử dụng bởi {skill._count.candidateSkills} ứng viên và {skill._count.jobSkills} việc làm
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kỹ năng *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: React, JavaScript, Teamwork..."
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại kỹ năng *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại kỹ năng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(skillCategoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {skillCategoryIcons[value as SkillCategory]}
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {skillCategoryDescriptions[value as SkillCategory]}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Mô tả chi tiết về kỹ năng này..."
                      rows={3}
                      maxLength={500}
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 ký tự
                  </FormDescription>
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
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://example.com/icon.png"
                        disabled={submitting}
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  
                  {iconPreview && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={iconPreview} 
                          onError={handleIconError}
                        />
                        <AvatarFallback>
                          <ImageIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Xem trước icon</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'true')} 
                      value={field.value ? 'true' : 'false'}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Hoạt động
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            Không hoạt động
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={submitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={submitting || !isDirty}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {submitting 
                  ? 'Đang xử lý...' 
                  : mode === 'create' ? 'Tạo kỹ năng' : 'Cập nhật'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
