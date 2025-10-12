'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useJobMutations } from '@/hooks/useJobManagementWithNotification';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Loader2,
  Sparkles,
  Send,
  Copy,
  Trash,
  Edit
} from 'lucide-react';

export default function NotificationsDemoPage() {
  const notifications = useNotifications();
  const jobMutations = useJobMutations();
  const [asyncLoading, setAsyncLoading] = useState(false);

  // Simulate an async operation
  const simulateAsyncOperation = async (shouldSucceed: boolean) => {
    setAsyncLoading(true);
    
    try {
      await notifications.promise(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (shouldSucceed) {
              resolve({ message: 'Operation completed successfully!' });
            } else {
              reject(new Error('Operation failed due to network error'));
            }
          }, 3000);
        }),
        {
          loading: 'Đang xử lý yêu cầu của bạn...',
          success: (data: any) => `✅ ${data.message}`,
          error: (error) => `❌ ${error.message}`,
        }
      );
    } catch (error) {
      // Error is already handled by the promise method
    } finally {
      setAsyncLoading(false);
    }
  };

  const demoActions = [
    {
      title: 'Success Notification',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      action: () => notifications.success(
        '✨ Thành công!',
        'Hành động đã được thực hiện thành công. Tất cả các thay đổi đã được lưu.',
        {
          action: {
            label: 'Xem chi tiết',
            onClick: () => alert('Viewing details...')
          }
        }
      )
    },
    {
      title: 'Error Notification',
      icon: XCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 hover:bg-rose-100',
      action: () => notifications.error(
        '❌ Lỗi xảy ra',
        'Không thể hoàn thành hành động. Vui lòng kiểm tra kết nối mạng và thử lại.'
      )
    },
    {
      title: 'Warning Notification',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
      action: () => notifications.warning(
        '⚠️ Cảnh báo',
        'Hành động này có thể ảnh hưởng đến dữ liệu của bạn. Hãy cẩn thận!'
      )
    },
    {
      title: 'Info Notification',
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: () => notifications.info(
        '💡 Thông tin',
        'Phiên bản mới đã được phát hành. Cập nhật ngay để có trải nghiệm tốt nhất.',
        {
          action: {
            label: 'Cập nhật',
            onClick: () => alert('Updating...')
          }
        }
      )
    },
    {
      title: 'Loading Notification',
      icon: Loader2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: () => {
        const id = notifications.loading(
          '⏳ Đang tải dữ liệu...',
          'Vui lòng đợi trong giây lát'
        );
        setTimeout(() => {
          notifications.dismissNotification(id);
          notifications.success('✅ Tải dữ liệu thành công!');
        }, 3000);
      }
    },
    {
      title: 'Multiple Notifications',
      icon: Sparkles,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      action: () => {
        notifications.info('📧 Email mới', 'Bạn có 5 email chưa đọc');
        setTimeout(() => {
          notifications.warning('📅 Lịch hẹn', 'Bạn có cuộc họp sau 30 phút');
        }, 500);
        setTimeout(() => {
          notifications.success('✅ Tác vụ hoàn thành', 'Đã hoàn thành 3/5 công việc hôm nay');
        }, 1000);
      }
    }
  ];

  const jobActions = [
    {
      title: 'Tạo công việc mới',
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: () => {
        // Simulate job creation
        const loadingId = notifications.loading('Đang tạo công việc mới...');
        setTimeout(() => {
          notifications.dismissNotification(loadingId);
          notifications.success(
            '✨ Tạo công việc thành công',
            'Công việc "Senior React Developer" đã được tạo',
            {
              action: {
                label: 'Xem công việc',
                onClick: () => alert('Navigating to job...')
              }
            }
          );
        }, 2000);
      }
    },
    {
      title: 'Sao chép công việc',
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: () => {
        const loadingId = notifications.loading('Đang sao chép công việc...');
        setTimeout(() => {
          notifications.dismissNotification(loadingId);
          notifications.success(
            '📋 Sao chép thành công',
            'Đã tạo bản sao của công việc'
          );
        }, 1500);
      }
    },
    {
      title: 'Cập nhật công việc',
      icon: Edit,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      action: () => {
        const loadingId = notifications.loading('Đang cập nhật...');
        setTimeout(() => {
          notifications.dismissNotification(loadingId);
          notifications.info(
            '📊 Cập nhật thành công',
            'Thông tin công việc đã được cập nhật'
          );
        }, 1500);
      }
    },
    {
      title: 'Xóa công việc',
      icon: Trash,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      action: () => {
        const loadingId = notifications.loading('Đang xóa công việc...');
        setTimeout(() => {
          notifications.dismissNotification(loadingId);
          notifications.warning(
            '🗑️ Đã xóa công việc',
            'Công việc đã được xóa khỏi hệ thống'
          );
        }, 1500);
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
              <Bell className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 Custom Notification System Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Hệ thống thông báo hiện đại với animation và style đẹp mắt
          </p>
        </div>

        {/* Basic Notifications */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            📌 Các loại thông báo cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoActions.map((demo, index) => {
              const Icon = demo.icon;
              return (
                <button
                  key={index}
                  onClick={demo.action}
                  className={`
                    group relative overflow-hidden rounded-xl p-6 
                    border border-gray-200 dark:border-gray-700
                    transition-all duration-300 transform hover:scale-105
                    ${demo.bgColor} dark:bg-gray-800 dark:hover:bg-gray-700
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 rounded-lg bg-white/80 dark:bg-gray-900/80
                      group-hover:rotate-12 transition-transform duration-300
                    `}>
                      <Icon className={`h-6 w-6 ${demo.color}`} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {demo.title}
                    </span>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Management Notifications */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            💼 Thông báo quản lý công việc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`
                    group relative overflow-hidden rounded-xl p-6 
                    border border-gray-200 dark:border-gray-700
                    transition-all duration-300 transform hover:scale-105
                    ${action.bgColor} dark:bg-gray-800 dark:hover:bg-gray-700
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 rounded-lg bg-white/80 dark:bg-gray-900/80
                      group-hover:rotate-12 transition-transform duration-300
                    `}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {action.title}
                    </span>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Async Operations */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            ⚡ Xử lý bất đồng bộ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => simulateAsyncOperation(true)}
              disabled={asyncLoading}
              className="
                group relative overflow-hidden rounded-xl p-6 
                border border-gray-200 dark:border-gray-700
                transition-all duration-300 transform hover:scale-105
                bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100
                dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Async Operation (Success)
                </span>
              </div>
            </button>

            <button
              onClick={() => simulateAsyncOperation(false)}
              disabled={asyncLoading}
              className="
                group relative overflow-hidden rounded-xl p-6 
                border border-gray-200 dark:border-gray-700
                transition-all duration-300 transform hover:scale-105
                bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100
                dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <div className="flex items-center justify-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Async Operation (Fail)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Clear All Button */}
        <div className="text-center">
          <button
            onClick={() => notifications.clearAllNotifications()}
            className="
              px-8 py-3 rounded-xl
              bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800
              text-white font-medium
              shadow-lg hover:shadow-xl
              transition-all duration-300 transform hover:scale-105
            "
          >
            🗑️ Xóa tất cả thông báo
          </button>
        </div>
      </div>
    </div>
  );
}