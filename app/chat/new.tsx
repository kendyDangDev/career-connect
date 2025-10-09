import React from 'react';
import { View } from 'react-native';
import NewConversationScreen from '@/components/chat/NewConversationScreen';
import { ChatProvider } from '@/contexts/ChatContext';

const NewChatScreen: React.FC = () => {
  return (
    <ChatProvider>
      <View className="flex-1">
        <NewConversationScreen />
      </View>
    </ChatProvider>
  );
};

export default NewChatScreen;