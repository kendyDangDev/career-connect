import { useAlert } from "@/contexts/AlertContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SimpleLoginScreen() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Test123!");
  const [isLoading, setIsLoading] = useState(false);

  const alert = useAlert();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Call login API
      const response = await fetch("http://192.168.249.216:3000/api/auth/mobile/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("[SimpleLogin] Response:", data);

      if (data.success) {
        alert.success("Success", "Login successful!");
        
        // Save token to storage
        if (data.data?.token) {
          // For now, just navigate
          router.replace("/(tabs)/");
        }
      } else {
        alert.error("Error", data.error || "Login failed");
      }
    } catch (error) {
      console.error("[SimpleLogin] Error:", error);
      alert.error("Error", "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold mb-8 text-center">
          Đăng nhập
        </Text>

        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-gray-700">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />
        </View>

        <TouchableOpacity
          className={`py-4 rounded-lg ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              Đăng nhập
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-2"
          onPress={() => router.back()}
        >
          <Text className="text-gray-600 text-center">
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}