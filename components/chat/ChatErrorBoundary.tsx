import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChatErrorBoundary] Uncaught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <View className="flex-1 items-center justify-center px-6 py-20 bg-white">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          
          <Text className="text-xl font-semibold text-red-600 mt-4 mb-2 text-center">
            Có lỗi xảy ra trong chat
          </Text>
          
          <Text className="text-base text-gray-600 text-center mb-6">
            {this.state.error?.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'}
          </Text>
          
          <TouchableOpacity
            onPress={this.handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.error && (
            <View className="mt-6 p-4 bg-gray-100 rounded-lg w-full">
              <Text className="text-sm text-gray-800 font-mono">
                {this.state.error.stack}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;