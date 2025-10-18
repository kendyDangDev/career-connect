'use client';

import { useEffect, useMemo } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useChatContext } from '@/contexts/ChatContext';
import { ConversationList } from '@/components/employer/messages/ConversationList';
import { MessageThread } from '@/components/employer/messages/MessageThread';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function MessagesPage() {
  const { data: session } = useSession();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    onlineUsers,
    isLoading,
    isConnected,
    initializeChat,
    disconnectChat,
  } = useChatContext();

  // Initialize chat on mount, cleanup on unmount
  useEffect(() => {
    initializeChat();

    return () => {
      // Optionally disconnect when leaving messages page
      // Uncomment if you want to disconnect immediately
      // disconnectChat();
    };
  }, []);

  // Transform conversations for ConversationList component
  const formattedConversations = useMemo(() => {
    return conversations.map((conv) => {
      // Get other participant (not current user)
      const otherParticipant = conv.participants.find((p) => p.userId !== session?.user?.id);

      const lastMessage = conv.messages?.[0];
      const isOnline = onlineUsers.some((u) => u.userId === otherParticipant?.userId);

      // Split name into first and last name
      // const fullName = otherParticipant?.user?.name || '';
      // const nameParts = fullName.trim().split(' ');
      const firstName = otherParticipant?.user?.firstName || '';
      const lastName = otherParticipant?.user?.lastName || '';

      return {
        id: conv.id,
        firstName,
        lastName,
        avatarUrl: otherParticipant?.user?.avatarUrl || undefined,
        lastMessage: lastMessage?.content || 'Chưa có tin nhắn',
        timestamp: conv.lastMessageAt
          ? formatDistanceToNow(new Date(conv.lastMessageAt), {
              locale: vi,
              addSuffix: true,
            })
          : '',
        unread: 0, // TODO: Implement unread count
        online: isOnline,
        position: undefined, // TODO: Get position from user profile if needed
      };
    });
  }, [conversations, onlineUsers, session]);

  // Transform messages for MessageThread component
  const formattedMessages = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      timestamp: formatDistanceToNow(new Date(msg.createdAt), {
        locale: vi,
        addSuffix: true,
      }),
      isSent: msg.senderId === session?.user?.id,
      status: 'read' as const, // TODO: Implement read status
    }));
  }, [messages, session]);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversation || !content.trim()) return;
    sendMessage(activeConversation.id, content.trim());
  };

  // Get active conversation data
  const activeConvData = useMemo(() => {
    if (!activeConversation) return null;

    const otherParticipant = activeConversation.participants.find(
      (p) => p.userId !== session?.user?.id
    );

    const isOnline = onlineUsers.some((u) => u.userId === otherParticipant?.userId);

    return {
      id: activeConversation.id,
      name:
        `${otherParticipant?.user?.firstName} ${otherParticipant?.user?.lastName}` ||
        'Unknown User',
      avatar: otherParticipant?.user?.avatarUrl || undefined,
      position: undefined, // TODO: Get position from user profile
      online: isOnline,
    };
  }, [activeConversation, onlineUsers, session]);

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col">
      {/* Header */}

      {/* Chat Interface */}
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <div className="h-full min-h-0 lg:col-span-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white">
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

        {/* Message Thread */}
        <div className="h-full min-h-0 lg:col-span-2">
          {activeConvData ? (
            <MessageThread
              conversation={activeConvData}
              messages={formattedMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
