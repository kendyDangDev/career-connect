'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Info, Search, ArrowLeft } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  className?: string;
  onBack?: () => void; // For mobile responsive
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ className, onBack }) => {
  const { data: session } = useSession();
  const { activeConversation, messages, onlineUsers, typingUsers, isLoading } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className={`flex h-full flex-col items-center justify-center bg-gray-50 ${className}`}>
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-medium text-gray-900">Welcome to Chat</h3>
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  // Get conversation info
  const getConversationInfo = () => {
    if (activeConversation.type === 'DIRECT') {
      const otherParticipant = activeConversation.participants.find(
        (p) => p.userId !== session?.user?.id
      );
      return {
        name:
          `${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}` ||
          'Unknown User',
        avatar: otherParticipant?.user.avatarUrl,
        isOnline: onlineUsers.some((u) => u.userId === otherParticipant?.userId),
        participantCount: 2,
      };
    } else {
      return {
        name:
          `${activeConversation.firstName} ${activeConversation.lastName}` ||
          `${activeConversation.type.replace('_', ' ')} Chat`,
        avatar: null,
        isOnline: false,
        participantCount: activeConversation.participants.length,
      };
    }
  };

  const conversationInfo = getConversationInfo();

  // Get typing users for this conversation
  const currentTypingUsers = typingUsers.filter((u) => u.conversationId === activeConversation.id);

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <Button size="sm" variant="ghost" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Avatar and info */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversationInfo.avatar || undefined} />
              <AvatarFallback>{conversationInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {conversationInfo.isOnline && (
              <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{conversationInfo.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {conversationInfo.isOnline ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span>Offline</span>
              )}
              {activeConversation.type !== 'DIRECT' && (
                <>
                  <span>•</span>
                  <span>{conversationInfo.participantCount} members</span>
                </>
              )}
              {currentTypingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">
                    {currentTypingUsers.length === 1
                      ? `${currentTypingUsers[0].userInfo.name} is typing...`
                      : `${currentTypingUsers.length} people are typing...`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsSearching(!isSearching)}>
            <Search className="h-4 w-4" />
          </Button>

          {activeConversation.type === 'DIRECT' && (
            <>
              <Button size="sm" variant="ghost">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                Conversation info
              </DropdownMenuItem>
              <DropdownMenuItem>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Export conversation</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search bar (conditional) */}
      {isSearching && (
        <div className="border-b bg-gray-50 p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No messages yet</p>
            <p className="mt-1 text-xs text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showSender = !prevMessage || prevMessage.senderId !== message.senderId;
              const showTimestamp =
                !prevMessage ||
                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() >
                  300000; // 5 minutes

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

            {/* Typing indicators */}
            {currentTypingUsers.length > 0 && (
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
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-white">
        <MessageInput conversationId={activeConversation.id} />
      </div>
    </div>
  );
};
