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

type ChatConversation = ReturnType<typeof useChatContext>['conversations'][number];
type ResolvedConversation = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  position?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
};

function getOtherParticipant(conversation: ChatConversation, currentUserId?: string) {
  return conversation.participants.find((participant) => participant.userId !== currentUserId);
}

function getDirectConversationIdentity(conversation: ChatConversation, currentUserId?: string) {
  const otherParticipant = getOtherParticipant(conversation, currentUserId);
  const firstName = otherParticipant?.user?.firstName?.trim() || '';
  const lastName = otherParticipant?.user?.lastName?.trim() || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const emailPrefix = otherParticipant?.user?.email?.split('@')[0]?.trim() || '';
  const fallbackName = fullName || emailPrefix || 'Nhà tuyển dụng';

  return {
    name: fallbackName,
    firstName: fullName ? firstName : fallbackName,
    lastName: fullName ? lastName : '',
    avatarUrl: otherParticipant?.user?.avatarUrl || undefined,
  };
}

function getApplicationConversationIdentity(conversation: ChatConversation) {
  const companyName =
    conversation.application?.job?.company?.companyName ||
    conversation.job?.company?.companyName ||
    'Công ty';
  const companyLogo =
    conversation.application?.job?.company?.logoUrl ||
    conversation.job?.company?.logoUrl ||
    undefined;
  const jobTitle =
    conversation.application?.job?.title || conversation.job?.title || conversation.name || '';

  return {
    name: companyName,
    firstName: companyName,
    lastName: '',
    avatarUrl: companyLogo,
    position: jobTitle || undefined,
  };
}

function resolveConversation(
  conversation: ChatConversation,
  currentUserId: string | undefined,
  onlineUsers: ReturnType<typeof useChatContext>['onlineUsers']
): ResolvedConversation {
  const identity =
    conversation.type === 'DIRECT'
      ? getDirectConversationIdentity(conversation, currentUserId)
      : getApplicationConversationIdentity(conversation);
  const lastMessage = conversation.messages?.[0];
  const online = conversation.participants
    .filter((participant) => participant.userId !== currentUserId)
    .some((participant) => onlineUsers.some((user) => user.userId === participant.userId));

  return {
    id: conversation.id,
    ...identity,
    lastMessage: lastMessage?.content || 'Chưa có tin nhắn',
    timestamp: conversation.lastMessageAt
      ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
          locale: vi,
          addSuffix: true,
        })
      : '',
    unread: 0,
    online,
  };
}

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

  const formattedConversations = useMemo(() => {
    return conversations.map((conversation) =>
      resolveConversation(conversation, session?.user?.id, onlineUsers)
    );
  }, [conversations, onlineUsers, session]);

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
    const conversation = conversations.find((item) => item.id === conversationId);

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
        name: activeConvData.name,
        avatar: activeConvData.avatarUrl,
        position: activeConvData.position,
        online: activeConvData.online,
      }
    : null;

  return (
    <div className="mx-auto mt-16 flex h-[calc(100vh-4rem)] w-full max-w-7xl flex-col bg-slate-50 md:p-6 lg:flex-row lg:gap-6">
      <div className={cn('h-full flex-shrink-0 lg:w-96', showList ? 'block' : 'hidden lg:block')}>
        {isLoading && formattedConversations.length === 0 ? (
          <div className="shadow-soft flex h-full items-center justify-center rounded-xl border border-purple-100 bg-white">
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
          'h-full min-w-0 flex-1 transition-all',
          showList ? 'hidden lg:block' : 'block'
        )}
      >
        {activeConversation && activeThreadConversation ? (
          <div className="shadow-soft h-full overflow-hidden rounded-2xl border border-purple-100 bg-white">
            <MessageThread
              conversation={activeThreadConversation}
              messages={formattedMessages}
              onSendMessage={handleSendMessage}
              onBack={() => setShowList(true)}
            />
          </div>
        ) : (
          <div className="shadow-soft flex h-full flex-col items-center justify-center rounded-2xl border border-purple-100 bg-white p-8 text-center">
            <div className="mb-4 rounded-full bg-purple-100 p-4">
              <MessageSquareOff className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Chưa chọn cuộc trò chuyện</h3>
            <p className="max-w-md text-slate-500">
              Chọn một cuộc hội thoại từ danh sách bên trái hoặc ứng tuyển công việc mới để bắt đầu
              trao đổi với nhà tuyển dụng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
