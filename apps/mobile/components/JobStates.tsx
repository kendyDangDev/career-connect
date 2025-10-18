import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react-native';

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const JobDetailLoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading job details...' 
}) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-8">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 text-lg mt-4 text-center">{message}</Text>
      </View>
    </SafeAreaView>
  );
};

export const JobDetailErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  onBack 
}) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Back Button */}
      {onBack && (
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity 
            onPress={onBack}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-1 justify-center items-center px-8">
        <AlertCircle size={64} color="#EF4444" />
        
        <Text className="text-gray-900 text-xl font-bold mt-6 mb-2 text-center">
          Oops! Something went wrong
        </Text>
        
        <Text className="text-gray-500 text-base mb-8 text-center leading-6">
          {error || 'We couldn\'t load the job details. Please try again.'}
        </Text>

        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center"
            activeOpacity={0.8}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text className="text-white font-medium ml-2">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
