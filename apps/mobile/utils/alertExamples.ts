import { AlertConfig } from '../components/CustomAlert';

/**
 * Alert Examples cho Career Connect Job Portal
 * Các ví dụ sử dụng alert trong các tình huống thực tế
 */

// ====== JOB POSTING ALERTS ======
export const jobPostingAlerts = {
  // Thành công đăng tin
  postSuccess: (): AlertConfig => ({
    title: 'Đăng tin thành công!',
    message: 'Tin tuyển dụng của bạn đã được đăng và đang chờ duyệt. Chúng tôi sẽ thông báo khi tin được phê duyệt.',
    type: 'job-success',
    buttons: [
      { text: 'Xem tin', style: 'primary' },
      { text: 'Đăng tin khác', style: 'secondary' },
      { text: 'Đóng', style: 'cancel' }
    ]
  }),

  // Confirm xóa tin
  confirmDelete: (jobTitle: string): AlertConfig => ({
    title: 'Xóa tin tuyển dụng',
    message: `Bạn có chắc chắn muốn xóa tin "${jobTitle}"? Hành động này không thể hoàn tác.`,
    type: 'warning',
    buttons: [
      { text: 'Xóa', style: 'destructive' },
      { text: 'Hủy', style: 'cancel' }
    ]
  }),

  // Tin hết hạn
  jobExpired: (): AlertConfig => ({
    title: 'Tin tuyển dụng hết hạn',
    message: 'Tin tuyển dụng của bạn đã hết hạn. Bạn có muốn gia hạn thêm 30 ngày?',
    type: 'warning',
    buttons: [
      { text: 'Gia hạn', style: 'primary' },
      { text: 'Để sau', style: 'cancel' }
    ]
  })
};

// ====== JOB APPLICATION ALERTS ======
export const jobApplicationAlerts = {
  // Thành công ứng tuyển
  applySuccess: (companyName: string): AlertConfig => ({
    title: 'Ứng tuyển thành công!',
    message: `Hồ sơ của bạn đã được gửi tới ${companyName}. Chúc bạn may mắn! Chúng tôi sẽ thông báo khi có phản hồi.`,
    type: 'application-success',
    buttons: [
      { text: 'Xem hồ sơ', style: 'secondary' },
      { text: 'Đóng', style: 'primary' }
    ]
  }),

  // Confirm ứng tuyển với loading
  confirmApply: (jobTitle: string, companyName: string): AlertConfig => ({
    title: 'Ứng tuyển việc làm',
    message: `Bạn có chắc chắn muốn ứng tuyển vị trí "${jobTitle}" tại ${companyName}?`,
    type: 'info',
    buttons: [
      { text: 'Ứng tuyển', style: 'primary' },
      { text: 'Hủy', style: 'cancel' }
    ]
  }),

  // Thiếu CV
  missingCV: (): AlertConfig => ({
    title: 'Thiếu CV',
    message: 'Bạn cần tải lên CV để có thể ứng tuyển. Vui lòng cập nhật hồ sơ của bạn.',
    type: 'warning',
    buttons: [
      { text: 'Tải CV', style: 'primary' },
      { text: 'Để sau', style: 'cancel' }
    ]
  }),

  // Đã ứng tuyển rồi
  alreadyApplied: (): AlertConfig => ({
    title: 'Đã ứng tuyển',
    message: 'Bạn đã ứng tuyển vị trí này trước đó. Vui lòng chờ phản hồi từ nhà tuyển dụng.',
    type: 'info'
  })
};

// ====== SAVED JOBS ALERTS ======
export const savedJobsAlerts = {
  // Lưu công việc thành công
  saveSuccess: (): AlertConfig => ({
    title: 'Đã lưu việc làm!',
    message: 'Việc làm đã được thêm vào danh sách yêu thích của bạn.',
    type: 'save-success'
  }),

  // Bỏ lưu công việc
  unsaveSuccess: (): AlertConfig => ({
    title: 'Đã bỏ lưu',
    message: 'Việc làm đã được xóa khỏi danh sách yêu thích.',
    type: 'info'
  }),

  // Confirm xóa tất cả
  confirmClearAll: (count: number): AlertConfig => ({
    title: 'Xóa tất cả việc làm đã lưu',
    message: `Bạn có chắc chắn muốn xóa tất cả ${count} việc làm đã lưu? Hành động này không thể hoàn tác.`,
    type: 'warning',
    buttons: [
      { text: 'Xóa tất cả', style: 'destructive' },
      { text: 'Hủy', style: 'cancel' }
    ]
  })
};

