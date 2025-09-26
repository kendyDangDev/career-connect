import { SectionConfig, SectionType, CVData } from '../types/cvEditor.types';

export const SECTION_CONFIGS: Record<SectionType, SectionConfig> = {
  personalInfo: {
    type: 'personalInfo',
    title: 'Thông tin cá nhân',
    icon: 'person-outline',
    description: 'Thông tin cơ bản về bản thân',
    isRequired: true,
    hasData: (cvData: CVData) => Boolean(cvData.personalInfo?.fullName)
  },
  contactInfo: {
    type: 'contactInfo',
    title: 'Thông tin liên hệ',
    icon: 'call-outline',
    description: 'Email, số điện thoại, địa chỉ',
    isRequired: true,
    hasData: (cvData: CVData) => Boolean(cvData.contactInfo?.email || cvData.contactInfo?.phone)
  },
  careerObjective: {
    type: 'careerObjective',
    title: 'Mục tiêu nghề nghiệp',
    icon: 'target-outline',
    description: 'Mục tiêu và định hướng phát triển',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.careerObjective)
  },
  experience: {
    type: 'experience',
    title: 'Kinh nghiệm làm việc',
    icon: 'briefcase-outline',
    description: 'Lịch sử công việc và kinh nghiệm',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.experience && cvData.experience.length > 0)
  },
  education: {
    type: 'education',
    title: 'Học vấn',
    icon: 'school-outline',
    description: 'Bằng cấp và quá trình học tập',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.education && cvData.education.length > 0)
  },
  skills: {
    type: 'skills',
    title: 'Kỹ năng',
    icon: 'build-outline',
    description: 'Kỹ năng chuyên môn và kỹ năng mềm',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.skills && cvData.skills.length > 0)
  },
  projects: {
    type: 'projects',
    title: 'Dự án',
    icon: 'folder-outline',
    description: 'Các dự án đã tham gia',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.projects && cvData.projects.length > 0)
  },
  certificates: {
    type: 'certificates',
    title: 'Chứng chỉ',
    icon: 'ribbon-outline',
    description: 'Chứng chỉ và bằng cấp chuyên môn',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.certificates && cvData.certificates.length > 0)
  },
  awards: {
    type: 'awards',
    title: 'Giải thưởng',
    icon: 'trophy-outline',
    description: 'Các giải thưởng và danh hiệu',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.awards && cvData.awards.length > 0)
  },
  activities: {
    type: 'activities',
    title: 'Hoạt động',
    icon: 'people-outline',
    description: 'Hoạt động xã hội và tình nguyện',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.activities && cvData.activities.length > 0)
  },
  languages: {
    type: 'languages',
    title: 'Ngôn ngữ',
    icon: 'language-outline',
    description: 'Khả năng sử dụng ngôn ngữ',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.languages && cvData.languages.length > 0)
  },
  references: {
    type: 'references',
    title: 'Người tham chiếu',
    icon: 'person-add-outline',
    description: 'Thông tin người tham chiếu',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.references && cvData.references.length > 0)
  },
  custom: {
    type: 'custom',
    title: 'Mục tùy chỉnh',
    icon: 'add-circle-outline',
    description: 'Thêm mục tùy chỉnh',
    isRequired: false,
    hasData: (cvData: CVData) => Boolean(cvData.customSections && cvData.customSections.length > 0)
  }
};

export const DEFAULT_SECTION_ORDER: SectionType[] = [
  'personalInfo',
  'contactInfo',
  'careerObjective',
  'experience',
  'education',
  'skills',
  'projects',
  'certificates',
  'awards',
  'activities',
  'languages',
  'references'
];

export const DEFAULT_SECTION_VISIBILITY: Record<SectionType, boolean> = {
  personalInfo: true,
  contactInfo: true,
  careerObjective: true,
  experience: true,
  education: true,
  skills: true,
  projects: false,
  certificates: false,
  awards: false,
  activities: false,
  languages: false,
  references: false,
  custom: false
};
