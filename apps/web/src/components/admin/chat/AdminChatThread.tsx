'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, BriefcaseBusiness, MessageSquare, UserRound, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/contexts/ChatContext';
import { AdminChatComposer } from './AdminChatComposer';
import { AdminChatMessageItem } from './AdminChatMessageItem';
import {
  AdminConversation,
  getConversationMeta,
  shouldShowDateDivider,
} from './admin-chat-helpers';

interface AdminChatThreadProps {
  activeConversation: AdminConversation | null;
  onBack?: () => void;
  className?: string;
}

export function AdminChatThread({
  activeConversation,
  onBack,
  className,
}: AdminChatThreadProps) {
  const { data: session } = useSession();
  const { messages, onlineUsers, typingUsers, isLoading } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meta = useMemo(() => {
    if (!activeConversation) {
      return null;
    }

    return getConversationMeta(activeConversation, session?.user?.id, onlineUsers);
  }, [activeConversation, onlineUsers, session?.user?.id]);

  const currentTypingUsers = useMemo(() => {
    if (!activeConversation) {
      return [];
    }

    return typingUsers.filter((user) => user.conversationId === activeConversation.id);
  }, [activeConversation, typingUsers]);

  if (!activeConversation || !meta) {
    return (
      <section
        className={cn(
          'flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_48%)] px-8 text-center',
          className
        )}
      >
        <div className="max-w-md rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-100 text-slate-500">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            Select a thread to review context
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Application and direct conversations will appear here with participant context,
            message history, and live reply tools.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Admin oversight</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Live inbox</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('flex h-full flex-col bg-white', className)}>
      <div className="border-b border-slate-200/80 bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {onBack ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="mt-0.5 h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}

            <Avatar className="h-12 w-12 rounded-2xl border border-slate-200">
              <AvatarImage src={meta.avatarUrl || undefined} />
              <AvatarFallback className="rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                {meta.avatarFallback}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                  {meta.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                    activeConversation.type === 'APPLICATION_RELATED'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : activeConversation.type === 'DIRECT'
                        ? 'border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-violet-200 bg-violet-50 text-violet-700'
                  )}
                >
                  {meta.typeLabel}
                </Badge>
                {meta.isOnline ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Online
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
            </div>
          </div>

          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
            {meta.participantCount} participants
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {activeConversation.type === 'APPLICATION_RELATED' ? (
            <>
              {meta.jobTitle ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <BriefcaseBusiness className="h-3 w-3" />
                  {meta.jobTitle}
                </span>
              ) : null}
              {meta.companyName ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {meta.companyName}
                </span>
              ) : null}
              {meta.candidateName ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  <UserRound className="h-3 w-3" />
                  {meta.candidateName}
                </span>
              ) : null}
            </>
          ) : activeConversation.type === 'GROUP' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <Users className="h-3 w-3" />
              {meta.supportingText}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {meta.supportingText}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 bg-[linear-gradient(180deg,rgba(248,250,252,0.8)_0%,rgba(255,255,255,0.95)_18%,rgba(248,250,252,0.95)_100%)] px-5 py-5">
        {isLoading ? (
          <div className="flex h-36 items-center justify-center">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
              Loading thread...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/90 px-8 text-center shadow-sm shadow-slate-200/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-slate-950">No replies in this thread yet</h4>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Use the composer below to send the first response and keep this conversation moving.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showSender =
                !previousMessage ||
                previousMessage.senderId !== message.senderId ||
                shouldShowDateDivider(message, previousMessage);
              const showTimestamp =
                !previousMessage ||
                new Date(message.createdAt).getTime() -
                  new Date(previousMessage.createdAt).getTime() >
                  1000 * 60 * 5;
              const showDateDivider = shouldShowDateDivider(message, previousMessage);

              return (
                <AdminChatMessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === session?.user?.id}
                  showSender={showSender}
                  showTimestamp={showTimestamp}
                  showDateDivider={showDateDivider}
                />
              );
            })}

            {currentTypingUsers.length > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm w-fit">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </span>
                <span>
                  {currentTypingUsers.length === 1
                    ? `${currentTypingUsers[0].userInfo.name} is typing`
                    : `${currentTypingUsers.length} people are typing`}
                </span>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <AdminChatComposer conversationId={activeConversation.id} />
    </section>
  );
}
