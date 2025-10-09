import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Star,
  Eye,
  MoreVertical
} from 'lucide-react-native';
import { Application, ApplicationStatus } from '@/types/application.types';

interface ApplicationCardProps {
  application: Application;
  onPress: (application: Application) => void;
  onWithdraw?: (applicationId: string) => void;
  onViewDetails?: (application: Application) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onWithdraw,
  onViewDetails
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return {
          label: 'Đã nộp',
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <FileText size={14} color="#2563eb" />
        };
      case ApplicationStatus.SCREENING:
        return {
          label: 'Đang xét duyệt',
          color: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          icon: <Eye size={14} color="#ca8a04" />
        };
      case ApplicationStatus.INTERVIEWING:
        return {
          label: 'Phỏng vấn',
          color: 'bg-purple-100',
          textColor: 'text-purple-700',
          icon: <Calendar size={14} color="#7c3aed" />
        };
      case ApplicationStatus.OFFERED:
        return {
          label: 'Đã nhận offer',
          color: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle size={14} color="#16a34a" />
        };
      case ApplicationStatus.HIRED:
        return {
          label: 'Đã tuyển',
          color: 'bg-emerald-100',
          textColor: 'text-emerald-700',
          icon: <Star size={14} color="#10b981" />
        };
      case ApplicationStatus.REJECTED:
        return {
          label: 'Từ chối',
          color: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle size={14} color="#dc2626" />
        };
      case ApplicationStatus.WITHDRAWN:
        return {
          label: 'Đã rút',
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <AlertCircle size={14} color="#6b7280" />
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <AlertCircle size={14} color="#6b7280" />
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const { job } = application;

  return (
    <TouchableOpacity
      onPress={() => onPress(application)}
      activeOpacity={0.7}
      className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden border border-gray-100"
    >
      <View className="p-4">
        {/* Header with company info and status */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: job.company.logoUrl || 'https://i.pravatar.cc/100?img=' + job.company.id }}
              className="w-12 h-12 rounded-xl bg-gray-100"
              contentFit="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
                {job.title}
              </Text>
              <Text className="text-gray-600 text-sm mt-0.5" numberOfLines={1}>
                {job.company.companyName}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className={`${statusConfig.color} px-3 py-1.5 rounded-full flex-row items-center`}>
            {statusConfig.icon}
            <Text className={`${statusConfig.textColor} font-medium text-xs ml-1.5`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Job Details */}
        <View className="space-y-2">
          {/* Location & Type */}
          <View className="flex-row items-center flex-wrap">
            {job.location && (
              <View className="flex-row items-center mr-4 mb-1">
                <MapPin size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">{job.location}</Text>
              </View>
            )}
            {job.workLocationType && (
              <View className="flex-row items-center mr-4 mb-1">
                <Briefcase size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {job.workLocationType === 'REMOTE' ? 'Remote' :
                   job.workLocationType === 'HYBRID' ? 'Hybrid' : 'Tại văn phòng'}
                </Text>
              </View>
            )}
            {job.jobType && (
              <View className="bg-gray-100 px-2 py-1 rounded-md mb-1">
                <Text className="text-gray-600 text-xs">
                  {job.jobType === 'FULL_TIME' ? 'Toàn thời gian' :
                   job.jobType === 'PART_TIME' ? 'Bán thời gian' :
                   job.jobType === 'CONTRACT' ? 'Hợp đồng' : 'Thực tập'}
                </Text>
              </View>
            )}
          </View>

          {/* Salary */}
          {job.salary && (
            <View className="flex-row items-center">
              <DollarSign size={14} color="#6b7280" />
              <Text className="text-gray-700 font-medium text-sm ml-1">
                {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} VND
              </Text>
            </View>
          )}

          {/* Timeline Info */}
          <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 mt-2">
            <View className="flex-row items-center">
              <Clock size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                Nộp {formatDate(application.appliedAt)}
              </Text>
            </View>

            {/* Interview Schedule */}
            {application.status === ApplicationStatus.INTERVIEWING && application.interviewScheduledAt && (
              <View className="flex-row items-center">
                <Calendar size={14} color="#7c3aed" />
                <Text className="text-purple-700 text-xs font-medium ml-1">
                  PV: {new Date(application.interviewScheduledAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}

            {/* Rating */}
            {application.rating && (
              <View className="flex-row items-center">
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-gray-700 text-xs ml-1">
                  {application.rating}/5
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons (only for certain statuses) */}
        {(application.status === ApplicationStatus.APPLIED || 
          application.status === ApplicationStatus.SCREENING) && (
          <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => onWithdraw?.(application.id)}
              className="bg-gray-100 px-4 py-2 rounded-lg mr-2"
            >
              <Text className="text-gray-700 font-medium text-sm">Rút hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onViewDetails?.(application)}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">Chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Deadline warning */}
        {job.deadline && new Date(job.deadline) > new Date() && (
          <View className="mt-2">
            <Text className="text-red-600 text-xs">
              Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ApplicationCard;