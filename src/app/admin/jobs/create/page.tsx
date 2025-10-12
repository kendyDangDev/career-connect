'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  XMarkIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useJobMutations } from '@/hooks/useJobManagement';
import { CreateJobDTO } from '@/types/employer/job';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

interface FormErrors {
  [key: string]: string;
}

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${
    size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  }`} />
);

const CreateJobPage: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateJobDTO>>({
    jobType: 'FULL_TIME',
    workLocationType: 'ONSITE',
    experienceLevel: 'MID',
    currency: 'VND',
    salaryNegotiable: false,
    featured: false,
    urgent: false,
    skills: [],
    categories: []
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);

  const mutations = useJobMutations((operation, data) => {
    if (operation === 'create') {
      router.push(`/admin/jobs/${data.id}`);
    }
  });

  // Form steps configuration
  const steps = [
    {
      id: 0,
      title: 'Thông tin cơ bản',
      description: 'Tiêu đề và mô tả công việc'
    },
    {
      id: 1, 
      title: 'Yêu cầu & Quyền lợi',
      description: 'Chi tiết yêu cầu và quyền lợi'
    },
    {
      id: 2,
      title: 'Lương & Địa điểm',
      description: 'Thông tin lương và nơi làm việc'
    },
    {
      id: 3,
      title: 'Kỹ năng & Danh mục',
      description: 'Kỹ năng yêu cầu và phân loại'
    },
    {
      id: 4,
      title: 'Xem trước & Xuất bản',
      description: 'Kiểm tra và xuất bản'
    }
  ];

  // Form fields configuration for each step
  const formFields: { [key: number]: FormField[] } = {
    0: [
      { name: 'title', label: 'Tiêu đề công việc', type: 'text', required: true, placeholder: 'VD: Senior Frontend Developer' },
      { name: 'description', label: 'Mô tả công việc', type: 'textarea', required: true, rows: 6, placeholder: 'Mô tả chi tiết về công việc, trách nhiệm, môi trường làm việc...' },
      { name: 'jobType', label: 'Loại công việc', type: 'select', required: true, options: [
        { value: 'FULL_TIME', label: 'Toàn thời gian' },
        { value: 'PART_TIME', label: 'Bán thời gian' },
        { value: 'CONTRACT', label: 'Hợp đồng' },
        { value: 'INTERNSHIP', label: 'Thực tập' }
      ]},
      { name: 'experienceLevel', label: 'Cấp độ kinh nghiệm', type: 'select', required: true, options: [
        { value: 'ENTRY', label: 'Mới ra trường' },
        { value: 'MID', label: 'Trung cấp (2-5 năm)' },
        { value: 'SENIOR', label: 'Cao cấp (5+ năm)' },
        { value: 'LEAD', label: 'Trưởng nhóm' },
        { value: 'EXECUTIVE', label: 'Điều hành' }
      ]}
    ],
    1: [
      { name: 'requirements', label: 'Yêu cầu ứng viên', type: 'textarea', required: true, rows: 6, placeholder: 'Chi tiết về yêu cầu kinh nghiệm, kỹ năng, trình độ học vấn...' },
      { name: 'benefits', label: 'Quyền lợi', type: 'textarea', rows: 4, placeholder: 'Lương thưởng, phúc lợi, cơ hội phát triển...' }
    ],
    2: [
      { name: 'salaryMin', label: 'Lương tối thiểu', type: 'number', placeholder: 'VD: 15000000' },
      { name: 'salaryMax', label: 'Lương tối đa', type: 'number', placeholder: 'VD: 25000000' },
      { name: 'currency', label: 'Đơn vị tiền tệ', type: 'select', options: [
        { value: 'VND', label: 'VND' },
        { value: 'USD', label: 'USD' }
      ]},
      { name: 'salaryNegotiable', label: 'Lương thỏa thuận', type: 'checkbox' },
      { name: 'workLocationType', label: 'Hình thức làm việc', type: 'select', required: true, options: [
        { value: 'ONSITE', label: 'Tại văn phòng' },
        { value: 'REMOTE', label: 'Từ xa' },
        { value: 'HYBRID', label: 'Lai ghép' }
      ]},
      { name: 'locationCity', label: 'Thành phố', type: 'text', placeholder: 'VD: Hà Nội' },
      { name: 'locationProvince', label: 'Tỉnh/Thành phố', type: 'text', placeholder: 'VD: Hà Nội' },
      { name: 'applicationDeadline', label: 'Hạn nộp hồ sơ', type: 'date' }
    ]
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};
    const fields = formFields[step] || [];

    fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name as keyof CreateJobDTO];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field.name] = `${field.label} là bắt buộc`;
        }
      }

      // Additional validations
      if (field.name === 'title' && formData.title) {
        if (formData.title.length < 10) {
          errors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
        }
        if (formData.title.length > 200) {
          errors.title = 'Tiêu đề không được quá 200 ký tự';
        }
      }

      if (field.name === 'description' && formData.description) {
        if (formData.description.length < 50) {
          errors.description = 'Mô tả phải có ít nhất 50 ký tự';
        }
      }

      if (field.name === 'requirements' && formData.requirements) {
        if (formData.requirements.length < 50) {
          errors.requirements = 'Yêu cầu ứng viên phải có ít nhất 50 ký tự';
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !selectedSkills.find(s => s.name === skill)) {
      const newSkill = {
        skillId: `temp-${Date.now()}`, // Temporary ID - should be replaced with real skill ID
        name: skill,
        requiredLevel: 'PREFERRED' as const
      };
      setSelectedSkills(prev => [...prev, newSkill]);
      setSkillInput('');
    }
  };

  const handleSkillRemove = (index: number) => {
    setSelectedSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE' = 'DRAFT') => {
    // Final validation
    let isValid = true;
    for (let i = 0; i < 3; i++) {
      if (!validateStep(i)) {
        isValid = false;
        setActiveStep(i);
        break;
      }
    }

    if (!isValid) return;

    // Prepare final data
    const jobData: CreateJobDTO = {
      ...formData as Required<CreateJobDTO>,
      skills: selectedSkills.map(skill => ({
        skillId: skill.skillId,
        requiredLevel: skill.requiredLevel,
        minYearsExperience: skill.minYearsExperience || 0
      })),
      categories: formData.categories || []
    };

    try {
      await mutations.createJob(jobData);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.name as keyof CreateJobDTO];
    const error = formErrors[field.name];

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
    }`;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, field.type === 'number' ? +e.target.value : e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={baseClasses}
          />
        );
      
      case 'select':
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseClasses}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">{field.label}</label>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
      case 1:
      case 2:
        return (
          <div className="space-y-6">
            {formFields[activeStep]?.map(field => (
              <div key={field.name}>
                {field.type !== 'checkbox' && (
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderFormField(field)}
                {formErrors[field.name] && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {formErrors[field.name]}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỹ năng yêu cầu
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd(skillInput)}
                  placeholder="Nhập kỹ năng và nhấn Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleSkillAdd(skillInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-800">Xem trước việc làm</h3>
              </div>
              <p className="text-yellow-700 mt-2">
                Hãy kiểm tra lại tất cả thông tin trước khi xuất bản việc làm
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Tiêu đề:</span> {formData.title}</div>
                  <div><span className="text-gray-500">Loại:</span> {formData.jobType}</div>
                  <div><span className="text-gray-500">Kinh nghiệm:</span> {formData.experienceLevel}</div>
                  <div><span className="text-gray-500">Địa điểm:</span> {formData.locationCity}, {formData.locationProvince}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lương & Quyền lợi</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Mức lương:</span>{' '}
                    {formData.salaryNegotiable ? 'Thỏa thuận' : 
                     `${formData.salaryMin?.toLocaleString()} - ${formData.salaryMax?.toLocaleString()} ${formData.currency}`}
                  </div>
                  <div><span className="text-gray-500">Kỹ năng:</span> {selectedSkills.length} kỹ năng</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={mutations.loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {mutations.loading ? <LoadingSpinner size="sm" /> : 'Lưu nháp'}
              </button>
              <button
                onClick={() => handleSubmit('ACTIVE')}
                disabled={mutations.loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {mutations.loading ? <LoadingSpinner size="sm" /> : 'Xuất bản ngay'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo việc làm mới</h1>
        <p className="mt-1 text-gray-600">Điền thông tin chi tiết để tạo bài đăng tuyển dụng</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <nav className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= activeStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < activeStep ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index <= activeStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                  index < activeStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">{steps[activeStep].title}</h2>
          <p className="text-gray-600">{steps[activeStep].description}</p>
        </div>

        {mutations.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Có lỗi xảy ra
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {mutations.error}
                </div>
              </div>
            </div>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={activeStep === 0}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay lại
          </button>
          
          {activeStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tiếp theo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;