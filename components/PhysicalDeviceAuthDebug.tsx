import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { AuthStorageDebug } from '@/utils/authStorageDebug';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  details?: any;
}

export const PhysicalDeviceAuthDebug = () => {
  const auth = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [persistenceInfo, setPersistenceInfo] = useState<any>(null);

  useEffect(() => {
    checkPersistence();
  }, []);

  const checkPersistence = async () => {
    const info = await AuthStorageDebug.checkAuthPersistence();
    setPersistenceInfo(info);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'SecureStore Test',
        run: () => AuthStorageDebug.testSecureStore()
      },
      {
        name: 'AsyncStorage Test',
        run: () => AuthStorageDebug.testAsyncStorage()
      },
      {
        name: 'Auth Persistence Check',
        run: () => AuthStorageDebug.checkAuthPersistence()
      },
      {
        name: 'API Connection Test',
        run: async () => {
          try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/health`);
            return {
              success: response.ok,
              message: `Status: ${response.status}`
            };
          } catch (error) {
            return {
              success: false,
              message: String(error)
            };
          }
        }
      },
      {
        name: 'Token Verification',
        run: async () => {
          try {
            const token = await authService.getStoredToken();
            if (!token) {
              return {
                success: false,
                message: 'No token found'
              };
            }
            
            const isValid = await authService.checkAuthStatus();
            return {
              success: isValid,
              message: isValid ? 'Token valid' : 'Token invalid'
            };
          } catch (error) {
            return {
              success: false,
              message: String(error)
            };
          }
        }
      }
    ];
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test.run();
        results.push({
          name: test.name,
          status: result.success ? 'success' : 'failed',
          message: result.message || (result.success ? 'Passed' : 'Failed'),
          details: result.details
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: 'failed',
          message: String(error)
        });
      }
      
      setTestResults([...results]);
    }
    
    setIsRunning(false);
    await checkPersistence();
  };

  const testLogin = async () => {
    try {
      Alert.prompt(
        'Test Login',
        'Enter email:',
        async (email) => {
          Alert.prompt(
            'Test Login',
            'Enter password:',
            async (password) => {
              if (email && password) {
                const result = await auth.login({ email, password });
                Alert.alert(
                  'Login Result',
                  auth.isAuthenticated ? 'Success! Check persistence now.' : `Failed: ${auth.error || 'Unknown error'}`
                );
                await checkPersistence();
              }
            },
            'secure-text'
          );
        }
      );
    } catch (error) {
      Alert.alert('Login Error', String(error));
    }
  };

  const migrateStorage = async () => {
    const result = await AuthStorageDebug.migrateToAsyncStorage();
    Alert.alert(
      'Migration Result',
      result.message
    );
    await checkPersistence();
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all authentication data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AuthStorageDebug.clearAllStorage();
            await auth.checkAuthStatus();
            await checkPersistence();
            Alert.alert('Success', 'All data cleared');
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1">
      <View className="p-4 bg-white dark:bg-gray-900">
        <Text className="text-xl font-bold mb-4">
          📱 Physical Device Auth Debug
        </Text>

        {/* Current Status */}
        <View className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <Text className="font-semibold mb-2">Current Status:</Text>
          <Text className="text-sm">Platform: {Platform.OS}</Text>
          <Text className="text-sm">
            Authenticated: {auth.isAuthenticated ? '✅' : '❌'}
          </Text>
          <Text className="text-sm">
            User: {auth.user?.email || 'None'}
          </Text>
        </View>

        {/* Persistence Info */}
        {persistenceInfo && (
          <View className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mb-4">
            <Text className="font-semibold mb-2">Storage Status:</Text>
            <Text className="text-sm">
              Method: {persistenceInfo.storageMethod}
            </Text>
            <Text className="text-sm">
              Token: {persistenceInfo.tokenExists ? '✅ Exists' : '❌ Missing'}
            </Text>
            <Text className="text-sm">
              User Data: {persistenceInfo.userExists ? '✅ Exists' : '❌ Missing'}
            </Text>
            {persistenceInfo.details && (
              <Text className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                {JSON.stringify(persistenceInfo.details, null, 2)}
              </Text>
            )}
          </View>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <View className="mb-4">
            <Text className="font-semibold mb-2">Test Results:</Text>
            {testResults.map((result, index) => (
              <View
                key={index}
                className={`p-2 mb-1 rounded ${
                  result.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900'
                    : result.status === 'failed'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Text className="font-medium text-sm">
                  {result.status === 'success' ? '✅' : 
                   result.status === 'failed' ? '❌' : '⏳'} {result.name}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {result.message}
                </Text>
                {result.details && (
                  <Text className="text-xs mt-1 text-gray-500">
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-2">
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg"
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text className="text-white text-center font-medium">
              {isRunning ? '⏳ Running Tests...' : '🧪 Run All Tests'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 p-3 rounded-lg"
            onPress={testLogin}
          >
            <Text className="text-white text-center font-medium">
              🔐 Test Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-purple-500 p-3 rounded-lg"
            onPress={checkPersistence}
          >
            <Text className="text-white text-center font-medium">
              🔍 Check Persistence
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-yellow-500 p-3 rounded-lg"
            onPress={migrateStorage}
          >
            <Text className="text-white text-center font-medium">
              📦 Migrate to AsyncStorage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 p-3 rounded-lg"
            onPress={clearAllData}
          >
            <Text className="text-white text-center font-medium">
              🗑️ Clear All Data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};