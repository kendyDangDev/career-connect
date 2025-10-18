import { CheckCircle, AlertCircle, X, Clock } from 'lucide-react';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

interface VerificationStatusAlertProps {
  status: VerificationStatus;
  onRequestVerification?: () => void;
  onResendRequest?: () => void;
}

/**
 * Badge hiển thị trạng thái xác minh
 */
export function VerificationStatusBadge({ status, className = '' }: VerificationStatusBadgeProps) {
  const statusConfig = {
    VERIFIED: {
      icon: CheckCircle,
      label: 'Đã xác minh',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-300',
      textColor: 'text-white',
    },
    PENDING: {
      icon: Clock,
      label: 'Đang chờ xác minh',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-500/20',
      iconColor: 'text-yellow-300',
      textColor: 'text-white',
    },
    REJECTED: {
      icon: X,
      label: 'Bị từ chối',
      borderColor: 'border-red-400',
      bgColor: 'bg-red-500/20',
      iconColor: 'text-red-300',
      textColor: 'text-white',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border ${config.borderColor} ${config.bgColor} px-4 py-2 backdrop-blur-sm ${className}`}
    >
      <Icon className={`h-5 w-5 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
}

/**
 * Alert box hiển thị thông tin chi tiết về trạng thái xác minh
 */
export function VerificationStatusAlert({
  status,
  onRequestVerification,
  onResendRequest,
}: VerificationStatusAlertProps) {
  const alertConfig = {
    PENDING: {
      icon: Clock,
      borderColor: 'border-blue-200',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
      title: 'Đang chờ xác minh',
      description:
        'Yêu cầu xác minh của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất có thể.',
      showButton: false,
    },
    REJECTED: {
      icon: X,
      borderColor: 'border-red-200',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100/50',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      title: 'Yêu cầu xác minh bị từ chối',
      description:
        'Thông tin công ty chưa đủ điều kiện để xác minh. Vui lòng cập nhật đầy đủ thông tin và gửi lại yêu cầu.',
      buttonText: 'Gửi lại yêu cầu xác minh',
      showButton: true,
      onClick: onResendRequest,
    },
    VERIFIED: {
      icon: CheckCircle,
      borderColor: 'border-green-200',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100/50',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-700',
      title: 'Công ty đã được xác minh',
      description:
        'Chúc mừng! Công ty của bạn đã được xác minh. Điều này sẽ giúp tăng độ tin cậy với ứng viên.',
      showButton: false,
    },
  };

  // Trường hợp chưa có trạng thái (null hoặc undefined)
  if (!status || status === ('UNVERIFIED' as any)) {
    const Icon = AlertCircle;
    return (
      <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6">
        <div className="flex items-start gap-4">
          <Icon className="h-6 w-6 shrink-0 text-orange-600" />
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-orange-900">Công ty chưa được xác minh</h3>
            <p className="mb-3 text-sm text-orange-700">
              Hãy hoàn thiện thông tin và gửi yêu cầu xác minh để tăng độ tin cậy với ứng viên
            </p>
            {onRequestVerification && (
              <button
                onClick={onRequestVerification}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
              >
                Gửi yêu cầu xác minh
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const config = alertConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <h3 className={`mb-1 font-semibold ${config.titleColor}`}>{config.title}</h3>
          <p className={`text-sm ${config.textColor}`}>{config.description}</p>
          {config.showButton && status === 'REJECTED' && onResendRequest && (
            <button
              onClick={onResendRequest}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg"
            >
              Gửi lại yêu cầu xác minh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị icon status nhỏ gọn (dùng trong table, list, etc.)
 */
export function VerificationStatusIcon({ status }: { status: VerificationStatus }) {
  const iconConfig = {
    VERIFIED: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    PENDING: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    REJECTED: {
      icon: X,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
  };

  const config = iconConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}
    >
      <Icon className={`h-4 w-4 ${config.color}`} />
    </div>
  );
}

/**
 * Component hiển thị text status
 */
export function VerificationStatusText({ status }: { status: VerificationStatus }) {
  const textConfig = {
    VERIFIED: {
      label: 'Đã xác minh',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    PENDING: {
      label: 'Đang chờ xác minh',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    REJECTED: {
      label: 'Bị từ chối',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
  };

  const config = textConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
}
