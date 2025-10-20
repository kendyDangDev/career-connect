import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { JobFilters as JobFiltersType } from '../types/job';

interface JobFiltersProps {
  filters: JobFiltersType;
  onApply: (filters: Partial<JobFiltersType>) => void;
  onClose: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onApply,
  onClose,
}) => {
  const [tempFilters, setTempFilters] =
    useState<Partial<JobFiltersType>>(filters);

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
  ];

  const experienceLevels = [
    { value: 'ENTRY', label: 'Entry Level' },
    { value: 'MID', label: 'Mid Level' },
    { value: 'SENIOR', label: 'Senior Level' },
    { value: 'LEAD', label: 'Lead' },
    { value: 'EXECUTIVE', label: 'Executive' },
  ];

  const locations = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Biên Hòa',
    'Nha Trang',
    'Huế',
    'Buôn Ma Thuột',
    'Vũng Tàu',
  ];

  const sortOptions = [
    { value: 'publishedAt', label: 'Mới nhất' },
    { value: 'viewCount', label: 'Xem nhiều nhất' },
    { value: 'applicationCount', label: 'Ứng tuyển nhiều nhất' },
    { value: 'createdAt', label: 'Ngày tạo' },
  ];

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleReset = () => {
    setTempFilters({
      page: 1,
      limit: 10,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Bộ lọc</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text className="text-blue-600 font-medium">Đặt lại</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {/* Job Type */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold mb-3">
                Loại công việc
              </Text>
              <View className="flex-row flex-wrap">
                {jobTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() =>
                      setTempFilters(prev => ({
                        ...prev,
                        jobType:
                          prev.jobType === type.value
                            ? undefined
                            : (type.value as any),
                      }))
                    }
                    className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                      tempFilters.jobType === type.value
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={
                        tempFilters.jobType === type.value
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Level */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold mb-3">
                Cấp độ kinh nghiệm
              </Text>
              <View className="flex-row flex-wrap">
                {experienceLevels.map(level => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() =>
                      setTempFilters(prev => ({
                        ...prev,
                        experienceLevel:
                          prev.experienceLevel === level.value
                            ? undefined
                            : (level.value as any),
                      }))
                    }
                    className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                      tempFilters.experienceLevel === level.value
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={
                        tempFilters.experienceLevel === level.value
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold mb-3">Địa điểm</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {locations.map(location => (
                  <TouchableOpacity
                    key={location}
                    onPress={() =>
                      setTempFilters(prev => ({
                        ...prev,
                        locationCity:
                          prev.locationCity === location ? undefined : location,
                      }))
                    }
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      tempFilters.locationCity === location
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={
                        tempFilters.locationCity === location
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Salary Range */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold mb-3">
                Khoảng lương
              </Text>
              <View className="flex-row items-center">
                <View className="flex-1 mr-2">
                  <Text className="text-sm text-gray-600 mb-1">
                    Lương tối thiểu
                  </Text>
                  <View className="border rounded-lg px-3 py-2">
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Ví dụ: 15000000"
                      value={tempFilters.salaryMin?.toString() ?? ''}
                      onChangeText={text =>
                        setTempFilters(prev => ({
                          ...prev,
                          salaryMin:
                            text === ''
                              ? undefined
                              : Number(text.replace(/[^0-9]/g, '')),
                        }))
                      }
                      className="text-gray-800"
                    />
                  </View>
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-sm text-gray-600 mb-1">
                    Lương tối đa
                  </Text>
                  <View className="border rounded-lg px-3 py-2">
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Ví dụ: 30000000"
                      value={tempFilters.salaryMax?.toString() ?? ''}
                      onChangeText={text =>
                        setTempFilters(prev => ({
                          ...prev,
                          salaryMax:
                            text === ''
                              ? undefined
                              : Number(text.replace(/[^0-9]/g, '')),
                        }))
                      }
                      className="text-gray-800"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Sort By */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold mb-3">
                Sắp xếp theo
              </Text>
              <View className="flex-row flex-wrap">
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setTempFilters(prev => ({
                        ...prev,
                        sortBy: option.value as any,
                        sortOrder: 'desc',
                      }))
                    }
                    className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                      tempFilters.sortBy === option.value
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={
                        tempFilters.sortBy === option.value
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleApply}
              className="bg-blue-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Áp dụng bộ lọc
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default JobFilters;
