import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Upload,
  ChevronDown,
  HardDrive,
  Eye,
} from "lucide-react-native";
import { useAlert } from "@/contexts/AlertContext";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  CandidateCv,
  CVListResponse,
  CVQueryParams,
  formatFileSize,
  MAX_CVS_PER_CANDIDATE,
} from "@/types/candidateCv.types";
import CVCard from "@/components/cv/CVCard";
import CVUploadModal from "@/components/cv/CVUploadModal";
import CVPreviewModal from "@/components/cv/CVPreviewModal";
import candidateCvService from "@/services/candidateCvService";

const CVManagementScreen: React.FC = () => {
  const router = useRouter();
  const alert = useAlert();
  const { user } = useAuthContext();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cvList, setCvList] = useState<CandidateCv[]>([]);
  const [statistics, setStatistics] = useState<
    CVListResponse["statistics"] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<CVQueryParams["sortBy"]>("uploadedAt");
  const [sortOrder, setSortOrder] =
    useState<CVQueryParams["sortOrder"]>("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CandidateCv | null>(null);

  // Operation states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  // Load CVs
  const loadCVs = useCallback(
    async (showLoader = true) => {
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
          alert.error("Lỗi", response.error || "Không thể tải danh sách CV");
        }
      } catch (error) {
        console.error("Error loading CVs:", error);
        alert.error("Lỗi", "Đã xảy ra lỗi khi tải danh sách CV");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sortBy, sortOrder, searchQuery, alert]
  );

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
        fileToUpload = new File([blob], file.name || "cv.pdf", {
          type: file.mimeType || "application/pdf",
        });
      } else if (file instanceof File || file instanceof Blob) {
        // For web platform
        fileToUpload = file;
      } else {
        throw new Error("Invalid file format");
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
        alert.success("Thành công", "CV đã được tải lên thành công");
        loadCVs();
        return true;
      } else {
        alert.error("Lỗi", uploadResponse.error || "Không thể tải lên CV");
        return false;
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert.error("Lỗi", "Đã xảy ra lỗi khi tải lên CV");
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
        alert.success("Thành công", "CV đã được tải xuống");
      } else {
        alert.error("Lỗi", "Không thể tải xuống CV");
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert.error("Lỗi", "Đã xảy ra lỗi khi tải xuống CV");
    }
  };

  // Handle CV delete
  const handleDeleteCV = async (cv: CandidateCv) => {
    setDeletingId(cv.id);
    try {
      const response = await candidateCvService.deleteCV(cv.id);
      if (response.success) {
        alert.success("Thành công", "CV đã được xóa");
        loadCVs();
      } else {
        alert.error("Lỗi", response.error || "Không thể xóa CV");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert.error("Lỗi", "Đã xảy ra lỗi khi xóa CV");
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
        alert.success("Thành công", "Đã đặt CV làm CV chính");
        loadCVs();
      } else {
        alert.error("Lỗi", response.error || "Không thể đặt CV làm CV chính");
      }
    } catch (error) {
      console.error("Error setting primary CV:", error);
      alert.error("Lỗi", "Đã xảy ra lỗi khi đặt CV làm CV chính");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Handle CV edit
  const handleEditCV = async (cv: CandidateCv) => {
    // This would open an edit modal or navigate to edit screen
    alert.info("Thông báo", "Tính năng chỉnh sửa đang được phát triển");
  };

  // Sort options
  const sortOptions = [
    { value: "uploadedAt", label: "Ngày tải lên" },
    { value: "cvName", label: "Tên CV" },
    { value: "fileSize", label: "Kích thước" },
    { value: "viewCount", label: "Lượt xem" },
  ];

  const canUploadMore =
    !statistics || statistics.totalCvs < MAX_CVS_PER_CANDIDATE;

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <View className="relative">
        <LinearGradient
          colors={["#a855f7", "#9333ea", "#7e22ce"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pb-4"
        >
          {/* Decorative elements */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

          <View className="relative z-10">
            {/* Header Top */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full bg-white/20"
              >
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text className="flex-1 text-xl font-bold text-white text-center tracking-wide">
                Quản lý CV
              </Text>
              <TouchableOpacity
                className={`p-2 rounded-full ${canUploadMore ? "bg-white/20" : "bg-white/10"}`}
                onPress={() => setShowUploadModal(true)}
                disabled={!canUploadMore}
              >
                <Plus size={24} color={canUploadMore ? "#FFF" : "#FFFFFF80"} />
              </TouchableOpacity>
            </View>

            {/* Statistics */}
            {statistics && (
              <View className="flex-row justify-around px-4 pt-2">
                <View className="items-center">
                  <View className="bg-white/20 rounded-full p-2 mb-2">
                    <FileText size={16} color="#FFF" />
                  </View>
                  <Text className="text-lg font-bold text-white">
                    {statistics.totalCvs}/{MAX_CVS_PER_CANDIDATE}
                  </Text>
                  <Text className="text-xs text-white/80 mt-1">CV</Text>
                </View>
                <View className="items-center">
                  <View className="bg-white/20 rounded-full p-2 mb-2">
                    <HardDrive size={16} color="#FFF" />
                  </View>
                  <Text className="text-lg font-bold text-white">
                    {formatFileSize(statistics.totalFileSize)}
                  </Text>
                  <Text className="text-xs text-white/80 mt-1">
                    Tổng dung lượng
                  </Text>
                </View>
                <View className="items-center">
                  <View className="bg-white/20 rounded-full p-2 mb-2">
                    <Eye size={16} color="#FFF" />
                  </View>
                  <Text className="text-lg font-bold text-white">
                    {statistics.totalViews}
                  </Text>
                  <Text className="text-xs text-white/80 mt-1">Lượt xem</Text>
                </View>
              </View>
            )}
          </View>
          {/* Decorative Elements */}
          <View className="absolute top-20 left-8 w-16 h-16 bg-white/10 rounded-full" />
          <View className="absolute top-32 right-12 w-8 h-8 bg-white/10 rounded-full" />
          <View className="absolute top-16 right-20 w-2 h-2 bg-white/20 rounded-full" />
        </LinearGradient>
      </View>

      {/* Search and Filter Bar */}
      <View className="relative">
        <View className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
        <View className="flex-row px-4 py-3 gap-3 relative z-10">
          <View className="flex-1 relative">
            <View className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-indigo-100/50 rounded-2xl" />
            <View className="flex-row items-center bg-white/70 backdrop-blur-xs rounded-2xl px-4 py-2 border border-purple-200/30 relative z-10">
              <Search size={20} color="#7e22ce" />
              <TextInput
                className="flex-1 ml-3 text-sm text-purple-700"
                placeholder="Tìm kiếm CV..."
                placeholderTextColor="#a855f7"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={() => loadCVs()}
              />
            </View>
          </View>

          <TouchableOpacity
            className="relative"
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <View className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl opacity-80" />
            <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-3 rounded-xl border border-purple-200/50 shadow-soft relative z-10">
              <Filter size={18} color="#7e22ce" />
              <Text className="text-purple-700 ml-2 text-sm font-medium">
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </Text>
              <ChevronDown size={16} color="#7e22ce" className="ml-1" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View className="absolute top-36 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-glow-purple border border-purple-200/30 min-w-[150px] z-50">
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`px-4 py-3 ${sortBy === option.value ? "bg-purple-50" : ""}`}
              onPress={() => {
                setSortBy(option.value as CVQueryParams["sortBy"]);
                setShowSortMenu(false);
              }}
            >
              <Text
                className={`text-sm ${sortBy === option.value ? "text-purple-700 font-semibold" : "text-purple-600"}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="h-px bg-purple-200/30 mx-2" />
          <TouchableOpacity
            className="px-4 py-3"
            onPress={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              setShowSortMenu(false);
            }}
          >
            <Text className="text-sm text-purple-600">
              {sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center px-4">
            <ActivityIndicator size="large" color="#a855f7" />
            <Text className="text-purple-600 text-lg font-medium mt-4">
              Đang tải danh sách CV...
            </Text>
          </View>
        ) : cvList.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6">
              <FileText size={40} color="#a855f7" />
            </View>
            <Text className="text-purple-800 text-xl font-bold text-center mb-2">
              Chưa có CV nào
            </Text>
            <Text className="text-purple-600 text-base text-center mb-8 leading-6">
              Tải lên CV đầu tiên của bạn để bắt đầu ứng tuyển công việc
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-4 rounded-full shadow-glow-purple flex-row items-center"
              onPress={() => setShowUploadModal(true)}
            >
              <Upload size={20} color="#FFF" />
              <Text className="text-white text-lg font-semibold ml-2">
                Tải lên CV
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Warning if reaching limit */}
            {statistics && statistics.totalCvs >= MAX_CVS_PER_CANDIDATE - 1 && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mx-4 mb-4 flex-row items-center">
                <AlertCircle size={20} color="#F59E0B" />
                <Text className="text-amber-700 text-sm font-medium ml-3 flex-1">
                  Bạn{" "}
                  {statistics.totalCvs === MAX_CVS_PER_CANDIDATE
                    ? "đã đạt giới hạn"
                    : `còn ${MAX_CVS_PER_CANDIDATE - statistics.totalCvs} slot`}{" "}
                  CV.
                  {statistics.totalCvs === MAX_CVS_PER_CANDIDATE &&
                    " Xóa CV cũ để tải lên CV mới."}
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

export default CVManagementScreen;
