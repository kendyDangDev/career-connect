import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useChatStore } from "@/stores/chatStore";
import { CreateConversationPayload, User } from "@/types/chat.types";
import UserAvatar from "./UserAvatar";

// API service for user search
const searchUsers = async (query: string): Promise<User[]> => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(
      `/api/users/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to search users");
    }
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("[NewConversation] User search error:", error);
    return [];
  }
};

const NewConversationScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [conversationType, setConversationType] = useState<"DIRECT" | "GROUP">(
    "DIRECT"
  );
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const { createConversation, currentUserId } = useChatStore();

  // User search with API
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await searchUsers(searchQuery.trim());
          setSearchResults(results);
        } catch (error) {
          console.error("[NewConversation] Search failed:", error);
          setSearchResults([]);
        }
      } else {
        // Load initial users or clear results
        setSearchResults([]);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBackPress = () => {
    router.back();
  };

  const handleUserSelect = (user: User) => {
    if (conversationType === "DIRECT") {
      // For direct conversation, only one user can be selected
      setSelectedUsers([user]);
    } else {
      // For group conversation, toggle user selection
      const isSelected = selectedUsers.some((u) => u.id === user.id);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn ít nhất một người để tạo cuộc trò chuyện."
      );
      return;
    }

    if (conversationType === "GROUP" && !groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateConversationPayload = {
        type: conversationType,
        participantIds: selectedUsers.map((u) => u.id),
        title: conversationType === "GROUP" ? groupName.trim() : undefined,
      };

      const conversation = await createConversation(payload);

      // Navigate to the new conversation
      router.replace({
        pathname: "/chat/[conversationId]",
        params: { conversationId: conversation.id },
      });
    } catch (error) {
      console.error(
        "[NewConversationScreen] Create conversation error:",
        error
      );
      Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some((u) => u.id === item.id);
    const isCurrentUser = item.id === currentUserId;

    if (isCurrentUser) return null; // Don't show current user

    return (
      <TouchableOpacity
        onPress={() => handleUserSelect(item)}
        className={`flex-row items-center px-4 py-3 ${
          isSelected ? "bg-blue-50" : "bg-white"
        } border-b border-gray-100`}
        activeOpacity={0.7}
      >
        <UserAvatar user={item} size="medium" />

        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-gray-900">
            {item.firstName} {item.lastName}
          </Text>
          {item.email && (
            <Text className="text-sm text-gray-500 mt-0.5">{item.email}</Text>
          )}
          <Text className="text-xs text-gray-400 mt-0.5">
            {item.userType === "EMPLOYER" ? "Nhà tuyển dụng" : "Ứng viên"}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = (user: User) => (
    <View
      key={user.id}
      className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
    >
      <Text className="text-sm text-blue-800 mr-1">
        {user.firstName} {user.lastName}
      </Text>
      <TouchableOpacity
        onPress={() => handleUserSelect(user)}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <Ionicons name="close" size={16} color="#1E40AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleBackPress}
              className="mr-3 p-1"
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">
              Cuộc trò chuyện mới
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateConversation}
            disabled={selectedUsers.length === 0 || isLoading}
            className={`px-4 py-2 rounded-lg ${
              selectedUsers.length > 0 && !isLoading
                ? "bg-blue-500"
                : "bg-gray-300"
            }`}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`font-medium ${
                  selectedUsers.length > 0 ? "text-white" : "text-gray-500"
                }`}
              >
                Tạo
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Conversation Type Selector */}
        <View className="px-4 py-3 border-t border-gray-100">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => {
                setConversationType("DIRECT");
                setSelectedUsers([]);
              }}
              className={`flex-1 py-2 px-4 rounded-md ${
                conversationType === "DIRECT" ? "bg-white shadow-sm" : ""
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center font-medium ${
                  conversationType === "DIRECT"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Trực tiếp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setConversationType("GROUP");
                setSelectedUsers([]);
              }}
              className={`flex-1 py-2 px-4 rounded-md ${
                conversationType === "GROUP" ? "bg-white shadow-sm" : ""
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center font-medium ${
                  conversationType === "GROUP"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Nhóm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Name Input */}
        {conversationType === "GROUP" && (
          <View className="px-4 py-3 border-t border-gray-100">
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Nhập tên nhóm..."
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-lg px-4 py-3 text-base text-gray-900"
              maxLength={50}
            />
          </View>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View className="px-4 py-3 border-t border-gray-100">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Đã chọn ({selectedUsers.length})
            </Text>
            <View className="flex-row flex-wrap">
              {selectedUsers.map(renderSelectedUser)}
            </View>
          </View>
        )}

        {/* Search Input */}
        <View className="px-4 py-3 border-t border-gray-100">
          <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm người dùng..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-gray-900"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="person-outline" size={48} color="#D1D5DB" />
            <Text className="text-lg font-medium text-gray-400 mt-4">
              Không tìm thấy người dùng
            </Text>
            <Text className="text-base text-gray-500 mt-1 text-center px-6">
              Thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        )}
      />

      {/* Info Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <Text className="text-xs text-gray-500 text-center">
          {conversationType === "DIRECT"
            ? "Chọn một người để bắt đầu trò chuyện trực tiếp"
            : "Chọn nhiều người để tạo nhóm trò chuyện"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NewConversationScreen;
