import { useState, useCallback } from 'react';
import { NotificationItem, NotificationType } from '@/components/notification/NotificationManager';

interface ShowNotificationOptions {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback((options: ShowNotificationOptions) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const notification: NotificationItem = {
      id,
      ...options,
    };

    setNotifications((prev) => [...prev, notification]);

    // Return the notification ID for programmatic dismissal
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for common notification types
  const success = useCallback(
    (title: string, message?: string, options?: Partial<ShowNotificationOptions>) => {
      return showNotification({
        type: 'success',
        title,
        message,
        duration: 4000,
        ...options,
      });
    },
    [showNotification]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<ShowNotificationOptions>) => {
      return showNotification({
        type: 'error',
        title,
        message,
        duration: 6000,
        ...options,
      });
    },
    [showNotification]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<ShowNotificationOptions>) => {
      return showNotification({
        type: 'warning',
        title,
        message,
        duration: 5000,
        ...options,
      });
    },
    [showNotification]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<ShowNotificationOptions>) => {
      return showNotification({
        type: 'info',
        title,
        message,
        duration: 4000,
        ...options,
      });
    },
    [showNotification]
  );

  const loading = useCallback(
    (title: string, message?: string) => {
      return showNotification({
        type: 'loading',
        title,
        message,
        dismissible: false,
      });
    },
    [showNotification]
  );

  // Promise-based notification for async operations
  const promise = useCallback(
    async <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      }
    ): Promise<T> => {
      const loadingId = loading(messages.loading);

      try {
        const result = await promise;
        dismissNotification(loadingId);

        const successMessage =
          typeof messages.success === 'function' ? messages.success(result) : messages.success;

        success(successMessage);
        return result;
      } catch (err) {
        dismissNotification(loadingId);

        const errorMessage = messages.error
          ? typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error
          : 'Đã xảy ra lỗi không mong muốn';

        error(errorMessage);
        throw err;
      }
    },
    [loading, dismissNotification, success, error]
  );

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
};
