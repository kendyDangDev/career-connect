import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import savedJobService from '@/services/savedJobService';

interface UseSavedJobResult {
  isSaved: boolean;
  isLoading: boolean;
  savedJobId: string | null;
  toggleSave: () => Promise<void>;
  checkSavedStatus: () => Promise<void>;
}

export const useSavedJob = (jobId: string): UseSavedJobResult => {
  const { isAuthenticated } = useAuthContext();
  const alert = useAlert();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);

  // Check if job is saved
  const checkSavedStatus = useCallback(async () => {
    // Skip authentication check in development with mock data
    if (!__DEV__ && (!isAuthenticated || !jobId)) {
      setIsSaved(false);
      setSavedJobId(null);
      return;
    }
    
    if (!jobId) {
      setIsSaved(false);
      setSavedJobId(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await savedJobService.checkIfJobSaved(jobId);
      
      if (response.success) {
        setIsSaved(response.data.isSaved);
        setSavedJobId(response.data.savedJobId || null);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
      // Silently fail - don't show error to user
      setIsSaved(false);
      setSavedJobId(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, isAuthenticated]);

  // Toggle save status
  const toggleSave = useCallback(async () => {
    // Skip authentication check in development with mock data
    if (!__DEV__ && !isAuthenticated) {
      alert.confirm(
        'Đăng nhập yêu cầu',
        'Bạn cần đăng nhập để lưu việc làm',
        () => {
          // Navigate to login screen
          // This should be handled by the parent component
          console.log('Navigate to login');
        },
        () => {}
      );
      return;
    }

    if (!jobId) {
      alert.error('Lỗi', 'Không tìm thấy thông tin việc làm');
      return;
    }

    try {
      setIsLoading(true);

      if (isSaved && savedJobId) {
        // Remove from saved jobs
        const response = await savedJobService.removeSavedJob(savedJobId);
        
        if (response.success) {
          setIsSaved(false);
          setSavedJobId(null);
          // Show success feedback
          alert.success('Thành công', 'Đã xóa việc làm khỏi danh sách đã lưu');
        }
      } else {
        // Add to saved jobs
        const response = await savedJobService.saveJob(jobId);
        
        if (response.success) {
          setIsSaved(true);
          setSavedJobId(response.data.savedJob.id);
          // Show success feedback
          alert.success('Thành công', 'Đã lưu việc làm thành công');
        }
      }
    } catch (error: any) {
      console.error('Error toggling save status:', error);
      
      // Handle specific error cases
      if (error.message === 'Job is already saved') {
        // Refresh the status
        await checkSavedStatus();
      } else if (error.message === 'No authentication token found. Please login.') {
        alert.warning(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục'
        );
      } else {
        alert.error(
          'Lỗi',
          isSaved 
            ? 'Không thể xóa việc làm. Vui lòng thử lại.' 
            : 'Không thể lưu việc làm. Vui lòng thử lại.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobId, isSaved, savedJobId, isAuthenticated, alert]);

  // Check saved status on mount and when jobId changes
  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);

  return {
    isSaved,
    isLoading,
    savedJobId,
    toggleSave,
    checkSavedStatus,
  };
};

export default useSavedJob;
