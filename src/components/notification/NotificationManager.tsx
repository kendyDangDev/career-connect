'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationItem {
  id: string;
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

interface NotificationManagerProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    progressColor: 'bg-gradient-to-r from-emerald-400 to-green-500',
    glowColor: 'shadow-emerald-500/20',
    titleColor: 'text-emerald-950 dark:text-emerald-50',
    textColor: 'text-emerald-800 dark:text-emerald-100',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-rose-500/10 via-red-500/10 to-pink-500/10',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-500',
    progressColor: 'bg-gradient-to-r from-rose-400 to-red-500',
    glowColor: 'shadow-rose-500/20',
    titleColor: 'text-rose-950 dark:text-rose-50',
    textColor: 'text-rose-800 dark:text-rose-100',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    progressColor: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    glowColor: 'shadow-amber-500/20',
    titleColor: 'text-amber-950 dark:text-amber-50',
    textColor: 'text-amber-800 dark:text-amber-100',
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500',
    progressColor: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    glowColor: 'shadow-blue-500/20',
    titleColor: 'text-blue-950 dark:text-blue-50',
    textColor: 'text-blue-800 dark:text-blue-100',
  },
  loading: {
    icon: Loader2,
    bgColor: 'bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-500',
    progressColor: 'bg-gradient-to-r from-purple-400 to-violet-500',
    glowColor: 'shadow-purple-500/20',
    titleColor: 'text-purple-950 dark:text-purple-50',
    textColor: 'text-purple-800 dark:text-purple-100',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

const NotificationItem: React.FC<{
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const config = notificationConfig[notification.type];
  const Icon = config.icon;
  const duration = notification.duration || 5000;

  useEffect(() => {
    if (notification.type === 'loading') return;

    const interval = 50;
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          if (notification.dismissible !== false) {
            onDismiss(notification.id);
          }
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      }}
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-xl',
        'max-w-[420px] min-w-[320px]',
        'shadow-2xl',
        config.bgColor,
        config.borderColor,
        config.glowColor
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background gradient */}
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Sparkle effect for success notifications */}
      {notification.type === 'success' && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-4 w-4 text-yellow-400/50" />
        </motion.div>
      )}

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon with animation */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ rotate: notification.type === 'loading' ? 0 : -180, scale: 0 }}
              animate={{
                rotate: notification.type === 'loading' ? 360 : 0,
                scale: 1,
              }}
              transition={{
                rotate: {
                  duration: notification.type === 'loading' ? 2 : 0.5,
                  repeat: notification.type === 'loading' ? Infinity : 0,
                  ease: 'linear',
                },
                scale: { duration: 0.3 },
              }}
              className={cn('rounded-full p-2', 'bg-white/80 dark:bg-gray-900/80', 'shadow-lg')}
            >
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={cn('text-sm font-semibold tracking-tight', config.titleColor)}
            >
              {notification.title}
            </motion.h3>

            {notification.message && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn('mt-1 text-xs leading-relaxed', config.textColor)}
              >
                {notification.message}
              </motion.p>
            )}

            {/* Action button */}
            {notification.action && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={notification.action.onClick}
                className={cn(
                  'mt-2 text-xs font-medium',
                  'rounded-md px-3 py-1',
                  'bg-white/50 dark:bg-gray-900/50',
                  'hover:bg-white/70 dark:hover:bg-gray-900/70',
                  'transition-all duration-200',
                  'border border-white/20',
                  config.textColor
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {notification.action.label}
              </motion.button>
            )}
          </div>

          {/* Close button */}
          {notification.dismissible !== false && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => onDismiss(notification.id)}
              className={cn(
                'flex-shrink-0 rounded-lg p-1',
                'hover:bg-white/20 dark:hover:bg-gray-900/20',
                'transition-colors duration-200',
                'group'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X
                className={cn(
                  'h-4 w-4',
                  'text-gray-600 dark:text-gray-400',
                  'group-hover:text-gray-900 dark:group-hover:text-gray-100'
                )}
              />
            </motion.button>
          )}
        </div>

        {/* Progress bar */}
        {notification.type !== 'loading' && notification.dismissible !== false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 bottom-0 left-0 h-1 bg-black/5 dark:bg-white/5"
          >
            <motion.div
              className={cn('h-full', config.progressColor)}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
}) => {
  return (
    <div className={cn('pointer-events-none fixed z-[9999]', positionClasses[position])}>
      <div className="pointer-events-auto flex flex-col gap-3">
        <AnimatePresence mode="sync">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
