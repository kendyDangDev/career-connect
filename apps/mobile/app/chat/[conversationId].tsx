import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/components/chat/ChatScreen';
import { ChatProvider } from '@/contexts/ChatContext';

const ConversationScreen: React.FC = () => {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  if (!conversationId) {
    return null;
  }

  return (
    <ChatProvider>
      <View className="flex-1">
        <ChatScreen conversationId={conversationId} />
      </View>
    </ChatProvider>
  );
};

export default ConversationScreen;