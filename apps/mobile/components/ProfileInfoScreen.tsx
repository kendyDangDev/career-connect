import { useAlert } from "@/contexts/AlertContext";
import { useAuthContext } from "@/contexts/AuthContext";
import userService from "@/services/userService";
import type {
  Gender,
  UpdateUserProfileRequest,
  UpdateUserRequest,
  UserProfile,
  User as UserType,
} from "@/types/user.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Edit2,
  Github,
  Globe,
  Link,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileInfoScreen: React.FC = () => {
  const router = useRouter();
  const { user: authUser, updateUser: updateAuthUser } = useAuthContext();
  const alert = useAlert();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // User data states
  const [userData, setUserData] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Form states for editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: new Date(),
    gender: "PREFER_NOT_TO_SAY" as Gender,
    address: "",
    city: "",
    province: "",
    country: "Vietnam",
    bio: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  // Gender options
  const genderOptions = [
    { value: "MALE" as Gender, label: "Nam" },
    { value: "FEMALE" as Gender, label: "Nữ" },
    { value: "OTHER" as Gender, label: "Khác" },
    { value: "PREFER_NOT_TO_SAY" as Gender, label: "Không muốn nói" },
  ];

  // Vietnamese provinces
  const provinces = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // if (__DEV__) {
      //   // Use mock data in development
      //   const mockProfile = userService.getMockUserProfile();
      //   const mockUser: UserType = {
      //     id: authUser?.id || "mock-user-id",
      //     email: authUser?.email || "user@example.com",
      //     firstName: authUser?.firstName || "Nguyễn",
      //     lastName: authUser?.lastName || "Văn A",
      //     phone: "0912345678",
      //     avatarUrl: "https://via.placeholder.com/150",
      //     userType: "CANDIDATE" as any,
      //     status: "ACTIVE" as any,
      //     emailVerified: true,
      //     phoneVerified: false,
      //     createdAt: "2024-01-01T00:00:00Z",
      //     updatedAt: "2024-01-01T00:00:00Z",
      //     profile: mockProfile,
      //   };

      //   setUserData(mockUser);
      //   setUserProfile(mockProfile);
      //   updateFormData(mockUser, mockProfile);
      // } else if (authUser?.id) {
        // Load real data from API
        const userResponse = await userService.getUserById(authUser.id);
        if ("data" in userResponse && userResponse.data) {
          setUserData(userResponse.data);

          const profileResponse = await userService.getUserProfile(authUser.id);
          if ("data" in profileResponse && profileResponse.data) {
            setUserProfile(profileResponse.data);
            updateFormData(userResponse.data, profileResponse.data);
          } else {
            // Create default profile data if not exists
            updateFormData(userResponse.data, null);
          }
        // }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      alert.error("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (user: UserType, profile: UserProfile | null) => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      email: user.email,
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : new Date(),
      gender: profile?.gender || "PREFER_NOT_TO_SAY",
      address: profile?.address || "",
      city: profile?.city || "",
      province: profile?.province || "",
      country: profile?.country || "Vietnam",
      bio: profile?.bio || "",
      websiteUrl: profile?.websiteUrl || "",
      linkedinUrl: profile?.linkedinUrl || "",
      githubUrl: profile?.githubUrl || "",
      portfolioUrl: profile?.portfolioUrl || "",
    });
  };

  const handleSave = async () => {
    // try {
      setSaving(true);

      if (!authUser?.id) {
        alert.error("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      // Update user basic info
      const userUpdateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      const userResponse = await userService.updateUser(
        authUser.id,
        userUpdateData
      );

      if ("error" in userResponse) {
        alert.error("Lỗi", userResponse.error);
        return;
      }

      // Update user profile
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

      if ("error" in profileResponse) {
        alert.error("Lỗi", profileResponse.error);
        return;
      }

      // Update auth context with new user data
      if ("data" in userResponse && userResponse.data) {
        // updateAuthUser(userResponse.data);
        setUserData(userResponse.data);
      }

      if ("data" in profileResponse && profileResponse.data) {
        setUserProfile(profileResponse.data);
      }

      setIsEditing(false);
      alert.success("Thành công", "Cập nhật thông tin thành công");
    // } catch (error) {
    //   console.error("Error saving profile:", error);
    //   alert.error("Lỗi", "Không thể lưu thông tin");
    // } finally {
    //   setSaving(false);
    // }
  };

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert.error("Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      // Upload avatar
      if (authUser?.id) {
        const uploadResponse = await userService.uploadAvatar(
          authUser.id,
          result.assets[0].uri
        );
        if ("avatarUrl" in uploadResponse) {
          setUserData((prev) =>
            prev ? { ...prev, avatarUrl: uploadResponse.avatarUrl } : null
          );
        }
      }
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getGenderLabel = (gender: Gender) => {
    const option = genderOptions.find((opt) => opt.value === gender);
    return option?.label || "Không muốn nói";
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2"
            >
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            
            <Text className="text-lg font-semibold text-gray-900">
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
              className="p-2"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : isEditing ? (
                <Save size={24} color="#2563EB" />
              ) : (
                <Edit2 size={24} color="#2563EB" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="bg-white px-4 py-6 items-center">
            <TouchableOpacity
              onPress={isEditing ? handleImagePicker : undefined}
              className="relative"
              disabled={!isEditing}
            >
              {userData?.avatarUrl ? (
                <Image
                  source={{ uri: userData.avatarUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-blue-100 justify-center items-center">
                  <User size={40} color="#2563EB" />
                </View>
              )}
              {isEditing && (
                <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                  <Camera size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <Text className="mt-3 text-xl font-bold text-gray-900">
              {userData?.firstName} {userData?.lastName}
            </Text>
            <Text className="text-gray-500">{userData?.email}</Text>
          </View>

          {/* Basic Information Section */}
          <View className="bg-white mt-2 px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin cơ bản
            </Text>

            {/* First Name */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Họ</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                  placeholder="Nhập họ"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {formData.firstName || "Chưa cập nhật"}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Tên</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastName: text })
                  }
                  placeholder="Nhập tên"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {formData.lastName || "Chưa cập nhật"}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Số điện thoại</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              ) : (
                <View className="flex-row items-center">
                  <Phone size={16} color="#6B7280" />
                  <Text className="ml-2 text-base text-gray-900">
                    {formData.phone || "Chưa cập nhật"}
                  </Text>
                </View>
              )}
            </View>

            {/* Email (Read-only) */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Email</Text>
              <View className="flex-row items-center">
                <Mail size={16} color="#6B7280" />
                <Text className="ml-2 text-base text-gray-900">
                  {formData.email}
                </Text>
              </View>
            </View>

            {/* Date of Birth */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Ngày sinh</Text>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 rounded-lg px-3 py-2 flex-row items-center"
                >
                  <Calendar size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-900">
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center">
                  <Calendar size={16} color="#6B7280" />
                  <Text className="ml-2 text-base text-gray-900">
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                </View>
              )}
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Giới tính</Text>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => setShowGenderPicker(true)}
                  className="border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between"
                >
                  <Text className="text-gray-900">
                    {getGenderLabel(formData.gender)}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
              ) : (
                <Text className="text-base text-gray-900">
                  {getGenderLabel(formData.gender)}
                </Text>
              )}
            </View>
          </View>

          {/* Address Information Section */}
          <View className="bg-white mt-2 px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Địa chỉ
            </Text>

            {/* Address */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Địa chỉ</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  placeholder="Nhập địa chỉ"
                  multiline
                />
              ) : (
                <View className="flex-row items-start">
                  <MapPin size={16} color="#6B7280" className="mt-1" />
                  <Text className="ml-2 text-base text-gray-900 flex-1">
                    {formData.address || "Chưa cập nhật"}
                  </Text>
                </View>
              )}
            </View>

            {/* City */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Thành phố</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                  placeholder="Nhập thành phố"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {formData.city || "Chưa cập nhật"}
                </Text>
              )}
            </View>

            {/* Province */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Tỉnh/Thành</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.province}
                  onChangeText={(text) =>
                    setFormData({ ...formData, province: text })
                  }
                  placeholder="Nhập tỉnh/thành"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {formData.province || "Chưa cập nhật"}
                </Text>
              )}
            </View>

            {/* Country */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Quốc gia</Text>
              <Text className="text-base text-gray-900">
                {formData.country}
              </Text>
            </View>
          </View>

          {/* Professional Information Section */}
          <View className="bg-white mt-2 px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin nghề nghiệp
            </Text>

            {/* Bio */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Giới thiệu</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bio: text })
                  }
                  placeholder="Giới thiệu về bản thân"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {formData.bio || "Chưa cập nhật"}
                </Text>
              )}
            </View>

            {/* Website */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Website</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.websiteUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, websiteUrl: text })
                  }
                  placeholder="https://example.com"
                  keyboardType="url"
                />
              ) : formData.websiteUrl ? (
                <View className="flex-row items-center">
                  <Globe size={16} color="#6B7280" />
                  <Text className="ml-2 text-base text-blue-600">
                    {formData.websiteUrl}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">Chưa cập nhật</Text>
              )}
            </View>

            {/* LinkedIn */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">LinkedIn</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.linkedinUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, linkedinUrl: text })
                  }
                  placeholder="https://linkedin.com/in/username"
                  keyboardType="url"
                />
              ) : formData.linkedinUrl ? (
                <View className="flex-row items-center">
                  <Linkedin size={16} color="#0077B5" />
                  <Text className="ml-2 text-base text-blue-600">
                    {formData.linkedinUrl}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">Chưa cập nhật</Text>
              )}
            </View>

            {/* GitHub */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">GitHub</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.githubUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, githubUrl: text })
                  }
                  placeholder="https://github.com/username"
                  keyboardType="url"
                />
              ) : formData.githubUrl ? (
                <View className="flex-row items-center">
                  <Github size={16} color="#333" />
                  <Text className="ml-2 text-base text-blue-600">
                    {formData.githubUrl}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">Chưa cập nhật</Text>
              )}
            </View>

            {/* Portfolio */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Portfolio</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.portfolioUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, portfolioUrl: text })
                  }
                  placeholder="https://portfolio.dev"
                  keyboardType="url"
                />
              ) : formData.portfolioUrl ? (
                <View className="flex-row items-center">
                  <Link size={16} color="#6B7280" />
                  <Text className="ml-2 text-base text-blue-600">
                    {formData.portfolioUrl}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">Chưa cập nhật</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-blue-600 rounded-lg py-3 items-center mb-3"
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
                  loadUserData(); // Reload original data
                }}
                className="bg-gray-200 rounded-lg py-3 items-center"
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
        {showDatePicker && Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white">
                <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-600 text-base">Hủy</Text>
                  </TouchableOpacity>
                  <Text className="font-semibold text-base">Chọn ngày sinh</Text>
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

        {showDatePicker && Platform.OS === "android" && (
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
        <Modal
          visible={showGenderPicker}
          transparent
          animationType="slide"
        >
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
                {genderOptions.map((option) => (
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