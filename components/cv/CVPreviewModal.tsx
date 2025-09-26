import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import CrossPlatformWebView from '@/components/common/CrossPlatformWebView';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Download,
  Share2,
  ExternalLink,
  FileText,
  Eye,
  Loader,
} from 'lucide-react-native';
import { CandidateCv } from '@/types/candidateCv.types';
import pdfPageService, { PDFPageInfo } from '@/services/pdfPageService';
import { useAlert } from '@/contexts/AlertContext';

interface CVPreviewModalProps {
  visible: boolean;
  cv: CandidateCv | null;
  onClose: () => void;
  onDownload: (cv: CandidateCv) => void;
}

// Get screen dimensions for responsive design (currently unused but available for future use)
// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
  visible,
  cv,
  onClose,
  onDownload,
}) => {
  const alert = useAlert();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webViewProgress, setWebViewProgress] = useState(0);
  const [pdfPageInfo, setPdfPageInfo] = useState<PDFPageInfo | null>(null);
  
  // Memoize cv id to prevent unnecessary re-renders
  const cvId = useMemo(() => cv?.id, [cv?.id]);



  // Load preview - completely stable without any dependencies
  const loadPreview = useCallback(async (cvData: CandidateCv) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading direct preview for CV:', cvData.id, cvData.cvName);
      
      // Use direct URL from CV data (cloudinaryUrl or fileUrl)
      const directUrl = cvData.cloudinaryUrl || cvData.fileUrl;
      
      if (!directUrl) {
        console.error('❌ No file URL available for CV:', cvData.id);
        setError('Không tìm thấy URL file CV');
        setIsLoading(false);
        return;
      }

      console.log('✅ Using direct CV URL:', directUrl);
      setPreviewUrl(directUrl);
      
      // Convert PDF to multiple pages inline to avoid dependency
      try {
        console.log('📄 Converting PDF to pages:', directUrl);
        const pageInfo = await pdfPageService.getPDFPages(directUrl);
        
        console.log('📄 PDF processed, pages:', pageInfo.pageUrls.length);
        setPdfPageInfo(pageInfo);
      } catch (pdfError) {
        console.error('⚠️ Failed to convert PDF pages:', pdfError);
        // On error, still try to show something
        setPdfPageInfo({
          pageUrls: [directUrl],
          totalPages: 1,
          originalUrl: directUrl,
        });
      }
      
    } catch (err) {
      console.error('💥 Error loading direct preview:', err);
      setError('Đã xảy ra lỗi khi tải xem trước CV');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset state when modal closes
  const resetState = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    setWebViewProgress(0);
    setPdfPageInfo(null);
    setIsLoading(false);
  }, []);

  // Use refs to track the current CV to avoid dependency issues
  const currentCvIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (visible && cv && cvId) {
      // Check if this is actually a different CV or first load
      if (currentCvIdRef.current !== cvId || !hasLoadedRef.current) {
        currentCvIdRef.current = cvId;
        hasLoadedRef.current = true;
        loadPreview(cv);
      }
    } else if (!visible) {
      // Reset state when modal is closed
      currentCvIdRef.current = null;
      hasLoadedRef.current = false;
      resetState();
    }
    // Include cv in dependency array since it's used inside the effect
  }, [visible, cv, cvId, loadPreview, resetState]);



  // Don't use cv or onDownload as dependencies - accept them as parameters instead
  const handleDownload = () => {
    if (cv) {
      onDownload(cv);
    }
  };

  const handleOpenExternal = () => {
    if (previewUrl && Platform.OS === 'web') {
      window.open(previewUrl, '_blank');
    } else {
      alert.info(
        'Thông báo',
        'Tính năng này chỉ khả dụng trên trình duyệt web.'
      );
    }
  };

  const handleShare = async () => {
    if (cv && previewUrl) {
      // Implementation would depend on platform
      // For React Native, would use Share API
      // For web, could use Web Share API or copy to clipboard
      alert.info('Thông báo', 'Tính năng chia sẻ đang được phát triển');
    }
  };

  const getGoogleViewerUrl = (url: string) => {
    // Use Google Docs Viewer for better compatibility
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Đang tải CV...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <FileText size={48} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            if (!cv) return;
            loadPreview(cv);
          }}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (previewUrl) {
      const viewerUrl = Platform.OS === 'web' 
        ? previewUrl 
        : getGoogleViewerUrl(previewUrl);

      return (
        <>
          {webViewProgress < 1 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${webViewProgress * 100}%` }]} 
                />
              </View>
            </View>
          )}
          <CrossPlatformWebView
            source={{ uri: viewerUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <Loader size={32} color="#4A90E2" />
              </View>
            )}
            onLoadProgress={({ nativeEvent }) => {
              setWebViewProgress(nativeEvent.progress);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setError('Không thể hiển thị CV. Vui lòng tải về để xem.');
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
          />
        </>
      );
    }

    return null;
  };

  if (!cv) return null;

  // Always use WebView for consistent experience
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {cv.cvName}
              </Text>
              <View style={styles.headerMeta}>
                <Eye size={14} color="#FFF" />
                <Text style={styles.headerMetaText}>
                  Xem lần thứ {cv.viewCount + 1}
                </Text>
                {pdfPageInfo && pdfPageInfo.totalPages > 1 && (
                  <>
                    <Text style={styles.headerMetaText}> • </Text>
                    <FileText size={14} color="#FFF" />
                    <Text style={styles.headerMetaText}>
                      {pdfPageInfo.totalPages} trang
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDownload}
            >
              <Download size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
            >
              <Share2 size={20} color="#FFF" />
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleOpenExternal}
              >
                <ExternalLink size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Footer Info */}
        {cv.description && (
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Mô tả:</Text>
            <Text style={styles.footerText}>{cv.description}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  headerMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  webView: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E0E0E0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7F8C8D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
});

export default CVPreviewModal;