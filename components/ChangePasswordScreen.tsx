import { useAlert } from "@/contexts/AlertContext";
import { useAuthContext } from "@/contexts/AuthContext";
import userService from "@/services/userService";
import type { ChangePasswordRequest } from "@/types/user.types";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  Shield,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const alert = useAlert();

  // State management
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Error states
  const [errors, setErrors] = useState<Partial<ChangePasswordRequest>>({});

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.newPassword;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  }, [formData.newPassword]);

  // Get password strength details
  const getPasswordStrengthDetails = useCallback(() => {
    const password = formData.newPassword;
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [formData.newPassword]);

  const getPasswordStrengthText = useCallback(() => {
    if (formData.newPassword.length === 0) return "";
    if (passwordStrength <= 2) return "Yếu";
    if (passwordStrength <= 4) return "Trung bình";
    if (passwordStrength <= 5) return "Mạnh";
    return "Rất mạnh";
  }, [passwordStrength, formData.newPassword]);

  const getPasswordStrengthColor = useCallback(() => {
    if (passwordStrength <= 2) return "#EF4444"; // red
    if (passwordStrength <= 4) return "#F59E0B"; // yellow
    if (passwordStrength <= 5) return "#3B82F6"; // blue
    return "#10B981"; // green
  }, [passwordStrength]);

  const getPasswordStrengthWidth = useCallback(() => {
    if (formData.newPassword.length === 0) return "0%";
    const percentage = (passwordStrength / 6) * 100;
    return `${percentage}%`;
  }, [passwordStrength, formData.newPassword]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ChangePasswordRequest> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (passwordStrength < 3) {
      newErrors.newPassword = "Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordStrength]);

  // Handle change password
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      alert.error("Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await userService.changePassword(user.id, formData);

      if ("error" in response) {
        // Handle specific error cases
        if (response.error.includes("incorrect") || response.error.includes("wrong")) {
          setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
        } else {
          alert.error("Lỗi", response.error);
        }
        return;
      }

      // Success
      alert.success(
        "Thành công",
        "Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới."
      );
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error changing password:", error);
      alert.error("Lỗi", "Không thể đổi mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = useMemo(() => {
    const details = getPasswordStrengthDetails();
    return [
      {
        met: details.length,
        text: "Ít nhất 8 ký tự",
        icon: details.length ? CheckCircle : XCircle,
        color: details.length ? "#10B981" : "#6B7280",
      },
      {
        met: details.uppercase,
        text: "Chứa chữ in hoa",
        icon: details.uppercase ? CheckCircle : XCircle,
        color: details.uppercase ? "#10B981" : "#6B7280",
      },
      {
        met: details.lowercase,
        text: "Chứa chữ thường",
        icon: details.lowercase ? CheckCircle : XCircle,
        color: details.lowercase ? "#10B981" : "#6B7280",
      },
      {
        met: details.number,
        text: "Chứa số",
        icon: details.number ? CheckCircle : XCircle,
        color: details.number ? "#10B981" : "#6B7280",
      },
      {
        met: details.special,
        text: "Chứa ký tự đặc biệt",
        icon: details.special ? CheckCircle : XCircle,
        color: details.special ? "#10B981" : "#6B7280",
      },
    ];
  }, [getPasswordStrengthDetails]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-gray-900">
              Đổi mật khẩu
            </Text>

            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Security Notice */}
          <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl flex-row">
            <View className="mr-3">
              <Shield size={24} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold mb-1">
                Bảo mật tài khoản
              </Text>
              <Text className="text-blue-700 text-sm">
                Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ
                với người khác.
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
            {/* Current Password */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`border ${
                    errors.currentPassword ? "border-red-500" : "border-gray-300"
                  } rounded-xl pl-10 pr-12 py-3 text-gray-900`}
                  value={formData.currentPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, currentPassword: text });
                    if (errors.currentPassword) {
                      setErrors({ ...errors, currentPassword: undefined });
                    }
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`border ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } rounded-xl pl-10 pr-12 py-3 text-gray-900`}
                  value={formData.newPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, newPassword: text });
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: undefined });
                    }
                  }}
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </Text>
              )}

              {/* Password Strength Indicator */}
              {formData.newPassword.length > 0 && (
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs text-gray-600">Độ mạnh:</Text>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: getPasswordStrengthWidth(),
                        backgroundColor: getPasswordStrengthColor(),
                      }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } rounded-xl pl-10 pr-12 py-3 text-gray-900`}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </Text>
              )}
              {formData.confirmPassword &&
                formData.newPassword === formData.confirmPassword &&
                !errors.confirmPassword && (
                  <View className="flex-row items-center mt-2">
                    <CheckCircle size={16} color="#10B981" />
                    <Text className="text-green-600 text-xs ml-1">
                      Mật khẩu khớp
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* Password Requirements */}
          <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <Info size={18} color="#6B7280" />
              <Text className="text-sm font-medium text-gray-700 ml-2">
                Yêu cầu mật khẩu
              </Text>
            </View>
            <View>
              {passwordRequirements.map((req, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <req.icon size={16} color={req.color} />
                  <Text
                    className="text-sm ml-2"
                    style={{ color: req.met ? "#10B981" : "#6B7280" }}
                  >
                    {req.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mx-4 mt-6">
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={loading}
              className={`${
                loading ? "bg-blue-400" : "bg-blue-600"
              } rounded-xl py-4 items-center mb-3`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Shield size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Đổi mật khẩu
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-200 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">Hủy</Text>
            </TouchableOpacity>
          </View>

          {/* Tips Section */}
          <View className="bg-yellow-50 mx-4 mt-6 p-4 rounded-xl">
            <Text className="text-yellow-900 font-semibold mb-2">
              💡 Mẹo tạo mật khẩu an toàn
            </Text>
            <View className="space-y-1">
              <Text className="text-yellow-700 text-sm">
                • Sử dụng cụm từ dài thay vì từ đơn
              </Text>
              <Text className="text-yellow-700 text-sm">
                • Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
              </Text>
              <Text className="text-yellow-700 text-sm">
                • Không sử dụng thông tin cá nhân dễ đoán
              </Text>
              <Text className="text-yellow-700 text-sm">
                • Sử dụng mật khẩu khác nhau cho mỗi tài khoản
              </Text>
              <Text className="text-yellow-700 text-sm">
                • Cập nhật mật khẩu định kỳ
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;