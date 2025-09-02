'use client';

import React, { useState } from 'react';
import { Skill, SkillCategory } from '@/types/system-categories';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FolderOpen,
  Brain,
  Languages,
  Wrench,
  Calendar,
  RefreshCw,
  Link2,
  Tag,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Clock
} from 'lucide-react';

interface SkillDetailProps {
  open: boolean;
  onClose: () => void;
  skill: Skill | null;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onStatusChange?: (skill: Skill, isActive: boolean) => void;
}

const skillCategoryIcons: Record<SkillCategory, React.ReactElement> = {
  TECHNICAL: <FolderOpen className="h-4 w-4" />,
  SOFT: <Brain className="h-4 w-4" />,
  LANGUAGE: <Languages className="h-4 w-4" />,
  TOOL: <Wrench className="h-4 w-4" />
};

const skillCategoryLabels: Record<SkillCategory, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT: 'Kỹ năng mềm',
  LANGUAGE: 'Ngôn ngữ',
  TOOL: 'Công cụ'
};

const skillCategoryColors: Record<SkillCategory, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  TECHNICAL: 'default',
  SOFT: 'secondary',
  LANGUAGE: 'outline',
  TOOL: 'destructive'
};

export const SkillDetail: React.FC<SkillDetailProps> = ({
  open,
  onClose,
  skill,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!skill) return null;

  const handleEdit = () => {
    onEdit(skill);
    onClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    onDelete(skill);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleStatusToggle = () => {
    if (onStatusChange) {
      onStatusChange(skill, !skill.isActive);
    }
  };

  const usageCount = (skill._count?.candidateSkills || 0) + (skill._count?.jobSkills || 0);
  const canDelete = usageCount === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {skill.iconUrl ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={skill.iconUrl} alt={skill.name} />
                  <AvatarFallback>{skill.name[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{skill.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <DialogTitle className="text-left">{skill.name}</DialogTitle>
                <Badge variant={skillCategoryColors[skill.category]} className="flex items-center gap-1 w-fit">
                  {skillCategoryIcons[skill.category]}
                  {skillCategoryLabels[skill.category]}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thông tin chính */}
            <div className="md:col-span-2 space-y-6">
              {/* Mô tả */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mô tả
                </h3>
                <p className="text-sm text-muted-foreground">
                  {skill.description || 'Chưa có mô tả'}
                </p>
              </div>

              {/* Thông tin hệ thống */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Thông tin hệ thống
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Slug:</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{skill.slug}</code>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ngày tạo:</span>
                    <span>{format(new Date(skill.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                  
                  {skill.updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cập nhật cuối:</span>
                      <span>{format(new Date(skill.updatedAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                  )}
                  
                  {skill.iconUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">URL Icon:</span>
                      <a 
                        href={skill.iconUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-[200px]"
                      >
                        {skill.iconUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar thông tin */}
            <div className="space-y-4">
              {/* Trạng thái */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {skill.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">Đang hoạt động</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">Không hoạt động</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Thống kê sử dụng */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Thống kê sử dụng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Ứng viên:</span>
                    </div>
                    <span className="font-medium">{skill._count?.candidateSkills || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Việc làm:</span>
                    </div>
                    <span className="font-medium">{skill._count?.jobSkills || 0}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Tổng cộng:</span>
                    <span className="font-bold text-primary">{usageCount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cảnh báo nếu đang được sử dụng */}
              {usageCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Đang được sử dụng</div>
                  <div className="text-xs text-yellow-700">
                    Kỹ năng này đang được sử dụng bởi {skill._count?.candidateSkills || 0} ứng viên và {skill._count?.jobSkills || 0} việc làm. Không thể xóa khi đang được sử dụng.
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div>
              {onStatusChange && (
                <Button
                  variant="outline"
                  onClick={handleStatusToggle}
                  className={skill.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                >
                  {skill.isActive ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Vô hiệu hóa
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Kích hoạt
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!canDelete}
                title={!canDelete ? 'Không thể xóa khi đang được sử dụng' : ''}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
              
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kỹ năng <strong>{skill.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
