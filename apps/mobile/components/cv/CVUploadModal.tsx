import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import * as DocumentPicker from "expo-document-picker";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
  Star,
} from "lucide-react-native";
// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface CVUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (
    file: any,
    cvName: string,
    description: string,
    isPrimary: boolean
  ) => Promise<boolean>;
  canUploadMore: boolean;
  currentCVCount: number;
}

// Component thông báo nội bộ
const InlineNotification: React.FC<{
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  onAction?: () => void;
}> = ({ visible, type, title, message, onClose, onAction }) => {
  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 z-50 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-lg p-6 max-w-sm w-full">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-4 self-center ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {type === "success" ? (
            <CheckCircle size={24} color="#22C55E" />
          ) : (
            <AlertCircle size={24} color="#EF4444" />
          )}
        </View>

        <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </Text>

        <Text className="text-gray-600 text-center mb-6">{message}</Text>

        <View className="flex-row justify-center">
          {type === "success" && onAction ? (
            <TouchableOpacity
              className="bg-green-500 px-6 py-3 rounded-lg flex-1 mr-2"
              onPress={onAction}
            >
              <Text className="text-white font-medium text-center">OK</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`px-6 py-3 rounded-lg flex-1 ${
                type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
              onPress={onClose}
            >
              <Text className="text-white font-medium text-center">
                {type === "success" ? "OK" : "Đóng"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CVUploadModal: React.FC<CVUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  canUploadMore,
  currentCVCount,
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [cvName, setCvName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State cho InlineNotification
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    onAction?: () => void;
  }>({ visible: false, type: "error", title: "", message: "" });

  // Helper function để hiển thị notification
  const showNotification = (
    type: "success" | "error",
    title: string,
    message: string,
    onAction?: () => void
  ) => {
    setNotification({ visible: true, type, title, message, onAction });
  };

  const hideNotification = () => {
    setNotification({ visible: false, type: "error", title: "", message: "" });
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log("CVUploadModal - selectedFile changed:", selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    console.log("CVUploadModal - cvName changed:", cvName);
  }, [cvName]);

  useEffect(() => {
    console.log("CVUploadModal - modal visible:", visible);
    // Chỉ reset form khi modal được mở lần đầu sau khi đóng thành công
    if (!visible) {
      // Modal đang đóng - không làm gì
      return;
    }
  }, [visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      // Kiểm tra nếu user đã chọn file (không bị cancel)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Validate file size
        if (selectedAsset.size && selectedAsset.size > MAX_FILE_SIZE) {
          showNotification(
            "error",
            "File quá lớn",
            `File không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}. File của bạn có dung lượng ${formatFileSize(selectedAsset.size)}.`
          );
          return;
        }

        // Validate file type
        const mimeType = selectedAsset.mimeType;
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (mimeType && !allowedTypes.includes(mimeType)) {
          showNotification(
            "error",
            "Định dạng file không hỗ trợ",
            "Vui lòng chọn file PDF, DOC hoặc DOCX."
          );
          return;
        }

        setSelectedFile(selectedAsset);
        console.log(
          "Selected file structure:",
          JSON.stringify(selectedAsset, null, 2)
        );

        // Auto-fill CV name from filename
        if (!cvName && selectedAsset.name) {
          const nameWithoutExt = selectedAsset.name.replace(/\.[^/.]+$/, "");
          setCvName(nameWithoutExt);
        }
        setErrors({});
      } else {
        // User cancelled selection
        console.log("User cancelled document selection");
      }
    } catch (err) {
      console.error("Error picking document:", err);
      showNotification(
        "error",
        "Lỗi",
        "Không thể chọn file. Vui lòng thử lại."
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = "Vui lòng chọn file CV";
    }
    if (!cvName.trim()) {
      newErrors.cvName = "Vui lòng nhập tên CV";
    } else if (cvName.length > 100) {
      newErrors.cvName = "Tên CV không được vượt quá 100 ký tự";
    }
    if (description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const success = await onUpload(
        selectedFile,
        cvName.trim(),
        description.trim(),
        isPrimary
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (success) {
        setTimeout(() => {
          resetForm();
          onClose();
        }, 500);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCvName("");
    setDescription("");
    setIsPrimary(false);
    setUploadProgress(0);
    setErrors({});
  };

  const handleClose = () => {
    if (isUploading) {
      showNotification(
        "error",
        "Đang tải lên",
        "File đang được tải lên. Bạn có chắc muốn hủy?"
      );
    } else {
      // Chỉ reset form khi user thực sự muốn đóng modal (không phải do re-render)
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form khi user click nút Cancel
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] shadow-2xl">
          <LinearGradient
            colors={["#a855f7", "#9333ea", "#7e22ce"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row justify-between items-center px-5 py-4 rounded-t-3xl"
          >
            {/* Decorative elements */}
            <View className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

            <View className="relative z-10 flex-1">
              <Text className="text-lg font-bold text-white">
                Tải lên CV mới
              </Text>
              <Text className="text-xs text-white/80 mt-1">
                Tạo hồ sơ chuyên nghiệp
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 rounded-full bg-white/20 relative z-10"
            >
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            className="p-5 max-h-96"
            showsVerticalScrollIndicator={false}
          >
            {/* Upload limit warning */}
            {!canUploadMore && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex-row items-center">
                <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mr-3">
                  <AlertCircle size={16} color="#F59E0B" />
                </View>
                <Text className="text-amber-700 text-sm font-medium flex-1 leading-5">
                  Bạn đã đạt giới hạn 5 CV. Vui lòng xóa CV cũ trước khi tải lên
                  CV mới.
                </Text>
              </View>
            )}

            {/* File picker section */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-purple-800 mb-3">
                Chọn file CV
              </Text>
              <TouchableOpacity
                className={`border-2 border-dashed rounded-2xl p-5 relative overflow-hidden ${
                  errors.file
                    ? "border-red-300 bg-red-50"
                    : "border-purple-300 bg-purple-50/30"
                } ${!canUploadMore ? "opacity-50" : ""}`}
                onPress={pickDocument}
                disabled={!canUploadMore}
              >
                <View className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-indigo-100/20" />
                <View className="relative z-10">
                  {selectedFile ? (
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-3">
                        <FileText size={24} color="#a855f7" />
                      </View>
                      <View className="flex-1 mr-2">
                        <Text
                          className="text-sm font-medium text-purple-800"
                          numberOfLines={1}
                        >
                          {selectedFile.name}
                        </Text>
                        <Text className="text-xs text-purple-600 mt-1">
                          {formatFileSize(selectedFile.size || 0)}
                        </Text>
                      </View>
                      <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                        <CheckCircle size={18} color="#22c55e" />
                      </View>
                    </View>
                  ) : (
                    <View className="items-center">
                      <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-3">
                        <FileUp size={32} color="#a855f7" />
                      </View>
                      <Text className="text-sm font-medium text-purple-700 mb-1">
                        Nhấn để chọn file CV
                      </Text>
                      <Text className="text-xs text-purple-500">
                        PDF, DOC, DOCX (Tối đa 10MB)
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {errors.file && (
                <Text className="text-xs text-red-500 mt-2">{errors.file}</Text>
              )}
            </View>

            {/* CV Name input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-purple-800 mb-3">
                Tên CV *
              </Text>
              <View className="relative">
                <View className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl" />
                <TextInput
                  className={`relative z-10 border rounded-xl px-4 py-3 text-sm text-purple-800 bg-white/70 backdrop-blur-sm ${
                    errors.cvName ? "border-red-300" : "border-purple-200"
                  }`}
                  placeholder="Ví dụ: CV Kỹ sư phần mềm"
                  placeholderTextColor="#a855f7"
                  value={cvName}
                  onChangeText={setCvName}
                  maxLength={100}
                  editable={!isUploading}
                />
              </View>
              <Text className="text-xs text-purple-500 text-right mt-1">
                {cvName.length}/100
              </Text>
              {errors.cvName && (
                <Text className="text-xs text-red-500 mt-2">
                  {errors.cvName}
                </Text>
              )}
            </View>

            {/* Description input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-purple-800 mb-3">
                Mô tả
              </Text>
              <View className="relative">
                <View className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl" />
                <TextInput
                  className={`relative z-10 border rounded-xl px-4 py-3 text-sm text-purple-800 bg-white/70 backdrop-blur-sm min-h-20 ${
                    errors.description ? "border-red-300" : "border-purple-200"
                  }`}
                  placeholder="Mô tả ngắn về CV này..."
                  placeholderTextColor="#a855f7"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={500}
                  multiline
                  numberOfLines={4}
                  editable={!isUploading}
                  textAlignVertical="top"
                />
              </View>
              <Text className="text-xs text-purple-500 text-right mt-1">
                {description.length}/500
              </Text>
              {errors.description && (
                <Text className="text-xs text-red-500 mt-2">
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Primary CV toggle */}
            {currentCVCount === 0 ? (
              <View className="mb-5">
                <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                      <Star size={16} color="#a855f7" />
                    </View>
                    <Text className="text-sm text-purple-700 font-medium flex-1">
                      Đây sẽ là CV chính của bạn vì bạn chưa có CV nào.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="mb-5">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-4">
                    <Text className="text-sm font-semibold text-purple-800 mb-1">
                      Đặt làm CV chính
                    </Text>
                    <Text className="text-xs text-purple-600">
                      CV chính sẽ được sử dụng mặc định khi ứng tuyển
                    </Text>
                  </View>
                  <Switch
                    value={isPrimary}
                    onValueChange={setIsPrimary}
                    trackColor={{ false: "#e5e7eb", true: "#c084fc" }}
                    thumbColor={isPrimary ? "#a855f7" : "#f3f4f6"}
                    disabled={isUploading}
                  />
                </View>
              </View>
            )}

            {/* Upload progress */}
            {isUploading && (
              <View className="mt-4">
                <View className="bg-purple-100 rounded-full h-2 overflow-hidden mb-2">
                  <View
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </View>
                <Text className="text-xs text-purple-600 text-center">
                  Đang tải lên... {uploadProgress}%
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View className="flex-row p-5 pt-3 border-t border-purple-100">
            <TouchableOpacity
              className={`flex-1 py-3 mr-2 rounded-xl border border-purple-200 items-center justify-center ${
                isUploading ? "opacity-50" : ""
              }`}
              onPress={handleCancel}
              disabled={isUploading}
            >
              <Text className="text-sm font-medium text-purple-700">Hủy</Text>
            </TouchableOpacity>

            <View
              className={`flex-1 ml-2 rounded-xl overflow-hidden shadow-glow-purple ${
                !canUploadMore || isUploading ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={["#a855f7", "#9333ea", "#7e22ce"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
              >
                <TouchableOpacity
                  className="flex-1 py-3 items-center justify-center flex-row"
                  onPress={handleUpload}
                  disabled={!canUploadMore || isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Upload size={18} color="#FFF" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Tải lên
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* InlineNotification */}
        <InlineNotification
          visible={notification.visible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
          onAction={notification.onAction}
        />
      </View>
    </Modal>
  );
};

export default CVUploadModal;
