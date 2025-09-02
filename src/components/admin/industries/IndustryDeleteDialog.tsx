'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Industry } from '@/types/system-categories'

interface IndustryDeleteDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  industry: Industry | null
}

export function IndustryDeleteDialog({
  open,
  onClose,
  onSuccess,
  industry,
}: IndustryDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    if (!industry) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/system-categories/industries/${industry.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Có lỗi xảy ra')
      }

      toast.success('Xóa ngành thành công')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa ngành')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa ngành</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa ngành{' '}
              <span className="font-semibold">{industry?.name}</span> không?
            </p>
            {industry?.categoryCount && industry.categoryCount > 0 && (
              <p className="text-destructive">
                Lưu ý: Ngành này đang có {industry.categoryCount} danh mục liên quan.
                Việc xóa có thể ảnh hưởng đến dữ liệu khác trong hệ thống.
              </p>
            )}
            <p>Hành động này không thể hoàn tác.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
