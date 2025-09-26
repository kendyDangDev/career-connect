import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CreateReviewDto } from '../../services/reviewService';
import { useAlert } from '@/contexts/AlertContext';

interface AddReviewModalProps {
  visible: boolean;
  companyName: string;
  onClose: () => void;
  onSubmit: (review: CreateReviewDto) => Promise<void>;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  visible,
  companyName,
  onClose,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const alert = useAlert();
  const [formData, setFormData] = useState<CreateReviewDto>({
    companyId: '',
    rating: 0,
    title: '',
    reviewText: '',
    pros: '',
    cons: '',
    workLifeBalanceRating: 0,
    salaryBenefitRating: 0,
    managementRating: 0,
    cultureRating: 0,
    isAnonymous: false,
    employmentStatus: 'CURRENT',
    positionTitle: '',
    employmentLength: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      companyId: '',
      rating: 0,
      title: '',
      reviewText: '',
      pros: '',
      cons: '',
      workLifeBalanceRating: 0,
      salaryBenefitRating: 0,
      managementRating: 0,
      cultureRating: 0,
      isAnonymous: false,
      employmentStatus: 'CURRENT',
      positionTitle: '',
      employmentLength: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStarRating = (
    value: number,
    onChange: (rating: number) => void,
    size: number = 32
  ) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            className="mx-1"
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={size}
              color={star <= value ? '#FFC107' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }
    if (formData.title.length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }
    if (formData.reviewText.length < 50) {
      newErrors.reviewText = 'Nội dung đánh giá phải có ít nhất 50 ký tự';
    }
    if (formData.reviewText.length > 2000) {
      newErrors.reviewText = 'Nội dung đánh giá không được vượt quá 2000 ký tự';
    }
    if (formData.pros && formData.pros.length < 10) {
      newErrors.pros = 'Ưu điểm phải có ít nhất 10 ký tự';
    }
    if (formData.cons && formData.cons.length < 10) {
      newErrors.cons = 'Nhược điểm phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert.error('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleClose}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Viết đánh giá
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg ${isSubmitting ? 'bg-gray-300' : 'bg-blue-600'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium">Gửi</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              {/* Company Name */}
              <View className="mb-6">
                <Text className="text-xl font-semibold text-gray-900 mb-2">
                  {companyName}
                </Text>
                <Text className="text-sm text-gray-600">
                  Chia sẻ trải nghiệm của bạn khi làm việc tại công ty này
                </Text>
              </View>

              {/* Overall Rating */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Đánh giá chung *
                </Text>
                <View className="items-center">
                  {renderStarRating(
                    formData.rating,
                    (rating) => setFormData({ ...formData, rating })
                  )}
                  {formData.rating > 0 && (
                    <Text className="mt-2 text-sm text-gray-600">
                      {formData.rating === 1 && 'Rất tệ'}
                      {formData.rating === 2 && 'Tệ'}
                      {formData.rating === 3 && 'Bình thường'}
                      {formData.rating === 4 && 'Tốt'}
                      {formData.rating === 5 && 'Xuất sắc'}
                    </Text>
                  )}
                </View>
                {errors.rating && (
                  <Text className="text-red-500 text-xs mt-1">{errors.rating}</Text>
                )}
              </View>

              {/* Employment Status */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Tình trạng làm việc *
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, employmentStatus: 'CURRENT' })}
                    className={`flex-1 mr-2 py-3 px-4 rounded-xl border ${
                      formData.employmentStatus === 'CURRENT'
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      formData.employmentStatus === 'CURRENT' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      Nhân viên hiện tại
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, employmentStatus: 'FORMER' })}
                    className={`flex-1 ml-2 py-3 px-4 rounded-xl border ${
                      formData.employmentStatus === 'FORMER'
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      formData.employmentStatus === 'FORMER' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      Cựu nhân viên
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Position and Length */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Thông tin công việc
                </Text>
                <TextInput
                  placeholder="Vị trí công việc (VD: Software Engineer)"
                  value={formData.positionTitle}
                  onChangeText={(text) => setFormData({ ...formData, positionTitle: text })}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  placeholder="Thời gian làm việc (VD: 2 năm)"
                  value={formData.employmentLength}
                  onChangeText={(text) => setFormData({ ...formData, employmentLength: text })}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Review Title */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Tiêu đề đánh giá *
                </Text>
                <TextInput
                  placeholder="Tóm tắt trải nghiệm của bạn"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholderTextColor="#9CA3AF"
                  maxLength={100}
                />
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {formData.title.length}/100
                </Text>
                {errors.title && (
                  <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>
                )}
              </View>

              {/* Review Text */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Nội dung đánh giá *
                </Text>
                <TextInput
                  placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
                  value={formData.reviewText}
                  onChangeText={(text) => setFormData({ ...formData, reviewText: text })}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 min-h-[120px] ${
                    errors.reviewText ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholderTextColor="#9CA3AF"
                  maxLength={2000}
                />
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {formData.reviewText.length}/2000
                </Text>
                {errors.reviewText && (
                  <Text className="text-red-500 text-xs mt-1">{errors.reviewText}</Text>
                )}
              </View>

              {/* Pros */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Ưu điểm
                </Text>
                <TextInput
                  placeholder="Những điều bạn thích về công ty này"
                  value={formData.pros}
                  onChangeText={(text) => setFormData({ ...formData, pros: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 min-h-[80px] ${
                    errors.pros ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholderTextColor="#9CA3AF"
                  maxLength={1000}
                />
                {errors.pros && (
                  <Text className="text-red-500 text-xs mt-1">{errors.pros}</Text>
                )}
              </View>

              {/* Cons */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Nhược điểm
                </Text>
                <TextInput
                  placeholder="Những điều cần cải thiện"
                  value={formData.cons}
                  onChangeText={(text) => setFormData({ ...formData, cons: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 min-h-[80px] ${
                    errors.cons ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholderTextColor="#9CA3AF"
                  maxLength={1000}
                />
                {errors.cons && (
                  <Text className="text-red-500 text-xs mt-1">{errors.cons}</Text>
                )}
              </View>

              {/* Detailed Ratings */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-4">
                  Đánh giá chi tiết
                </Text>

                {/* Work-Life Balance */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-700">
                      Cân bằng công việc - cuộc sống
                    </Text>
                    {(formData.workLifeBalanceRating || 0) > 0 && (
                      <Text className="text-sm font-medium text-gray-900">
                        {formData.workLifeBalanceRating}/5
                      </Text>
                    )}
                  </View>
                  {renderStarRating(
                    formData.workLifeBalanceRating || 0,
                    (rating) => setFormData({ ...formData, workLifeBalanceRating: rating }),
                    24
                  )}
                </View>

                {/* Salary & Benefits */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-700">
                      Lương thưởng & Phúc lợi
                    </Text>
                    {(formData.salaryBenefitRating || 0) > 0 && (
                      <Text className="text-sm font-medium text-gray-900">
                        {formData.salaryBenefitRating}/5
                      </Text>
                    )}
                  </View>
                  {renderStarRating(
                    formData.salaryBenefitRating || 0,
                    (rating) => setFormData({ ...formData, salaryBenefitRating: rating }),
                    24
                  )}
                </View>

                {/* Management */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-700">
                      Quản lý
                    </Text>
                    {(formData.managementRating || 0) > 0 && (
                      <Text className="text-sm font-medium text-gray-900">
                        {formData.managementRating}/5
                      </Text>
                    )}
                  </View>
                  {renderStarRating(
                    formData.managementRating || 0,
                    (rating) => setFormData({ ...formData, managementRating: rating }),
                    24
                  )}
                </View>

                {/* Culture */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-700">
                      Văn hóa công ty
                    </Text>
                    {(formData.cultureRating || 0) > 0 && (
                      <Text className="text-sm font-medium text-gray-900">
                        {formData.cultureRating}/5
                      </Text>
                    )}
                  </View>
                  {renderStarRating(
                    formData.cultureRating || 0,
                    (rating) => setFormData({ ...formData, cultureRating: rating }),
                    24
                  )}
                </View>
              </View>

              {/* Anonymous Option */}
              <View className="mb-6">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                  className="flex-row items-center"
                >
                  <View className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                    formData.isAnonymous ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                  }`}>
                    {formData.isAnonymous && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text className="text-sm text-gray-700">
                    Gửi đánh giá ẩn danh
                  </Text>
                </TouchableOpacity>
                <Text className="text-xs text-gray-500 ml-9 mt-2">
                  Tên của bạn sẽ được ẩn khi đăng đánh giá
                </Text>
              </View>

              {/* Note */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#2563EB" />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-blue-900 mb-1">
                      Lưu ý
                    </Text>
                    <Text className="text-xs text-blue-700">
                      • Đánh giá của bạn sẽ được xem xét trước khi đăng{'\n'}
                      • Vui lòng cung cấp thông tin trung thực và khách quan{'\n'}
                      • Tránh sử dụng ngôn từ không phù hợp hoặc xúc phạm
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default AddReviewModal;