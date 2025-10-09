import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChatStore } from '@/stores/chatStore';
import { Conversation } from '@/types/chat.types';
import ConversationItem from './ConversationItem';

const ConversationsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const {
    conversations,
    isLoading,
    isLoadingMore,
    conversationsPagination,
    currentUserId,
    onlineUsers,
    fetchConversations,
    fetchMoreConversations,
    error,
    clearError,
    isConnected,
  } = useChatStore();

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search by conversation name
    if (conversation.name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by participant names (for direct conversations)
    if (conversation.type === 'DIRECT') {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      if (otherParticipant?.user) {
        const fullName = `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`.toLowerCase();
        return fullName.includes(query);
      }
    }
    
    // Search by last message content
    if (conversation.lastMessage?.content.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });

  const handleRefresh = useCallback(async () => {
    try {
      await fetchConversations();
      clearError();
    } catch (error) {
      console.error('[ConversationsList] Refresh error:', error);
    }
  }, [fetchConversations, clearError]);

  const handleLoadMore = useCallback(() => {
    if (conversationsPagination.hasMore && !isLoadingMore) {
      fetchMoreConversations();
    }
  }, [conversationsPagination.hasMore, isLoadingMore, fetchMoreConversations]);

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: '/chat/[conversationId]',
      params: { conversationId: conversation.id }
    });
  };

  const handleNewChatPress = () => {
    router.push('/chat/new');
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  const getOtherParticipantId = (conversation: Conversation): string | undefined => {
    if (conversation.type === 'DIRECT') {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      return otherParticipant?.userId;
    }
    return undefined;
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUserId = getOtherParticipantId(item);
    const isOnline = otherUserId ? isUserOnline(otherUserId) : false;

    return (
      <ConversationItem
        conversation={item}
        onPress={() => handleConversationPress(item)}
        isOnline={isOnline}
        currentUserId={currentUserId || undefined}
      />
    );
  };

  const renderHeader = () => (
    <View className="bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tin nhắn</Text>
        
        <View className="flex-row items-center">
          {/* Connection Status */}
          <View className={`w-2 h-2 rounded-full mr-3 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Search Button */}
          <TouchableOpacity
            onPress={() => setIsSearchVisible(!isSearchVisible)}
            className="p-2 rounded-full bg-gray-100 mr-2"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#374151" />
          </TouchableOpacity>
          
          {/* New Chat Button */}
          <TouchableOpacity
            onPress={handleNewChatPress}
            className="p-2 rounded-full bg-blue-500"
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <View className="flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-base text-gray-900"
              autoFocus={isSearchVisible}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="ml-2"
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-semibold text-gray-400 mt-4 mb-2">
        Chưa có cuộc trò chuyện
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Bắt đầu trò chuyện với nhà tuyển dụng hoặc ứng viên
      </Text>
      <TouchableOpacity
        onPress={handleNewChatPress}
        className="bg-blue-500 px-6 py-3 rounded-lg"
        activeOpacity={0.7}
      >
        <Text className="text-white font-semibold">Tạo cuộc trò chuyện mới</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-xl font-semibold text-red-600 mt-4 mb-2">
        Có lỗi xảy ra
      </Text>
      <Text className="text-base text-gray-600 text-center mb-6">
        {error || 'Không thể tải danh sách cuộc trò chuyện'}
      </Text>
      <TouchableOpacity
        onPress={handleRefresh}
        className="bg-blue-500 px-6 py-3 rounded-lg"
        activeOpacity={0.7}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-3">Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        {renderError()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={filteredConversations.length === 0 ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && conversations.length > 0}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default ConversationsList;