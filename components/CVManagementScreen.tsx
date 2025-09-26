import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Upload,
  ChevronDown,
  BarChart3,
  HardDrive,
  Eye,
} from 'lucide-react-native';
import { useAlert } from '@/contexts/AlertContext';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  CandidateCv,
  CVListResponse,
  CVQueryParams,
  formatFileSize,
  MAX_CVS_PER_CANDIDATE,
} from '@/types/candidateCv.types';
import CVCard from '@/components/cv/CVCard';
import CVUploadModal from '@/components/cv/CVUploadModal';
import CVPreviewModal from '@/components/cv/CVPreviewModal';
import candidateCvService from '@/services/candidateCvService';

const CVManagementScreen: React.FC = () => {
  const router = useRouter();
  const alert = useAlert();
  const { user } = useAuthContext();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cvList, setCvList] = useState<CandidateCv[]>([]);
  const [statistics, setStatistics] = useState<CVListResponse['statistics'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<CVQueryParams['sortBy']>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<CVQueryParams['sortOrder']>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CandidateCv | null>(null);

  // Operation states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  // Load CVs
  const loadCVs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const params: CVQueryParams = {
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
      };

      const response = await candidateCvService.getCVs(params);
      
      if (response.success && response.data) {
        setCvList(response.data.cvs);
        setStatistics(response.data.statistics);
      } else {
        alert.error('Lỗi', response.error || 'Không thể tải danh sách CV');
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi tải danh sách CV');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, sortOrder, searchQuery, alert]);

  useEffect(() => {
    loadCVs();
  }, [loadCVs]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadCVs(false);
  };

  // Handle CV upload with progress tracking
  const handleUploadCV = async (
    file: any,
    cvName: string,
    description: string,
    isPrimary: boolean
  ): Promise<boolean> => {
    try {
      // Create a File object for Cloudinary upload
      let fileToUpload: File | Blob;
      
      if (file.uri) {
        // For React Native (Expo Document Picker result)
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], file.name || 'cv.pdf', {
          type: file.mimeType || 'application/pdf',
        });
      } else if (file instanceof File || file instanceof Blob) {
        // For web platform
        fileToUpload = file;
      } else {
        throw new Error('Invalid file format');
      }

      // Upload with progress tracking
      const uploadResponse = await candidateCvService.uploadCV(
        fileToUpload,
        cvName,
        description,
        isPrimary || cvList.length === 0,
        user?.id, // Pass candidate ID
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );

      if (uploadResponse.success) {
        alert.success('Thành công', 'CV đã được tải lên thành công');
        loadCVs();
        return true;
      } else {
        alert.error('Lỗi', uploadResponse.error || 'Không thể tải lên CV');
        return false;
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi tải lên CV');
      return false;
    }
  };

  // Handle CV preview
  const handlePreviewCV = (cv: CandidateCv) => {
    setSelectedCV(cv);
    setShowPreviewModal(true);
  };

  // Handle CV download
  const handleDownloadCV = async (cv: CandidateCv) => {
    try {
      const success = await candidateCvService.downloadCV(cv);
      if (success) {
        alert.success('Thành công', 'CV đã được tải xuống');
      } else {
        alert.error('Lỗi', 'Không thể tải xuống CV');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi tải xuống CV');
    }
  };

  // Handle CV delete
  const handleDeleteCV = async (cv: CandidateCv) => {
    setDeletingId(cv.id);
    try {
      const response = await candidateCvService.deleteCV(cv.id);
      if (response.success) {
        alert.success('Thành công', 'CV đã được xóa');
        loadCVs();
      } else {
        alert.error('Lỗi', response.error || 'Không thể xóa CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi xóa CV');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle set primary CV
  const handleSetPrimaryCV = async (cv: CandidateCv) => {
    setSettingPrimaryId(cv.id);
    try {
      const response = await candidateCvService.setPrimaryCV(cv.id);
      if (response.success) {
        alert.success('Thành công', 'Đã đặt CV làm CV chính');
        loadCVs();
      } else {
        alert.error('Lỗi', response.error || 'Không thể đặt CV làm CV chính');
      }
    } catch (error) {
      console.error('Error setting primary CV:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi đặt CV làm CV chính');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Handle CV edit
  const handleEditCV = async (cv: CandidateCv) => {
    // This would open an edit modal or navigate to edit screen
    alert.info('Thông báo', 'Tính năng chỉnh sửa đang được phát triển');
  };

  // Sort options
  const sortOptions = [
    { value: 'uploadedAt', label: 'Ngày tải lên' },
    { value: 'cvName', label: 'Tên CV' },
    { value: 'fileSize', label: 'Kích thước' },
    { value: 'viewCount', label: 'Lượt xem' },
  ];

  const canUploadMore = !statistics || statistics.totalCvs < MAX_CVS_PER_CANDIDATE;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý CV</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
            disabled={!canUploadMore}
          >
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        {statistics && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <FileText size={16} color="#FFF" />
              <Text style={styles.statValue}>{statistics.totalCvs}/{MAX_CVS_PER_CANDIDATE}</Text>
              <Text style={styles.statLabel}>CV</Text>
            </View>
            <View style={styles.statItem}>
              <HardDrive size={16} color="#FFF" />
              <Text style={styles.statValue}>{formatFileSize(statistics.totalFileSize)}</Text>
              <Text style={styles.statLabel}>Tổng dung lượng</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color="#FFF" />
              <Text style={styles.statValue}>{statistics.totalViews}</Text>
              <Text style={styles.statLabel}>Lượt xem</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterBar}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#7F8C8D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm CV..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => loadCVs()}
          />
        </View>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Filter size={18} color="#34495E" />
          <Text style={styles.sortButtonText}>
            {sortOptions.find(o => o.value === sortBy)?.label}
          </Text>
          <ChevronDown size={16} color="#34495E" />
        </TouchableOpacity>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortMenuItem,
                sortBy === option.value && styles.sortMenuItemActive,
              ]}
              onPress={() => {
                setSortBy(option.value as CVQueryParams['sortBy']);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortMenuText,
                  sortBy === option.value && styles.sortMenuTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.sortMenuDivider} />
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setShowSortMenu(false);
            }}
          >
            <Text style={styles.sortMenuText}>
              {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Đang tải danh sách CV...</Text>
          </View>
        ) : cvList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>Chưa có CV nào</Text>
            <Text style={styles.emptyText}>
              Tải lên CV đầu tiên của bạn để bắt đầu ứng tuyển công việc
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Upload size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Tải lên CV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Warning if reaching limit */}
            {statistics && statistics.totalCvs >= MAX_CVS_PER_CANDIDATE - 1 && (
              <View style={styles.warningCard}>
                <AlertCircle size={20} color="#F39C12" />
                <Text style={styles.warningText}>
                  Bạn {statistics.totalCvs === MAX_CVS_PER_CANDIDATE 
                    ? 'đã đạt giới hạn' 
                    : `còn ${MAX_CVS_PER_CANDIDATE - statistics.totalCvs} slot`} CV.
                  {statistics.totalCvs === MAX_CVS_PER_CANDIDATE && 
                    ' Xóa CV cũ để tải lên CV mới.'}
                </Text>
              </View>
            )}

            {/* CV List */}
            {cvList.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onPreview={handlePreviewCV}
                onDownload={handleDownloadCV}
                onDelete={handleDeleteCV}
                onSetPrimary={handleSetPrimaryCV}
                onEdit={handleEditCV}
                isDeleting={deletingId === cv.id}
                isSettingPrimary={settingPrimaryId === cv.id}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <CVUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadCV}
        canUploadMore={canUploadMore}
        currentCVCount={cvList.length}
      />

      {/* Preview Modal */}
      <CVPreviewModal
        visible={showPreviewModal}
        cv={selectedCV}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedCV(null);
        }}
        onDownload={handleDownloadCV}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  uploadButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 8,
    fontSize: 14,
    color: '#34495E',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#34495E',
  },
  sortMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 180 : 150,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    minWidth: 150,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortMenuItemActive: {
    backgroundColor: '#F0F8FF',
  },
  sortMenuText: {
    fontSize: 14,
    color: '#34495E',
  },
  sortMenuTextActive: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  sortMenuDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  warningCard: {
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
    lineHeight: 18,
  },
});

export default CVManagementScreen;