import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  mockUser,
  mockUserWithoutAvatar,
  mockUserSingleName,
} from "../utils/mockUserData";
import Header from "./Header";

const DebugScreen: React.FC = () => {
  const { user, isAuthenticated, isLoading, setMockUser } = useAuthContext();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header Component Test */}
        <Header
          searchValue=""
          onSearchChange={(text) => console.log("Search:", text)}
          onNotificationPress={() => console.log("Notification pressed")}
          onMicPress={() => console.log("Mic pressed")}
          onFilterPress={() => console.log("Filter pressed")}
        />

        <View className="p-4 bg-white m-4 rounded-lg">
          <Text className="text-xl font-bold mb-4">Auth Debug Panel</Text>

          <View className="mb-4">
            <Text className="font-semibold mb-2">Current Auth State:</Text>
            <Text className="mb-1">
              • Authenticated: {isAuthenticated.toString()}
            </Text>
            <Text className="mb-1">• Loading: {isLoading.toString()}</Text>
            <Text className="mb-1">• User ID: {user?.id || "None"}</Text>
            <Text className="mb-1">
              • Name: {user?.firstName} {user?.lastName}
            </Text>
            <Text className="mb-1">• Email: {user?.email || "None"}</Text>
            <Text className="mb-1">
              • Avatar: {user?.avatarUrl ? "✅ Has Avatar" : "❌ No Avatar"}
            </Text>
            <Text className="mb-1">
              • User Type: {user?.userType || "None"}
            </Text>
            <Text className="mb-1">• Status: {user?.status || "None"}</Text>
          </View>

          {/* Only show in development */}
          {__DEV__ && setMockUser && (
            <View>
              <Text className="font-semibold mb-2">
                Test With Different Users:
              </Text>

              <TouchableOpacity
                onPress={() => setMockUser(mockUser)}
                className="bg-blue-500 p-3 rounded mb-2"
              >
                <Text className="text-white text-center font-medium">
                  👤 John Doe (with Avatar)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMockUser(mockUserWithoutAvatar)}
                className="bg-green-500 p-3 rounded mb-2"
              >
                <Text className="text-white text-center font-medium">
                  👤 Jane Smith (no Avatar)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMockUser(mockUserSingleName)}
                className="bg-purple-500 p-3 rounded mb-2"
              >
                <Text className="text-white text-center font-medium">
                  👤 Alice (single name)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMockUser(null)}
                className="bg-gray-500 p-3 rounded mb-2"
              >
                <Text className="text-white text-center font-medium">
                  🚪 Logout (Guest Mode)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-4 p-3 bg-yellow-50 rounded">
            <Text className="text-yellow-800 text-sm">
              💡 This debug panel is only available in development mode. The
              Header component above shows real-time user data from AuthContext.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DebugScreen;
