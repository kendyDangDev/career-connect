'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { NotificationManager } from '@/components/notification/NotificationManager';
import {
  ConfirmationDialog,
  ConfirmationOptions,
} from '@/components/notification/ConfirmationDialog';
import { useNotification } from '@/hooks/useNotification';

type NotificationContextType = ReturnType<typeof useNotification> & {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const notification = useNotification();
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);
  const [confirmationResolver, setConfirmationResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationOptions(options);
      setConfirmationResolver(() => resolve);
    });
  };

  const handleConfirmationClose = () => {
    setConfirmationOptions(null);
    if (confirmationResolver) {
      confirmationResolver(false);
      setConfirmationResolver(null);
    }
  };

  const handleConfirm = () => {
    if (confirmationOptions && confirmationResolver) {
      confirmationOptions.onConfirm();
      confirmationResolver(true);
      setConfirmationOptions(null);
      setConfirmationResolver(null);
    }
  };

  const handleCancel = () => {
    if (confirmationOptions && confirmationResolver) {
      confirmationOptions.onCancel?.();
      confirmationResolver(false);
      setConfirmationOptions(null);
      setConfirmationResolver(null);
    }
  };

  const extendedNotification = {
    ...notification,
    confirm,
  };

  return (
    <NotificationContext.Provider value={extendedNotification}>
      {children}
      <NotificationManager
        notifications={notification.notifications}
        onDismiss={notification.dismissNotification}
        position={position}
      />
      <ConfirmationDialog
        isOpen={!!confirmationOptions}
        options={
          confirmationOptions
            ? {
                ...confirmationOptions,
                onConfirm: handleConfirm,
                onCancel: handleCancel,
              }
            : null
        }
        onClose={handleConfirmationClose}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Export common notification functions for easy access
export const notify = {
  success: (title: string, message?: string) => {
    const context = useContext(NotificationContext);
    return context?.success(title, message);
  },
  error: (title: string, message?: string) => {
    const context = useContext(NotificationContext);
    return context?.error(title, message);
  },
  warning: (title: string, message?: string) => {
    const context = useContext(NotificationContext);
    return context?.warning(title, message);
  },
  info: (title: string, message?: string) => {
    const context = useContext(NotificationContext);
    return context?.info(title, message);
  },
  loading: (title: string, message?: string) => {
    const context = useContext(NotificationContext);
    return context?.loading(title, message);
  },
};
