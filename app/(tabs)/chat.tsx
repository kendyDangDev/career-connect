import React from 'react';
import { View } from 'react-native';
import ConversationsList from '@/components/chat/ConversationsList';
import { ChatProvider } from '@/contexts/ChatContext';

const ChatTab: React.FC = () => {
  return (
    <ChatProvider>
      <View className="flex-1">
        <ConversationsList />
      </View>
    </ChatProvider>
  );
};

export default ChatTab;