// ====== PROFILE ALERTS ======
export const profileAlerts = {
  // Cập nhật profile thành công
  updateSuccess: (): AlertConfig => ({
    title: 'Cập nhật thành công!',
    message: 'Thông tin hồ sơ của bạn đã được cập nhật.',
    type: 'success'
  }),

  // Upload CV thành công
  uploadCVSuccess: (): AlertConfig => ({
    title: 'Tải CV thành công!',
    message: 'CV của bạn đã được tải lên và cập nhật trong hồ sơ.',
    type: 'success',
    buttons: [
      { text: 'Xem CV', style: 'secondary' },
      { text: 'Đóng', style: 'primary' }
    ]
  }),

  // CV quá lớn
  fileTooLarge: (): AlertConfig => ({
    title: 'File quá lớn',
    message: 'Kích thước CV không được vượt quá 5MB. Vui lòng chọn file khác.',
    type: 'error'
  }),

  // Định dạng file không hỗ trợ
  invalidFileFormat: (): AlertConfig => ({
    title: 'Định dạng không hỗ trợ',
    message: 'Chỉ hỗ trợ file PDF, DOC, DOCX. Vui lòng chọn file khác.',
    type: 'error'
  })
};

// ====== AUTH ALERTS ======
export const authAlerts = {
  // Đăng nhập thành công
  loginSuccess: (name: string): AlertConfig => ({
    title: 'Chào mừng trở lại!',
    message: `Xin chào ${name}, bạn đã đăng nhập thành công.`,
    type: 'success'
  }),

  // Đăng ký thành công
  registerSuccess: (): AlertConfig => ({
    title: 'Đăng ký thành công!',
    message: 'Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email để xác thực tài khoản.',
    type: 'success'
  }),

  // Sai mật khẩu
  wrongPassword: (): AlertConfig => ({
    title: 'Sai mật khẩu',
    message: 'Mật khẩu không chính xác. Vui lòng thử lại.',
    type: 'error'
  }),

  // Tài khoản bị khóa
  accountLocked: (): AlertConfig => ({
    title: 'Tài khoản bị khóa',
    message: 'Tài khoản của bạn đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    type: 'error'
  }),

  // Reset password
  resetPasswordSent: (): AlertConfig => ({
    title: 'Đã gửi email',
    message: 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.',
    type: 'info'
  })
};

// ====== NETWORK ALERTS ======
export const networkAlerts = {
  // Mất kết nối
  noConnection: (): AlertConfig => ({
    title: 'Mất kết nối',
    message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.',
    type: 'error',
    buttons: [
      { text: 'Thử lại', style: 'primary' },
      { text: 'Đóng', style: 'cancel' }
    ]
  }),

  // Loading với timeout
  loadingWithTimeout: (): AlertConfig => ({
    title: 'Đang tải dữ liệu',
    message: 'Vui lòng chờ trong khi chúng tôi tải thông tin...',
    type: 'info',
    showLoading: true,
    cancelable: true
  }),

  // Server error
  serverError: (): AlertConfig => ({
    title: 'Lỗi server',
    message: 'Có lỗi xảy ra từ phía server. Chúng tôi đang khắc phục vấn đề này.',
    type: 'error'
  })
};

// ====== NOTIFICATION ALERTS ======
export const notificationAlerts = {
  // Bật thông báo
  enableNotifications: (): AlertConfig => ({
    title: 'Bật thông báo',
    message: 'Bật thông báo để nhận cập nhật về việc làm mới và phản hồi từ nhà tuyển dụng.',
    type: 'info',
    buttons: [
      { text: 'Bật', style: 'primary' },
      { text: 'Để sau', style: 'cancel' }
    ]
  }),

  // Có thông báo mới
  newNotification: (count: number): AlertConfig => ({
    title: 'Thông báo mới',
    message: `Bạn có ${count} thông báo mới. Bạn có muốn xem ngay?`,
    type: 'info',
    buttons: [
      { text: 'Xem', style: 'primary' },
      { text: 'Để sau', style: 'cancel' }
    ]
  })
};

// ====== PREMIUM ALERTS ======
export const premiumAlerts = {
  // Upgrade premium
  upgradePremium: (): AlertConfig => ({
    title: 'Nâng cấp Premium',
    message: 'Nâng cấp tài khoản Premium để sử dụng tính năng này và nhiều lợi ích khác.',
    type: 'info',
    buttons: [
      { text: 'Nâng cấp', style: 'primary' },
      { text: 'Để sau', style: 'cancel' }
    ]
  }),

  // Đã hết quota
  quotaExceeded: (feature: string): AlertConfig => ({
    title: 'Đã hết lượt sử dụng',
    message: `Bạn đã sử dụng hết lượt ${feature} trong tháng này. Nâng cấp Premium để sử dụng không giới hạn.`,
    type: 'warning',
    buttons: [
      { text: 'Nâng cấp', style: 'primary' },
      { text: 'Đóng', style: 'cancel' }
    ]
  })
};

// Export tất cả
export const alertExamples = {
  jobPosting: jobPostingAlerts,
  application: jobApplicationAlerts,
  savedJobs: savedJobsAlerts,
  profile: profileAlerts,
  auth: authAlerts,
  network: networkAlerts,
  notification: notificationAlerts,
  premium: premiumAlerts
};
