import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { authService } from '@/services/authService';

export const DebugInfo: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(authService.getBaseURL());
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        Alert.alert('Kết nối thành công', `API server đang hoạt động tại ${apiUrl}`);
      } else {
        Alert.alert('Lỗi kết nối', `Server trả về status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối', `Không thể kết nối đến server tại ${apiUrl}. Đảm bảo server đang chạy.`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 10 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Debug Info:</Text>
      <Text style={{ fontSize: 12 }}>API URL: {apiUrl}</Text>
      <TouchableOpacity 
        onPress={testConnection}
        disabled={testing}
        style={{ 
          marginTop: 5, 
          padding: 8, 
          backgroundColor: testing ? '#ccc' : '#007AFF', 
          borderRadius: 5,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>
          {testing ? 'Đang kiểm tra...' : 'Test kết nối API'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
