import candidateCvService from "@/services/candidateCvService";
import { formatFileSize } from "@/types/candidateCv.types";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CvUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newCv: any) => void;
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

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File validation function
const validateCvFile = (file: any): { valid: boolean; error?: string } => {
  // Check file type using mimeType (more reliable)
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const mimeType = file.mimeType || file.type;
  if (mimeType && !allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: "Chỉ hỗ trợ file PDF, DOC, DOCX",
    };
  }

  // Check file size
  if (file.size && file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}. File của bạn có dung lượng ${formatFileSize(file.size)}.`,
    };
  }

  return { valid: true };
};

const CvUploadModalSimple: React.FC<CvUploadModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [cvName, setCvName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State cho thông báo nội bộ
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ visible: false, type: "success", title: "", message: "" });

  // Helper function để hiển thị thông báo
  const showNotification = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setNotification({ visible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification({
      visible: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  const resetForm = () => {
    setCvName("");
    setDescription("");
    setSelectedFile(null);
    setUploadProgress(0);
    hideNotification();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      console.log("DocumentPicker result:", result);

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

        // Auto-generate CV name from file name if not set
        if (!cvName && selectedAsset.name) {
          const nameWithoutExt = selectedAsset.name.replace(/\.[^/.]+$/, "");
          setCvName(nameWithoutExt);
        }
      } else {
        // User cancelled selection
        console.log("User cancelled document selection");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      showNotification(
        "error",
        "Lỗi",
        "Không thể chọn file. Vui lòng thử lại."
      );
    }
  };

  const handleUpload = async () => {
    if (!cvName.trim()) {
      showNotification("error", "Lỗi", "Vui lòng nhập tên CV");
      return;
    }

    if (!selectedFile) {
      showNotification("error", "Lỗi", "Vui lòng chọn file CV");
      return;
    }

    // Final validation before upload
    const validation = validateCvFile(selectedFile);
    if (!validation.valid) {
      showNotification("error", "Lỗi", validation.error!);
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
      console.log("Uploading CV with data:", {
        file: selectedFile.name,
        name: cvName.trim(),
        description: description.trim(),
        size: selectedFile.size,
        mimeType: selectedFile.mimeType,
      });

      // Create a proper File object for candidateCvService (following CVManagementScreen pattern)
      let fileToUpload: File | Blob;

      console.log("Platform:", Platform.OS);
      console.log("Selected file structure:", selectedFile);

      if (selectedFile.uri) {
        // For React Native/Expo (DocumentPicker result with uri)
        console.log("Converting React Native file to Blob/File...");
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], selectedFile.name || "cv.pdf", {
          type: selectedFile.mimeType || "application/pdf",
        });
        console.log("Created File object:", fileToUpload);
      } else if (selectedFile instanceof File || selectedFile instanceof Blob) {
        // For web platform (already proper File/Blob)
        console.log("Using existing File/Blob object");
        fileToUpload = selectedFile;
      } else {
        throw new Error("Invalid file format");
      }

      const response = await candidateCvService.uploadCV(
        fileToUpload,
        cvName.trim(),
        description.trim() || undefined
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Handle both response formats
        const cvData = response.data || response;

        setTimeout(() => {
          showNotification(
            "success",
            "Thành công",
            "CV đã được tải lên thành công!"
          );
          // Delay để người dùng thấy thông báo trước khi đóng modal
          setTimeout(() => {
            onSuccess(cvData);
            handleClose();
          }, 2000);
        }, 500);
      } else {
        showNotification(
          "error",
          "Lỗi",
          response.error || "Không thể tải lên CV"
        );
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error uploading CV:", error);
      showNotification(
        "error",
        "Lỗi",
        "Đã xảy ra lỗi khi tải lên CV. Vui lòng thử lại."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white/10 absolute w-full h-full">
        {/* Header */}
        <LinearGradient
          colors={["#3B82F6", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-12 pb-6"
        >
          <View className="flex-row items-center justify-between px-4">
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 bg-white/20 rounded-full"
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-white font-semibold text-lg flex-1 text-center">
              Tải lên CV mới
            </Text>

            <View className="w-10" />
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="flex-1 p-4">
          {/* CV Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Tên CV <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={cvName}
              onChangeText={setCvName}
              placeholder="Ví dụ: CV Fullstack Developer 2024"
              className="border border-gray-300 rounded-lg p-3 text-gray-900"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả ngắn gọn về CV này..."
              className="border border-gray-300 rounded-lg p-3 text-gray-900"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* File Upload */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              File CV <Text className="text-red-500">*</Text>
            </Text>

            {selectedFile ? (
              <View className="border border-green-300 bg-green-50 rounded-lg p-4">
                <View className="flex-row items-center">
                  <FileText size={24} color="#059669" />
                  <View className="flex-1 ml-3">
                    <Text className="font-medium text-gray-900">
                      {selectedFile.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFile(null)}
                    className="p-1"
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickFile}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
              >
                <Upload size={32} color="#9CA3AF" />
                <Text className="text-gray-600 font-medium mt-2">
                  Chọn file CV
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Hỗ trợ PDF, DOC, DOCX (tối đa 5MB)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Upload progress */}
          {isUploading && (
            <View className="mb-4">
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
              <Text className="text-center text-sm text-gray-600 mt-2">
                Đang tải lên... {uploadProgress}%
              </Text>
            </View>
          )}

          {/* Info */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <Text className="text-blue-800 font-medium mb-2">💡 Lưu ý:</Text>
            <Text className="text-blue-700 text-sm">
              • Chỉ hỗ trợ file PDF, DOC, DOCX{"\n"}• Dung lượng tối đa 5MB
              {"\n"}• Nên đặt tên CV rõ ràng để dễ quản lý{"\n"}• CV sẽ được lưu
              trữ an toàn trên cloud
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 mr-2 py-3 rounded-lg border border-gray-300"
            >
              <Text className="text-gray-700 font-medium text-center">Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpload}
              disabled={!cvName.trim() || !selectedFile || isUploading}
              className={`flex-1 ml-2 py-3 rounded-lg flex-row items-center justify-center ${
                cvName.trim() && selectedFile && !isUploading
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Upload
                  size={20}
                  color={cvName.trim() && selectedFile ? "white" : "#6B7280"}
                />
              )}
              <Text
                className={`ml-2 font-medium ${
                  cvName.trim() && selectedFile && !isUploading
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {isUploading ? "Đang tải lên..." : "Tải lên"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thông báo nội bộ */}
        <InlineNotification
          visible={notification.visible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
          onAction={
            notification.type === "success"
              ? () => {
                  hideNotification();
                  // Success action đã được xử lý trong handleUpload
                }
              : undefined
          }
        />
      </View>
    </Modal>
  );
};

export default CvUploadModalSimple;
