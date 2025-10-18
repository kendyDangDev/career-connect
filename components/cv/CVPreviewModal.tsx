import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

import CrossPlatformWebView from "@/components/common/CrossPlatformWebView";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Download,
  Share2,
  ExternalLink,
  FileText,
  Eye,
  Loader,
} from "lucide-react-native";
import { CandidateCv } from "@/types/candidateCv.types";
import pdfPageService, { PDFPageInfo } from "@/services/pdfPageService";
import { useAlert } from "@/contexts/AlertContext";

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
      console.log(
        "🔄 Loading direct preview for CV:",
        cvData.id,
        cvData.cvName
      );

      // Use direct URL from CV data (cloudinaryUrl or fileUrl)
      const directUrl = cvData.cloudinaryUrl || cvData.fileUrl;

      if (!directUrl) {
        console.error("❌ No file URL available for CV:", cvData.id);
        setError("Không tìm thấy URL file CV");
        setIsLoading(false);
        return;
      }

      console.log("✅ Using direct CV URL:", directUrl);
      setPreviewUrl(directUrl);

      // Convert PDF to multiple pages inline to avoid dependency
      try {
        console.log("📄 Converting PDF to pages:", directUrl);
        const pageInfo = await pdfPageService.getPDFPages(directUrl);

        console.log("📄 PDF processed, pages:", pageInfo.pageUrls.length);
        setPdfPageInfo(pageInfo);
      } catch (pdfError) {
        console.error("⚠️ Failed to convert PDF pages:", pdfError);
        // On error, still try to show something
        setPdfPageInfo({
          pageUrls: [directUrl],
          totalPages: 1,
          originalUrl: directUrl,
        });
      }
    } catch (err) {
      console.error("💥 Error loading direct preview:", err);
      setError("Đã xảy ra lỗi khi tải xem trước CV");
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
    if (previewUrl && Platform.OS === "web") {
      window.open(previewUrl, "_blank");
    } else {
      alert.info(
        "Thông báo",
        "Tính năng này chỉ khả dụng trên trình duyệt web."
      );
    }
  };

  const handleShare = async () => {
    if (cv && previewUrl) {
      // Implementation would depend on platform
      // For React Native, would use Share API
      // For web, could use Web Share API or copy to clipboard
      alert.info("Thông báo", "Tính năng chia sẻ đang được phát triển");
    }
  };

  const getGoogleViewerUrl = (url: string) => {
    // Use Google Docs Viewer for better compatibility
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center bg-purple-50">
          <View className="items-center">
            <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-4">
              <ActivityIndicator size="large" color="#a855f7" />
            </View>
            <Text className="text-purple-600 text-base font-medium">
              Đang tải CV...
            </Text>
            <Text className="text-purple-500 text-sm mt-1">
              Vui lòng chờ một chút
            </Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-5 bg-purple-50">
          <View className="items-center">
            <View className="w-20 h-20 bg-red-100 rounded-2xl items-center justify-center mb-4">
              <FileText size={40} color="#ef4444" />
            </View>
            <Text className="text-red-600 text-base font-semibold mb-2 text-center">
              Không thể tải CV
            </Text>
            <Text className="text-red-500 text-sm text-center mb-6 leading-5">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 rounded-full shadow-glow-purple"
              onPress={() => {
                if (!cv) return;
                loadPreview(cv);
              }}
            >
              <Text className="text-white text-sm font-semibold">Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (previewUrl) {
      const viewerUrl =
        Platform.OS === "web" ? previewUrl : getGoogleViewerUrl(previewUrl);

      return (
        <>
          {webViewProgress < 1 && (
            <View className="absolute top-0 left-0 right-0 z-10">
              <View className="h-1 bg-purple-200">
                <View
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${webViewProgress * 100}%` }}
                />
              </View>
            </View>
          )}
          <CrossPlatformWebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 justify-center items-center bg-white">
                <View className="items-center">
                  <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-3">
                    <Loader size={32} color="#a855f7" />
                  </View>
                  <Text className="text-purple-600 text-sm">Đang tải...</Text>
                </View>
              </View>
            )}
            onLoadProgress={({ nativeEvent }) => {
              setWebViewProgress(nativeEvent.progress);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
              setError("Không thể hiển thị CV. Vui lòng tải về để xem.");
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
            originWhitelist={["*"]}
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
      <View className="flex-1 bg-purple-50">
        {/* Header */}
        <LinearGradient
          colors={["#a855f7", "#9333ea", "#7e22ce"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="relative"
          style={{
            paddingTop: Platform.OS === "ios" ? 50 : 20,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          {/* Decorative elements */}
          <View className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <View className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

          <View className="flex-row justify-between items-center relative z-10">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={onClose}
                className="p-2 mr-3 rounded-full bg-white/20"
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-white"
                  numberOfLines={1}
                >
                  {cv.cvName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Eye size={12} color="#FFF" />
                  <Text className="text-xs text-white/90 ml-1">
                    Xem lần thứ {cv.viewCount + 1}
                  </Text>
                  {pdfPageInfo && pdfPageInfo.totalPages > 1 && (
                    <>
                      <Text className="text-xs text-white/90 mx-2">•</Text>
                      <FileText size={12} color="#FFF" />
                      <Text className="text-xs text-white/90 ml-1">
                        {pdfPageInfo.totalPages} trang
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="p-2 rounded-lg bg-white/20"
                onPress={handleDownload}
              >
                <Download size={18} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="p-2 rounded-lg bg-white/20"
                onPress={handleShare}
              >
                <Share2 size={18} color="#FFF" />
              </TouchableOpacity>

              {Platform.OS === "web" && (
                <TouchableOpacity
                  className="p-2 rounded-lg bg-white/20"
                  onPress={handleOpenExternal}
                >
                  <ExternalLink size={18} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="flex-1 bg-white">{renderContent()}</View>

        {/* Footer Info */}
        {cv.description && (
          <View className="p-4 bg-white border-t border-purple-100">
            <Text className="text-xs font-semibold text-purple-600 mb-1">
              Mô tả:
            </Text>
            <Text className="text-sm text-purple-800 leading-5">
              {cv.description}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CVPreviewModal;
