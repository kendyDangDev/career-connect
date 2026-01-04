import { useAlert } from '@/contexts/AlertContext';
import { useAuthContext } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import type {
  Gender,
  UpdateUserProfileRequest,
  UpdateUserRequest,
  UserProfile,
  User as UserType,
} from '@/types/user.types';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Camera,
  Edit2,
  Mail,
  Phone,
  Save,
  User,
  Award,
  Briefcase,
  UserCheck,
  Calendar,
  ChevronDown,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Link,
  Check,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileInfoScreen: React.FC = () => {
  const router = useRouter();
  const { user: authUser } = useAuthContext();
  const alert = useAlert();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // User data states
  const [userData, setUserData] = useState<UserType | null>(null);

  // Form states for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: new Date(),
    gender: 'PREFER_NOT_TO_SAY' as Gender,
    address: '',
    city: '',
    province: '',
    country: 'Vietnam',
    bio: '',
    websiteUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  // Gender options
  const genderOptions = [
    { value: 'MALE' as Gender, label: 'Nam' },
    { value: 'FEMALE' as Gender, label: 'Nữ' },
    { value: 'OTHER' as Gender, label: 'Khác' },
    { value: 'PREFER_NOT_TO_SAY' as Gender, label: 'Không muốn nói' },
  ];

  const loadUserData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (authUser?.id) {
        const userResponse = await userService.getUserById(authUser.id);
        if ('data' in userResponse && userResponse.data) {
          setUserData(userResponse.data);
          const profileResponse = await userService.getUserProfile(authUser.id);
          if ('data' in profileResponse && profileResponse.data) {
            updateFormData(userResponse.data, profileResponse.data);
          } else {
            updateFormData(userResponse.data, null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert.error('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, alert]);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const updateFormData = (user: UserType, profile: UserProfile | null) => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      email: user.email,
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : new Date(),
      gender: (profile?.gender as Gender) || ('PREFER_NOT_TO_SAY' as Gender),
      address: profile?.address || '',
      city: profile?.city || '',
      province: profile?.province || '',
      country: profile?.country || 'Vietnam',
      bio: profile?.bio || '',
      websiteUrl: profile?.websiteUrl || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      portfolioUrl: profile?.portfolioUrl || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    if (!authUser?.id) {
      alert.error('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      const userUpdateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      const userResponse = await userService.updateUser(
        authUser.id,
        userUpdateData
      );
      if ('error' in userResponse) {
        alert.error('Lỗi', userResponse.error);
        return;
      }

      const profileUpdateData: UpdateUserProfileRequest = {
        dateOfBirth: formData.dateOfBirth.toISOString(),
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        bio: formData.bio,
        websiteUrl: formData.websiteUrl,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
      };

      const profileResponse = await userService.updateUserProfile(
        authUser.id,
        profileUpdateData
      );
      if ('error' in profileResponse) {
        alert.error('Lỗi', profileResponse.error);
        return;
      }

      if ('data' in userResponse && userResponse.data) {
        setUserData(userResponse.data);
      }
      // Profile updated successfully

      setIsEditing(false);
      alert.success('Thành công', 'Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert.error('Lỗi', 'Không thể lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert.error('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0] && authUser?.id) {
      const uploadResponse = await userService.uploadAvatar(
        authUser.id,
        result.assets[0].uri
      );
      if ('avatarUrl' in uploadResponse) {
        setUserData(prev =>
          prev ? { ...prev, avatarUrl: uploadResponse.avatarUrl } : null
        );
      }
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getGenderLabel = (gender: Gender) => {
    const option = genderOptions.find(opt => opt.value === gender);
    return option?.label || 'Không muốn nói';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Modern Header with Gradient */}
          <View className="relative">
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8', '#1e40af']}
              className="h-64 w-full"
            />

            {/* Header Controls */}
            <View className="absolute top-12 left-0 right-0 flex-row items-center justify-between px-4 z-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                style={{ elevation: 5 }}
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-white">
                Thông tin cá nhân
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={saving}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                style={{ elevation: 5 }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isEditing ? (
                  <Save size={20} color="white" />
                ) : (
                  <Edit2 size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View
              className="bg-white mx-4 rounded-3xl -mt-32 mb-6"
              style={{
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              }}
            >
              <View className="items-center pt-8 pb-6">
                <TouchableOpacity
                  onPress={isEditing ? handleImagePicker : undefined}
                  className="relative mb-4"
                  disabled={!isEditing}
                >
                  <View
                    className="w-28 h-28 rounded-full border-4 border-white"
                    style={{
                      elevation: 6,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                    }}
                  >
                    {userData?.avatarUrl ? (
                      <Image
                        source={{ uri: userData.avatarUrl }}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={['#60a5fa', '#3b82f6']}
                        className="w-full h-full rounded-full justify-center items-center"
                      >
                        <User size={48} color="white" />
                      </LinearGradient>
                    )}
                  </View>
                  {isEditing && (
                    <View
                      className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2"
                      style={{ elevation: 4 }}
                    >
                      <Camera size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : 'Người dùng'}
                </Text>
                <Text className="text-gray-600 mb-4">{userData?.email}</Text>

                {/* Stats Row */}
                <View className="flex-row justify-around w-full px-8 py-4 bg-gray-50 mx-4 rounded-2xl">
                  <View className="items-center">
                    <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                      <UserCheck size={20} color="#3b82f6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                      100%
                    </Text>
                    <Text className="text-xs text-gray-500">Hoàn thành</Text>
                  </View>

                  <View className="items-center">
                    <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                      <Award size={20} color="#059669" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">5</Text>
                    <Text className="text-xs text-gray-500">Chứng chỉ</Text>
                  </View>

                  <View className="items-center">
                    <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                      <Briefcase size={20} color="#7c3aed" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">3</Text>
                    <Text className="text-xs text-gray-500">Kinh nghiệm</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Basic Information Section */}
          <View
            className="bg-white mx-4 rounded-2xl p-6 mb-4"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <User size={20} color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Thông tin cơ bản
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              {/* First Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Họ
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.firstName}
                      onChangeText={text =>
                        setFormData({ ...formData, firstName: text })
                      }
                      placeholder="Nhập họ"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.firstName || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Last Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Tên
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.lastName}
                      onChangeText={text =>
                        setFormData({ ...formData, lastName: text })
                      }
                      placeholder="Nhập tên"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.lastName || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Phone */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Phone size={16} color="#6B7280" />
                    <TextInput
                      className="text-gray-900 text-base ml-3 flex-1"
                      value={formData.phone}
                      onChangeText={text =>
                        setFormData({ ...formData, phone: text })
                      }
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Phone size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-900">
                      {formData.phone || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Email */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className="bg-blue-50 rounded-xl px-4 py-3 flex-row items-center">
                  <Mail size={16} color="#3b82f6" />
                  <Text className="ml-3 text-base text-gray-900">
                    {formData.email}
                  </Text>
                </View>
              </View>

              {/* Date of Birth */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Calendar size={16} color="#6B7280" />
                    <Text className="ml-3 text-gray-900">
                      {formatDate(formData.dateOfBirth)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-900">
                      {formatDate(formData.dateOfBirth)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Gender */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={() => setShowGenderPicker(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-900">
                      {getGenderLabel(formData.gender)}
                    </Text>
                    <ChevronDown size={20} color="#6B7280" />
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {getGenderLabel(formData.gender)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Address Information Section */}
          <View
            className="bg-white mx-4 rounded-2xl p-6 mb-4"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <MapPin size={20} color="#059669" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Địa chỉ</Text>
            </View>

            <View className="space-y-4">
              {/* Address */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.address}
                      onChangeText={text =>
                        setFormData({ ...formData, address: text })
                      }
                      placeholder="Nhập địa chỉ"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.address || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* City */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Thành phố
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.city}
                      onChangeText={text =>
                        setFormData({ ...formData, city: text })
                      }
                      placeholder="Nhập thành phố"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.city || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Province */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.province}
                      onChangeText={text =>
                        setFormData({ ...formData, province: text })
                      }
                      placeholder="Nhập tỉnh/thành"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.province || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Country */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Quốc gia
                </Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Text className="text-base text-gray-900">
                    {formData.country}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Professional Information Section */}
          <View
            className="bg-white mx-4 rounded-2xl p-6 mb-4"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Briefcase size={20} color="#7c3aed" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Thông tin nghề nghiệp
              </Text>
            </View>

            <View className="space-y-4">
              {/* Bio */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      value={formData.bio}
                      onChangeText={text =>
                        setFormData({ ...formData, bio: text })
                      }
                      placeholder="Giới thiệu về bản thân"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-900">
                      {formData.bio || 'Chưa cập nhật'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Website */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Website
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Globe size={16} color="#6B7280" />
                    <TextInput
                      className="text-gray-900 text-base ml-3 flex-1"
                      value={formData.websiteUrl}
                      onChangeText={text =>
                        setFormData({ ...formData, websiteUrl: text })
                      }
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                    />
                  </View>
                ) : formData.websiteUrl ? (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Globe size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-blue-600">
                      {formData.websiteUrl}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-400">
                      Chưa cập nhật
                    </Text>
                  </View>
                )}
              </View>

              {/* LinkedIn */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Linkedin size={16} color="#0077B5" />
                    <TextInput
                      className="text-gray-900 text-base ml-3 flex-1"
                      value={formData.linkedinUrl}
                      onChangeText={text =>
                        setFormData({ ...formData, linkedinUrl: text })
                      }
                      placeholder="https://linkedin.com/in/username"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                    />
                  </View>
                ) : formData.linkedinUrl ? (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Linkedin size={16} color="#0077B5" />
                    <Text className="ml-3 text-base text-blue-600">
                      {formData.linkedinUrl}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-400">
                      Chưa cập nhật
                    </Text>
                  </View>
                )}
              </View>

              {/* GitHub */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Github size={16} color="#333" />
                    <TextInput
                      className="text-gray-900 text-base ml-3 flex-1"
                      value={formData.githubUrl}
                      onChangeText={text =>
                        setFormData({ ...formData, githubUrl: text })
                      }
                      placeholder="https://github.com/username"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                    />
                  </View>
                ) : formData.githubUrl ? (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Github size={16} color="#333" />
                    <Text className="ml-3 text-base text-blue-600">
                      {formData.githubUrl}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-400">
                      Chưa cập nhật
                    </Text>
                  </View>
                )}
              </View>

              {/* Portfolio */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </Text>
                {isEditing ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Link size={16} color="#6B7280" />
                    <TextInput
                      className="text-gray-900 text-base ml-3 flex-1"
                      value={formData.portfolioUrl}
                      onChangeText={text =>
                        setFormData({ ...formData, portfolioUrl: text })
                      }
                      placeholder="https://portfolio.dev"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                    />
                  </View>
                ) : formData.portfolioUrl ? (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                    <Link size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-blue-600">
                      {formData.portfolioUrl}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Text className="text-base text-gray-400">
                      Chưa cập nhật
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-blue-600 rounded-xl py-4 items-center mb-3"
                style={{ elevation: 2 }}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Lưu thay đổi
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  loadUserData();
                }}
                className="bg-gray-200 rounded-xl py-4 items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white">
                <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-600 text-base">Hủy</Text>
                  </TouchableOpacity>
                  <Text className="font-semibold text-base">
                    Chọn ngày sinh
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-600 text-base font-semibold">
                      Xong
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setFormData({ ...formData, dateOfBirth: selectedDate });
                    }
                  }}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        )}

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, dateOfBirth: selectedDate });
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Gender Picker Modal */}
        <Modal visible={showGenderPicker} transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-end bg-black/50"
            activeOpacity={1}
            onPress={() => setShowGenderPicker(false)}
          >
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold">Chọn giới tính</Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View className="py-2">
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setFormData({ ...formData, gender: option.value });
                      setShowGenderPicker(false);
                    }}
                    className="flex-row items-center justify-between px-4 py-3"
                  >
                    <Text className="text-base text-gray-900">
                      {option.label}
                    </Text>
                    {formData.gender === option.value && (
                      <Check size={20} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileInfoScreen;
