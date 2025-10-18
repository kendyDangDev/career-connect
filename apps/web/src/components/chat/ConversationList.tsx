'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreVertical, MessageCircle, Users, Clock } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationListProps {
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ className }) => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    onlineUsers,
    isLoading,
    loadConversations,
  } = useChatContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DIRECT' | 'GROUP' | 'APPLICATION_RELATED'>(
    'ALL'
  );

  // Filter conversations based on search and type
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Type filter
      if (filterType !== 'ALL' && conv.type !== filterType) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        // Search in conversation name (for group/application conversations)
        const conversationName =
          conv.firstName && conv.lastName ? `${conv.firstName} ${conv.lastName}`.toLowerCase() : '';
        if (conversationName && conversationName.includes(query)) {
          return true;
        }

        // Search in participant names
        const participantMatch = conv.participants.some((p) => {
          const fullName =
            p.user.firstName && p.user.lastName
              ? `${p.user.firstName} ${p.user.lastName}`.toLowerCase()
              : '';
          return fullName.includes(query) || p.user.email.toLowerCase().includes(query);
        });
        if (participantMatch) {
          return true;
        }

        // Search in last message
        if (conv.messages.length > 0) {
          const lastMessage = conv.messages[0];
          if (lastMessage.content.toLowerCase().includes(query)) {
            return true;
          }
        }

        return false;
      }

      return true;
    });
  }, [conversations, searchQuery, filterType]);

  // Get conversation display info
  const getConversationInfo = (conversation: any) => {
    if (conversation.type === 'DIRECT') {
      // For direct messages, show the other participant
      const otherParticipant = conversation.participants.find(
        (p: any) => p.userId !== conversation.currentUserId
      );

      return {
        name:
          `${otherParticipant?.user?.firstName} ${otherParticipant?.user?.lastName}` ||
          'Unknown User',
        avatar: otherParticipant?.user?.avatarUrl,
        isOnline: onlineUsers.some((u) => u.userId === otherParticipant?.userId),
      };
    } else {
      // For group or application-related conversations
      return {
        name:
          `${conversation.firstName} ${conversation.lastName}` ||
          `${conversation.type.replace('_', ' ')} Chat`,
        avatar: null,
        isOnline: false,
      };
    }
  };

  // Format last message time
  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className={`flex h-full flex-col border-r bg-white ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={loadConversations}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['ALL', 'DIRECT', 'GROUP', 'APPLICATION_RELATED'].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type as any)}
              className="text-xs"
            >
              {type === 'APPLICATION_RELATED' ? 'Jobs' : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const info = getConversationInfo(conversation);
              const lastMessage = conversation.messages[0];
              const isActive = activeConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                    isActive ? 'border border-blue-200 bg-blue-50' : 'hover:bg-gray-50'
                  } `}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={info.avatar} />
                      <AvatarFallback>
                        {conversation.type === 'DIRECT' ? (
                          info.name.charAt(0).toUpperCase()
                        ) : conversation.type === 'GROUP' ? (
                          <Users className="h-6 w-6" />
                        ) : (
                          <MessageCircle className="h-6 w-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {info.isOnline && (
                      <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium">{info.name}</h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-gray-600">
                        {lastMessage ? (
                          <>
                            {lastMessage.type === 'SYSTEM' ? (
                              <span className="italic">{lastMessage.content}</span>
                            ) : lastMessage.type === 'IMAGE' ? (
                              <span className="flex items-center gap-1">📷 Image</span>
                            ) : lastMessage.type === 'FILE' ? (
                              <span className="flex items-center gap-1">📎 File</span>
                            ) : (
                              lastMessage.content
                            )}
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </p>

                      <div className="flex items-center gap-1">
                        {/* Unread count */}
                        {conversation._count?.messages > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation._count.messages}
                          </Badge>
                        )}

                        {/* Type indicator */}
                        {conversation.type === 'GROUP' && (
                          <Users className="h-3 w-3 text-gray-400" />
                        )}
                        {conversation.type === 'APPLICATION_RELATED' && (
                          <Clock className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mark as read</DropdownMenuItem>
                      <DropdownMenuItem>Pin conversation</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
