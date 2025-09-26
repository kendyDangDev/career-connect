import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Upload, FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react-native';
import { useAlert } from '@/contexts/AlertContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Job } from '@/types/job';
import { CandidateCv } from '@/types/candidateCv.types';
import candidateCvService from '@/services/candidateCvService';
import { jobApplicationService } from '@/services/jobApplicationService';
import CvUploadModalSimple from '@/components/cv/CvUploadModalSimple';
import CVPreviewModal from '@/components/cv/CVPreviewModal';

interface JobApplyModalProps {
  visible: boolean;
  job: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApplyFormData {
  selectedCvId: string | null;
  coverLetter: string;
  agreedToTerms: boolean;
}

const JobApplyModal: React.FC<JobApplyModalProps> = ({
  visible,
  job,
  onClose,
  onSuccess,
}) => {
  const alert = useAlert();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCvs, setUserCvs] = useState<CandidateCv[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCvForPreview, setSelectedCvForPreview] = useState<CandidateCv | null>(null);
  
  const [formData, setFormData] = useState<ApplyFormData>({
    selectedCvId: null,
    coverLetter: '',
    agreedToTerms: false,
  });

  const steps = [
    { id: 1, title: 'Chọn CV', icon: FileText },
    { id: 2, title: 'Thư giới thiệu', icon: Upload },
    { id: 3, title: 'Xác nhận', icon: CheckCircle },
  ];

  // Load user CVs when modal opens
  useEffect(() => {
    if (visible) {
      loadUserCvs();
      // Reset form when opening
      setFormData({
        selectedCvId: null,
        coverLetter: '',
        agreedToTerms: false,
      });
      setCurrentStep(1);
    }
  }, [visible]);

  const loadUserCvs = async () => {
    setIsLoadingCvs(true);
    try {
      const cvs = await candidateCvService.getAllCVs();
      setUserCvs(cvs || []);
    } catch (error) {
      console.error('Error loading CVs:', error);
      alert.error('Lỗi', 'Không thể tải danh sách CV');
      setUserCvs([]);
    } finally {
      setIsLoadingCvs(false);
    }
  };

  const handleCvUploaded = (newCv: CandidateCv) => {
    // Add new CV to the list and select it
    setUserCvs(prevCvs => [newCv, ...prevCvs]);
    setFormData({ ...formData, selectedCvId: newCv.id });
    setShowUploadModal(false);
  };

  const handlePreviewCv = (cv: CandidateCv) => {
    setSelectedCvForPreview(cv);
    setShowPreviewModal(true);
  };

