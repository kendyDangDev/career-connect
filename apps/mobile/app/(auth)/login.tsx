import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks and contexts
import { useSafeAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { authService } from '@/services/authService';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth.types';

export default function LoginScreen() {
  const router = useRouter();
  const alert = useAlert();

  // Use safe auth context to prevent crash if not wrapped by AuthProvider
  const authContext = useSafeAuthContext();

  // Use auth context login if available
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (authContext?.login) {
        // console.log('[LoginScreen] Using AuthContext login');
        return await authContext.login(credentials);
      } else {
        // console.log('[LoginScreen] AuthContext not available, using authService directly');
        const response = await authService.login(credentials);
        if (response.success) {
          // console.log('[LoginScreen] Login successful via authService, will navigate after state update');
          // Delay navigation to allow state to update
          setTimeout(() => {
            // console.log('[LoginScreen] Navigating to home...');
            router.replace('/(tabs)/');
          }, 100);
        }
        return response;
      }
    },
    [authContext?.login, router]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      if (authContext?.register) {
        return await authContext.register(credentials);
      } else {
        // console.log('[LoginScreen] AuthContext not available for register, using authService directly');
        return await authService.register(credentials);
      }
    },
    [authContext?.register]
  );

  const clearError = useCallback(() => {
    if (authContext?.clearError) {
      authContext.clearError();
    }
  }, [authContext?.clearError]);

  const isLoading = authContext?.isLoading ?? false;
  const error = authContext?.error ?? null;

  // console.log('[LoginScreen] authContext:', !!authContext, { isLoading, error });

  // State management (must come after all hooks)
  const [formData, setFormData] = useState<LoginCredentials>({
    email: 'candidate@gmail.com', // Default test credentials
    password: 'SecurePassword123!',
  });

  // Check if we're coming from register route
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupData, setSignupData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<RegisterCredentials & { general?: string }>
  >({});

  // Animation values - removed for compatibility

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!isSignUp) return 0;
    const password = signupData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  }, [signupData.password, isSignUp]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show error alert when there's an error
  useEffect(() => {
    if (error) {
      alert.error('Lỗi', error, () => clearError());
    }
  }, [error, clearError, alert]);

  // Animated styles - removed for compatibility

  // Validation functions
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phone === '' || phoneRegex.test(phone);
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    return password.length >= 8;
  }, []);

  const getPasswordStrengthText = useCallback(() => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    if (passwordStrength <= 4) return 'Mạnh';
    return 'Rất mạnh';
  }, [passwordStrength]);

  const getPasswordStrengthColor = useCallback(() => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  }, [passwordStrength]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<RegisterCredentials & { general?: string }> = {};

    if (isSignUp) {
      // Signup validation
      if (!signupData.email) {
        errors.email = 'Email không được để trống';
      } else if (!validateEmail(signupData.email)) {
        errors.email = 'Email không hợp lệ';
      }

      if (!signupData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (!validatePassword(signupData.password)) {
        errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      }

      if (!signupData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (signupData.password !== signupData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }

      if (!signupData.firstName) {
        errors.firstName = 'Họ không được để trống';
      }
      if (!signupData.lastName) {
        errors.lastName = 'Tên không được để trống';
      }

      if (signupData.phone && !validatePhone(signupData.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
      }

      if (!signupData.acceptTerms) {
        errors.acceptTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
      }
      if (!signupData.acceptPrivacy) {
        errors.acceptPrivacy = 'Bạn phải đồng ý với chính sách bảo mật';
      }
    } else {
      // Login validation
      if (!formData.email) {
        errors.email = 'Email không được để trống';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Email không hợp lệ';
      }

      if (!formData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    isSignUp,
    signupData,
    formData,
    validateEmail,
    validatePassword,
    validatePhone,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (isSignUp) {
      try {
        // console.log(signupData);
        const response = await register(signupData);
        if (response?.success) {
          console.log('Đăng ký thành công');
          alert.success(
            'Đăng ký thành công!',
            'Vui lòng kiểm tra email để xác thực tài khoản.',
            () => {
              // Navigate to verify email screen with the email
              router.push({
                pathname: '/(auth)/verify-email',
                params: { email: signupData.email },
              });
            }
          );
        } else {
          // Handle registration error
          alert.error('Lỗi', response?.message || 'Đăng ký thất bại');
        }
      } catch (err) {
        // console.error("Registration error:", err);
        alert.error('Lỗi', 'Đã xảy ra lỗi khi đăng ký');
      }
    } else {
      try {
        // console.log('[LoginScreen] Submitting login form...');
        const response = await login(formData);

        if (!response.success) {
          // Handle login error
          // console.log('[LoginScreen] Login failed:', response.error);
          alert.error('Lỗi', response.error || 'Đăng nhập thất bại');
        } else {
          // console.log('[LoginScreen] Login successful!');
          // Navigate after successful login
          setTimeout(() => {
            // console.log('[LoginScreen] Navigating to home tabs...');
            router.replace('/(tabs)/');
          }, 100);
        }
      } catch (err) {
        // console.error("Login error:", err);
        alert.error('Lỗi', 'Đã xảy ra lỗi khi đăng nhập');
      }
    }
  }, [
    validateForm,
    isSignUp,
    signupData,
    formData,
    register,
    login,
    router,
    alert,
  ]);

  const handleInputChange = useCallback(
    (field: keyof LoginCredentials | keyof RegisterCredentials, value: any) => {
      if (isSignUp) {
        setSignupData(prev => ({ ...prev, [field]: value }));
      } else {
        if (field === 'email' || field === 'password') {
          setFormData(prev => ({ ...prev, [field]: value }));
        }
      }

      // Clear validation error when user starts typing
      if (validationErrors[field as keyof typeof validationErrors]) {
        setValidationErrors(prev => ({ ...prev, [field]: '' }));
      }
      // Clear auth error when user starts typing
      if (error) {
        clearError();
      }
    },
    [isSignUp, validationErrors, error, clearError]
  );

  const handleTabSwitch = useCallback(
    (isSignUpMode: boolean) => {
      setIsSignUp(isSignUpMode);
      setValidationErrors({});
      clearError();

      // Reset forms
      if (isSignUpMode) {
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          acceptTerms: false,
          acceptPrivacy: false,
        });
      } else {
        setFormData({
          email: '',
          password: '',
        });
      }
    },
    [clearError]
  );

  // Custom Checkbox Component
  const Checkbox = ({ checked, onChange, children }: any) => (
    <Pressable
      onPress={() => onChange(!checked)}
      className="flex-row items-center"
    >
      <View
        className={`w-5 h-5 mr-2 rounded border-2 ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
      >
        {checked && <Check size={14} color="white" />}
      </View>
      {children}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* <AuthDebug location="LoginScreen" /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#EBF5FF', '#F5F3FF', '#FFF0F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            <View className="flex-1 px-4 py-6">
              {/* Header with Logo */}
              <View>
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-lg">
                    <Briefcase size={32} color="white" />
                  </View>
                  <Text className="text-3xl font-bold text-blue-600 mt-4">
                    CareerConnect
                  </Text>
                  <Text className="text-gray-600 text-center px-8 mt-2">
                    Kết nối tài năng với cơ hội việc làm
                  </Text>
                </View>
              </View>

              {/* Tab Switcher */}
              <View>
                <View className="bg-gray-100 rounded-2xl p-1 mb-6 flex-row">
                  <Pressable
                    className="flex-1"
                    onPress={() => handleTabSwitch(false)}
                  >
                    <View
                      className={`py-3 px-4 rounded-xl ${
                        !isSignUp ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          !isSignUp ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        Đăng nhập
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    className="flex-1"
                    onPress={() => handleTabSwitch(true)}
                  >
                    <View
                      className={`py-3 px-4 rounded-xl ${
                        isSignUp ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          isSignUp ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        Đăng ký
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Form Container */}
              <View>
                <View className="bg-white/95 rounded-3xl shadow-xl p-6">
                  {/* Welcome Text */}
                  <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">
                      {isSignUp ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {isSignUp
                        ? 'Tham gia cùng hàng ngàn người tìm việc khác'
                        : 'Đăng nhập để tiếp tục hành trình tìm việc'}
                    </Text>
                  </View>

                  {/* Name fields - only for signup */}
                  {isSignUp && (
                    <View>
                      <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                          <Text className="text-gray-700 mb-2 font-medium">
                            Họ <Text className="text-red-500">*</Text>
                          </Text>
                          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3">
                            <User size={20} color="#9CA3AF" />
                            <TextInput
                              className="flex-1 ml-2 text-base"
                              placeholder="Nguyễn"
                              value={signupData.firstName}
                              onChangeText={text =>
                                handleInputChange('firstName', text)
                              }
                            />
                          </View>
                          {validationErrors.firstName && (
                            <Text className="text-red-500 text-xs mt-1">
                              {validationErrors.firstName}
                            </Text>
                          )}
                        </View>

                        <View className="flex-1">
                          <Text className="text-gray-700 mb-2 font-medium">
                            Tên <Text className="text-red-500">*</Text>
                          </Text>
                          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3">
                            <User size={20} color="#9CA3AF" />
                            <TextInput
                              className="flex-1 ml-2 text-base"
                              placeholder="Văn A"
                              value={signupData.lastName}
                              onChangeText={text =>
                                handleInputChange('lastName', text)
                              }
                            />
                          </View>
                          {validationErrors.lastName && (
                            <Text className="text-red-500 text-xs mt-1">
                              {validationErrors.lastName}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Email field */}
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2 font-medium">
                      Email{' '}
                      {isSignUp && <Text className="text-red-500">*</Text>}
                    </Text>
                    <View
                      className={`flex-row items-center border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3 py-3`}
                    >
                      <Mail size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 ml-2 text-base"
                        placeholder="your.email@example.com"
                        value={isSignUp ? signupData.email : formData.email}
                        onChangeText={text => handleInputChange('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {validationErrors.email && (
                      <Text className="text-red-500 text-xs mt-1">
                        {validationErrors.email}
                      </Text>
                    )}
                  </View>

                  {/* Phone field - only for signup */}
                  {isSignUp && (
                    <View>
                      <View className="mb-4">
                        <Text className="text-gray-700 mb-2 font-medium">
                          Số điện thoại{' '}
                          <Text className="text-gray-400 text-xs">
                            (Tùy chọn)
                          </Text>
                        </Text>
                        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3">
                          <Phone size={20} color="#9CA3AF" />
                          <TextInput
                            className="flex-1 ml-2 text-base"
                            placeholder="0901234567"
                            value={signupData.phone}
                            onChangeText={text =>
                              handleInputChange('phone', text)
                            }
                            keyboardType="phone-pad"
                          />
                        </View>
                        {validationErrors.phone && (
                          <Text className="text-red-500 text-xs mt-1">
                            {validationErrors.phone}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Password field */}
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2 font-medium">
                      Mật khẩu{' '}
                      {isSignUp && <Text className="text-red-500">*</Text>}
                    </Text>
                    <View
                      className={`flex-row items-center border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3 py-3`}
                    >
                      <Lock size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 ml-2 text-base"
                        placeholder={
                          isSignUp
                            ? 'Nhập mật khẩu mạnh'
                            : 'Nhập mật khẩu của bạn'
                        }
                        value={
                          isSignUp ? signupData.password : formData.password
                        }
                        onChangeText={text =>
                          handleInputChange('password', text)
                        }
                        secureTextEntry={!showPassword}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                          <Eye size={20} color="#9CA3AF" />
                        )}
                      </Pressable>
                    </View>
                    {validationErrors.password && (
                      <Text className="text-red-500 text-xs mt-1">
                        {validationErrors.password}
                      </Text>
                    )}

                    {/* Password strength indicator - only for signup */}
                    {isSignUp && signupData.password && (
                      <View>
                        <View className="mt-2">
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-xs text-gray-600">
                              Độ mạnh mật khẩu
                            </Text>
                            <View
                              className={`px-2 py-1 rounded ${
                                passwordStrength <= 2
                                  ? 'bg-red-100'
                                  : passwordStrength <= 3
                                    ? 'bg-yellow-100'
                                    : passwordStrength <= 4
                                      ? 'bg-blue-100'
                                      : 'bg-green-100'
                              }`}
                            >
                              <Text
                                className={`text-xs font-medium ${
                                  passwordStrength <= 2
                                    ? 'text-red-600'
                                    : passwordStrength <= 3
                                      ? 'text-yellow-600'
                                      : passwordStrength <= 4
                                        ? 'text-blue-600'
                                        : 'text-green-600'
                                }`}
                              >
                                {getPasswordStrengthText()}
                              </Text>
                            </View>
                          </View>
                          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <View
                              className={`h-full ${getPasswordStrengthColor()}`}
                              style={{ width: `${passwordStrength * 20}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Confirm Password - only for signup */}
                  {isSignUp && (
                    <View>
                      <View className="mb-4">
                        <Text className="text-gray-700 mb-2 font-medium">
                          Xác nhận mật khẩu{' '}
                          <Text className="text-red-500">*</Text>
                        </Text>
                        <View
                          className={`flex-row items-center border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3 py-3`}
                        >
                          <Lock size={20} color="#9CA3AF" />
                          <TextInput
                            className="flex-1 ml-2 text-base"
                            placeholder="Nhập lại mật khẩu"
                            value={signupData.confirmPassword}
                            onChangeText={text =>
                              handleInputChange('confirmPassword', text)
                            }
                            secureTextEntry={!showConfirmPassword}
                          />
                          <Pressable
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} color="#9CA3AF" />
                            ) : (
                              <Eye size={20} color="#9CA3AF" />
                            )}
                          </Pressable>
                        </View>
                        {validationErrors.confirmPassword && (
                          <Text className="text-red-500 text-xs mt-1">
                            {validationErrors.confirmPassword}
                          </Text>
                        )}
                        {/* Show checkmark when passwords match */}
                        {signupData.password &&
                          signupData.confirmPassword &&
                          signupData.password ===
                            signupData.confirmPassword && (
                            <View className="flex-row items-center mt-1">
                              <CheckCircle size={14} color="#10b981" />
                              <Text className="text-green-600 text-xs ml-1">
                                Mật khẩu khớp
                              </Text>
                            </View>
                          )}
                      </View>
                    </View>
                  )}

                  {/* Terms and Privacy - only for signup */}
                  {isSignUp && (
                    <View>
                      <View className="mb-4">
                        <Checkbox
                          checked={signupData.acceptTerms}
                          onChange={(checked: boolean) =>
                            handleInputChange('acceptTerms', checked)
                          }
                        >
                          <View className="flex-row items-center flex-1">
                            <Text className="text-gray-600">
                              Tôi đồng ý với{' '}
                            </Text>
                            <Pressable
                              onPress={() => {
                                /* Open terms */
                              }}
                            >
                              <Text className="text-blue-600 font-medium">
                                Điều khoản sử dụng
                              </Text>
                            </Pressable>
                            <Text className="text-red-500"> *</Text>
                          </View>
                        </Checkbox>
                        {validationErrors.acceptTerms && (
                          <Text className="text-red-500 text-xs mt-1 ml-7">
                            {validationErrors.acceptTerms}
                          </Text>
                        )}

                        <View className="mt-3">
                          <Checkbox
                            checked={signupData.acceptPrivacy}
                            onChange={(checked: boolean) =>
                              handleInputChange('acceptPrivacy', checked)
                            }
                          >
                            <View className="flex-row items-center flex-1">
                              <Text className="text-gray-600">
                                Tôi đã đọc và đồng ý với{' '}
                              </Text>
                              <Pressable
                                onPress={() => {
                                  /* Open privacy */
                                }}
                              >
                                <Text className="text-blue-600 font-medium">
                                  Chính sách bảo mật
                                </Text>
                              </Pressable>
                              <Text className="text-red-500"> *</Text>
                            </View>
                          </Checkbox>
                          {validationErrors.acceptPrivacy && (
                            <Text className="text-red-500 text-xs mt-1 ml-7">
                              {validationErrors.acceptPrivacy}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Remember me and forgot password - only for login */}
                  {/* {!isSignUp && (
                    <View className="flex-row justify-between items-center mb-6">
                      <Checkbox checked={rememberMe} onChange={setRememberMe}>
                        <Text className="text-gray-600">Ghi nhớ tôi</Text>
                      </Checkbox>
                      <Pressable
                        onPress={() => router.push("/(auth)/forgot-password")}
                      >
                        <Text className="text-blue-600 font-medium">
                          Quên mật khẩu?
                        </Text>
                      </Pressable>
                    </View>
                  )} */}

                  {/* Submit button */}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`${
                      isLoading ? 'bg-blue-400' : 'bg-blue-600'
                    } py-4 rounded-xl flex-row items-center justify-center`}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View className="flex-row items-center">
                        <Text className="text-white font-semibold text-base mr-2">
                          {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
                        </Text>
                        <ArrowRight size={20} color="white" />
                      </View>
                    )}
                  </Pressable>

                  {/* Divider */}
                  <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="text-gray-500 px-3">
                      Hoặc tiếp tục với
                    </Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>

                  {/* Social login buttons */}
                  <View className="flex-row gap-3">
                    <Pressable
                      className="flex-1 border border-gray-300 py-3 rounded-xl flex-row items-center justify-center"
                      onPress={() => {
                        /* Google login */
                      }}
                    >
                      <Image
                        source={require('@/assets/images/icons8-google-72.png')}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                      />
                      <Text className="text-gray-700 font-medium">Google</Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 border border-gray-300 py-3 rounded-xl flex-row items-center justify-center"
                      onPress={() => {
                        /* Facebook login */
                      }}
                    >
                      <Image
                        source={require('@/assets/images/facebook.png')}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                      />
                      <Text className="text-gray-700 font-medium">
                        Facebook
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Footer Stats */}
              <View>
                <View className="mt-6 p-4 bg-white/80 rounded-2xl">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-blue-600">
                        10K+
                      </Text>
                      <Text className="text-xs text-gray-600">Việc làm</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-green-600">
                        5K+
                      </Text>
                      <Text className="text-xs text-gray-600">Công ty</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-purple-600">
                        95%
                      </Text>
                      <Text className="text-xs text-gray-600">Hài lòng</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
