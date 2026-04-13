'use client';

import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCheck,
  CircleAlert,
  CircleCheckBig,
  Eye,
  FileUser,
  Loader2,
  MessageCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PANEL_LIMIT = 8;
const CLOSE_DELAY_MS = 120;

type NotificationKind =
  | 'APPLICATION_STATUS'
  | 'NEW_JOB_MATCH'
  | 'MESSAGE'
  | 'SYSTEM'
  | 'COMPANY_NEW_JOB'
  | 'CV_VIEWED';

interface NotificationItem {
  id: string;
  type: NotificationKind;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

interface CandidateNotificationBellProps {
  solid: boolean;
  shouldClose: boolean;
  onOpen: () => void;
}

interface NotificationVisualMeta {
  icon: ComponentType<{ className?: string }>;
  label: string;
  wrapperClassName: string;
  iconClassName: string;
}

function formatNotificationTimestamp(createdAt: string) {
  return formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
}

function getEffectiveNotificationKind(notification: NotificationItem): NotificationKind {
  if (
    notification.data &&
    typeof notification.data === 'object' &&
    !Array.isArray(notification.data)
  ) {
    const notificationKind = notification.data.notificationKind;
    if (notificationKind === 'COMPANY_NEW_JOB') {
      return 'COMPANY_NEW_JOB';
    }
    if (notificationKind === 'CV_VIEWED') {
      return 'CV_VIEWED';
    }
  }

  return notification.type;
}

function getNotificationHref(notification: NotificationItem) {
  const notificationKind = getEffectiveNotificationKind(notification);

  if (
    notification.data &&
    typeof notification.data === 'object' &&
    !Array.isArray(notification.data)
  ) {
    const url = notification.data.url;
    if (typeof url === 'string' && url.length > 0) {
      return url;
    }
  }

  if (notificationKind === 'MESSAGE') {
    return '/candidate/chat';
  }

  return null;
}

function getNotificationVisualMeta(notification: NotificationItem): NotificationVisualMeta {
  const notificationKind = getEffectiveNotificationKind(notification);
  const content = `${notification.title} ${notification.message}`.toLowerCase();

  if (notificationKind === 'MESSAGE') {
    return {
      icon: MessageCircle,
      label: 'Tin nhắn',
      wrapperClassName: 'bg-sky-100',
      iconClassName: 'text-sky-700',
    };
  }

  if (notificationKind === 'NEW_JOB_MATCH') {
    return {
      icon: Sparkles,
      label: 'Phù hợp',
      wrapperClassName: 'bg-fuchsia-100',
      iconClassName: 'text-fuchsia-700',
    };
  }

  if (notificationKind === 'COMPANY_NEW_JOB') {
    return {
      icon: Building2,
      label: 'Công ty theo dõi',
      wrapperClassName: 'bg-violet-100',
      iconClassName: 'text-violet-700',
    };
  }

  if (notificationKind === 'CV_VIEWED') {
    return {
      icon: Eye,
      label: 'CV đã xem',
      wrapperClassName: 'bg-emerald-100',
      iconClassName: 'text-emerald-700',
    };
  }

  if (notificationKind === 'APPLICATION_STATUS') {
    if (
      content.includes('offer') ||
      content.includes('trúng tuyển') ||
      content.includes('nhận việc') ||
      content.includes('hired')
    ) {
      return {
        icon: CircleCheckBig,
        label: 'Kết quả tốt',
        wrapperClassName: 'bg-emerald-100',
        iconClassName: 'text-emerald-700',
      };
    }

    if (content.includes('phỏng vấn') || content.includes('interview')) {
      return {
        icon: CalendarClock,
        label: 'Phỏng vấn',
        wrapperClassName: 'bg-amber-100',
        iconClassName: 'text-amber-700',
      };
    }

    if (content.includes('từ chối') || content.includes('rejected')) {
      return {
        icon: XCircle,
        label: 'Cập nhật hồ sơ',
        wrapperClassName: 'bg-rose-100',
        iconClassName: 'text-rose-700',
      };
    }

    return {
      icon: FileUser,
      label: 'Hồ sơ ứng tuyển',
      wrapperClassName: 'bg-indigo-100',
      iconClassName: 'text-indigo-700',
    };
  }

  if (notificationKind === 'SYSTEM') {
    return {
      icon: CircleAlert,
      label: 'Hệ thống',
      wrapperClassName: 'bg-orange-100',
      iconClassName: 'text-orange-700',
    };
  }

  return {
    icon: BriefcaseBusiness,
    label: 'Thông báo',
    wrapperClassName: 'bg-purple-100',
    iconClassName: 'text-purple-700',
  };
}

export function CandidateNotificationBell({
  solid,
  shouldClose,
  onOpen,
}: CandidateNotificationBellProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [isPanelRefreshing, setIsPanelRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [hasLoadedPanel, setHasLoadedPanel] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const badgeLabel = useMemo(() => {
    if (unreadCount <= 0) {
      return null;
    }

    return unreadCount > 9 ? '9+' : String(unreadCount);
  }, [unreadCount]);
  const hasUnread = unreadCount > 0;
  const triggerActive = isOpen;

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closePanel = useCallback(() => {
    clearCloseTimeout();
    setIsOpen(false);
    setIsPinnedOpen(false);
  }, [clearCloseTimeout]);

  const loadUnreadSummary = useCallback(async () => {
    setIsSummaryLoading(true);

    try {
      const response = await fetch('/api/notifications?limit=1', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification summary');
      }

      const data = (await response.json()) as NotificationResponse;
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error('Failed to fetch notification summary:', error);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadPanelNotifications = useCallback(async (showLoading = false) => {
    setPanelError(null);

    if (showLoading) {
      setIsPanelLoading(true);
    } else {
      setIsPanelRefreshing(true);
    }

    try {
      const response = await fetch(`/api/notifications?limit=${PANEL_LIMIT}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = (await response.json()) as NotificationResponse;
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setHasLoadedPanel(true);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setPanelError('Không thể tải thông báo lúc này.');
    } finally {
      setIsPanelLoading(false);
      setIsPanelRefreshing(false);
    }
  }, []);

  const openPanel = useCallback(
    (pin = false) => {
      clearCloseTimeout();

      if (!isOpen) {
        onOpen();
        setIsOpen(true);
        setIsPinnedOpen(pin);
        void loadPanelNotifications(!hasLoadedPanel);
        return;
      }

      if (pin) {
        onOpen();
        setIsPinnedOpen(true);
      }
    },
    [clearCloseTimeout, hasLoadedPanel, isOpen, loadPanelNotifications, onOpen]
  );

  const queueClose = useCallback(() => {
    if (isPinnedOpen) {
      return;
    }

    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsPinnedOpen(false);
      closeTimeoutRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimeout, isPinnedOpen]);

  const markNotificationIdsAsRead = useCallback(async (notificationIds: string[]) => {
    if (notificationIds.length === 0) {
      return;
    }

    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read');
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    if (isMarkingAll || unreadCount === 0) {
      return;
    }

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setIsMarkingAll(true);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
    setUnreadCount(0);

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAll: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error('Không thể đánh dấu tất cả đã đọc.');
    } finally {
      setIsMarkingAll(false);
    }
  }, [isMarkingAll, notifications, unreadCount]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationItem) => {
      const href = getNotificationHref(notification);
      if (!href) {
        return;
      }

      if (!notification.isRead) {
        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification.id === notification.id
              ? { ...currentNotification, isRead: true }
              : currentNotification
          )
        );
        setUnreadCount((currentUnreadCount) => Math.max(0, currentUnreadCount - 1));

        try {
          await markNotificationIdsAsRead([notification.id]);
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          toast.error('Không thể cập nhật trạng thái thông báo.');
        }
      }

      closePanel();
      router.push(href);
    },
    [closePanel, markNotificationIdsAsRead, router]
  );

  useEffect(() => {
    void loadUnreadSummary();
  }, [loadUnreadSummary]);

  useEffect(() => {
    if (!shouldClose) {
      return;
    }

    closePanel();
  }, [closePanel, shouldClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closePanel, isOpen]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  return (
    <div
      ref={rootRef}
      className="relative z-20"
      onMouseEnter={() => openPanel(false)}
      onMouseLeave={queueClose}
    >
      {hasUnread && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 rounded-[1.15rem] blur-xl transition-opacity duration-300',
            triggerActive ? 'opacity-100' : 'opacity-65',
            solid ? 'bg-purple-200/70' : 'bg-purple-500/35'
          )}
        />
      )}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Thông báo"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isOpen && isPinnedOpen) {
            closePanel();
            return;
          }

          openPanel(true);
        }}
        className={cn(
          'group relative isolate rounded-2xl p-2.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:outline-none',
          'before:absolute before:inset-0 before:-z-10 before:rounded-[1.05rem] before:transition before:duration-300',
          triggerActive
            ? solid
              ? 'shadow-lg ring-1 shadow-purple-200/50 ring-purple-200/80 before:bg-gradient-to-br before:from-purple-100 before:via-fuchsia-50 before:to-white'
              : 'shadow-lg ring-1 shadow-black/25 ring-white/20 backdrop-blur-md before:bg-white/16'
            : solid
              ? 'before:bg-transparent hover:shadow-md hover:ring-1 hover:shadow-purple-100/70 hover:ring-purple-100/80 hover:before:bg-purple-50/90'
              : 'before:bg-transparent hover:ring-1 hover:ring-white/15 hover:before:bg-white/12'
        )}
      >
        <Bell
          className={cn(
            'h-5 w-5 transition-all duration-300 group-hover:scale-105',
            triggerActive ? 'text-purple-600' : solid ? 'text-gray-600' : 'text-white'
          )}
        />

        {!isSummaryLoading && badgeLabel && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white shadow-lg shadow-purple-400/30">
            {badgeLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.85rem)] right-0 z-50 w-[24rem] max-w-[calc(100vw-1.5rem)]">
          <div
            aria-hidden="true"
            className="absolute -top-2 right-5 h-4 w-4 rotate-45 rounded-[5px] border-t border-l border-purple-100/80 bg-white/95 shadow-sm"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-purple-100/70 bg-white/95 shadow-2xl shadow-purple-200/30 backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-sky-500/10"
            />
            <div className="relative flex items-start justify-between border-b border-purple-50/90 px-5 pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm',
                    hasUnread
                      ? 'border-purple-200/80 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-white text-purple-600 shadow-purple-200/40'
                      : 'border-gray-200 bg-white text-gray-500'
                  )}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Thông báo</p>
                  <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-purple-100/80 bg-white/80 px-2.5 text-[11px] font-medium text-gray-500">
                    <span
                      className={cn(
                        'inline-flex h-1.5 w-1.5 rounded-full',
                        hasUnread ? 'bg-purple-500' : 'bg-emerald-500'
                      )}
                    />
                    {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Bạn đã xem hết thông báo'}
                  </p>
                </div>
              </div>

              {(isPanelRefreshing || isPanelLoading) && (
                <div className="mt-1 rounded-full border border-purple-100 bg-white/80 p-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                </div>
              )}
            </div>

            {isPanelLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : panelError ? (
              <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <p className="mt-3 text-sm font-medium text-gray-900">{panelError}</p>
                <button
                  type="button"
                  onClick={() => void loadPanelNotifications(false)}
                  className="mt-4 rounded-full border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50"
                >
                  Thử lại
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                <Bell className="h-8 w-8 text-purple-300" />
                <p className="mt-3 text-sm font-medium text-gray-900">Chưa có thông báo nào</p>
                <p className="mt-1 text-xs text-gray-500">
                  Thông báo mới sẽ xuất hiện tại đây khi có cập nhật.
                </p>
              </div>
            ) : (
              <div className="max-h-[26rem] space-y-2 overflow-y-auto px-2 py-2">
                {notifications.map((notification) => {
                  const href = getNotificationHref(notification);
                  const visualMeta = getNotificationVisualMeta(notification);
                  const Icon = visualMeta.icon;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      disabled={!href}
                      onClick={() => void handleNotificationClick(notification)}
                      className={cn(
                        'flex w-full gap-3 rounded-2xl px-3 py-1 text-left transition',
                        href ? 'hover:bg-purple-50/70' : 'cursor-default',
                        notification.isRead ? 'bg-transparent' : 'bg-purple-50/60'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl',
                          notification.isRead
                            ? 'bg-gray-100 text-gray-500'
                            : visualMeta.wrapperClassName
                        )}
                        title={visualMeta.label}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            notification.isRead ? 'text-gray-500' : visualMeta.iconClassName
                          )}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'mt-1 line-clamp-1 text-sm font-medium',
                                notification.isRead ? 'text-gray-800' : 'text-gray-900'
                              )}
                            >
                              {notification.title}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-purple-500" />
                          )}
                        </div>

                        <p className="line-clamp-2 text-sm text-gray-600">{notification.message}</p>

                        <p className="text-xs text-gray-400">
                          {formatNotificationTimestamp(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t border-purple-50 px-5 py-3">
              <button
                type="button"
                disabled={unreadCount === 0 || isMarkingAll}
                onClick={() => void handleMarkAllAsRead()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full text-sm font-medium transition',
                  unreadCount === 0 || isMarkingAll
                    ? 'cursor-not-allowed text-gray-300'
                    : 'text-purple-700 hover:text-purple-800'
                )}
              >
                {isMarkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
