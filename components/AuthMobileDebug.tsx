import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { authService } from '@/services/authService';
import { useSafeAuthContext } from '@/contexts/AuthContext';

interface DebugInfo {
  platform: string;
  apiUrl: string | undefined;
  apiUrlFromExtra: string | undefined;
  tokenPresent: boolean;
  tokenValue?: string;
  userPresent: boolean;
  userEmail?: string;
  authState: {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasError: boolean;
  };
  secureStoreTest?: string;
  lastError?: string;
}

export const AuthMobileDebug = () => {
  const auth = useSafeAuthContext();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDebugInfo = async () => {
    try {
      setIsLoading(true);
      
      // Get token from SecureStore
      let token: string | null = null;
      let tokenError: string | undefined;
      
      try {
        if (Platform.OS === 'web') {
          token = localStorage.getItem('authToken');
        } else {
          token = await SecureStore.getItemAsync('authToken');
        }
      } catch (error) {
        tokenError = `Error reading token: ${error}`;
        console.error('Error reading token:', error);
      }

      // Get user from storage
      let user: any = null;
      try {
        if (Platform.OS === 'web') {
          const userStr = localStorage.getItem('userData');
          if (userStr) user = JSON.parse(userStr);
        } else {
          const userStr = await SecureStore.getItemAsync('userData');
          if (userStr) user = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Error reading user:', error);
      }

      // Test SecureStore
      let secureStoreTestResult = 'Not tested';
      try {
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync('test_key', 'test_value');
          const testValue = await SecureStore.getItemAsync('test_key');
          await SecureStore.deleteItemAsync('test_key');
          secureStoreTestResult = testValue === 'test_value' ? 'Working' : 'Failed';
        } else {
          secureStoreTestResult = 'Using localStorage (web)';
        }
      } catch (error) {
        secureStoreTestResult = `Error: ${error}`;
      }

      const info: DebugInfo = {
        platform: Platform.OS,
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        apiUrlFromExtra: Constants.manifest?.extra?.apiUrl || Constants.expoConfig?.extra?.apiUrl,
        tokenPresent: !!token,
        tokenValue: token ? `${token.substring(0, 20)}...` : undefined,
        userPresent: !!user,
        userEmail: user?.email,
        authState: {
          isAuthenticated: auth?.isAuthenticated ?? false,
          isLoading: auth?.isLoading ?? false,
          hasError: !!auth?.error,
        },
        secureStoreTest: secureStoreTestResult,
        lastError: tokenError || auth?.error || undefined,
      };

      setDebugInfo(info);
    } catch (error) {
      console.error('Debug load error:', error);
      setDebugInfo({
        platform: Platform.OS,
        apiUrl: 'Error loading',
        apiUrlFromExtra: 'Error loading',
        tokenPresent: false,
        userPresent: false,
        authState: {
          isAuthenticated: false,
          isLoading: false,
          hasError: true,
        },
        lastError: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const testAPIConnection = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || authService.getBaseURL();
      Alert.alert('Testing', `Connecting to: ${apiUrl}`);
      
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const text = await response.text();
      Alert.alert(
        'API Connection Test',
        `Status: ${response.status}\nResponse: ${text.substring(0, 100)}`
      );
    } catch (error) {
      Alert.alert('API Connection Failed', String(error));
    }
  };

  const testAuthVerify = async () => {
    try {
      const token = await authService.getStoredToken();
      if (!token) {
        Alert.alert('No Token', 'No authentication token found');
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || authService.getBaseURL();
      const response = await fetch(`${apiUrl}/api/auth/mobile/verify`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      Alert.alert(
        'Auth Verify Test',
        `Status: ${response.status}\nSuccess: ${data.success}\nUser: ${JSON.stringify(data.data?.user?.email || 'No user')}`
      );
    } catch (error) {
      Alert.alert('Auth Verify Failed', String(error));
    }
  };

  const clearAllStorage = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
      } else {
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');
        await SecureStore.deleteItemAsync('refreshToken');
      }
      Alert.alert('Success', 'All auth data cleared');
      await loadDebugInfo();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  if (isLoading) {
    return (
      <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg m-4">
        <Text className="text-center">Loading debug info...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg m-4">
        <Text className="text-lg font-bold mb-4">🔍 Auth Debug Info (Mobile)</Text>
        
        {debugInfo && (
          <View className="space-y-2">
            <Text className="font-semibold">Platform: {debugInfo.platform}</Text>
            
            <View className="mt-2">
              <Text className="font-semibold">API Configuration:</Text>
              <Text className="text-sm">ENV URL: {debugInfo.apiUrl || 'Not set'}</Text>
              <Text className="text-sm">Extra URL: {debugInfo.apiUrlFromExtra || 'Not set'}</Text>
              <Text className="text-sm">Service URL: {authService.getBaseURL()}</Text>
            </View>

            <View className="mt-2">
              <Text className="font-semibold">Storage:</Text>
              <Text className="text-sm">Token: {debugInfo.tokenPresent ? '✅ Present' : '❌ Missing'}</Text>
              {debugInfo.tokenValue && (
                <Text className="text-xs text-gray-600">{debugInfo.tokenValue}</Text>
              )}
              <Text className="text-sm">User: {debugInfo.userPresent ? '✅ Present' : '❌ Missing'}</Text>
              {debugInfo.userEmail && (
                <Text className="text-xs text-gray-600">{debugInfo.userEmail}</Text>
              )}
            </View>

            <View className="mt-2">
              <Text className="font-semibold">Auth State:</Text>
              <Text className="text-sm">
                Authenticated: {debugInfo.authState.isAuthenticated ? '✅' : '❌'}
              </Text>
              <Text className="text-sm">
                Loading: {debugInfo.authState.isLoading ? '⏳' : '✅'}
              </Text>
              <Text className="text-sm">
                Error: {debugInfo.authState.hasError ? '❌' : '✅'}
              </Text>
            </View>

            <View className="mt-2">
              <Text className="font-semibold">SecureStore Test:</Text>
              <Text className="text-sm">{debugInfo.secureStoreTest}</Text>
            </View>

            {debugInfo.lastError && (
              <View className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                <Text className="font-semibold text-red-800 dark:text-red-200">Error:</Text>
                <Text className="text-sm text-red-600 dark:text-red-300">
                  {debugInfo.lastError}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="mt-4 space-y-2">
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded"
            onPress={loadDebugInfo}
          >
            <Text className="text-white text-center">🔄 Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 p-2 rounded"
            onPress={testAPIConnection}
          >
            <Text className="text-white text-center">🌐 Test API Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-purple-500 p-2 rounded"
            onPress={testAuthVerify}
          >
            <Text className="text-white text-center">🔐 Test Auth Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 p-2 rounded"
            onPress={clearAllStorage}
          >
            <Text className="text-white text-center">🗑️ Clear All Storage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};