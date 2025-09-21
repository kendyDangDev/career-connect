# Hướng dẫn sử dụng Career Connect API cho React Native

Tài liệu này mô tả chi tiết cách sử dụng tất cả API Routes của Career Connect trong ứng dụng React Native/Expo.

## 📋 Mục lục

- [1. Cấu hình cơ bản](#1-cấu-hình-cơ-bản)
- [2. Authentication APIs](#2-authentication-apis)
- [3. User Profile APIs](#3-user-profile-apis)
- [4. Job APIs](#4-job-apis)
- [5. Company APIs](#5-company-apis)
- [6. Application APIs](#6-application-apis)
- [7. Candidate APIs](#7-candidate-apis)
- [8. Employer APIs](#8-employer-apis)
- [9. Review APIs](#9-review-apis)
- [10. Admin APIs](#10-admin-apis)
- [11. Error Handling](#11-error-handling)
- [12. Best Practices](#12-best-practices)

## 1. Cấu hình cơ bản

### 1.1 Base URL Configuration

```javascript
// config/api.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    // Development
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Android Emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3000'; // iOS Simulator
    }
  }
  
  // Production
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.com';
};

export const API_BASE_URL = getBaseURL();
```

### 1.2 HTTP Client Setup

```javascript
// services/httpClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new HttpClient(API_BASE_URL);
```

## 2. Authentication APIs

### 2.1 Mobile Login
```javascript
// services/auth.service.js

// Đăng nhập
export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/mobile/login', {
    email: email.toLowerCase().trim(),
    password,
  });
  
  if (response.success) {
    await AsyncStorage.setItem('authToken', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

// Ví dụ sử dụng
const handleLogin = async () => {
  try {
    const result = await login('user@example.com', 'password123');
    console.log('User:', result.data.user);
    console.log('Token:', result.data.token);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### 2.2 Register
```javascript
// Đăng ký người dùng mới
export const register = async (userData) => {
  return await apiClient.post('/api/auth/register', {
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.confirmPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    userType: userData.userType, // 'CANDIDATE' or 'EMPLOYER'
  });
};

// Ví dụ
const handleRegister = async () => {
  try {
    const result = await register({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'CANDIDATE',
    });
    console.log('Registration successful:', result);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

### 2.3 Logout
```javascript
// Đăng xuất
export const logout = async () => {
  const token = await AsyncStorage.getItem('authToken');
  
  try {
    await apiClient.post('/api/auth/mobile/logout', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } finally {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }
};
```

### 2.4 Verify Token
```javascript
// Xác thực token
export const verifyToken = async () => {
  try {
    const response = await apiClient.get('/api/auth/mobile/verify');
    return response.success;
  } catch {
    return false;
  }
};
```

### 2.5 Email Verification
```javascript
// Gửi lại email xác thực
export const resendVerificationEmail = async () => {
  return await apiClient.post('/api/auth/resend-verification');
};

// Xác thực email
export const verifyEmail = async (token) => {
  return await apiClient.post('/api/auth/verify-email', { token });
};
```

### 2.6 Phone Verification
```javascript
// Gửi mã OTP đến điện thoại
export const sendPhoneVerification = async (phone) => {
  return await apiClient.post('/api/auth/send-phone-verification', { phone });
};

// Xác thực số điện thoại
export const verifyPhone = async (phone, code) => {
  return await apiClient.post('/api/auth/verify-phone', { phone, code });
};
```

## 3. User Profile APIs

### 3.1 Get Current User Session
```javascript
// Lấy thông tin session hiện tại
export const getCurrentSession = async () => {
  return await apiClient.get('/api/auth/session');
};

// Ví dụ
const loadUserSession = async () => {
  try {
    const session = await getCurrentSession();
    console.log('Current user:', session.user);
  } catch (error) {
    console.error('Failed to load session:', error);
  }
};
```

## 4. Job APIs

### 4.1 Create Job (Employer)
```javascript
// Tạo tin tuyển dụng mới
export const createJob = async (jobData) => {
  return await apiClient.post('/api/jobs/create', jobData);
};

// Ví dụ
const handleCreateJob = async () => {
  const newJob = {
    title: 'Senior React Native Developer',
    description: 'We are looking for...',
    requirements: ['5+ years experience', 'React Native expert'],
    salary: {
      min: 2000,
      max: 3500,
      currency: 'USD',
      negotiable: true,
    },
    location: 'Remote',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    skills: ['React Native', 'TypeScript', 'Redux'],
    benefits: ['Health insurance', 'Flexible hours'],
    deadline: new Date('2024-12-31').toISOString(),
  };
  
  try {
    const result = await createJob(newJob);
    console.log('Job created:', result);
  } catch (error) {
    console.error('Failed to create job:', error);
  }
};
```

### 4.2 View Job Details
```javascript
// Xem chi tiết công việc
export const viewJob = async (jobId) => {
  return await apiClient.post(`/api/jobs/${jobId}/view`);
};

// Lấy thông tin công việc
export const getJobDetails = async (jobId) => {
  return await apiClient.get(`/api/employer/jobs/${jobId}`);
};
```

### 4.3 Update Job
```javascript
// Cập nhật thông tin công việc
export const updateJob = async (jobId, updates) => {
  return await apiClient.patch(`/api/employer/jobs/${jobId}`, updates);
};

// Ví dụ
const handleUpdateJob = async () => {
  try {
    const result = await updateJob('job123', {
      title: 'Updated Title',
      salary: { min: 2500, max: 4000 },
    });
    console.log('Job updated:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### 4.4 Delete Job
```javascript
// Xóa công việc
export const deleteJob = async (jobId) => {
  return await apiClient.delete(`/api/employer/jobs/${jobId}`);
};
```

### 4.5 List Employer's Jobs
```javascript
// Lấy danh sách công việc của nhà tuyển dụng
export const getEmployerJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return await apiClient.get(`/api/employer/jobs${queryParams ? `?${queryParams}` : ''}`);
};

// Ví dụ với filters
const loadMyJobs = async () => {
  try {
    const jobs = await getEmployerJobs({
      status: 'ACTIVE',
      page: 1,
      limit: 10,
    });
    console.log('My jobs:', jobs.data);
  } catch (error) {
    console.error('Failed to load jobs:', error);
  }
};
```

## 5. Company APIs

### 5.1 Get Company Profile
```javascript
// Lấy thông tin công ty theo slug
export const getCompanyBySlug = async (slug) => {
  return await apiClient.get(`/api/companies/${slug}`);
};

// Lấy profile công ty của employer hiện tại
export const getMyCompanyProfile = async () => {
  return await apiClient.get('/api/companies/profile');
};
```

### 5.2 Update Company Profile
```javascript
// Cập nhật thông tin công ty
export const updateCompanyProfile = async (updates) => {
  return await apiClient.put('/api/companies/profile', updates);
};

// Ví dụ
const updateCompany = async () => {
  try {
    const result = await updateCompanyProfile({
      name: 'Updated Company Name',
      description: 'New description...',
      website: 'https://company.com',
      size: 'MEDIUM', // SMALL, MEDIUM, LARGE, ENTERPRISE
      industry: 'Technology',
      locations: ['Hanoi', 'Ho Chi Minh'],
    });
    console.log('Company updated:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### 5.3 Upload Company Media
```javascript
// Upload logo hoặc ảnh cover
export const uploadCompanyMedia = async (file, type) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.name || 'image.jpg',
  });
  formData.append('type', type); // 'logo' or 'cover'
  
  return await apiClient.post('/api/companies/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Ví dụ sử dụng với Image Picker
import * as ImagePicker from 'expo-image-picker';

const pickAndUploadLogo = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  
  if (!result.cancelled) {
    try {
      const uploadResult = await uploadCompanyMedia(result, 'logo');
      console.log('Logo uploaded:', uploadResult);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};
```

## 6. Application APIs

### 6.1 Apply for Job (Candidate)
```javascript
// Ứng tuyển công việc
export const applyForJob = async (applicationData) => {
  return await apiClient.post('/api/applications/apply', {
    jobId: applicationData.jobId,
    coverLetter: applicationData.coverLetter,
    expectedSalary: applicationData.expectedSalary,
    availableStartDate: applicationData.startDate,
    attachments: applicationData.attachments, // URLs hoặc file IDs
  });
};

// Ví dụ
const handleApply = async () => {
  try {
    const result = await applyForJob({
      jobId: 'job123',
      coverLetter: 'I am excited to apply for this position...',
      expectedSalary: 2500,
      startDate: '2024-01-15',
    });
    console.log('Application submitted:', result);
  } catch (error) {
    console.error('Application failed:', error);
  }
};
```

### 6.2 Get Applications (Employer)
```javascript
// Lấy danh sách ứng viên
export const getApplications = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return await apiClient.get(`/api/employer/applications${queryParams ? `?${queryParams}` : ''}`);
};

// Lấy thống kê ứng viên
export const getApplicationStats = async () => {
  return await apiClient.get('/api/employer/applications/stats');
};
```

### 6.3 Update Application Status
```javascript
// Cập nhật trạng thái đơn ứng tuyển
export const updateApplicationStatus = async (applicationId, status, note) => {
  return await apiClient.patch(`/api/employer/applications/${applicationId}`, {
    status, // 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'
    note,
  });
};

// Cập nhật hàng loạt
export const bulkUpdateApplications = async (applicationIds, updates) => {
  return await apiClient.post('/api/employer/applications/bulk-update', {
    applicationIds,
    updates,
  });
};
```

## 7. Candidate APIs

### 7.1 Experience Management
```javascript
// Thêm kinh nghiệm làm việc
export const addExperience = async (experience) => {
  return await apiClient.post('/api/candidate/experience', experience);
};

// Cập nhật kinh nghiệm
export const updateExperience = async (experienceId, updates) => {
  return await apiClient.put(`/api/candidate/experience/${experienceId}`, updates);
};

// Xóa kinh nghiệm
export const deleteExperience = async (experienceId) => {
  return await apiClient.delete(`/api/candidate/experience/${experienceId}`);
};

// Lấy danh sách kinh nghiệm
export const getExperiences = async () => {
  return await apiClient.get('/api/candidate/experience');
};

// Ví dụ thêm kinh nghiệm
const addNewExperience = async () => {
  try {
    const result = await addExperience({
      title: 'Senior Developer',
      company: 'Tech Corp',
      location: 'Hanoi',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      current: false,
      description: 'Led development of mobile applications...',
    });
    console.log('Experience added:', result);
  } catch (error) {
    console.error('Failed to add experience:', error);
  }
};
```

### 7.2 Education Management
```javascript
// Thêm học vấn
export const addEducation = async (education) => {
  return await apiClient.post('/api/candidate/education', education);
};

// Cập nhật học vấn
export const updateEducation = async (educationId, updates) => {
  return await apiClient.put(`/api/candidate/education/${educationId}`, updates);
};

// Xóa học vấn
export const deleteEducation = async (educationId) => {
  return await apiClient.delete(`/api/candidate/education/${educationId}`);
};

// Lấy danh sách học vấn
export const getEducation = async () => {
  return await apiClient.get('/api/candidate/education');
};
```

### 7.3 Skills Management
```javascript
// Thêm kỹ năng
export const addSkill = async (skill) => {
  return await apiClient.post('/api/candidate/skills', {
    name: skill.name,
    level: skill.level, // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
    yearsOfExperience: skill.years,
  });
};

// Cập nhật kỹ năng
export const updateSkill = async (skillId, updates) => {
  return await apiClient.put(`/api/candidate/skills/${skillId}`, updates);
};

// Xóa kỹ năng
export const deleteSkill = async (skillId) => {
  return await apiClient.delete(`/api/candidate/skills/${skillId}`);
};

// Lấy danh sách kỹ năng
export const getSkills = async () => {
  return await apiClient.get('/api/candidate/skills');
};
```

### 7.4 Certifications Management
```javascript
// Thêm chứng chỉ
export const addCertification = async (certification) => {
  return await apiClient.post('/api/candidate/certifications', certification);
};

// Cập nhật chứng chỉ
export const updateCertification = async (certId, updates) => {
  return await apiClient.put(`/api/candidate/certifications/${certId}`, updates);
};

// Xóa chứng chỉ
export const deleteCertification = async (certId) => {
  return await apiClient.delete(`/api/candidate/certifications/${certId}`);
};

// Lấy danh sách chứng chỉ
export const getCertifications = async () => {
  return await apiClient.get('/api/candidate/certifications');
};
```

### 7.5 Saved Jobs
```javascript
// Lưu công việc
export const saveJob = async (jobId) => {
  return await apiClient.post('/api/candidate/saved-jobs', { jobId });
};

// Bỏ lưu công việc
export const unsaveJob = async (jobId) => {
  return await apiClient.delete(`/api/candidate/saved-jobs/${jobId}`);
};

// Lấy danh sách công việc đã lưu
export const getSavedJobs = async () => {
  return await apiClient.get('/api/candidate/saved-jobs');
};
```

### 7.6 Company Following
```javascript
// Theo dõi công ty
export const followCompany = async (companyId) => {
  return await apiClient.post('/api/candidate/company-followers', { companyId });
};

// Bỏ theo dõi công ty
export const unfollowCompany = async (companyId) => {
  return await apiClient.delete(`/api/candidate/company-followers/${companyId}`);
};

// Lấy danh sách công ty đang theo dõi
export const getFollowedCompanies = async () => {
  return await apiClient.get('/api/candidate/company-followers');
};
```

### 7.7 Job Alerts
```javascript
// Tạo thông báo việc làm
export const createJobAlert = async (alert) => {
  return await apiClient.post('/api/candidate/job-alerts', {
    name: alert.name,
    keywords: alert.keywords,
    locations: alert.locations,
    jobTypes: alert.jobTypes,
    experienceLevels: alert.experienceLevels,
    salaryMin: alert.salaryMin,
    frequency: alert.frequency, // 'DAILY', 'WEEKLY', 'MONTHLY'
  });
};

// Cập nhật thông báo
export const updateJobAlert = async (alertId, updates) => {
  return await apiClient.put(`/api/candidate/job-alerts/${alertId}`, updates);
};

// Xóa thông báo
export const deleteJobAlert = async (alertId) => {
  return await apiClient.delete(`/api/candidate/job-alerts/${alertId}`);
};

// Lấy danh sách thông báo
export const getJobAlerts = async () => {
  return await apiClient.get('/api/candidate/job-alerts');
};

// Lấy thống kê thông báo
export const getJobAlertStats = async () => {
  return await apiClient.get('/api/candidate/job-alerts/stats');
};
```

## 8. Employer APIs

### 8.1 Employer Registration
```javascript
// Đăng ký tài khoản nhà tuyển dụng
export const registerEmployer = async (data) => {
  return await apiClient.post('/api/employer/auth/register', {
    // Thông tin cá nhân
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    
    // Thông tin công ty
    companyName: data.companyName,
    companyEmail: data.companyEmail,
    companyPhone: data.companyPhone,
    website: data.website,
    taxNumber: data.taxNumber,
    
    // Địa chỉ
    address: data.address,
    city: data.city,
    district: data.district,
    
    // Thông tin bổ sung
    position: data.position,
    employeeCount: data.employeeCount,
    industry: data.industry,
  });
};

// Kiểm tra trạng thái đăng ký
export const checkRegistrationStatus = async () => {
  return await apiClient.get('/api/employer/auth/registration-status');
};
```

## 9. Review APIs

### 9.1 Company Reviews
```javascript
// Tạo đánh giá công ty
export const createCompanyReview = async (review) => {
  return await apiClient.post('/api/reviews/company', {
    companyId: review.companyId,
    rating: review.rating, // 1-5
    title: review.title,
    pros: review.pros,
    cons: review.cons,
    isCurrentEmployee: review.isCurrentEmployee,
    employmentStatus: review.employmentStatus, // 'FULL_TIME', 'PART_TIME', etc.
    position: review.position,
    yearsWorked: review.yearsWorked,
  });
};

// Lấy đánh giá của công ty
export const getCompanyReviews = async (companyId, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return await apiClient.get(`/api/reviews/company/${companyId}${queryParams ? `?${queryParams}` : ''}`);
};

// Lấy thống kê đánh giá
export const getCompanyReviewStats = async (companyId) => {
  return await apiClient.get(`/api/reviews/company/${companyId}/statistics`);
};

// Lấy đánh giá của user hiện tại
export const getMyCompanyReviews = async () => {
  return await apiClient.get('/api/reviews/company/user');
};
```

### 9.2 Interview Reviews
```javascript
// Tạo đánh giá phỏng vấn
export const createInterviewReview = async (review) => {
  return await apiClient.post('/api/reviews/interview', {
    companyId: review.companyId,
    position: review.position,
    difficulty: review.difficulty, // 'VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD'
    experience: review.experience, // 'VERY_NEGATIVE', 'NEGATIVE', 'NEUTRAL', 'POSITIVE', 'VERY_POSITIVE'
    process: review.process,
    questions: review.questions,
    result: review.result, // 'OFFERED', 'REJECTED', 'NO_RESPONSE', 'WITHDREW'
    interviewDate: review.interviewDate,
    duration: review.duration,
  });
};

// Lấy tips phỏng vấn
export const getInterviewTips = async () => {
  return await apiClient.get('/api/reviews/interview/tips');
};
```

## 10. Admin APIs

### 10.1 User Management
```javascript
// Lấy danh sách người dùng (Admin)
export const getUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return await apiClient.get(`/api/admin/users${queryParams ? `?${queryParams}` : ''}`);
};

// Lấy chi tiết người dùng
export const getUserById = async (userId) => {
  return await apiClient.get(`/api/admin/users/${userId}`);
};

// Cập nhật người dùng
export const updateUser = async (userId, updates) => {
  return await apiClient.put(`/api/admin/users/${userId}`, updates);
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  return await apiClient.delete(`/api/admin/users/${userId}`);
};
```

### 10.2 Company Management
```javascript
// Lấy danh sách công ty (Admin)
export const getCompanies = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return await apiClient.get(`/api/admin/companies${queryParams ? `?${queryParams}` : ''}`);
};

// Lấy thống kê công ty
export const getCompanyStats = async () => {
  return await apiClient.get('/api/admin/companies/stats');
};

// Phê duyệt/từ chối công ty
export const updateCompanyStatus = async (companyId, status) => {
  return await apiClient.patch(`/api/admin/companies/${companyId}`, { status });
};
```

### 10.3 System Categories
```javascript
// Quản lý danh mục hệ thống
export const getSystemCategories = async () => {
  return await apiClient.get('/api/admin/system-categories/categories');
};

// Quản lý ngành nghề
export const getIndustries = async () => {
  return await apiClient.get('/api/admin/system-categories/industries');
};

// Quản lý địa điểm
export const getLocations = async () => {
  return await apiClient.get('/api/admin/system-categories/locations');
};

// Quản lý kỹ năng
export const getSystemSkills = async () => {
  return await apiClient.get('/api/admin/system-categories/skills');
};
```

## 11. Error Handling

### 11.1 Global Error Handler
```javascript
// utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.error || 'Đã có lỗi xảy ra';
    const statusCode = error.response.status;
    
    switch (statusCode) {
      case 400:
        return new ApiError('Dữ liệu không hợp lệ', statusCode, error.response.data);
      case 401:
        return new ApiError('Vui lòng đăng nhập lại', statusCode);
      case 403:
        return new ApiError('Bạn không có quyền thực hiện hành động này', statusCode);
      case 404:
        return new ApiError('Không tìm thấy dữ liệu', statusCode);
      case 429:
        return new ApiError('Quá nhiều yêu cầu. Vui lòng thử lại sau', statusCode);
      case 500:
        return new ApiError('Lỗi máy chủ. Vui lòng thử lại sau', statusCode);
      default:
        return new ApiError(message, statusCode);
    }
  } else if (error.request) {
    // Request made but no response
    return new ApiError('Không thể kết nối đến máy chủ', 0);
  } else {
    // Something else happened
    return new ApiError(error.message || 'Đã có lỗi xảy ra', -1);
  }
};
```

### 11.2 Using Error Handler in Components
```javascript
// screens/LoginScreen.js
import { handleApiError } from '../utils/errorHandler';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await login(email, password);
      // Navigate to home
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      
      if (apiError.statusCode === 401) {
        // Handle unauthorized
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Rest of UI */}
    </View>
  );
};
```

## 12. Best Practices

### 12.1 Request Interceptor with Retry
```javascript
// services/apiInterceptor.js
export const requestWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Usage
const fetchData = async () => {
  return await requestWithRetry(() => apiClient.get('/api/some-endpoint'));
};
```

### 12.2 Caching Strategy
```javascript
// utils/cache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheManager {
  constructor() {
    this.cachePrefix = '@cache_';
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }
  
  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(this.cachePrefix + key);
      if (!cached) return null;
      
      const { data, expiry } = JSON.parse(cached);
      
      if (Date.now() > expiry) {
        await this.delete(key);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }
  
  async set(key, data, ttl = this.defaultTTL) {
    const item = {
      data,
      expiry: Date.now() + ttl,
    };
    
    await AsyncStorage.setItem(
      this.cachePrefix + key,
      JSON.stringify(item)
    );
  }
  
  async delete(key) {
    await AsyncStorage.removeItem(this.cachePrefix + key);
  }
  
  async clear() {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
    await AsyncStorage.multiRemove(cacheKeys);
  }
}

export const cache = new CacheManager();

// Usage with API
export const getCachedData = async (endpoint, ttl = 300000) => {
  const cacheKey = `api_${endpoint}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch fresh data
  const data = await apiClient.get(endpoint);
  
  // Cache for future use
  await cache.set(cacheKey, data, ttl);
  
  return data;
};
```

### 12.3 Offline Support
```javascript
// utils/offline.js
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineManager {
  constructor() {
    this.queue = [];
    this.isOnline = true;
    
    // Monitor network status
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      
      if (this.isOnline) {
        this.processQueue();
      }
    });
  }
  
  async addToQueue(request) {
    const queueItem = {
      id: Date.now().toString(),
      request,
      timestamp: Date.now(),
    };
    
    this.queue.push(queueItem);
    await this.saveQueue();
    
    if (this.isOnline) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        await item.request();
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        console.error('Failed to process queued request:', error);
        break;
      }
    }
  }
  
  async saveQueue() {
    await AsyncStorage.setItem('@offline_queue', JSON.stringify(this.queue));
  }
  
  async loadQueue() {
    const saved = await AsyncStorage.getItem('@offline_queue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }
}

export const offlineManager = new OfflineManager();
```

### 12.4 Performance Optimization
```javascript
// hooks/useApiCall.js
import { useState, useEffect, useCallback } from 'react';

export const useApiCall = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, dependencies);
  
  const refetch = () => execute();
  
  useEffect(() => {
    execute();
  }, dependencies);
  
  return { data, loading, error, refetch, execute };
};

// Usage in component
const JobListScreen = () => {
  const { data, loading, error, refetch } = useApiCall(
    () => getEmployerJobs({ status: 'ACTIVE' }),
    []
  );
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  
  return (
    <FlatList
      data={data?.jobs}
      renderItem={({ item }) => <JobCard job={item} />}
      onRefresh={refetch}
      refreshing={loading}
    />
  );
};
```

## 📱 Testing với Physical Device

### Cấu hình cho thiết bị thật

1. **Tìm IP máy chủ (Windows)**:
```powershell
ipconfig
# Tìm IPv4 Address của adapter đang dùng (ví dụ: 192.168.1.100)
```

2. **Cập nhật Base URL**:
```javascript
// Cho thiết bị thật
const API_BASE_URL = 'http://192.168.1.100:3000';
```

3. **Chạy Next.js server cho phép truy cập từ mạng LAN**:
```bash
npm run dev -- -H 0.0.0.0 -p 3000
```

4. **Đảm bảo firewall cho phép kết nối đến port 3000**

## 🔐 Security Notes

1. **Luôn sử dụng HTTPS trong production**
2. **Không hardcode sensitive data**
3. **Implement certificate pinning cho enhanced security**
4. **Validate và sanitize all inputs**
5. **Use secure storage cho tokens và sensitive data**

## 📚 Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

Tài liệu này sẽ được cập nhật khi có API mới. Vui lòng tham khảo source code để biết implementation chi tiết nhất.
