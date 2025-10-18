'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import { ConfirmationOptions } from '@/components/notification/ConfirmationDialog';

export const useConfirm = () => {
  const notifications = useNotifications();

  const confirmAction = async (
    title: string,
    message?: string,
    onConfirm?: () => void,
    options?: Partial<ConfirmationOptions>
  ): Promise<boolean> => {
    return notifications.confirm({
      type: 'question',
      title,
      message,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
      onConfirm: onConfirm || (() => {}),
      ...options,
    });
  };

  const confirmWarning = async (
    title: string,
    message?: string,
    onConfirm?: () => void,
    options?: Partial<ConfirmationOptions>
  ): Promise<boolean> => {
    return notifications.confirm({
      type: 'warning',
      title,
      message,
      confirmText: 'Tiếp tục',
      cancelText: 'Hủy',
      destructive: true,
      onConfirm: onConfirm || (() => {}),
      ...options,
    });
  };

  const confirmDanger = async (
    title: string,
    message?: string,
    onConfirm?: () => void,
    options?: Partial<ConfirmationOptions>
  ): Promise<boolean> => {
    return notifications.confirm({
      type: 'danger',
      title,
      message,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true,
      onConfirm: onConfirm || (() => {}),
      ...options,
    });
  };

  const confirmUnsavedChanges = async (
    onConfirm?: () => void,
    customMessage?: string
  ): Promise<boolean> => {
    return notifications.confirm({
      type: 'warning',
      title: 'Có thay đổi chưa lưu',
      message:
        customMessage || 'Bạn có thay đổi chưa lưu. Những thay đổi này sẽ bị mất nếu bạn tiếp tục.',
      confirmText: 'Rời khỏi',
      cancelText: 'Ở lại',
      destructive: true,
      onConfirm: onConfirm || (() => {}),
    });
  };

  return {
    confirm: confirmAction,
    confirmWarning,
    confirmDanger,
    confirmUnsavedChanges,
  };
};
