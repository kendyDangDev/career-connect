import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
} from "lucide-react-native";
import { CandidateCv, formatFileSize } from "@/types/candidateCv.types";
import { useAlert } from "@/contexts/AlertContext";

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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getFileIcon = () => {
    const extension = cv.cvName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "#E74C3C";
      case "doc":
      case "docx":
        return "#3498DB";
      default:
        return "#95A5A6";
    }
  };

  const handleDelete = () => {
    alert.confirm(
      "Xác nhận xóa",
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
    <View className="mb-3 relative">
      <LinearGradient
        colors={
          cv.isPrimary
            ? ["#a855f7", "#9333ea", "#7e22ce"]
            : ["#FFFFFF", "#F8F9FA"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl shadow-glow-purple"
      >
        <TouchableOpacity
          className="rounded-2xl overflow-hidden"
          onPress={() => onPreview(cv)}
          activeOpacity={0.7}
        >
          <View className="flex-row p-4 items-center">
            {/* File Icon Section */}
            <View
              className={`w-14 h-14 rounded-xl justify-center items-center mr-3 relative`}
              style={{ backgroundColor: getFileIcon() + "20" }}
            >
              <FileText size={28} color={getFileIcon()} />
              {cv.isPrimary && (
                <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                  <Star size={12} color="#FFF" fill="#FFF" />
                </View>
              )}
            </View>

            {/* Content Section */}
            <View className="flex-1 mr-2">
              <Text
                className={`text-base font-semibold mb-1 ${cv.isPrimary ? "text-white" : "text-gray-800"}`}
                numberOfLines={1}
              >
                {cv.cvName}
              </Text>

              {cv.description && (
                <Text
                  className={`text-sm ${cv.isPrimary ? "text-white/80" : "text-gray-600"} mb-2 leading-5`}
                  numberOfLines={2}
                >
                  {cv.description}
                </Text>
              )}

              <View className="flex-row flex-wrap gap-3">
                <View className="flex-row items-center gap-1">
                  <HardDrive
                    size={12}
                    color={cv.isPrimary ? "#FFFFFF80" : "#7F8C8D"}
                  />
                  <Text
                    className={`text-xs ${cv.isPrimary ? "text-white/70" : "text-gray-500"}`}
                  >
                    {formatFileSize(cv.fileSize)}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <Clock
                    size={12}
                    color={cv.isPrimary ? "#FFFFFF80" : "#7F8C8D"}
                  />
                  <Text
                    className={`text-xs ${cv.isPrimary ? "text-white/70" : "text-gray-500"}`}
                  >
                    {formatDate(cv.uploadedAt)}
                  </Text>
                </View>

                {cv.viewCount > 0 && (
                  <View className="flex-row items-center gap-1">
                    <Eye
                      size={12}
                      color={cv.isPrimary ? "#FFFFFF80" : "#7F8C8D"}
                    />
                    <Text
                      className={`text-xs ${cv.isPrimary ? "text-white/70" : "text-gray-500"}`}
                    >
                      {cv.viewCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Actions Section */}
            <View className="p-1">
              <TouchableOpacity
                className="p-2 rounded-lg"
                onPress={() => setShowActions(!showActions)}
              >
                <MoreVertical
                  size={20}
                  color={cv.isPrimary ? "#FFF" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Menu */}
          {showActions && (
            <View
              className={`border-t pt-2 ${cv.isPrimary ? "bg-white/10 border-white/20 backdrop-blur-sm" : "bg-white border-gray-200"}`}
            >
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 gap-3"
                onPress={() => {
                  setShowActions(false);
                  onPreview(cv);
                }}
              >
                <Eye size={16} color={cv.isPrimary ? "#FFF" : "#a855f7"} />
                <Text
                  className={`text-sm font-medium ${cv.isPrimary ? "text-white" : "text-purple-700"}`}
                >
                  Xem trước
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 px-4 gap-3"
                onPress={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator
                    size="small"
                    color={cv.isPrimary ? "#FFF" : "#10b981"}
                  />
                ) : (
                  <Download
                    size={16}
                    color={cv.isPrimary ? "#FFF" : "#10b981"}
                  />
                )}
                <Text
                  className={`text-sm font-medium ${cv.isPrimary ? "text-white" : "text-emerald-600"}`}
                >
                  Tải xuống
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 px-4 gap-3"
                onPress={() => {
                  setShowActions(false);
                  onEdit(cv);
                }}
              >
                <Edit3 size={16} color={cv.isPrimary ? "#FFF" : "#f59e0b"} />
                <Text
                  className={`text-sm font-medium ${cv.isPrimary ? "text-white" : "text-amber-600"}`}
                >
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>

              {!cv.isPrimary && (
                <TouchableOpacity
                  className="flex-row items-center py-3 px-4 gap-3"
                  onPress={() => {
                    setShowActions(false);
                    onSetPrimary(cv);
                  }}
                  disabled={isSettingPrimary}
                >
                  {isSettingPrimary ? (
                    <ActivityIndicator size="small" color="#f59e0b" />
                  ) : (
                    <Star size={16} color="#f59e0b" />
                  )}
                  <Text className="text-sm font-medium text-amber-600">
                    Đặt làm chính
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="flex-row items-center py-3 px-4 gap-3 border-t border-red-100 mt-2 pt-3"
                onPress={() => {
                  setShowActions(false);
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Trash2 size={16} color="#ef4444" />
                )}
                <Text className="text-sm font-medium text-red-500">Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Primary Badge Label */}
      {cv.isPrimary && (
        <View className="absolute top-0 right-3 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 rounded-b-lg flex-row items-center gap-1 shadow-soft">
          <Star size={10} color="#FFF" fill="#FFF" />
          <Text className="text-white text-xs font-semibold">CV Chính</Text>
        </View>
      )}

      {/* Decorative Elements for Primary CV */}
      {cv.isPrimary && (
        <>
          <View className="absolute top-4 right-4 w-6 h-6 bg-white/10 rounded-full" />
          <View className="absolute bottom-4 left-4 w-3 h-3 bg-white/10 rounded-full" />
        </>
      )}
    </View>
  );
};

export default CVCard;
