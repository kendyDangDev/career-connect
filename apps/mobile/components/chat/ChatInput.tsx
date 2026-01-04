import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '@/stores/chatStore';
import { SendMessagePayload } from '@/types/chat.types';

interface ChatInputProps {
  conversationId: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  onClearReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  conversationId,
  replyTo,
  onClearReply,
  placeholder = 'Nhập tin nhắn...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    sendMessage,
    startTyping,
    stopTyping,
    isSendingMessage,
    isConnected,
  } = useChatStore();

  // Handle typing indicators
  useEffect(() => {
    if (message.trim().length > 0 && !isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(conversationId);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, conversationId, startTyping, stopTyping]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping) {
        stopTyping(conversationId);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSendingMessage) return;

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
    }

    const messagePayload: SendMessagePayload = {
      conversationId,
      content: trimmedMessage,
      type: 'TEXT',
      replyToId: replyTo?.id,
    };

    try {
      setMessage('');
      onClearReply?.();
      await sendMessage(messagePayload);
    } catch (error) {
      console.error('[ChatInput] Send message error:', error);
      // Restore message on error
      setMessage(trimmedMessage);
      Alert.alert(
        'Lỗi gửi tin nhắn',
        'Không thể gửi tin nhắn. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập thư viện ảnh để gửi hình ảnh.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // TODO: Upload image and send message with attachment
        Alert.alert('Thông báo', 'Tính năng gửi ảnh sẽ được cập nhật sớm!');
      }
    } catch (error) {
      console.error('[ChatInput] Image picker error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        // TODO: Upload document and send message with attachment
        Alert.alert('Thông báo', 'Tính năng gửi file sẽ được cập nhật sớm!');
      }
    } catch (error) {
      console.error('[ChatInput] Document picker error:', error);
      Alert.alert('Lỗi', 'Không thể chọn file. Vui lòng thử lại.');
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert('Đính kèm', 'Chọn loại file muốn gửi', [
      {
        text: 'Ảnh',
        onPress: handleImagePicker,
      },
      {
        text: 'File',
        onPress: handleDocumentPicker,
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ]);
  };

  const canSend = message.trim().length > 0 && !isSendingMessage && isConnected;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="bg-white border-t border-gray-200">
        {/* Reply Preview */}
        {replyTo && (
          <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 border-l-4 border-purple-500">
            <View className="flex-1">
              <Text className="text-xs text-purple-600 font-medium">
                Trả lời {replyTo.senderName}
              </Text>
              <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
                {replyTo.content}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClearReply}
              className="ml-2 p-1"
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View className="flex-row items-end px-4 py-3">
          {/* Attachment Button */}
          <TouchableOpacity
            onPress={showAttachmentOptions}
            disabled={disabled}
            className={`mr-2 p-2 rounded-full ${
              disabled ? 'bg-gray-100' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add"
              size={24}
              color={disabled ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>

          {/* Text Input */}
          <View className="flex-1 max-h-32 bg-gray-100 rounded-2xl px-4 py-2">
            <TextInput
              ref={textInputRef}
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="text-base text-gray-900 min-h-[36px]"
              editable={!disabled}
              maxLength={1000}
              onSubmitEditing={
                Platform.OS === 'ios' ? handleSendMessage : undefined
              }
              blurOnSubmit={Platform.OS === 'ios'}
              returnKeyType={Platform.OS === 'ios' ? 'send' : 'default'}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!canSend || disabled}
            className={`ml-2 p-2 rounded-full ${
              canSend && !disabled ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            activeOpacity={0.7}
          >
            {isSendingMessage ? (
              <Ionicons name="hourglass" size={24} color="white" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={canSend && !disabled ? 'white' : '#9CA3AF'}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        {!isConnected && (
          <View className="px-4 py-1">
            <Text className="text-xs text-red-500 text-center">
              Đang kết nối lại...
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatInput;
