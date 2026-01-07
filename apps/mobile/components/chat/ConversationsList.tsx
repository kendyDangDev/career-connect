import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search by conversation name
    if (conversation.name?.toLowerCase()?.includes(query)) {
      return true;
    }

    // Search by participant names (for direct conversations)
    if (conversation.type === 'DIRECT') {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      if (otherParticipant?.user) {
        const fullName =
          `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`.toLowerCase();
        return fullName?.includes(query);
      }
    }

    // Search by last message content
    if (conversation.lastMessage?.content.toLowerCase()?.includes(query)) {
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
      params: { conversationId: conversation.id },
    });
  };

  const handleNewChatPress = () => {
    router.push('/chat/new');
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers?.includes(userId);
  };

  const getOtherParticipantId = (
    conversation: Conversation
  ): string | undefined => {
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
    <View className="relative">
      <LinearGradient
        colors={['#a855f7', '#9333ea', '#7e22ce']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pb-4"
      >
        {/* Decorative elements */}
        <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
        <View className="absolute top-20 left-8 w-16 h-16 bg-white/10 rounded-full" />
        <View className="absolute top-32 right-12 w-8 h-8 bg-white/10 rounded-full" />
        <View className="absolute top-16 right-20 w-2 h-2 bg-white/20 rounded-full" />

        <View className="relative z-10">
          {/* Header Top */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
            <Text className="text-2xl font-bold text-white tracking-wide">
              Tin nhắn
            </Text>

            <View className="flex-row items-center">
              {/* Connection Status */}
              <View
                className={`w-3 h-3 rounded-full mr-4 ${
                  isConnected
                    ? 'bg-green-400 shadow-lg shadow-green-400/50'
                    : 'bg-red-400 shadow-lg shadow-red-400/50'
                }`}
              />

              {/* Search Button */}
              <TouchableOpacity
                onPress={() => setIsSearchVisible(!isSearchVisible)}
                className="p-3 rounded-full bg-white/20 mr-3"
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>

              {/* New Chat Button */}
              <TouchableOpacity
                onPress={handleNewChatPress}
                className="p-3 rounded-full bg-white/30"
                activeOpacity={0.7}
              >
                <Ionicons name="create" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Online users count or stats if available */}
          {onlineUsers && onlineUsers.length > 0 && (
            <View className="px-4 pb-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                <Text className="text-white/80 text-sm">
                  {onlineUsers.length} người đang trực tuyến
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {isSearchVisible && (
        <View className="relative">
          <View className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <View className="px-4 py-3 relative z-10">
            <View className="relative">
              <View className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-2xl" />
              <View className="flex-row items-center bg-white/70 backdrop-blur-xs rounded-2xl px-4 py-3 border border-blue-200/30 relative z-10">
                <Ionicons name="search" size={18} color="#2563eb" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  placeholderTextColor="#3b82f6"
                  className="flex-1 ml-3 text-base text-blue-700"
                  autoFocus={isSearchVisible}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    className="ml-2"
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#3b82f6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="chatbubble-outline" size={40} color="#3b82f6" />
      </View>
      <Text className="text-blue-800 text-xl font-bold text-center mb-2">
        Chưa có cuộc trò chuyện
      </Text>
      <Text className="text-blue-600 text-base text-center mb-8 leading-6">
        Bắt đầu trò chuyện với nhà tuyển dụng hoặc ứng viên
      </Text>
      <TouchableOpacity
        onPress={handleNewChatPress}
        className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-full shadow-lg flex-row items-center"
        activeOpacity={0.7}
      >
        <Ionicons name="create" size={20} color="white" />
        <Text className="text-white text-lg font-semibold ml-2">
          Tạo cuộc trò chuyện mới
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
      </View>
      <Text className="text-red-800 text-xl font-bold text-center mb-2">
        Có lỗi xảy ra
      </Text>
      <Text className="text-red-600 text-base text-center mb-8 leading-6">
        {error || 'Không thể tải danh sách cuộc trò chuyện'}
      </Text>
      <TouchableOpacity
        onPress={handleRefresh}
        className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 rounded-full shadow-lg flex-row items-center"
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text className="text-white text-lg font-semibold ml-2">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-blue-600 text-lg font-medium mt-4">
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
        {renderHeader()}
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          filteredConversations.length === 0 ? renderEmptyState : null
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && conversations.length > 0}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

export default ConversationsList;
