import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Conversation } from '@/types/chat.types';
import UserAvatar from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  isOnline?: boolean;
  currentUserId?: string;
  locale?: 'vi' | 'en';
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  isOnline = false,
  currentUserId,
  locale = 'vi',
}) => {
  const getConversationName = () => {
    if (conversation.name) return conversation.name;
    
    // For direct conversations, show the other participant's name
    if (conversation.type === 'DIRECT' && conversation.participants.length > 0) {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      if (otherParticipant?.user) {
        return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }
    
    return 'Cuộc trò chuyện';
  };

  const getOtherUser = () => {
    if (conversation.type === 'DIRECT' && conversation.participants.length > 0) {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      return otherParticipant?.user;
    }
    return undefined;
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    
    const { content, sender, messageType } = conversation.lastMessage;
    const isCurrentUser = sender.id === currentUserId;
    const prefix = isCurrentUser ? 'Bạn: ' : '';
    
    switch (messageType) {
      case 'IMAGE':
        return `${prefix}📷 Hình ảnh`;
      case 'FILE':
        return `${prefix}📎 Tệp đính kèm`;
      case 'AUDIO':
        return `${prefix}🎵 Tin nhắn thoại`;
      default:
        return `${prefix}${content}`;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: false,
        locale: locale === 'vi' ? vi : enUS,
      });
    } catch (error) {
      return '';
    }
  };

  const getConversationIcon = () => {
    switch (conversation.type) {
      case 'GROUP':
        return <Ionicons name="people" size={20} color="#6B7280" />;
      case 'APPLICATION_RELATED':
        return <Ionicons name="briefcase" size={20} color="#2563EB" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="mr-3">
        <UserAvatar
          user={getOtherUser()}
          size="medium"
          isOnline={isOnline}
          showOnlineIndicator={conversation.type === 'DIRECT'}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text
            className={`flex-1 text-base ${
              conversation.unreadCount > 0 ? 'font-semibold' : 'font-normal'
            } text-gray-900`}
            numberOfLines={1}
          >
            {getConversationName()}
          </Text>
          
          <View className="flex-row items-center ml-2">
            {getConversationIcon()}
            {conversation.lastMessageAt && (
              <Text className="text-xs text-gray-500 ml-2">
                {formatTime(conversation.lastMessageAt)}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <Text
            className={`flex-1 text-sm ${
              conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
            }`}
            numberOfLines={1}
          >
            {getLastMessagePreview()}
          </Text>
          
          {conversation.unreadCount > 0 && (
            <View className="bg-blue-500 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center ml-2">
              <Text className="text-white text-xs font-semibold">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationItem;