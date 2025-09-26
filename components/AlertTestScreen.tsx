import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import CustomAlert, { AlertConfig, AlertType } from './CustomAlert';
import { 
  TestTube, 
  Briefcase, 
  UserCheck, 
  Heart, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader
} from 'lucide-react-native';

const AlertTestScreen: React.FC = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertConfig>({
    title: 'Test Alert',
    message: 'This is a test message',
    type: 'info'
  });
  const [loadingButtons, setLoadingButtons] = useState<{[key: string]: boolean}>({});

  const showAlert = (config: AlertConfig) => {
    setCurrentAlert(config);
    setAlertVisible(true);
  };

  const handleLoadingTest = (alertType: string) => {
    setLoadingButtons({...loadingButtons, [alertType]: true});
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoadingButtons({...loadingButtons, [alertType]: false});
      showAlert({
        title: 'Thành công!',
        message: 'Hành động đã được thực hiện thành công.',
        type: 'success'
      });
    }, 2000);
  };

  const testCases = [
    // Basic Alert Types
    {
      category: 'Basic Alert Types',
      tests: [
        {
          title: 'Success Alert',
          icon: <CheckCircle size={20} color="#10B981" />,
          onPress: () => showAlert({
            title: 'Thành công!',
            message: 'Hành động đã được thực hiện thành công.',
            type: 'success'
          })
        },
        {
          title: 'Error Alert',
          icon: <XCircle size={20} color="#EF4444" />,
          onPress: () => showAlert({
            title: 'Lỗi xảy ra!',
            message: 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.',
            type: 'error'
          })
        },
        {
          title: 'Warning Alert',
          icon: <AlertTriangle size={20} color="#F59E0B" />,
          onPress: () => showAlert({
            title: 'Cảnh báo!',
            message: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
            type: 'warning',
            buttons: [
              { text: 'Tiếp tục', style: 'destructive' },
              { text: 'Hủy', style: 'cancel' }
            ]
          })
        },
        {
          title: 'Info Alert',
          icon: <Info size={20} color="#3B82F6" />,
          onPress: () => showAlert({
            title: 'Thông tin',
            message: 'Đây là thông tin quan trọng cần bạn biết.',
            type: 'info'
          })
        }
      ]
    },
    
    // Job Portal Specific Alerts
    {
      category: 'Job Portal Alerts',
      tests: [
        {
          title: 'Job Success',
          icon: <Briefcase size={20} color="#059669" />,
          onPress: () => showAlert({
            title: 'Đăng tin thành công!',
            message: 'Tin tuyển dụng của bạn đã được đăng và đang chờ duyệt.',
            type: 'job-success',
            buttons: [
              { text: 'Xem tin', style: 'primary' },
              { text: 'Đóng', style: 'secondary' }
            ]
          })
        },
        {
          title: 'Application Success',
          icon: <UserCheck size={20} color="#059669" />,
          onPress: () => showAlert({
            title: 'Ứng tuyển thành công!',
            message: 'Hồ sơ của bạn đã được gửi tới nhà tuyển dụng. Chúc bạn may mắn!',
            type: 'application-success'
          })
        },
        {
          title: 'Save Job Success',
          icon: <Heart size={20} color="#DC2626" fill="#DC2626" />,
          onPress: () => showAlert({
            title: 'Đã lưu việc làm!',
            message: 'Việc làm đã được thêm vào danh sách yêu thích của bạn.',
            type: 'save-success'
          })
        }
      ]
    },

    // Button Styles
    {
      category: 'Button Styles',
      tests: [
        {
          title: 'Multiple Buttons',
          icon: <TestTube size={20} color="#8B5CF6" />,
          onPress: () => showAlert({
            title: 'Xác nhận hành động',
            message: 'Bạn có muốn thực hiện hành động này không?',
            type: 'info',
            buttons: [
              { text: 'Primary', style: 'primary' },
              { text: 'Secondary', style: 'secondary' },
              { text: 'Cancel', style: 'cancel' }
            ]
          })
        },
        {
          title: 'Destructive Action',
          icon: <XCircle size={20} color="#EF4444" />,
          onPress: () => showAlert({
            title: 'Xóa việc làm',
            message: 'Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.',
            type: 'warning',
            buttons: [
              { text: 'Xóa', style: 'destructive' },
              { text: 'Hủy', style: 'cancel' }
            ]
          })
        }
      ]
    },

    // Loading States
    {
      category: 'Loading States',
      tests: [
        {
          title: 'Global Loading',
          icon: <Loader size={20} color="#3B82F6" />,
          onPress: () => showAlert({
            title: 'Đang xử lý',
            message: 'Vui lòng chờ trong khi chúng tôi xử lý yêu cầu của bạn.',
            type: 'info',
            showLoading: true,
            buttons: [
              { text: 'Hủy', style: 'cancel' }
            ]
          })
        },
        {
          title: 'Button Loading',
          icon: <Loader size={20} color="#059669" />,
          onPress: () => showAlert({
            title: 'Ứng tuyển việc làm',
            message: 'Bạn có chắc chắn muốn ứng tuyển vị trí "Senior React Native Developer"?',
            type: 'info',
            buttons: [
              { 
                text: 'Ứng tuyển', 
                style: 'primary',
                loading: loadingButtons['apply'],
                onPress: () => handleLoadingTest('apply')
              },
              { text: 'Hủy', style: 'cancel' }
            ]
          })
        }
      ]
    },

    // Advanced Features
    {
      category: 'Advanced Features',
      tests: [
        {
          title: 'Cancelable Alert',
          icon: <XCircle size={20} color="#6B7280" />,
          onPress: () => showAlert({
            title: 'Thông báo có thể đóng',
            message: 'Bạn có thể đóng alert này bằng cách nhấn bên ngoài hoặc nút X.',
            type: 'info',
            cancelable: true
          })
        },
        {
          title: 'No Buttons',
          icon: <Info size={20} color="#3B82F6" />,
          onPress: () => showAlert({
            title: 'Thông báo tự động đóng',
            message: 'Alert này sẽ tự động đóng sau 3 giây.',
            type: 'info',
            cancelable: true,
            buttons: []
          })
        }
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          CustomAlert UI Test
        </Text>
        <Text className="text-gray-600">
          Test các loại alert và tính năng
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {testCases.map((category, categoryIndex) => (
            <View key={categoryIndex} className="mb-8">
              {/* Category Header */}
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                {category.category}
              </Text>

              {/* Test Buttons */}
              <View className="space-y-3">
                {category.tests.map((test, testIndex) => (
                  <TouchableOpacity
                    key={testIndex}
                    onPress={test.onPress}
                    className="bg-white p-4 rounded-xl border border-gray-200 flex-row items-center shadow-sm"
                    activeOpacity={0.7}
                  >
                    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                      {test.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">
                        {test.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Info Footer */}
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-4">
            <Text className="text-sm text-blue-800 font-medium mb-2">
              💡 Hướng dẫn sử dụng
            </Text>
            <Text className="text-sm text-blue-700 leading-5">
              Nhấn vào các button trên để test các loại alert khác nhau. 
              Mỗi alert sẽ demo các tính năng như loading states, button styles, 
              và các loại thông báo phù hợp với website tuyển dụng.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        config={currentAlert}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AlertTestScreen;
