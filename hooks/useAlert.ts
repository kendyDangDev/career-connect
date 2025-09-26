import { useState, useCallback } from 'react';
import { AlertConfig } from '../components/CustomAlert';

/**
 * Custom hook để quản lý CustomAlert
 * Cung cấp các method tiện lợi để show/hide alert
 */

interface UseAlertReturn {
  // State
  visible: boolean;
  config: AlertConfig;
  
  // Methods
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  
  // Quick methods for common alerts
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  showLoading: (title: string, message?: string) => void;
  
  // Job portal specific methods
  showJobSuccess: (title: string, message?: string) => void;
  showApplicationSuccess: (title: string, message?: string) => void;
  showSaveSuccess: (title: string, message?: string) => void;
}

export const useAlert = (): UseAlertReturn => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  // Quick success alert
  const showSuccess = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'success'
    });
  }, [showAlert]);

  // Quick error alert
  const showError = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'error'
    });
  }, [showAlert]);

  // Quick warning alert
  const showWarning = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'warning'
    });
  }, [showAlert]);

  // Quick info alert
  const showInfo = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'info'
    });
  }, [showAlert]);

  // Confirmation dialog
  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        { 
          text: 'Xác nhận', 
          style: 'primary',
          onPress: () => {
            onConfirm();
            hideAlert();
          }
        },
        { 
          text: 'Hủy', 
          style: 'cancel',
          onPress: () => {
            onCancel?.();
            hideAlert();
          }
        }
      ]
    });
  }, [showAlert, hideAlert]);

  // Loading alert
  const showLoading = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'info',
      showLoading: true,
      cancelable: true
    });
  }, [showAlert]);

  // Job posting success
  const showJobSuccess = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'job-success'
    });
  }, [showAlert]);

  // Application success
  const showApplicationSuccess = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'application-success'
    });
  }, [showAlert]);

  // Save job success
  const showSaveSuccess = useCallback((title: string, message?: string) => {
    showAlert({
      title,
      message,
      type: 'save-success'
    });
  }, [showAlert]);

  return {
    visible,
    config,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    showJobSuccess,
    showApplicationSuccess,
    showSaveSuccess
  };
};
