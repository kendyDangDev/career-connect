import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CustomAlert, { AlertConfig, AlertButton, AlertType } from '@/components/CustomAlert';
import { Platform, Alert as NativeAlert } from 'react-native';

interface AlertContextType {
  alert: (title: string, message?: string, buttons?: AlertButton[], options?: { type?: AlertType; cancelable?: boolean }) => void;
  success: (title: string, message?: string, onOk?: () => void) => void;
  error: (title: string, message?: string, onOk?: () => void) => void;
  warning: (title: string, message?: string, onOk?: () => void) => void;
  info: (title: string, message?: string, onOk?: () => void) => void;
  confirm: (title: string, message?: string, onConfirm?: () => void, onCancel?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
  useNativeAlert?: boolean; // Option to force native alert on mobile
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children, useNativeAlert = false }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    cancelable: false,
  });

  // Check if we should use native alert
  const shouldUseNativeAlert = useNativeAlert && Platform.OS !== 'web';

  const showAlert = useCallback((config: AlertConfig) => {
    if (shouldUseNativeAlert) {
      // Use native Alert for mobile platforms
      const buttons = config.buttons?.map(button => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style === 'destructive' ? 'destructive' : button.style === 'cancel' ? 'cancel' : 'default',
      })) || [{ text: 'OK' }];

      NativeAlert.alert(
        config.title,
        config.message,
        buttons as any,
        { cancelable: config.cancelable }
      );
    } else {
      // Use custom alert for web or when specified
      setAlertConfig(config);
      setAlertVisible(true);
    }
  }, [shouldUseNativeAlert]);

  const alert = useCallback((
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { type?: AlertType; cancelable?: boolean }
  ) => {
    showAlert({
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
      type: options?.type || 'info',
      cancelable: options?.cancelable || false,
    });
  }, [showAlert]);

  const success = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
      cancelable: false,
    });
  }, [showAlert]);

  const error = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
      cancelable: false,
    });
  }, [showAlert]);

  const warning = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
      cancelable: false,
    });
  }, [showAlert]);

  const info = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
      cancelable: false,
    });
  }, [showAlert]);

  const confirm = useCallback((
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [
        { text: 'Hủy', onPress: onCancel, style: 'cancel' },
        { text: 'Xác nhận', onPress: onConfirm, style: 'default' },
      ],
      cancelable: false,
    });
  }, [showAlert]);

  const handleDismiss = useCallback(() => {
    setAlertVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, success, error, warning, info, confirm }}>
      {children}
      {!shouldUseNativeAlert && (
        <CustomAlert
          visible={alertVisible}
          config={alertConfig}
          onDismiss={handleDismiss}
        />
      )}
    </AlertContext.Provider>
  );
};

// Singleton Alert service for use outside React components
class AlertService {
  private static instance: AlertService;
  private alertFunction: AlertContextType['alert'] | null = null;
  private successFunction: AlertContextType['success'] | null = null;
  private errorFunction: AlertContextType['error'] | null = null;
  private warningFunction: AlertContextType['warning'] | null = null;
  private infoFunction: AlertContextType['info'] | null = null;
  private confirmFunction: AlertContextType['confirm'] | null = null;

  private constructor() {}

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  setAlertFunctions(functions: AlertContextType) {
    this.alertFunction = functions.alert;
    this.successFunction = functions.success;
    this.errorFunction = functions.error;
    this.warningFunction = functions.warning;
    this.infoFunction = functions.info;
    this.confirmFunction = functions.confirm;
  }

  alert(title: string, message?: string, buttons?: AlertButton[], options?: { type?: AlertType; cancelable?: boolean }) {
    if (this.alertFunction) {
      this.alertFunction(title, message, buttons, options);
    } else if (Platform.OS !== 'web') {
      // Fallback to native alert if context not available
      NativeAlert.alert(title, message || '', buttons as any);
    } else {
      // Fallback to console for web if context not available
      console.log(`Alert: ${title} - ${message}`);
    }
  }

  success(title: string, message?: string, onOk?: () => void) {
    if (this.successFunction) {
      this.successFunction(title, message, onOk);
    } else {
      this.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'success' });
    }
  }

  error(title: string, message?: string, onOk?: () => void) {
    if (this.errorFunction) {
      this.errorFunction(title, message, onOk);
    } else {
      this.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'error' });
    }
  }

  warning(title: string, message?: string, onOk?: () => void) {
    if (this.warningFunction) {
      this.warningFunction(title, message, onOk);
    } else {
      this.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'warning' });
    }
  }

  info(title: string, message?: string, onOk?: () => void) {
    if (this.infoFunction) {
      this.infoFunction(title, message, onOk);
    } else {
      this.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'info' });
    }
  }

  confirm(title: string, message?: string, onConfirm?: () => void, onCancel?: () => void) {
    if (this.confirmFunction) {
      this.confirmFunction(title, message, onConfirm, onCancel);
    } else {
      const buttons: AlertButton[] = [
        { text: 'Hủy', onPress: onCancel, style: 'cancel' },
        { text: 'Xác nhận', onPress: onConfirm, style: 'default' },
      ];
      this.alert(title, message, buttons);
    }
  }
}

export const Alert = AlertService.getInstance();

// Hook to initialize Alert service with context
export const useAlertService = () => {
  const alertContext = useAlert();
  
  React.useEffect(() => {
    Alert.setAlertFunctions(alertContext);
  }, [alertContext]);
};

export default AlertContext;