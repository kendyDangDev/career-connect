import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Message } from '@/types/chat.types';
import UserAvatar from './UserAvatar';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onLongPress?: () => void;
  onReplyPress?: () => void;
  locale?: 'vi' | 'en';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  showTimestamp = true,
  onLongPress,
  onReplyPress,
  locale = 'vi',
}) => {
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', {
        locale: locale === 'vi' ? vi : enUS,
      });
    } catch (error) {
      return '';
    }
  };

  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <Text className="text-gray-400 italic">
          {locale === 'vi' ? 'Tin nhắn đã bị xóa' : 'Message deleted'}
        </Text>
      );
    }

    switch (message.messageType) {
      case 'IMAGE':
        return (
          <View>
            {message.attachments?.[0]?.fileUrl && (
              <Image
                source={{ uri: message.attachments[0].fileUrl }}
                className="w-48 h-48 rounded-lg"
                resizeMode="cover"
              />
            )}
            {message.content && (
              <Text
                className={
                  isCurrentUser ? 'text-white mt-1' : 'text-gray-900 mt-1'
                }
              >
                {message.content}
              </Text>
            )}
          </View>
        );

      case 'FILE':
        return (
          <View className="flex-row items-center">
            <Ionicons
              name="document-attach"
              size={20}
              color={isCurrentUser ? '#FFFFFF' : '#374151'}
            />
            <Text
              className={`ml-2 ${isCurrentUser ? 'text-white' : 'text-gray-900'} underline`}
            >
              {message.attachments?.[0]?.fileName || 'File'}
            </Text>
          </View>
        );

      case 'AUDIO':
        return (
          <View className="flex-row items-center">
            <Ionicons
              name="mic"
              size={20}
              color={isCurrentUser ? '#FFFFFF' : '#374151'}
            />
            <Text
              className={`ml-2 ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}
            >
              {locale === 'vi' ? 'Tin nhắn thoại' : 'Voice message'}
            </Text>
          </View>
        );

      default:
        return (
          <Text className={isCurrentUser ? 'text-white' : 'text-gray-900'}>
            {message.content}
          </Text>
        );
    }
  };

  const renderReplyTo = () => {
    if (!message.replyTo) return null;

    return (
      <TouchableOpacity
        onPress={onReplyPress}
        className={`border-l-2 pl-2 mb-1 ${
          isCurrentUser ? 'border-purple-300' : 'border-gray-300'
        }`}
      >
        <Text
          className={`text-xs ${
            isCurrentUser ? 'text-purple-100' : 'text-gray-500'
          } mb-0.5`}
        >
          {message.replyTo.sender.firstName}
        </Text>
        <Text
          className={`text-sm ${
            isCurrentUser ? 'text-purple-100' : 'text-gray-600'
          }`}
          numberOfLines={1}
        >
          {message.replyTo.content}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReadStatus = () => {
    if (!isCurrentUser) return null;

    const isRead = message.readBy && message.readBy.length > 0;

    return (
      <View className="ml-1">
        {isRead ? (
          <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
        ) : (
          <Ionicons name="checkmark" size={14} color="#9CA3AF" />
        )}
      </View>
    );
  };

  return (
    <View
      className={`flex-row mb-3 px-4 ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isCurrentUser && showAvatar && (
        <UserAvatar user={message.sender} size="small" />
      )}

      <View
        className={`max-w-[75%] ${!isCurrentUser && showAvatar ? 'ml-2' : ''} ${
          isCurrentUser && showAvatar ? 'mr-2' : ''
        }`}
      >
        {!isCurrentUser && !showAvatar && (
          <Text className="text-xs text-gray-500 mb-1 ml-1">
            {message.sender.name}
          </Text>
        )}

        <TouchableOpacity
          onLongPress={onLongPress}
          activeOpacity={0.7}
          className={`px-3 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-purple-500 rounded-br-sm'
              : 'bg-gray-100 rounded-bl-sm'
          } ${message.isEdited ? 'border border-gray-300' : ''}`}
        >
          {renderReplyTo()}
          {renderMessageContent()}

          {message.isEdited && (
            <Text
              className={`text-xs mt-1 ${
                isCurrentUser ? 'text-purple-100' : 'text-gray-500'
              }`}
            >
              {locale === 'vi' ? '(đã chỉnh sửa)' : '(edited)'}
            </Text>
          )}
        </TouchableOpacity>

        {showTimestamp && (
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-400 ml-1">
              {formatTime(message.createdAt)}
            </Text>
            {renderReadStatus()}
          </View>
        )}
      </View>

      {isCurrentUser && showAvatar && (
        <UserAvatar user={message.sender} size="small" />
      )}
    </View>
  );
};

export default MessageBubble;
