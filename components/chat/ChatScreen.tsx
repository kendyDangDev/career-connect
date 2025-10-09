import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useChatStore } from "@/stores/chatStore";
import { Message } from "@/types/chat.types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import UserAvatar from "./UserAvatar";

interface ChatScreenProps {
  conversationId: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const [replyTo, setReplyTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAtEndRef = useRef(false);
  const isNearTopRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  const {
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    currentUserId,
    isLoadingMessages,
    isLoadingMore,
    messagesPagination,
    isConnected,
    setActiveConversation,
    fetchMessages,
    fetchMoreMessages,
    clearError,
  } = useChatStore();

  // Get current conversation
  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = useMemo(
    () => messages[conversationId] || [],
    [messages, conversationId]
  );
  const typingUsersInConversation = typingUsers[conversationId] || [];

  // Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    isNearBottomRef.current = true;
    isAtEndRef.current = false;
    lastScrollYRef.current = 0;
    isLoadingMoreRef.current = false;
    setShowScrollToBottom(false);
  }, [conversationId]);

  const scrollToBottom = useCallback(
    (animated: boolean = true) => {
      requestAnimationFrame(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated });

          // Fallback method for better reliability
          if (conversationMessages.length > 0) {
            setTimeout(
              () => {
                if (flatListRef.current) {
                  try {
                    flatListRef.current.scrollToIndex({
                      index: conversationMessages.length - 1,
                      animated: false,
                      viewPosition: 1,
                    });
                  } catch {
                    // Ignore out of bounds errors
                  }
                }
              },
              animated ? 100 : 0
            );
          }
        }
      });
    },
    [conversationMessages.length]
  );

  const handleContentSizeChange = useCallback(() => {
    // Auto-scroll when content size changes and user is near bottom or on initial load
    if (conversationMessages.length > 0) {
      if (isInitialLoadRef.current) {
        // Force scroll to bottom on initial load
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        });
      } else if (isNearBottomRef.current && !isLoadingMoreRef.current) {
        // Auto-scroll for new messages when user is near bottom, but not when loading more
        scrollToBottom(false);
      }
    }
  }, [conversationMessages.length, scrollToBottom]);

  // Set active conversation on mount
  useEffect(() => {
    if (conversation) {
      setActiveConversation(conversation.id);
    }

    return () => {
      // Clear active conversation on unmount
      setActiveConversation(null);
      // Clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [conversation, setActiveConversation]);

  // Fetch messages on mount
  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      if (conversationId && conversationMessages.length === 0) {
        await fetchMessages(conversationId);
      }
    };

    fetchConversationAndMessages();
  }, [conversationId, conversationMessages.length, fetchMessages]);

  // Initial scroll to bottom when conversation loads
  useEffect(() => {
    if (conversationMessages.length > 0 && isInitialLoadRef.current) {
      // Multiple attempts to ensure scroll works
      const scrollAttempt = () => {
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            // Method 1: scrollToEnd
            flatListRef.current.scrollToEnd({ animated: false });

            // Method 2: scrollToIndex as fallback
            setTimeout(() => {
              if (flatListRef.current && conversationMessages.length > 0) {
                try {
                  flatListRef.current.scrollToIndex({
                    index: conversationMessages.length - 1,
                    animated: false,
                    viewPosition: 1,
                  });
                } catch {
                  // Index might be out of bounds, ignore
                }
              }
            }, 50);
          }
        });
      };

      // First attempt immediately
      scrollAttempt();

      // Second attempt after a delay to ensure render is complete
      setTimeout(() => {
        scrollAttempt();
        isInitialLoadRef.current = false;
      }, 200);
    }
  }, [conversationMessages.length]);

  // Auto-scroll when new messages arrive (but not when loading more)
  useEffect(() => {
    if (
      conversationMessages.length > 0 &&
      !isInitialLoadRef.current &&
      !isLoadingMoreRef.current
    ) {
      const latestMessage =
        conversationMessages[conversationMessages.length - 1];
      const isMyMessage = latestMessage.senderId === currentUserId;

      if (isMyMessage || isNearBottomRef.current) {
        scrollToBottom();
      } else if (!showScrollToBottom) {
        setShowScrollToBottom(true);
      }
    }
  }, [conversationMessages, currentUserId, scrollToBottom, showScrollToBottom]);

  // Clear loading more flag when loading completes
  useEffect(() => {
    if (!isLoadingMore) {
      isLoadingMoreRef.current = false;
    }
  }, [isLoadingMore]);

  const getConversationTitle = (): string => {
    if (!conversation) return "Chat";

    if (conversation.name) return conversation.name;

    // For direct conversations, show the other participant's name
    if (conversation.type === "DIRECT") {
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== currentUserId
      );
      if (otherParticipant?.user) {
        return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }

    return "Cuộc trò chuyện";
  };

  const getOtherUser = () => {
    if (!conversation || conversation.type !== "DIRECT") return undefined;

    console.log("participant:", conversation.participants);

    console.log("current user id:", currentUserId);

    const otherParticipant = conversation.participants.find(
      (p) => p.user.id !== currentUserId
      // (p) => {
      //   console.log(p);
      // }
    );
    return otherParticipant?.user;
  };

  const isUserOnline = (): boolean => {
    const otherUser = getOtherUser();
    return otherUser ? onlineUsers.includes(otherUser.id) : false;
  };

  const handleLoadMoreMessages = useCallback(() => {
    if (!conversationId || isLoadingMore) return;

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    const pagination = messagesPagination[conversationId];
    if (pagination?.hasMore) {
      console.log("[ChatScreen] Loading more messages...", {
        currentPage: pagination.page,
        hasMore: pagination.hasMore,
        messagesCount: conversationMessages.length,
      });

      // Set flag to prevent auto-scroll during load more
      isLoadingMoreRef.current = true;

      // Faster debouncing for better UX
      loadingTimeoutRef.current = setTimeout(async () => {
        try {
          await fetchMoreMessages(conversationId);
        } catch (error) {
          console.error("[ChatScreen] Load more messages failed:", error);
          // Could add retry logic here
        }
      }, 150); // Reduced from 300ms to 150ms
    }
  }, [
    conversationId,
    messagesPagination,
    isLoadingMore,
    fetchMoreMessages,
    conversationMessages.length,
  ]);

  const handleRefresh = useCallback(async () => {
    if (!conversationId || isLoadingMore) return;

    // RefreshControl is for pulling down to load older messages (same as scroll up)
    const pagination = messagesPagination[conversationId];
    if (pagination?.hasMore) {
      try {
        console.log("[ChatScreen] Pull to refresh - loading older messages");
        await fetchMoreMessages(conversationId);
        clearError();
      } catch (error) {
        console.error("[ChatScreen] Refresh error:", error);
      }
    }
  }, [
    conversationId,
    fetchMoreMessages,
    clearError,
    messagesPagination,
    isLoadingMore,
  ]);

  const handleMessageLongPress = (message: Message) => {
    const isCurrentUser = message.senderId === currentUserId;

    const options = [
      {
        text: "Trả lời",
        onPress: () => handleReplyToMessage(message),
      },
    ];

    if (isCurrentUser && !message.isDeleted) {
      options.push({
        text: "Xóa",
        onPress: () => handleDeleteMessage(message),
      } as any);
    }

    options.push({
      text: "Hủy",
      style: "cancel",
    } as any);

    Alert.alert("Tùy chọn tin nhắn", "", options);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: message.sender.firstName,
    });
  };

  const handleDeleteMessage = (message: Message) => {
    Alert.alert("Xóa tin nhắn", "Bạn có chắc chắn muốn xóa tin nhắn này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Delete message:", message.id);
          } catch (error) {
            console.error("[ChatScreen] Delete message error:", error);
            Alert.alert("Lỗi", "Không thể xóa tin nhắn");
          }
        },
      },
    ]);
  };

  const handleClearReply = () => {
    setReplyTo(null);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const currentScrollY = contentOffset.y;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const distanceFromTop = contentOffset.y;
      const isAtBottom = distanceFromBottom < 50;
      const isNearTop = distanceFromTop < 200; // Increased threshold for better UX
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      const isScrollingUp = scrollDelta < -10; // Require significant upward scroll

      isNearBottomRef.current = isAtBottom;
      isAtEndRef.current = isAtBottom;
      isNearTopRef.current = isNearTop;
      lastScrollYRef.current = currentScrollY;

      // Auto-load more messages when scrolling up near the top with better conditions
      if (
        isNearTop &&
        isScrollingUp &&
        !isLoadingMore &&
        !isInitialLoadRef.current
      ) {
        const pagination = messagesPagination[conversationId];
        if (pagination?.hasMore && conversationMessages.length > 0) {
          handleLoadMoreMessages();
        }
      }

      // Scroll to bottom button logic
      if (isAtBottom) {
        setShowScrollToBottom(false);
      } else if (!showScrollToBottom && distanceFromBottom > 200) {
        setShowScrollToBottom(true);
      }
    },
    [
      showScrollToBottom,
      conversationId,
      messagesPagination,
      isLoadingMore,
      handleLoadMoreMessages,
      conversationMessages.length,
    ]
  );

  const handleScrollToBottomPress = useCallback(() => {
    scrollToBottom();
    setShowScrollToBottom(false);
  }, [scrollToBottom]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const nextMessage =
      index < conversationMessages.length - 1
        ? conversationMessages[index + 1]
        : null;
    const showAvatar = !nextMessage || nextMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        showTimestamp={true}
        onLongPress={() => handleMessageLongPress(item)}
        onReplyPress={() => {
          // Scroll to replied message
          const replyIndex = conversationMessages.findIndex(
            (m) => m.id === item.replyToId
          );
          if (replyIndex !== -1) {
            flatListRef.current?.scrollToIndex({
              index: replyIndex,
              animated: true,
              viewPosition: 0.5,
            });
          }
        }}
      />
    );
  };

  const renderHeader = () => (
    <SafeAreaView className="bg-white border-b border-gray-200">
      <View className="flex-row items-center px-4 py-3">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          className="mr-3 p-1"
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {/* Avatar */}
        <UserAvatar
          user={getOtherUser()}
          size="medium"
          isOnline={isUserOnline()}
          showOnlineIndicator={conversation?.type === "DIRECT"}
        />

        {/* Title & Status */}
        <View className="flex-1 ml-3">
          <Text
            className="text-lg font-semibold text-gray-900"
            numberOfLines={1}
          >
            {getConversationTitle()}
          </Text>

          {conversation?.type === "DIRECT" && (
            <Text className="text-sm text-gray-500">
              {isUserOnline() ? "Đang hoạt động" : "Không hoạt động"}
            </Text>
          )}

          {conversation?.type === "GROUP" && (
            <Text className="text-sm text-gray-500">
              {conversation.participants.length} thành viên
            </Text>
          )}

          {conversation?.type === "APPLICATION_RELATED" && (
            <Text className="text-sm text-blue-600">
              Liên quan đến ứng tuyển
            </Text>
          )}
        </View>

        {/* Connection Status */}
        <View
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </View>
    </SafeAreaView>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Ionicons name="chatbubble-ellipses-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-semibold text-gray-400 mt-4 mb-2">
        Chưa có tin nhắn
      </Text>
      <Text className="text-base text-gray-500 text-center">
        Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên
      </Text>
    </View>
  );

  const renderLoadingHeader = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-3 items-center bg-gray-50">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="text-xs text-gray-500 mt-1">
          Đang tải tin nhắn cũ hơn...
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    return null; // No footer needed as we load at the top
  };

  if (!conversation) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600">
            Không tìm thấy cuộc trò chuyện
          </Text>
        </View>
      </View>
    );
  }

  if (isLoadingMessages && conversationMessages.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-3">Đang tải tin nhắn...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}

      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderLoadingHeader}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingMore}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
              title="Kéo để tải tin nhắn cũ hơn"
            />
          }
          onEndReached={undefined}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          removeClippedSubviews={true}
        />

        {/* Typing Indicator */}
        <TypingIndicator
          isTyping={typingUsersInConversation.length > 0}
          typingUsers={typingUsersInConversation}
        />

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <TouchableOpacity
            onPress={handleScrollToBottomPress}
            className="absolute bottom-4 right-4 bg-blue-500 rounded-full p-3 shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Input */}
      <ChatInput
        conversationId={conversationId}
        replyTo={replyTo}
        onClearReply={handleClearReply}
        disabled={!isConnected}
      />
    </View>
  );
};

export default ChatScreen;
