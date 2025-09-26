import { useAlert } from "@/contexts/AlertContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Send,
  Shield
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyEmail, isLoading, error, clearError } = useAuthContext();
  
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const alert = useAlert()
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const email = params.email as string || "";

  // Clear error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
    if (error) {
      clearError();
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newCode.every(digit => digit !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Handle backspace
    if (key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Removed handlePaste for React Native (not needed)

  const validateCode = (): boolean => {
    const code = verificationCode.join("");
    
    if (code.length !== 6) {
      setValidationError("Vui lòng nhập đầy đủ 6 chữ số");
      return false;
    }
    
    return true;
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || verificationCode.join("");
    
    if (!codeToVerify && !validateCode()) {
      return;
    }

    try {
      const response = await verifyEmail({ token: code });
      if (response?.success) {
        setSuccessMessage("Email đã được xác thực thành công!");
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          router.push("/(tabs)");
        }, 2000);
      }
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      // Call resend API endpoint
      // TODO: Implement resend verification endpoint in authService
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage("Mã xác thực mới đã được gửi!");
        setVerificationCode(["", "", "", "", "", ""]);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setValidationError("Không thể gửi lại mã. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setValidationError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#3B82F6", "#8B5CF6"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 py-8">
              {/* Back button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center mb-6"
              >
                <ArrowLeft size={24} color="white" />
                <Text className="text-white ml-2 text-base">Quay lại</Text>
              </TouchableOpacity>

              {/* Main content card */}
              <View className="bg-white rounded-3xl p-6 shadow-2xl">
                {/* Icon and Header */}
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="items-center mb-6"
                >
                  <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                    <Mail size={40} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Xác thực email
                  </Text>
                  <Text className="text-gray-600 text-center">
                    Chúng tôi đã gửi mã xác thực 6 chữ số đến
                  </Text>
                  <Text className="text-blue-600 font-semibold mt-1">
                    {email}
                  </Text>
                </Animated.View>

                {/* Success message */}
                {successMessage && (
                  <Animated.View
                    entering={FadeInUp.duration(300)}
                    className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex-row items-center"
                  >
                    <CheckCircle size={20} color="#10B981" />
                    <Text className="text-green-600 ml-2 flex-1">
                      {successMessage}
                    </Text>
                  </Animated.View>
                )}

                {/* Error messages */}
                {(error || validationError) && (
                  <Animated.View
                    entering={FadeInUp.duration(300)}
                    className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center"
                  >
                    <AlertCircle size={20} color="#EF4444" />
                    <Text className="text-red-600 ml-2 flex-1">
                      {error || validationError}
                    </Text>
                  </Animated.View>
                )}

                {/* Verification code inputs */}
                <View className="mb-6">
                  <Text className="text-center text-gray-700 font-medium mb-4">
                    Nhập mã xác thực
                  </Text>
                  <View className="flex-row justify-center gap-2">
                    {verificationCode.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(el) => {
                          if (el) inputRefs.current[index] = el;
                        }}
                        className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl ${
                          error || validationError
                            ? "border-red-500 bg-red-50"
                            : digit
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white"
                        }`}
                        value={digit}
                        onChangeText={(value) => handleCodeChange(index, value)}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Backspace") {
                            handleKeyPress(index, "Backspace");
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={1}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>
                  <Text className="text-center text-gray-500 text-xs mt-3">
                    Nhập mã 6 chữ số đã được gửi đến email của bạn
                  </Text>
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  onPress={() => handleVerify()}
                  disabled={isLoading || verificationCode.some((digit) => !digit)}
                  className={`bg-blue-600 rounded-xl py-4 flex-row items-center justify-center mb-6 ${
                    isLoading || verificationCode.some((digit) => !digit)
                      ? "opacity-50"
                      : ""
                  }`}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="flex-row items-center">
                      <Shield size={20} color="white" />
                      <Text className="text-white font-semibold ml-2 text-base">
                        Xác thực email
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Resend section */}
                <View className="border-t border-gray-200 pt-4">
                  <Text className="text-center text-gray-600 mb-3">
                    Không nhận được mã xác thực?
                  </Text>
                  {!canResend ? (
                    <View className="flex-row items-center justify-center">
                      <Clock size={16} color="#6B7280" />
                      <Text className="text-gray-500 ml-2">
                        Gửi lại mã sau {formatTime(resendTimer)}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={isResending}
                      className="flex-row items-center justify-center"
                      activeOpacity={0.7}
                    >
                      {isResending ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#3B82F6" />
                          <Text className="text-blue-600 ml-2">Đang gửi...</Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Send size={16} color="#3B82F6" />
                          <Text className="text-blue-600 ml-2 font-medium">
                            Gửi lại mã xác thực
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* Additional help */}
                <View className="mt-6 bg-blue-50 rounded-xl p-4">
                  <View className="flex-row">
                    <AlertCircle size={20} color="#3B82F6" />
                    <View className="ml-2 flex-1">
                      <Text className="text-blue-800 font-semibold mb-1">
                        Lưu ý:
                      </Text>
                      <Text className="text-blue-700 text-sm">
                        • Kiểm tra thư mục spam nếu không thấy email
                      </Text>
                      <Text className="text-blue-700 text-sm">
                        • Mã xác thực có hiệu lực trong 24 giờ
                      </Text>
                      <Text className="text-blue-700 text-sm">
                        • Sau 3 lần nhập sai, tài khoản sẽ bị khóa tạm thời
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Alternative verification methods */}
                <TouchableOpacity
                  onPress={() => {
                    alert.warning(
                      "Đổi email",
                      "Bạn có muốn sử dụng email khác để xác thực?",

                           () => router.back(),
                      
                    );
                  }}
                  className="mt-4"
                >
                  <Text className="text-center text-gray-600 text-sm">
                    Sử dụng email khác?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
