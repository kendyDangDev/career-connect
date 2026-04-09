'use client';

import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2, RefreshCw, X } from 'lucide-react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/contexts/ChatContext';
import { AdminChatConversationRail } from './AdminChatConversationRail';
import { AdminChatThread } from './AdminChatThread';
import { AdminConversation } from './admin-chat-helpers';

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MobileView = 'rail' | 'thread';

function AdminChatDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    initializeChat,
    loadConversations,
    isChatEnabled,
    isConnected,
    isLoading,
  } = useChatContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('rail');
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const syncViewport = () => setViewportWidth(window.innerWidth);

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const isMobile = viewportWidth > 0 ? viewportWidth < 768 : true;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!isChatEnabled) {
      initializeChat();
    }

    void loadConversations();

    if (isMobile) {
      setMobileView('rail');
    }
  }, [initializeChat, isChatEnabled, isMobile, isOpen, loadConversations]);

  const unreadMessageCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations]
  );

  const drawerWidth = useMemo(() => {
    if (isMobile || viewportWidth === 0) {
      return '100vw';
    }

    if (isExpanded) {
      return viewportWidth < 1440 ? 'min(96vw, 82rem)' : 'min(96vw, 94rem)';
    }

    return viewportWidth < 1280 ? 'min(94vw, 68rem)' : 'min(92vw, 82rem)';
  }, [isExpanded, isMobile, viewportWidth]);

  const statusLabel = useMemo(() => {
    if (!isChatEnabled) {
      return 'Inbox standby';
    }

    if (!isConnected) {
      return 'Connecting to live inbox';
    }

    if (conversations.length === 0) {
      return 'Live inbox ready';
    }

    if (unreadMessageCount === 0) {
      return `${conversations.length} live threads`;
    }

    return `${unreadMessageCount} unread messages across ${conversations.length} threads`;
  }, [conversations.length, isChatEnabled, isConnected, unreadMessageCount]);

  const handleSelectConversation = (conversation: AdminConversation) => {
    setActiveConversation(conversation);

    if (isMobile) {
      setMobileView('thread');
    }
  };

  return (
    <div className="ml-auto h-full pointer-events-auto" style={{ width: drawerWidth, maxWidth: drawerWidth }}>
      <div className="relative flex h-full flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_34%),radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_24%)]" />

        <div className="relative border-b border-slate-200/80 bg-white/92 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600">
                Executive Ops
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Message command center
              </h2>
              <p className="mt-1 text-sm text-slate-500">{statusLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void loadConversations()}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                aria-label="Refresh inbox"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>

              {!isMobile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded((value) => !value)}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  aria-label={isExpanded ? 'Collapse drawer' : 'Expand drawer'}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1">
          <div
            className={cn(
              'min-h-0 shrink-0',
              isMobile ? (mobileView === 'rail' ? 'flex w-full' : 'hidden') : 'flex w-[23rem] xl:w-[26rem]'
            )}
          >
            <AdminChatConversationRail onSelect={handleSelectConversation} className="w-full" />
          </div>

          <div
            className={cn(
              'min-h-0 min-w-0 flex-1',
              isMobile ? (mobileView === 'thread' ? 'flex' : 'hidden') : 'flex'
            )}
          >
            <AdminChatThread
              activeConversation={activeConversation}
              onBack={isMobile ? () => setMobileView('rail') : undefined}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminChatModal({ isOpen, onClose }: AdminChatModalProps) {
  return (
    <SheetPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <SheetPrimitive.Content
          className={cn(
            'fixed inset-0 z-50 p-0 outline-none pointer-events-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        >
          <AdminChatDrawer isOpen={isOpen} onClose={onClose} />
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
