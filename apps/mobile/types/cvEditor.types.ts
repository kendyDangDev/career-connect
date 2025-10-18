// CV Editor Types
export interface CVData {
  id?: string;
  templateId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  careerObjective?: string;
  skills?: Skill[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  certificates?: Certificate[];
  awards?: Award[];
  activities?: Activity[];
  languages?: Language[];
  references?: Reference[];
  customSections?: CustomSection[];
  sectionOrder?: SectionType[];
  sectionVisibility?: Record<SectionType, boolean>;
  metadata?: CVMetadata;
}

export interface PersonalInfo {
  fullName: string;
  title?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  facebook?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  percentage?: number;
  category?: string;
}

export interface Education {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  gpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  link?: string;
  highlights?: string[];
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Activity {
  id: string;
  name: string;
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  certifications?: string[];
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'timeline';
  content: any;
  order?: number;
}

export interface CVMetadata {
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  views?: number;
  downloads?: number;
  tags?: string[];
}

export type SectionType = 
  | 'personalInfo' 
  | 'contactInfo'
  | 'careerObjective'
  | 'skills'
  | 'education'
  | 'experience'
  | 'projects'
  | 'certificates'
  | 'awards'
  | 'activities'
  | 'languages'
  | 'references'
  | 'custom';

export interface EditableSectionProps {
  sectionType: SectionType;
  data: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export interface CVTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  isPremium?: boolean;
  layout: 'single-column' | 'two-column' | 'modern' | 'classic';
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  sections: {
    type: SectionType;
    title?: string;
    visible: boolean;
    order: number;
    column?: 'left' | 'right' | 'full';
  }[];
}

export interface SectionConfig {
  type: SectionType;
  title: string;
  icon: string;
  description: string;
  isRequired: boolean;
  hasData: (cvData: CVData) => boolean;
}

export interface DraggableSectionItem {
  key: string;
  sectionType: SectionType;
  title: string;
  icon: string;
  isVisible: boolean;
  isRequired: boolean;
  hasData: boolean;
}
