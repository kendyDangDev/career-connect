import { SavedJob } from '@/types/savedJob.types';
import {
  BookmarkX,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAlert } from '@/contexts/AlertContext';

interface SavedJobCardProps {
  savedJob: SavedJob;
  onPress: () => void;
  onRemove: () => void;
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({ 
  savedJob, 
  onPress, 
  onRemove 
}) => {
  const { job, createdAt } = savedJob;
  const alert = useAlert();

  const formatSalary = (min: number, max: number, currency: string): string => {
    const formatter = new Intl.NumberFormat('vi-VN');
    const minFormatted = formatter.format(min / 1000000);
    const maxFormatted = formatter.format(max / 1000000);
    return `${minFormatted} - ${maxFormatted} triệu ${currency}`;
  };

  const formatDate = (dateString: string): string => {
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

  const getDaysUntilDeadline = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getJobTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      INTERNSHIP: 'Thực tập',
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level: string = 'ok'): string => {
    const labels: Record<string, string> = {
      ENTRY: 'Entry Level',
      MID: 'Middle',
      SENIOR: 'Senior',
      LEAD: 'Lead',
      EXECUTIVE: 'Executive',
    };
    return labels[level] || level;
  };

  const handleRemove = () => {
    alert.confirm(
      'Xóa việc làm đã lưu',
      'Bạn có chắc chắn muốn xóa việc làm này khỏi danh sách đã lưu?',
      () => onRemove()
    );
  };

  const daysUntilDeadline = getDaysUntilDeadline(job.applicationDeadline);
  const isDeadlineNear = daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  const isExpired = daysUntilDeadline < 0;

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="p-4">
        {/* Header with Company Logo and Remove Button */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-start flex-1">
            {job.company.logoUrl ? (
              <Image 
                source={{ uri: job.company.logoUrl }} 
                className="w-12 h-12 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-lg bg-gray-200 mr-3 items-center justify-center">
                <Text className="text-gray-500 text-lg font-semibold">
                  {job.company.companyName.charAt(0)}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
                {job.title}
              </Text>
              <Text className="text-sm text-gray-600">{job.company.companyName}</Text>
            </View>
          </View>
          
          {/* Remove Button */}
          <TouchableOpacity 
            onPress={handleRemove}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BookmarkX size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Job Details */}
        <View className="space-y-2">
          {/* Location */}
          <View className="flex-row items-center">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1.5">
              {job.locationCity}, {job.locationProvince}
            </Text>
          </View>

          {/* Salary */}
          {job.salaryMin && job.salaryMax && (
            <View className="flex-row items-center">
              <DollarSign size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1.5">
                {job.salaryNegotiable 
                  ? 'Thương lượng' 
                  : formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </Text>
            </View>
          )}

          {/* Job Type and Experience */}
          <View className="flex-row items-center">
            <Briefcase size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1.5">
              {getJobTypeLabel(job.jobType)} • {getExperienceLevelLabel(job.experienceLevel)}
            </Text>
          </View>

          {/* Deadline */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={14} color={isExpired ? '#ef4444' : isDeadlineNear ? '#f59e0b' : '#6b7280'} />
              <Text 
                className={`text-sm ml-1.5 ${
                  isExpired 
                    ? 'text-red-500' 
                    : isDeadlineNear 
                    ? 'text-amber-500' 
                    : 'text-gray-600'
                }`}
              >
                {isExpired 
                  ? 'Đã hết hạn' 
                  : `Còn ${daysUntilDeadline} ngày để ứng tuyển`}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap mt-3 gap-2">
          {job.featured && (
            <View className="bg-purple-100 px-2 py-1 rounded">
              <Text className="text-xs text-purple-700">Nổi bật</Text>
            </View>
          )}
          {job.urgent && (
            <View className="bg-red-100 px-2 py-1 rounded">
              <Text className="text-xs text-red-700">Tuyển gấp</Text>
            </View>
          )}
          {job.workLocationType && (
            <View className="bg-blue-100 px-2 py-1 rounded">
              <Text className="text-xs text-blue-700">
                {job.workLocationType === 'REMOTE' ? 'Remote' : 
                 job.workLocationType === 'HYBRID' ? 'Hybrid' : 'Onsite'}
              </Text>
            </View>
          )}
        </View>

        {/* Saved Date */}
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <Clock size={12} color="#9ca3af" />
          <Text className="text-xs text-gray-400 ml-1">
            Đã lưu {formatDate(createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SavedJobCard;
