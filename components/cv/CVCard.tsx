import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Star,
  MoreVertical,
  Edit3,
  Clock,
  HardDrive,
  Share2,
} from 'lucide-react-native';
import { CandidateCv, formatFileSize } from '@/types/candidateCv.types';
import { useAlert } from '@/contexts/AlertContext';

interface CVCardProps {
  cv: CandidateCv;
  onPreview: (cv: CandidateCv) => void;
  onDownload: (cv: CandidateCv) => void;
  onDelete: (cv: CandidateCv) => void;
  onSetPrimary: (cv: CandidateCv) => void;
  onEdit: (cv: CandidateCv) => void;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
}

const CVCard: React.FC<CVCardProps> = ({
  cv,
  onPreview,
  onDownload,
  onDelete,
  onSetPrimary,
  onEdit,
  isDeleting,
  isSettingPrimary,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const alert = useAlert();

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = () => {
    const extension = cv.cvName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '#E74C3C';
      case 'doc':
      case 'docx':
        return '#3498DB';
      default:
        return '#95A5A6';
    }
  };

  const handleDelete = () => {
    alert.confirm(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa CV "${cv.cvName}"?`,
      () => onDelete(cv)
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload(cv);
    setIsDownloading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={cv.isPrimary ? ['#4A90E2', '#357ABD'] : ['#FFFFFF', '#F8F9FA']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPreview(cv)}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            {/* File Icon Section */}
            <View style={[styles.fileIconContainer, { backgroundColor: getFileIcon() + '20' }]}>
              <FileText size={28} color={getFileIcon()} />
              {cv.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Star size={12} color="#FFF" fill="#FFF" />
                </View>
              )}
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
              <Text style={[styles.cvName, cv.isPrimary && styles.primaryText]} numberOfLines={1}>
                {cv.cvName}
              </Text>
              
              {cv.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {cv.description}
                </Text>
              )}

              <View style={styles.metadata}>
                <View style={styles.metaItem}>
                  <HardDrive size={12} color="#7F8C8D" />
                  <Text style={styles.metaText}>{formatFileSize(cv.fileSize)}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Clock size={12} color="#7F8C8D" />
                  <Text style={styles.metaText}>{formatDate(cv.uploadedAt)}</Text>
                </View>

                {cv.viewCount > 0 && (
                  <View style={styles.metaItem}>
                    <Eye size={12} color="#7F8C8D" />
                    <Text style={styles.metaText}>{cv.viewCount}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Actions Section */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowActions(!showActions)}
              >
                <MoreVertical size={20} color={cv.isPrimary ? '#FFF' : '#34495E'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Menu */}
          {showActions && (
            <View style={[styles.actionMenu, cv.isPrimary && styles.actionMenuPrimary]}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);
                  onPreview(cv);
                }}
              >
                <Eye size={16} color={cv.isPrimary ? '#FFF' : '#3498DB'} />
                <Text style={[styles.actionText, cv.isPrimary && styles.actionTextPrimary]}>
                  Xem trước
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color={cv.isPrimary ? '#FFF' : '#3498DB'} />
                ) : (
                  <Download size={16} color={cv.isPrimary ? '#FFF' : '#27AE60'} />
                )}
                <Text style={[styles.actionText, cv.isPrimary && styles.actionTextPrimary]}>
                  Tải xuống
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);
                  onEdit(cv);
                }}
              >
                <Edit3 size={16} color={cv.isPrimary ? '#FFF' : '#F39C12'} />
                <Text style={[styles.actionText, cv.isPrimary && styles.actionTextPrimary]}>
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>

              {!cv.isPrimary && (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setShowActions(false);
                    onSetPrimary(cv);
                  }}
                  disabled={isSettingPrimary}
                >
                  {isSettingPrimary ? (
                    <ActivityIndicator size="small" color="#F39C12" />
                  ) : (
                    <Star size={16} color="#F39C12" />
                  )}
                  <Text style={styles.actionText}>Đặt làm chính</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionItem, styles.deleteAction]}
                onPress={() => {
                  setShowActions(false);
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#E74C3C" />
                ) : (
                  <Trash2 size={16} color="#E74C3C" />
                )}
                <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Primary Badge Label */}
      {cv.isPrimary && (
        <View style={styles.primaryLabel}>
          <Star size={10} color="#FFF" fill="#FFF" />
          <Text style={styles.primaryLabelText}>CV Chính</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  cardGradient: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  primaryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F39C12',
    borderRadius: 10,
    padding: 3,
  },
  contentSection: {
    flex: 1,
    marginRight: 8,
  },
  cvName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  primaryText: {
    color: '#FFF',
  },
  description: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  actionsContainer: {
    padding: 4,
  },
  actionButton: {
    padding: 8,
  },
  actionMenu: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingVertical: 8,
  },
  actionMenuPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#34495E',
  },
  actionTextPrimary: {
    color: '#FFF',
  },
  deleteAction: {
    borderTopWidth: 1,
    borderTopColor: '#FEE',
    marginTop: 8,
    paddingTop: 12,
  },
  deleteText: {
    color: '#E74C3C',
  },
  primaryLabel: {
    position: 'absolute',
    top: 0,
    right: 12,
    backgroundColor: '#F39C12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryLabelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default CVCard;