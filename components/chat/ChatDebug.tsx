import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useChatStore } from '@/stores/chatStore';
import { socketManager, getChatToken } from '@/utils/socketManager';

export default function ChatDebug() {
  const [socketStatus, setSocketStatus] = useState('Not connected');
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const {
    conversations,
    messages,
    isConnected,
    error,
    currentUserId,
    initializeChat,
    connectSocket,
    fetchConversations,
    fetchMessages,
  } = useChatStore();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    // Check socket status
    const checkStatus = setInterval(() => {
      setSocketStatus(socketManager.isConnected() ? 'Connected' : 'Disconnected');
    }, 1000);

    return () => clearInterval(checkStatus);
  }, []);

  const testGetChatToken = async () => {
    try {
      addLog('Getting chat token...');
      const token = await getChatToken();
      setChatToken(token);
      addLog(`Chat token received: ${token.substring(0, 20)}...`);
    } catch (error) {
      addLog(`Error getting chat token: ${error}`);
    }
  };

  const testInitializeChat = async () => {
    try {
      addLog('Initializing chat...');
      await initializeChat();
      addLog('Chat initialized successfully');
    } catch (error) {
      addLog(`Error initializing chat: ${error}`);
    }
  };

  const testConnectSocket = async () => {
    try {
      addLog('Connecting socket...');
      await connectSocket();
      addLog('Socket connected');
    } catch (error) {
      addLog(`Error connecting socket: ${error}`);
    }
  };

  const testFetchConversations = async () => {
    try {
      addLog('Fetching conversations...');
      await fetchConversations();
      addLog(`Fetched ${conversations.length} conversations`);
    } catch (error) {
      addLog(`Error fetching conversations: ${error}`);
    }
  };

  const testFetchMessages = async (conversationId: string) => {
    try {
      addLog(`Fetching messages for conversation: ${conversationId}`);
      await fetchMessages(conversationId);
      const msgs = messages[conversationId] || [];
      addLog(`Fetched ${msgs.length} messages`);
    } catch (error) {
      addLog(`Error fetching messages: ${error}`);
    }
  };

  const testSocketConnection = async () => {
    try {
      addLog('Testing direct socket connection...');
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.188:3000';
      addLog(`Using base URL: ${baseUrl}`);
      
      // Test HTTP endpoint first
      const response = await fetch(`${baseUrl}/api/health`);
      const health = await response.json();
      addLog(`API health check: ${JSON.stringify(health)}`);
      
      // Test socket endpoint
      const socketResponse = await fetch(`${baseUrl}/socket.io/?EIO=4&transport=polling`);
      addLog(`Socket.IO endpoint status: ${socketResponse.status}`);
      
    } catch (error) {
      addLog(`Socket test error: ${error}`);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Chat Debug Panel</Text>
      
      <View className="mb-4 p-3 bg-gray-100 rounded">
        <Text className="font-semibold">Status:</Text>
        <Text>Socket: {socketStatus}</Text>
        <Text>Store Connected: {isConnected ? 'Yes' : 'No'}</Text>
        <Text>Current User ID: {currentUserId || 'Not set'}</Text>
        <Text>Chat Token: {chatToken ? 'Present' : 'Not set'}</Text>
        <Text>Conversations: {conversations.length}</Text>
        <Text>Error: {error || 'None'}</Text>
      </View>

      <View className="space-y-2 mb-4">
        <TouchableOpacity 
          onPress={testSocketConnection}
          className="bg-blue-500 p-3 rounded"
        >
          <Text className="text-white text-center">Test Socket Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={testGetChatToken}
          className="bg-green-500 p-3 rounded"
        >
          <Text className="text-white text-center">Get Chat Token</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={testInitializeChat}
          className="bg-purple-500 p-3 rounded"
        >
          <Text className="text-white text-center">Initialize Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={testConnectSocket}
          className="bg-orange-500 p-3 rounded"
        >
          <Text className="text-white text-center">Connect Socket</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={testFetchConversations}
          className="bg-pink-500 p-3 rounded"
        >
          <Text className="text-white text-center">Fetch Conversations</Text>
        </TouchableOpacity>
      </View>

      {conversations.length > 0 && (
        <View className="mb-4">
          <Text className="font-semibold mb-2">Conversations:</Text>
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              onPress={() => testFetchMessages(conv.id)}
              className="bg-gray-200 p-2 rounded mb-1"
            >
              <Text>{conv.name || conv.id}</Text>
              <Text className="text-xs text-gray-600">
                Tap to fetch messages ({messages[conv.id]?.length || 0} loaded)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View className="mt-4">
        <Text className="font-semibold mb-2">Logs:</Text>
        <View className="bg-gray-100 p-2 rounded max-h-60">
          <ScrollView>
            {logs.map((log, index) => (
              <Text key={index} className="text-xs mb-1">{log}</Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}