'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, MessageSquareOff } from 'lucide-react';

import { ConversationList } from '@/components/employer/messages/ConversationList';
import { MessageThread } from '@/components/employer/messages/MessageThread';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export default function CandidateChatPage() {
  const { data: session } = useSession();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    onlineUsers,
    initializeChat,
    isLoading,
  } = useChatContext();
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    initializeChat();
  }, []);

  const applicationRelatedConversations = useMemo(
    () => conversations.filter((conversation) => conversation.type === 'APPLICATION_RELATED'),
    [conversations]
  );

  const formattedConversations = useMemo(() => {
    return applicationRelatedConversations.map((conversation) => {
      const companyName =
        conversation.application?.job?.company?.companyName ||
        conversation.job?.company?.companyName ||
        'Cong ty';
      const companyLogo =
        conversation.application?.job?.company?.logoUrl ||
        conversation.job?.company?.logoUrl ||
        undefined;
      const jobTitle =
        conversation.application?.job?.title || conversation.job?.title || conversation.name || '';
      const lastMessage = conversation.messages?.[0];
      const isOnline = conversation.participants
        .filter((participant) => participant.userId !== session?.user?.id)
        .some((participant) => onlineUsers.some((user) => user.userId === participant.userId));

      return {
        id: conversation.id,
        firstName: companyName,
        lastName: '',
        avatarUrl: companyLogo,
        position: jobTitle,
        lastMessage: lastMessage?.content || 'Chua co tin nhan',
        timestamp: conversation.lastMessageAt
          ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
              locale: vi,
              addSuffix: true,
            })
          : '',
        unread: 0,
        online: isOnline,
      };
    });
  }, [applicationRelatedConversations, onlineUsers, session]);

  const formattedMessages = useMemo(() => {
    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      timestamp: formatDistanceToNow(new Date(message.createdAt), {
        locale: vi,
        addSuffix: true,
      }),
      isSent: message.senderId === session?.user?.id,
      status: 'read' as const,
    }));
  }, [messages, session]);

  const activeConvData = useMemo(() => {
    if (!activeConversation) return null;
    return formattedConversations.find((conversation) => conversation.id === activeConversation.id);
  }, [activeConversation, formattedConversations]);

  useEffect(() => {
    if (activeConvData && window.innerWidth < 768) {
      setShowList(false);
    }
  }, [activeConvData]);

  const handleSelectConversation = (conversationId: string) => {
    const conversation = applicationRelatedConversations.find(
      (item) => item.id === conversationId
    );

    if (!conversation) return;

    setActiveConversation(conversation);

    if (window.innerWidth < 768) {
      setShowList(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversation || !content.trim()) return;
    sendMessage(activeConversation.id, content.trim());
  };

  const activeThreadConversation = activeConvData
    ? {
        id: activeConvData.id,
        name: activeConvData.firstName,
        avatar: activeConvData.avatarUrl,
        position: activeConvData.position,
        online: activeConvData.online,
      }
    : null;

  return (
    <div className="mx-auto mt-16 flex h-[calc(100vh-4rem)] w-full max-w-7xl flex-col bg-slate-50 md:p-6 lg:flex-row lg:gap-6">
      <div
        className={cn('h-full flex-shrink-0 lg:w-96', showList ? 'block' : 'hidden lg:block')}
      >
        {isLoading && formattedConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-purple-100 bg-white shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <ConversationList
            conversations={formattedConversations}
            activeId={activeConversation?.id}
            onSelect={handleSelectConversation}
          />
        )}
      </div>

      <div
        className={cn(
          'min-w-0 flex-1 h-full transition-all',
          showList ? 'hidden lg:block' : 'block'
        )}
      >
        {activeConversation && activeThreadConversation ? (
          <div className="h-full overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-soft">
            <MessageThread
              conversation={activeThreadConversation}
              messages={formattedMessages}
              onSendMessage={handleSendMessage}
              onBack={() => setShowList(true)}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-purple-100 bg-white p-8 text-center shadow-soft">
            <div className="mb-4 rounded-full bg-purple-100 p-4">
              <MessageSquareOff className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Chua chon cuoc tro chuyen
            </h3>
            <p className="max-w-md text-slate-500">
              Chon mot cuoc hoi thoai tu danh sach ben trai hoac ung tuyen cong viec moi de bat
              dau trao doi voi nha tuyen dung.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
