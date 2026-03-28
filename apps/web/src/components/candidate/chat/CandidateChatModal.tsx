'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, SendHorizonal, X } from 'lucide-react';
import * as SheetPrimitive from '@radix-ui/react-dialog';

import { MessageInput } from '@/components/chat/MessageInput';
import { MessageItem } from '@/components/chat/MessageItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface CandidateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getConversationTitle(conversation: any) {
  return (
    conversation?.name ||
    conversation?.application?.job?.title ||
    conversation?.job?.title ||
    'Tin nhan ung tuyen'
  );
}

function getCompanyName(conversation: any) {
  return (
    conversation?.application?.job?.company?.companyName ||
    conversation?.job?.company?.companyName ||
    'Nha tuyen dung'
  );
}

function getCompanyLogo(conversation: any) {
  return (
    conversation?.application?.job?.company?.logoUrl || conversation?.job?.company?.logoUrl || null
  );
}

const CandidateChatContent = ({ onClose }: { onClose: () => void }) => {
  const { data: session } = useSession();
  const { activeConversation, initializeChat, isLoading, messages, typingUsers } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.id, messages]);

  if (!activeConversation) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-purple-500/5 to-blue-500/5 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">Trao đổi với công ty</h3>

          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-500/10">
            <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <p className="text-sm text-slate-500">
              Không tìm thấy cuộc trò chuyện để gửi tin nhắn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const conversationTitle = getConversationTitle(activeConversation);
  const companyName = getCompanyName(activeConversation);
  const companyLogo = getCompanyLogo(activeConversation);
  const currentTypingUsers = typingUsers.filter(
    (typingUser) => typingUser.conversationId === activeConversation.id
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-purple-500/5 to-blue-500/5 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">Trao đổi với công ty</h3>
          <p className="truncate text-sm text-slate-500">{companyName}</p>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-500/10">
          <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
        </Button>
      </div>

      <div className="border-b bg-slate-50/80 px-4 py-4">
        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-100 text-purple-700">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{companyName}</p>
              <p className="text-sm text-slate-500">
                Gửi tin nhắn trực tiếp đến nhà tuyển dụng cho hồ sơ này.
              </p>
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                <SendHorizonal className="h-3.5 w-3.5" />
                <span className="truncate">{conversationTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-slate-50/70 px-4 py-5">
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full min-h-48 items-center justify-center">
            <p className="text-sm text-slate-500">Đang tải nội dung cuộc trò chuyện...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-48 items-center justify-center">
            <div className="rounded-3xl border border-dashed border-purple-200 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-900">Chưa có tin nhắn nào</p>
              <p className="mt-2 text-sm text-slate-500">
                Hãy gửi tin nhắn đầu tiên cho {companyName}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showSender = !previousMessage || previousMessage.senderId !== message.senderId;
              const showTimestamp =
                !previousMessage ||
                new Date(message.createdAt).getTime() -
                  new Date(previousMessage.createdAt).getTime() >
                  300000;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  showSender={showSender}
                  showTimestamp={showTimestamp}
                  isOwn={message.senderId === session?.user?.id}
                />
              );
            })}

            {currentTypingUsers.length > 0 ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex space-x-1">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-xs text-gray-500">
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

      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium text-slate-900">Soạn tin nhắn</p>
            <p className="mt-1 text-xs text-slate-500">
              Tin nhắn sẽ được gửi vào cuộc trò chuyện với{' '}
              <span className="text-base font-semibold text-slate-800">{companyName}</span>
            </p>
          </div>

          <MessageInput conversationId={activeConversation.id} className={cn('p-4')} />
        </div>
      </div>
    </div>
  );
};

export function CandidateChatModal({ isOpen, onClose }: CandidateChatModalProps) {
  const [width, setWidth] = useState('42rem');

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 640) {
        setWidth('100%');
      } else if (window.innerWidth < 1024) {
        setWidth('34rem');
      } else if (window.innerWidth < 1536) {
        setWidth('40rem');
      } else {
        setWidth('42rem');
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
        <SheetPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
        <SheetPrimitive.Content
          className={cn(
            'bg-background fixed inset-y-0 right-0 z-50 h-full border-l border-purple-200/50 p-0 shadow-2xl shadow-purple-500/10',
            'data-[state=closed]:animate-out data-[state=open]:animate-in',
            'data-[state=closed]:duration-300 data-[state=open]:duration-500',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'sm:max-w-none'
          )}
          style={{ width }}
        >
          <CandidateChatContent onClose={onClose} />
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
