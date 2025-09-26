import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@/contexts/AlertContext';
import * as DocumentPicker from 'expo-document-picker';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
} from 'lucide-react-native';
// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

const CVUploadModal: React.FC<CVUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  canUploadMore,
  currentCVCount,
}) => {
  const alert = useAlert();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [cvName, setCvName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: Log state changes
  useEffect(() => {
    console.log('CVUploadModal - selectedFile changed:', selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    console.log('CVUploadModal - cvName changed:', cvName);
  }, [cvName]);

  useEffect(() => {
    console.log('CVUploadModal - modal visible:', visible);
    // Chỉ reset form khi modal được mở lần đầu sau khi đóng thành công
    if (!visible) {
      // Modal đang đóng - không làm gì
      return;
    }
  }, [visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      console.log('DocumentPicker result:', result);

      // Kiểm tra nếu user đã chọn file (không bị cancel)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Validate file size
        if (selectedAsset.size && selectedAsset.size > MAX_FILE_SIZE) {
          alert.error(
            'File quá lớn',
            `File không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}. File của bạn có dung lượng ${formatFileSize(selectedAsset.size)}.`
          );
          return;
        }

        // Validate file type
        const mimeType = selectedAsset.mimeType;
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (mimeType && !allowedTypes.includes(mimeType)) {
          alert.error(
            'Định dạng file không hỗ trợ',
            'Vui lòng chọn file PDF, DOC hoặc DOCX.'
          );
          return;
        }

        setSelectedFile(selectedAsset);
        console.log('Selected file structure:', JSON.stringify(selectedAsset, null, 2));
        
        // Auto-fill CV name from filename
        if (!cvName && selectedAsset.name) {
          const nameWithoutExt = selectedAsset.name.replace(/\.[^/.]+$/, '');
          setCvName(nameWithoutExt);
        }
        setErrors({});
      } else {
        // User cancelled selection
        console.log('User cancelled document selection');
      }
    } catch (err) {
      console.error('Error picking document:', err);
      alert.error('Lỗi', 'Không thể chọn file. Vui lòng thử lại.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Vui lòng chọn file CV';
    }
    if (!cvName.trim()) {
      newErrors.cvName = 'Vui lòng nhập tên CV';
    } else if (cvName.length > 100) {
      newErrors.cvName = 'Tên CV không được vượt quá 100 ký tự';
    }
    if (description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
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
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCvName('');
    setDescription('');
    setIsPrimary(false);
    setUploadProgress(0);
    setErrors({});
  };

  const handleClose = () => {
    if (isUploading) {
      alert.confirm(
        'Đang tải lên',
        'File đang được tải lên. Bạn có chắc muốn hủy?',
        () => {
          resetForm();
          onClose();
        },
        () => {}
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#4A90E2', '#357ABD']}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.modalTitle}>Tải lên CV mới</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Upload limit warning */}
            {!canUploadMore && (
              <View style={styles.warningBox}>
                <AlertCircle size={20} color="#F39C12" />
                <Text style={styles.warningText}>
                  Bạn đã đạt giới hạn 5 CV. Vui lòng xóa CV cũ trước khi tải lên CV mới.
                </Text>
              </View>
            )}

            {/* File picker section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn file CV</Text>
              {/* Debug button - remove after testing */}
              {__DEV__ && (
                <TouchableOpacity 
                  style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4, marginBottom: 8 }}
                  onPress={() => {
                    console.log('DEBUG - Current selectedFile:', selectedFile);
                    console.log('DEBUG - Current cvName:', cvName);
                    alert.info('Debug', `File: ${selectedFile ? 'Selected' : 'None'}\nName: ${cvName}`);
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#666' }}>DEBUG: Check State</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.filePicker, errors.file && styles.inputError]}
                onPress={pickDocument}
                disabled={!canUploadMore}
              >
                {selectedFile ? (
                  <View style={styles.selectedFile}>
                    <FileText size={24} color="#4A90E2" />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(selectedFile.size || 0)}
                      </Text>
                    </View>
                    <CheckCircle size={20} color="#27AE60" />
                  </View>
                ) : (
                  <View style={styles.filePickerEmpty}>
                    <FileUp size={32} color="#95A5A6" />
                    <Text style={styles.filePickerText}>
                      Nhấn để chọn file CV
                    </Text>
                    <Text style={styles.filePickerHint}>
                      PDF, DOC, DOCX (Tối đa 10MB)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.file && <Text style={styles.errorText}>{errors.file}</Text>}
            </View>

            {/* CV Name input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tên CV *</Text>
              <TextInput
                style={[styles.input, errors.cvName && styles.inputError]}
                placeholder="Ví dụ: CV Kỹ sư phần mềm"
                value={cvName}
                onChangeText={setCvName}
                maxLength={100}
                editable={!isUploading}
              />
              <Text style={styles.charCount}>{cvName.length}/100</Text>
              {errors.cvName && <Text style={styles.errorText}>{errors.cvName}</Text>}
            </View>

            {/* Description input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                placeholder="Mô tả ngắn về CV này..."
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                numberOfLines={4}
                editable={!isUploading}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Primary CV toggle */}
            {currentCVCount === 0 ? (
              <View style={styles.section}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Đây sẽ là CV chính của bạn vì bạn chưa có CV nào.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.toggleSection}>
                  <View>
                    <Text style={styles.sectionTitle}>Đặt làm CV chính</Text>
                    <Text style={styles.toggleHint}>
                      CV chính sẽ được sử dụng mặc định khi ứng tuyển
                    </Text>
                  </View>
                  <Switch
                    value={isPrimary}
                    onValueChange={setIsPrimary}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                    thumbColor={isPrimary ? '#357ABD' : '#F4F3F4'}
                    disabled={isUploading}
                  />
                </View>
              </View>
            )}

            {/* Upload progress */}
            {isUploading && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>Đang tải lên... {uploadProgress}%</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isUploading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.uploadButton,
                (!canUploadMore || isUploading) && styles.buttonDisabled,
              ]}
              onPress={handleUpload}
              disabled={!canUploadMore || isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Upload size={18} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Tải lên</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  filePicker: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  filePickerEmpty: {
    alignItems: 'center',
  },
  filePickerText: {
    fontSize: 14,
    color: '#34495E',
    marginTop: 8,
  },
  filePickerHint: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  fileSize: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C3E50',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  charCount: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleHint: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: 6,
  },
});

export default CVUploadModal;