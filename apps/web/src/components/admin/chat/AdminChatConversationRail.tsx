'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { BriefcaseBusiness, MessageCircle, Search, UserRound } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/contexts/ChatContext';
import {
  AdminConversation,
  formatConversationTime,
  getConversationMeta,
  getConversationPreview,
} from './admin-chat-helpers';

type ConversationFilter = 'ALL' | 'UNREAD' | 'APPLICATION_RELATED' | 'DIRECT';

interface AdminChatConversationRailProps {
  onSelect: (conversation: AdminConversation) => void;
  className?: string;
}

const filterOptions: { label: string; value: ConversationFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Application', value: 'APPLICATION_RELATED' },
  { label: 'Direct', value: 'DIRECT' },
];

export function AdminChatConversationRail({
  onSelect,
  className,
}: AdminChatConversationRailProps) {
  const { data: session } = useSession();
  const {
    conversations,
    activeConversation,
    onlineUsers,
    isLoading,
  } = useChatContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('ALL');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const unreadMessageCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (filter === 'UNREAD' && (conversation.unreadCount ?? 0) === 0) {
        return false;
      }

      if (filter !== 'ALL' && filter !== 'UNREAD' && conversation.type !== filter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const meta = getConversationMeta(conversation, session?.user?.id, onlineUsers);
      const preview = getConversationPreview(conversation).toLowerCase();

      return [meta.title, meta.subtitle, meta.supportingText, preview]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [conversations, deferredSearchQuery, filter, onlineUsers, session?.user?.id]);

  const summaryLabel = useMemo(() => {
    if (conversations.length === 0) {
      return 'No active threads';
    }

    if (unreadMessageCount === 0) {
      return `${conversations.length} active threads`;
    }

    return `${conversations.length} threads - ${unreadMessageCount} unread`;
  }, [conversations.length, unreadMessageCount]);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200/80 bg-slate-50/85',
      className
      )}
    >
      <div className="border-b border-slate-200/80 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600">
          Admin inbox
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Inbox overview</h2>
        <p className="mt-1 text-sm text-slate-500">{summaryLabel}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Unread</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {unreadMessageCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Applications</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {conversations.filter((conversation) => conversation.type === 'APPLICATION_RELATED').length}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidate, company, or message"
            className="h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-sm shadow-slate-200/30"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isActive = filter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-300/40'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {isLoading && conversations.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/40"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                </div>
              ))
            : null}

          {!isLoading && filteredConversations.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm shadow-slate-200/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">No conversations found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Adjust filters or search for a different candidate, company, or thread.
              </p>
            </div>
          ) : null}

          {filteredConversations.map((conversation) => {
            const meta = getConversationMeta(conversation, session?.user?.id, onlineUsers);
            const unreadCount = conversation.unreadCount ?? 0;
            const isActive = activeConversation?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation)}
                className={cn(
                  'w-full rounded-[28px] border px-4 py-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-violet-200 bg-white shadow-lg shadow-violet-100/60'
                    : 'border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 hover:border-slate-300 hover:bg-white'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 rounded-2xl border border-slate-200">
                      <AvatarImage src={meta.avatarUrl || undefined} />
                      <AvatarFallback className="rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {meta.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    {meta.isOnline ? (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {meta.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                              conversation.type === 'APPLICATION_RELATED'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : conversation.type === 'DIRECT'
                                  ? 'border-slate-200 bg-slate-100 text-slate-600'
                                  : 'border-violet-200 bg-violet-50 text-violet-700'
                            )}
                          >
                            {meta.typeLabel}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{meta.subtitle}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {unreadCount > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        ) : null}
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatConversationTime(conversation.lastMessageAt || conversation.createdAt)}
                        </span>
                      </div>
                    </div>

                    {conversation.type === 'APPLICATION_RELATED' ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {meta.companyName ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            <BriefcaseBusiness className="h-3 w-3" />
                            {meta.companyName}
                          </span>
                        ) : null}
                        {meta.candidateName ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
                            <UserRound className="h-3 w-3" />
                            {meta.candidateName}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-3 truncate text-xs text-slate-500">{meta.supportingText}</p>
                    )}

                    <p
                      className={cn(
                        'mt-3 truncate text-sm',
                        unreadCount > 0 ? 'font-medium text-slate-900' : 'text-slate-500'
                      )}
                    >
                      {getConversationPreview(conversation)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