  const handleDownloadCv = (cv: CandidateCv) => {
    // Handle CV download functionality
    if (cv.fileUrl) {
      // Open download URL
      if (typeof window !== 'undefined') {
        window.open(cv.fileUrl, '_blank');
      }
    } else {
      alert.error('Lỗi', 'Không thể tải xuống CV');
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.selectedCvId) {
      alert.error('Lỗi', 'Vui lòng chọn CV');
      return;
    }

    if (!formData.coverLetter.trim()) {
      alert.error('Lỗi', 'Vui lòng viết thư giới thiệu');
      return;
    }

    if (!formData.agreedToTerms) {
      alert.error('Lỗi', 'Vui lòng đồng ý với điều khoản');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCv = userCvs.find(cv => cv.id === formData.selectedCvId);
      
      const applicationData = {
        jobId: job!.id,
        coverLetter: formData.coverLetter,
        cvId: formData.selectedCvId!,
        cvFileUrl: selectedCv?.fileUrl,
      };

      const response = await jobApplicationService.submitApplication(applicationData);

      if (response.success) {
        alert.success('Thành công', 'Đơn ứng tuyển đã được gửi thành công!', () => {
          onSuccess();
          onClose();
        });
      } else {
        alert.error('Lỗi', response.error || 'Không thể gửi đơn ứng tuyển');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi gửi đơn ứng tuyển');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-between mb-6 px-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const IconComponent = step.icon;

        return (
          <View key={step.id} className="flex-1 items-center">
            <View className="flex-row items-center justify-center mb-2">
              <View 
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                }`}
              >
                <IconComponent 
                  size={20} 
                  color="white" 
                />
              </View>
              
              {index < steps.length - 1 && (
                <View 
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} 
                />
              )}
            </View>
            
            <Text 
              className={`text-xs font-medium text-center ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step.title}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderCvSelection = () => (
    <ScrollView className="flex-1 px-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Chọn CV để ứng tuyển
      </Text>
      
      {isLoadingCvs ? (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Đang tải CV...</Text>
        </View>
      ) : userCvs.length === 0 ? (
        <View className="flex-1 justify-center items-center py-8">
          <FileText size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4 mb-4">
            Bạn chưa có CV nào
          </Text>
          <TouchableOpacity 
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => setShowUploadModal(true)}
          >
            <Text className="text-white font-medium">Tải lên CV mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {userCvs.map((cv) => (
            <View
              key={cv.id}
              className={`p-4 rounded-lg border mb-3 ${
                formData.selectedCvId === cv.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setFormData({ ...formData, selectedCvId: cv.id })}
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  formData.selectedCvId === cv.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.selectedCvId === cv.id && (
                    <CheckCircle size={12} color="white" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{cv.cvName}</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Tải lên: {new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Lượt xem: {cv.viewCount}
                  </Text>
                </View>
                
                <FileText size={24} color="#9CA3AF" />
              </TouchableOpacity>
              
              {/* CV Action Buttons */}
              <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
                <TouchableOpacity
                  className="flex-row items-center px-3 py-2 bg-blue-100 rounded-lg mr-2"
                  onPress={() => handlePreviewCv(cv)}
                >
                  <Eye size={16} color="#3B82F6" />
                  <Text className="text-blue-600 text-sm font-medium ml-1">Xem trước</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg"
                  onPress={() => handleDownloadCv(cv)}
                >
                  <Download size={16} color="#6B7280" />
                  <Text className="text-gray-600 text-sm font-medium ml-1">Tải xuống</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            className="border-2 border-dashed border-gray-300 p-4 rounded-lg items-center justify-center mt-2"
            onPress={() => setShowUploadModal(true)}
          >
            <Upload size={32} color="#9CA3AF" />
            <Text className="text-gray-500 font-medium mt-2">Tải lên CV mới</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderCoverLetter = () => (
    <ScrollView className="flex-1 px-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Thư giới thiệu
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-2">
          Giới thiệu bản thân và lý do bạn phù hợp với vị trí này:
        </Text>
        
        <TextInput
          multiline
          numberOfLines={10}
          value={formData.coverLetter}
          onChangeText={(text) => setFormData({ ...formData, coverLetter: text })}
          placeholder="Viết thư giới thiệu của bạn ở đây..."
          className="border border-gray-300 rounded-lg p-3 text-gray-900"
          style={{ textAlignVertical: 'top', minHeight: 200 }}
        />
        
        <Text className="text-xs text-gray-500 mt-2">
          Tối thiểu 50 ký tự ({formData.coverLetter.length}/50)
        </Text>
      </View>

      <View className="bg-blue-50 p-4 rounded-lg">
        <Text className="text-blue-800 font-medium mb-2">💡 Gợi ý viết thư giới thiệu:</Text>
        <Text className="text-blue-700 text-sm">
          • Giới thiệu ngắn gọn về bản thân{'\n'}
          • Nêu kinh nghiệm và kỹ năng liên quan{'\n'}
          • Giải thích tại sao bạn quan tâm đến vị trí này{'\n'}
          • Thể hiện sự nhiệt tình và cam kết
        </Text>
      </View>
    </ScrollView>
  );

  const renderConfirmation = () => (
    <ScrollView className="flex-1 px-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Xác nhận thông tin
      </Text>
      
      {/* Job Info */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <Text className="font-medium text-gray-900 mb-2">Vị trí ứng tuyển:</Text>
        <Text className="text-gray-800">{job?.title}</Text>
        <Text className="text-gray-600 text-sm mt-1">{job?.company?.companyName}</Text>
      </View>

      {/* Selected CV */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <Text className="font-medium text-gray-900 mb-2">CV đã chọn:</Text>
        <Text className="text-gray-800">
          {userCvs.find(cv => cv.id === formData.selectedCvId)?.cvName || 'Chưa chọn'}
        </Text>
      </View>

      {/* Cover Letter Preview */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <Text className="font-medium text-gray-900 mb-2">Thư giới thiệu:</Text>
        <Text className="text-gray-800" numberOfLines={3}>
          {formData.coverLetter || 'Chưa viết'}
        </Text>
      </View>

      {/* Terms & Conditions */}
      <TouchableOpacity
        className="flex-row items-center mb-6"
        onPress={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
      >
        <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
          formData.agreedToTerms ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
        }`}>
          {formData.agreedToTerms && (
            <CheckCircle size={16} color="white" />
          )}
        </View>
        
        <Text className="text-sm text-gray-700 flex-1">
          Tôi đồng ý với các điều khoản và điều kiện, xác nhận thông tin trên là chính xác
        </Text>
      </TouchableOpacity>

      <View className="bg-yellow-50 p-4 rounded-lg">
        <View className="flex-row items-center mb-2">
          <AlertCircle size={20} color="#F59E0B" />
          <Text className="font-medium text-yellow-800 ml-2">Lưu ý quan trọng</Text>
        </View>
        <Text className="text-yellow-700 text-sm">
          • Hãy chắc chắn thông tin trong CV và thư giới thiệu là chính xác{'\n'}
          • Nhà tuyển dụng sẽ liên hệ với bạn qua email hoặc số điện thoại{'\n'}
          • Bạn có thể theo dõi trạng thái đơn ứng tuyển trong mục "Đơn của tôi"
        </Text>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderCvSelection();
      case 2:
        return renderCoverLetter();
      case 3:
        return renderConfirmation();
      default:
        return renderCvSelection();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedCvId !== null;
      case 2:
        return formData.coverLetter.trim().length >= 50;
      case 3:
        return formData.agreedToTerms;
      default:
        return false;
    }
  };

  if (!job) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-12 pb-6"
        >
          <View className="flex-row items-center justify-between px-4">
            <TouchableOpacity 
              onPress={onClose}
              className="p-2 bg-white/20 rounded-full"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white font-semibold text-lg flex-1 text-center">
              Ứng tuyển công việc
            </Text>
            
            <View className="w-10" />
          </View>
        </LinearGradient>

        {/* Step Indicator */}
        <View className="py-4 bg-white shadow-sm">
          {renderStepIndicator()}
        </View>

        {/* Content */}
        <View className="flex-1">
          {renderContent()}
        </View>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentStep === 1}
              className={`flex-row items-center px-6 py-3 rounded-lg ${
                currentStep === 1 ? 'opacity-50' : ''
              }`}
            >
              <ChevronLeft size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-1">Quay lại</Text>
            </TouchableOpacity>

            {currentStep < 3 ? (
              <TouchableOpacity
                onPress={handleNext}
                disabled={!canProceed()}
                className={`flex-row items-center px-6 py-3 rounded-lg ${
                  canProceed() 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}
              >
                <Text className={`mr-1 ${canProceed() ? 'text-white' : 'text-gray-500'}`}>
                  Tiếp theo
                </Text>
                <ChevronRight size={20} color={canProceed() ? 'white' : '#6B7280'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`flex-row items-center px-6 py-3 rounded-lg ${
                  canProceed() && !isSubmitting
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CheckCircle size={20} color={canProceed() ? 'white' : '#6B7280'} />
                )}
                <Text className={`ml-2 ${canProceed() && !isSubmitting ? 'text-white' : 'text-gray-500'}`}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đơn'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* CV Upload Modal */}
      <CvUploadModalSimple
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleCvUploaded}
      />
      
      {/* CV Preview Modal */}
      <CVPreviewModal
        visible={showPreviewModal}
        cv={selectedCvForPreview}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedCvForPreview(null);
        }}
        onDownload={handleDownloadCv}
      />
    </Modal>
  );
};

export default JobApplyModal;
