import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info, 
  X, 
  Briefcase, 
  UserCheck,
  Heart
} from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'job-success' | 'application-success' | 'save-success';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary' | 'secondary';
  loading?: boolean;
}
export interface AlertConfig {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  cancelable?: boolean;
  showLoading?: boolean;
  customIcon?: React.ReactNode;
}

interface CustomAlertProps {
  visible: boolean;
  config: AlertConfig;
  onDismiss: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, config, onDismiss }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    const iconSize = 48;
    
    if (config.customIcon) {
      return config.customIcon;
    }
    
    switch (config.type) {
      case 'success':
        return <CheckCircle size={iconSize} color="#FFFFFF" fill="#16A34A" />;
      case 'job-success':
        return <Briefcase size={iconSize} color="#FFFFFF" fill="#0EA5E9" />;
      case 'application-success':
        return <UserCheck size={iconSize} color="#FFFFFF" fill="#8B5CF6" />;
      case 'save-success':
        return <Heart size={iconSize} color="#FFFFFF" fill="#EF4444" />;
      case 'error':
        return <XCircle size={iconSize} color="#FFFFFF" fill="#DC2626" />;
      case 'warning':
        return <AlertCircle size={iconSize} color="#FFFFFF" fill="#F59E0B" />;
      case 'info':
      default:
        return <Info size={iconSize} color="#FFFFFF" fill="#3B82F6" />;
    }
  };

  const getIconBgColor = () => {
    switch (config.type) {
      case 'success':
        return 'bg-green-500';
      case 'job-success':
        return 'bg-sky-500';
      case 'application-success':
        return 'bg-purple-500';
      case 'save-success':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getAlertWrapperColor = () => {
    switch (config.type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'job-success':
        return 'bg-gradient-to-br from-sky-50 to-sky-100';
      case 'application-success':
        return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'save-success':
        return 'bg-gradient-to-br from-rose-50 to-rose-100';
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      case 'info':
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
    }
  };


  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onDismiss();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary':
        return getButtonColorByType();
      case 'secondary':
        return 'bg-gray-100 border border-gray-200';
      case 'destructive':
        return 'bg-red-500';
      case 'cancel':
        return 'bg-white border border-gray-300';
      default:
        return getButtonColorByType();
    }
  };

  const getButtonColorByType = () => {
    switch (config.type) {
      case 'success':
      case 'job-success':
        return 'bg-green-500';
      case 'application-success':
        return 'bg-purple-500';
      case 'save-success':
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case 'cancel':
      case 'secondary':
        return 'text-gray-700 font-semibold';
      case 'primary':
      case 'destructive':
      default:
        return 'text-white font-semibold';
    }
  };

  const buttons = config.buttons || [{ text: 'OK', style: 'default' }];

  // For web, we need to handle the modal differently
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      visible={visible}
      transparent= {true}
      animationType="none"
      onRequestClose={config.cancelable ? onDismiss : undefined}
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <TouchableWithoutFeedback onPress={config.cancelable ? onDismiss : undefined}>
        <View 
          className="flex-1 justify-center items-center bg-black/70 px-6"
          style={{
            zIndex: 999999,
            elevation: Platform.OS === 'android' ? 1000 : undefined,
            ...(Platform.OS === 'web' && {
              position: 'fixed' as any,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }),
          }}
        >
          <TouchableWithoutFeedback>
            {/* Alert Wrapper với background nổi bật */}
            <View 
              className={`relative p-6 rounded-3xl ${getAlertWrapperColor()}`} 
              style={{ 
                minWidth: isWeb ? 400 : '100%',
                zIndex: 10000,
                elevation: Platform.OS === 'android' ? 1001 : undefined,
              }}
            >
              {/* Floating Icon */}
              <View className="absolute -top-8 left-1/2" style={{ transform: [{ translateX: -48 }], zIndex: 20 }}>
                <View className={`w-24 h-24 rounded-full ${getIconBgColor()} justify-center items-center shadow-xl border-4 border-white`}>
                  {getIcon()}
                </View>
              </View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                  zIndex: 10001,
                  elevation: Platform.OS === 'android' ? 1002 : undefined,
                }}
                className={`bg-white rounded-2xl w-full shadow-2xl border border-gray-100 mt-8`}
              >
                {/* Close button for cancelable alerts */}
                {config.cancelable && (
                  <TouchableOpacity
                    onPress={onDismiss}
                    className="absolute right-3 top-3 z-10 p-1"
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}

                {/* Content */}
                <View className="px-6 pt-12 pb-6">
                  {/* Title */}
                  <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
                    {config.title}
                  </Text>

                  {/* Message */}
                  {config.message && (
                    <Text className="text-base text-gray-600 text-center mb-8 leading-6">
                      {config.message}
                    </Text>
                  )}

                {/* Loading indicator */}
                {config.showLoading && (
                  <View className="items-center mb-6">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-sm text-gray-500 mt-2">Đang xử lý...</Text>
                  </View>
                )}

                {/* Buttons */}
                <View className={`${buttons.length > 1 ? 'flex-row justify-center gap-3' : ''}`}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleButtonPress(button)}
                      disabled={button.loading || config.showLoading}
                      className={`${buttons.length > 1 ? 'flex-1' : 'w-full'} ${getButtonStyle(button.style)} px-6 py-4 rounded-2xl ${
                        button.loading || config.showLoading ? 'opacity-60' : ''
                      }`}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center">
                        {button.loading && (
                          <ActivityIndicator 
                            size="small" 
                            color={button.style === 'cancel' || button.style === 'secondary' ? '#4B5563' : '#FFFFFF'} 
                            className="mr-2"
                          />
                        )}
                        <Text className={`text-center text-base ${getButtonTextColor(button.style)}`}>
                          {button.text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomAlert;