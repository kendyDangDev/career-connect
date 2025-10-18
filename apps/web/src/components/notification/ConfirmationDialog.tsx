'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ConfirmationType = 'warning' | 'danger' | 'info' | 'question';

export interface ConfirmationOptions {
  type?: ConfirmationType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onClose: () => void;
}

const confirmationConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-800',
    glowColor: 'shadow-amber-500/20',
  },
  danger: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    glowColor: 'shadow-red-500/20',
  },
  info: {
    icon: HelpCircle,
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    glowColor: 'shadow-blue-500/20',
  },
  question: {
    icon: HelpCircle,
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-900',
    textColor: 'text-purple-800',
    glowColor: 'shadow-purple-500/20',
  },
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  options,
  onClose,
}) => {
  if (!options) return null;

  const config = confirmationConfig[options.type || 'question'];
  const IconComponent = options.icon || config.icon;

  const handleConfirm = () => {
    options.onConfirm();
    onClose();
  };

  const handleCancel = () => {
    options.onCancel?.();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className={cn(
              'relative w-full max-w-md rounded-2xl border backdrop-blur-xl',
              'shadow-2xl',
              config.bgColor,
              config.borderColor,
              config.glowColor
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background gradient */}
            <div className="animate-shimmer absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 rounded-lg p-1 transition-colors duration-200 hover:bg-white/20"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </button>

              {/* Content */}
              <div className="pr-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className={cn('mb-4 inline-flex rounded-full p-3', 'bg-white/80 shadow-lg')}
                >
                  <IconComponent className={cn('h-6 w-6', config.iconColor)} />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn('mb-2 text-lg font-semibold', config.titleColor)}
                >
                  {options.title}
                </motion.h3>

                {/* Message */}
                {options.message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn('mb-6 text-sm leading-relaxed', config.textColor)}
                  >
                    {options.message}
                  </motion.p>
                )}

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-end gap-3"
                >
                  <Button variant="outline" onClick={handleCancel} className="min-w-[80px]">
                    {options.cancelText || 'Hủy'}
                  </Button>

                  <Button
                    onClick={handleConfirm}
                    variant={options.destructive ? 'destructive' : 'default'}
                    className="min-w-[80px]"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    {options.confirmText || 'Xác nhận'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
