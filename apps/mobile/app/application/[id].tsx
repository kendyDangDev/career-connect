import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  CalendarCheck,
  User,
  Mail,
  Phone,
  Download,
  ExternalLink,
} from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import {
  Application,
  ApplicationStatus,
  TimelineEntry,
} from '@/types/application.types';

const ApplicationDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alert = useAlert();

  // Safely access auth context
  let user = null;
  let isAuthenticated = false;
  let logout = null;

  try {
    const authContext = useAuthContext();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
    logout = authContext.logout;
  } catch (error) {
    console.log(
      '[ApplicationDetailScreen] AuthContext not available, using defaults'
    );
  }

  // State management
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data function
  const getMockApplication = (applicationId: string) => {
    return {
      id: applicationId,
      jobId: 'job-mock-1',
      candidateId: 'candidate-mock-1',
      userId: 'user-mock-1',
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      statusUpdatedAt: new Date(Date.now() - 1 * 24 * 60 * 1000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      cvFileUrl: 'https://example.com/mock-cv.pdf',
      coverLetter:
        'Đây là thư xin việc mẫu cho ứng viên. Tôi rất mong muốn được làm việc tại công ty của bạn vì tôi tin rằng môi trường làm việc chuyên nghiệp và cơ hội phát triển sẽ giúp tôi hoàn thiện kỹ năng và đóng góp tích cực cho sự phát triển của công ty.',
      rating: 4,
      recruiterNotes: 'Ứng viên có kinh nghiệm phù hợp, cần phỏng vấn thêm',
      interviewScheduledAt: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 days from now
      job: {
        id: 'job-mock-1',
        title: 'Nhân viên lập trình React Native',
        company: {
          id: 'company-mock-1',
          companyName: 'Công ty Công nghệ ABC',
          logoUrl: 'https://example.com/logo.png',
        },
        salary: {
          min: 1500000,
          max: 2500000,
          currency: 'VND',
        },
        location: 'Hồ Chí Minh',
        workLocationType: 'ONSITE',
        jobType: 'FULL_TIME',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 1000).toISOString(),
      },
      candidate: {
        id: 'candidate-mock-1',
        currentPosition: 'Lập trình viên React Native',
        experienceYears: 3,
        expectedSalaryMin: 15000000,
        expectedSalaryMax: 25000000,
        availabilityStatus: 'AVAILABLE',
        preferredWorkType: 'FULL_TIME',
        preferredLocationType: 'ONSITE_REMOTE',
        cvFileUrl: 'https://example.com/mock-cv.pdf',
        user: {
          id: 'user-mock-1',
          firstName: 'Nguyễn Văn',
          lastName: 'A',
          email: 'nguyenvana@example.com',
          phone: '+84123456789',
          avatarUrl: 'https://example.com/avatar.jpg',
          userType: 'CANDIDATE',
          profile: {
            dateOfBirth: '1995-05-15',
            gender: 'MALE',
            address: '123 Đường ABC, Quận 1',
            city: 'Hồ Chí Minh',
            bio: 'Tôi là một lập trình viên React Native với 3 năm kinh nghiệm, có kinh nghiệm làm việc với các dự án di động lớn.',
            linkedinUrl: 'https://linkedin.com/in/nguyenvana',
            githubUrl: 'https://github.com/nguyenvana',
          },
        },
        skills: [
          {
            skill: {
              id: 'skill-mock-1',
              name: 'React Native',
              category: 'TECHNICAL',
            },
            proficiencyLevel: 'ADVANCED',
            yearsExperience: 3,
          },
          {
            skill: {
              id: 'skill-mock-2',
              name: 'TypeScript',
              category: 'TECHNICAL',
            },
            proficiencyLevel: 'ADVANCED',
            yearsExperience: 2,
          },
        ],
        education: [
          {
            id: 'edu-mock-1',
            institutionName: 'Đại học Công nghệ Thông tin',
            degreeType: 'BACHELOR',
            fieldOfStudy: 'Công nghệ Thông tin',
            startDate: '2014-09-01',
            endDate: '2018-06-01',
            isCurrentlyStudying: false,
            gpa: 3.5,
          },
        ],
        experiences: [
          {
            id: 'exp-mock-1',
            companyName: 'Công ty XYZ',
            position: 'Lập trình viên React Native',
            startDate: '2021-01-01',
            endDate: '2023-12-31',
            isCurrentPosition: false,
            description:
              'Phát triển ứng dụng di động React Native cho khách hàng doanh nghiệp',
          },
        ],
      },
      timeline: [
        {
          id: 'timeline-mock-1',
          status: ApplicationStatus.APPLIED,
          note: 'Ứng viên đã nộp hồ sơ',
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          changedBy: 'user-mock-1',
          user: {
            firstName: 'Nguyễn Văn',
            lastName: 'A',
            userType: 'CANDIDATE',
          },
        },
        {
          id: 'timeline-mock-2',
          status: ApplicationStatus.SCREENING,
          note: 'Hồ sơ đang được xét duyệt',
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          changedBy: 'user-mock-2',
          user: {
            firstName: 'Trần Thị',
            lastName: 'B',
            userType: 'EMPLOYER',
          },
        },
      ],
    };
  };

  // Load application details
  const loadApplication = async () => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để xem chi tiết đơn ứng tuyển');
      setLoading(false);
      return;
    }

    try {
      // Use mock data instead of API call
      const mockApplication = getMockApplication(id);
      setApplication(mockApplication);
      setError(null);
    } catch (err: any) {
      console.error('Error loading application:', err);

      // Check if token expired
      if (err.message && err.message.includes('Phiên đăng nhập đã hết hạn')) {
        setError(err.message);
        // Auto logout after 2 seconds
        setTimeout(() => {
          if (logout) logout();
          router.replace('/(auth)/login');
        }, 2000);
      } else {
        setError(err.message || 'Không thể tải chi tiết đơn ứng tuyển');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadApplication();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadApplication();
  };

  // Handle withdraw application
  const handleWithdraw = async () => {
    Alert.alert(
      'Xác nhận rút hồ sơ',
      'Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rút hồ sơ',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock withdraw functionality
              if (application) {
                // Update the application status to WITHDRAWN
                setApplication({
                  ...application,
                  status: ApplicationStatus.WITHDRAWN,
                  statusUpdatedAt: new Date().toISOString(),
                });
                alert.success('Thành công', 'Đã rút hồ sơ ứng tuyển');
              }
            } catch (err) {
              console.error('Error withdrawing application:', err);
              alert.error('Lỗi', 'Không thể rút hồ sơ. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  // Handle view job
  const handleViewJob = () => {
    if (application?.job.id) {
      router.push(`/job/${application.job.id}`);
    }
  };

  // Handle download CV
  const handleDownloadCV = () => {
    if (application?.cvFileUrl) {
      Linking.openURL(application.cvFileUrl);
    }
  };

  // Status configuration
  const getStatusConfig = (status: ApplicationStatus) => {
    const configs = {
      [ApplicationStatus.APPLIED]: {
        label: 'Đã nộp',
        icon: FileText,
        color: '#2563eb',
        bgColor: '#dbeafe',
      },
      [ApplicationStatus.SCREENING]: {
        label: 'Đang xét duyệt',
        icon: Eye,
        color: '#ca8a04',
        bgColor: '#fef9c3',
      },
      [ApplicationStatus.INTERVIEWING]: {
        label: 'Phỏng vấn',
        icon: Calendar,
        color: '#7c3aed',
        bgColor: '#e9d5ff',
      },
      [ApplicationStatus.OFFERED]: {
        label: 'Đã nhận offer',
        icon: CheckCircle,
        color: '#16a34a',
        bgColor: '#dcfce7',
      },
      [ApplicationStatus.HIRED]: {
        label: 'Đã tuyển',
        icon: Star,
        color: '#10b981',
        bgColor: '#d1fae5',
      },
      [ApplicationStatus.REJECTED]: {
        label: 'Từ chối',
        icon: XCircle,
        color: '#dc2626',
        bgColor: '#fee2e2',
      },
      [ApplicationStatus.WITHDRAWN]: {
        label: 'Đã rút',
        icon: XCircle,
        color: '#6b7280',
        bgColor: '#e5e7eb',
      },
    };
    return configs[status];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-600 mt-2">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6 py-12">
          <XCircle size={64} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">
            Đã xảy ra lỗi
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            {error}
          </Text>
          {!isAuthenticated ? (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="mt-6 bg-purple-60 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Đăng nhập</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={loadApplication}
              className="mt-6 bg-purple-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Thử lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6 py-12">
          <Briefcase size={64} color="#d1d5db" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">
            Không tìm thấy đơn ứng tuyển
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Đơn ứng tuyển này có thể đã bị xóa hoặc không tồn tại
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(application.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 py-3">
            <TouchableOpacity onPress={() => router.back()} className="">
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Chi tiết ứng tuyển
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Job Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {application.job.title}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {application.job.company.companyName}
              </Text>
            </View>
            <View className="ml-4">
              <View
                className={`px-3 py-1 rounded-full ${statusConfig.bgColor}`}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-3">
            {application.job.salary && (
              <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                <DollarSign size={12} color="#6b7280" />
                <Text className="text-xs text-gray-700 ml-1">
                  {application.job.salary.min} - {application.job.salary.max}{' '}
                  {application.job.salary.currency}
                </Text>
              </View>
            )}
            {application.job.location && (
              <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                <MapPin size={12} color="#6b7280" />
                <Text className="text-xs text-gray-700 ml-1">
                  {application.job.location}
                </Text>
              </View>
            )}
            {application.job.workLocationType && (
              <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                <Briefcase size={12} color="#6b7280" />
                <Text className="text-xs text-gray-700 ml-1">
                  {application.job.workLocationType === 'ONSITE'
                    ? 'Tại văn phòng'
                    : application.job.workLocationType === 'REMOTE'
                      ? 'Làm từ xa'
                      : 'Linh hoạt'}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mt-3">
            <Clock size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              Ứng tuyển: {formatDate(application.appliedAt)}
            </Text>
          </View>
        </View>

        {/* Application Details */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Thông tin ứng tuyển
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-purple-600 mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-sm text-gray-600">
                  Trạng thái hiện tại
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-purple-600 mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-sm text-gray-600">Ngày cập nhật</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatDate(application.statusUpdatedAt)}
                </Text>
              </View>
            </View>

            {application.interviewScheduledAt && (
              <View className="flex-row items-start">
                <CalendarCheck size={16} color="#6b7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-gray-600">Lịch phỏng vấn</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatDate(application.interviewScheduledAt)}
                  </Text>
                </View>
              </View>
            )}

            {application.rating && (
              <View className="flex-row items-start">
                <Star size={16} color="#6b7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-gray-600">Đánh giá</Text>
                  <View className="flex-row items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={
                          application.rating &&
                          i < Math.floor(application.rating)
                            ? '#fbbf24'
                            : '#d1d5db'
                        }
                        fill={
                          application.rating &&
                          i < Math.floor(application.rating)
                            ? '#fbbf24'
                            : '#d1d5db'
                        }
                      />
                    ))}
                    <Text className="text-sm font-medium text-gray-900 ml-2">
                      {application.rating}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Candidate Information */}
        {application.candidate && (
          <View className="bg-white px-4 py-4 border-b border-gray-200">
            <Text className="text-base font-semibold text-gray-90 mb-3">
              Thông tin ứng viên
            </Text>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <User size={16} color="#6b7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-gray-600">Họ tên</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {application.candidate.user.firstName}{' '}
                    {application.candidate.user.lastName}
                  </Text>
                </View>
              </View>

              {application.candidate.user.email && (
                <View className="flex-row items-center">
                  <Mail size={16} color="#6b7280" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm text-gray-600">Email</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {application.candidate.user.email}
                    </Text>
                  </View>
                </View>
              )}

              {application.candidate.user.phone && (
                <View className="flex-row items-center">
                  <Phone size={16} color="#6b7280" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm text-gray-600">Điện thoại</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {application.candidate.user.phone}
                    </Text>
                  </View>
                </View>
              )}

              {application.candidate.currentPosition && (
                <View className="flex-row items-center">
                  <Briefcase size={16} color="#6b7280" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm text-gray-600">
                      Chức danh hiện tại
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {application.candidate.currentPosition}
                    </Text>
                  </View>
                </View>
              )}

              {application.candidate.experienceYears !== undefined && (
                <View className="flex-row items-center">
                  <Clock size={16} color="#6b7280" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm text-gray-600">Kinh nghiệm</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {application.candidate.experienceYears} năm
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Application Documents */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Hồ sơ ứng tuyển
          </Text>

          <View className="space-y-3">
            {application.cvFileUrl && (
              <TouchableOpacity
                onPress={handleDownloadCV}
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
              >
                <Download size={20} color="#2563eb" />
                <Text className="text-sm font-medium text-blue-600 ml-3">
                  Tải CV
                </Text>
                <ExternalLink size={16} color="#6b7280" className="ml-auto" />
              </TouchableOpacity>
            )}

            {application.coverLetter && (
              <View className="p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm text-gray-600 mb-2">Thư xin việc</Text>
                <Text className="text-sm text-gray-800">
                  {application.coverLetter}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        {application.timeline && application.timeline.length > 0 && (
          <View className="bg-white px-4 py-4 border-b border-gray-20">
            <Text className="text-base font-semibold text-gray-90 mb-3">
              Lịch sử cập nhật
            </Text>

            <View className="space-y-4">
              {application.timeline
                .sort(
                  (a: TimelineEntry, b: TimelineEntry) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((entry: TimelineEntry) => {
                  const entryStatusConfig = getStatusConfig(entry.status);
                  return (
                    <View key={entry.id} className="flex-row">
                      <View className="items-center mr-3">
                        <View
                          className={`w-3 h-3 rounded-full ${entryStatusConfig.bgColor}`}
                          style={{ backgroundColor: entryStatusConfig.color }}
                        />
                        <View className="w-0.5 h-8 bg-gray-200 ml-1.5 mt-1" />
                      </View>
                      <View className="flex-1 pb-4">
                        <Text className="text-sm font-medium text-gray-900">
                          {entryStatusConfig.label}
                        </Text>
                        <Text className="text-xs text-gray-600 mt-1">
                          {formatDate(entry.createdAt)}
                        </Text>
                        {entry.note && (
                          <Text className="text-xs text-gray-700 mt-1">
                            {entry.note}
                          </Text>
                        )}
                        <Text className="text-xs text-gray-500 mt-1">
                          Cập nhật bởi {entry.user.firstName}{' '}
                          {entry.user.lastName}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="p-4 space-y-3">
          <TouchableOpacity
            onPress={handleViewJob}
            className="bg-purple-600 py-4 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Xem công việc</Text>
          </TouchableOpacity>

          {application.status !== ApplicationStatus.WITHDRAWN && (
            <TouchableOpacity
              onPress={handleWithdraw}
              className="bg-red-500 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-medium">Rút hồ sơ</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicationDetailScreen;
