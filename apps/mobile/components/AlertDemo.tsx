import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import CustomAlert, { AlertConfig } from './CustomAlert';

interface AlertDemoProps {
  title?: string;
  compact?: boolean;
}

const AlertDemo: React.FC<AlertDemoProps> = ({ 
  title = "Alert Demo", 
  compact = false 
}) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertConfig>({
    title: 'Test Alert',
    message: 'This is a test message',
    type: 'info'
  });

  const showAlert = (config: AlertConfig) => {
    setCurrentAlert(config);
    setAlertVisible(true);
  };

  const quickTests = [
    {
      title: 'Success',
      color: 'bg-green-500',
      onPress: () => showAlert({
        title: 'Thành công!',
        message: 'Hành động đã được thực hiện thành công.',
        type: 'success'
      })
    },
    {
      title: 'Job Apply',
      color: 'bg-blue-500',
      onPress: () => showAlert({
        title: 'Ứng tuyển việc làm',
        message: 'Bạn có chắc chắn muốn ứng tuyển vị trí "Senior React Native Developer"?',
        type: 'info',
        buttons: [
          { text: 'Ứng tuyển', style: 'primary' },
          { text: 'Hủy', style: 'cancel' }
        ]
      })
    },
    {
      title: 'Save Job',
      color: 'bg-red-500',
      onPress: () => showAlert({
        title: 'Đã lưu việc làm!',
        message: 'Việc làm đã được thêm vào danh sách yêu thích của bạn.',
        type: 'save-success'
      })
    },
    {
      title: 'Loading',
      color: 'bg-purple-500',
      onPress: () => showAlert({
        title: 'Đang xử lý',
        message: 'Vui lòng chờ trong khi chúng tôi xử lý yêu cầu của bạn.',
        type: 'info',
        showLoading: true,
        buttons: [
          { text: 'Hủy', style: 'cancel' }
        ]
      })
    }
  ];

  if (compact) {
    return (
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-base font-semibold text-gray-900 mb-3">
          {title}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {quickTests.map((test, index) => (
            <TouchableOpacity
              key={index}
              onPress={test.onPress}
              className={`${test.color} px-3 py-2 rounded-lg`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-medium">
                {test.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomAlert
          visible={alertVisible}
          config={currentAlert}
          onDismiss={() => setAlertVisible(false)}
        />
      </View>
    );
  }

  return (
    <View className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {title}
      </Text>
      
      <View className="space-y-3">
        {quickTests.map((test, index) => (
          <TouchableOpacity
            key={index}
            onPress={test.onPress}
            className={`${test.color} p-4 rounded-xl`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-base">
              Test {test.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomAlert
        visible={alertVisible}
        config={currentAlert}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default AlertDemo;
