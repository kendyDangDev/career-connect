import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CVData, SectionType } from '../../../types/cvEditor.types';

interface CreativeTemplateProps {
  cvData: CVData;
  onSectionClick?: (sectionType: SectionType, data: any) => void;
  selectedSection?: SectionType;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({
  cvData,
  onSectionClick,
  selectedSection,
}) => {
  const handleSectionPress = (sectionType: SectionType, data: any) => {
    if (onSectionClick) {
      onSectionClick(sectionType, data);
    }
  };

  const renderPersonalInfo = () => (
    <TouchableOpacity
      style={[
        styles.headerSection,
        selectedSection === 'personalInfo' && styles.selectedSection,
      ]}
      onPress={() => handleSectionPress('personalInfo', cvData.personalInfo)}
    >
      <View style={styles.personalInfoContainer}>
        <View style={styles.avatarContainer}>
          {cvData.personalInfo.avatar ? (
            <Image
              source={{ uri: cvData.personalInfo.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
          <View style={styles.avatarOverlay} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.fullName}>{cvData.personalInfo.fullName || 'Your Name'}</Text>
          {cvData.personalInfo.title && (
            <Text style={styles.jobTitle}>{cvData.personalInfo.title}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContactInfo = () => (
    <TouchableOpacity
      style={[
        styles.section,
        styles.leftSection,
        selectedSection === 'contactInfo' && styles.selectedSection,
      ]}
      onPress={() => handleSectionPress('contactInfo', cvData.contactInfo)}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="call" size={20} color="#8b5cf6" />
        <Text style={styles.sectionTitle}>Liên hệ</Text>
      </View>
      <View style={styles.contactItem}>
        <Ionicons name="mail" size={16} color="#ec4899" />
        <Text style={styles.contactText}>{cvData.contactInfo.email || 'email@example.com'}</Text>
      </View>
      <View style={styles.contactItem}>
        <Ionicons name="call" size={16} color="#ec4899" />
        <Text style={styles.contactText}>{cvData.contactInfo.phone || '0123456789'}</Text>
      </View>
      {cvData.contactInfo.address && (
        <View style={styles.contactItem}>
          <Ionicons name="location" size={16} color="#ec4899" />
          <Text style={styles.contactText}>{cvData.contactInfo.address}</Text>
        </View>
      )}
      {cvData.contactInfo.linkedin && (
        <View style={styles.contactItem}>
          <Ionicons name="logo-linkedin" size={16} color="#ec4899" />
          <Text style={styles.contactText}>{cvData.contactInfo.linkedin}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSkills = () => {
    if (!cvData.skills || cvData.skills.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.leftSection,
          selectedSection === 'skills' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('skills', cvData.skills)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb" size={20} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Kỹ năng</Text>
        </View>
        <View style={styles.skillsContainer}>
          {cvData.skills.map((skill) => (
            <View key={skill.id} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillPercent}>{skill.percentage}%</Text>
              </View>
              <View style={styles.skillBarContainer}>
                <View
                  style={[
                    styles.skillBar,
                    { width: skill.percentage ? `${skill.percentage}%` : '0%' },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLanguages = () => {
    if (!cvData.languages || cvData.languages.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.leftSection,
          selectedSection === 'languages' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('languages', cvData.languages)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="language" size={20} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Ngoại ngữ</Text>
        </View>
        {cvData.languages.map((lang) => (
          <View key={lang.id} style={styles.languageItem}>
            <Text style={styles.languageName}>{lang.name}</Text>
            <View style={styles.proficiencyContainer}>
              <Text style={styles.proficiencyText}>
                {lang.proficiency === 'native' && 'Bản ngữ'}
                {lang.proficiency === 'fluent' && 'Thành thạo'}
                {lang.proficiency === 'conversational' && 'Giao tiếp'}
                {lang.proficiency === 'basic' && 'Cơ bản'}
              </Text>
            </View>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const renderCareerObjective = () => {
    if (!cvData.careerObjective) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.rightSection,
          selectedSection === 'careerObjective' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('careerObjective', cvData.careerObjective)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="flag" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Mục tiêu nghề nghiệp</Text>
        </View>
        <Text style={styles.bodyText}>{cvData.careerObjective}</Text>
      </TouchableOpacity>
    );
  };

  const renderExperience = () => {
    if (!cvData.experience || cvData.experience.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.rightSection,
          selectedSection === 'experience' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('experience', cvData.experience)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="briefcase" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
        </View>
        {cvData.experience.map((exp, index) => (
          <View key={exp.id} style={styles.experienceItem}>
            <View style={styles.timelineDot} />
            <View style={[styles.timelineLine, index === cvData.experience!.length - 1 && styles.lastTimelineLine]} />
            <View style={styles.experienceContent}>
              <Text style={styles.experienceTitle}>{exp.position}</Text>
              <Text style={styles.experienceCompany}>{exp.company}</Text>
              <Text style={styles.experiencePeriod}>
                {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
              </Text>
              {exp.description && (
                <Text style={styles.experienceDescription}>{exp.description}</Text>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <View style={styles.achievementsList}>
                  {exp.achievements.slice(0, 2).map((achievement, index) => (
                    <Text key={index} style={styles.achievementItem}>
                      ✦ {achievement}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const renderEducation = () => {
    if (!cvData.education || cvData.education.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.rightSection,
          selectedSection === 'education' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('education', cvData.education)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="school" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Học vấn</Text>
        </View>
        {cvData.education.map((edu, index) => (
          <View key={edu.id} style={styles.educationItem}>
            <View style={styles.timelineDot} />
            <View style={[styles.timelineLine, index === cvData.education!.length - 1 && styles.lastTimelineLine]} />
            <View style={styles.educationContent}>
              <Text style={styles.educationTitle}>{edu.school}</Text>
              {edu.degree && (
                <Text style={styles.educationDegree}>
                  {edu.degree} {edu.field && `- ${edu.field}`}
                </Text>
              )}
              <Text style={styles.educationPeriod}>
                {edu.startDate} - {edu.isCurrent ? 'Hiện tại' : edu.endDate}
              </Text>
              {edu.gpa && <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>}
            </View>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const renderProjects = () => {
    if (!cvData.projects || cvData.projects.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          styles.rightSection,
          selectedSection === 'projects' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('projects', cvData.projects)}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="code-slash" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Dự án nổi bật</Text>
        </View>
        {cvData.projects.slice(0, 2).map((project) => (
          <View key={project.id} style={styles.projectItem}>
            <Text style={styles.projectTitle}>{project.name}</Text>
            {project.role && (
              <Text style={styles.projectRole}>{project.role}</Text>
            )}
            {project.description && (
              <Text style={styles.projectDescription}>{project.description}</Text>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <View style={styles.techStack}>
                {project.technologies.slice(0, 4).map((tech, index) => (
                  <View key={index} style={styles.techTag}>
                    <Text style={styles.techTagText}>{tech}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  // Dynamic section rendering based on order and visibility
  const renderSectionByType = (sectionType: SectionType) => {
    // Skip if section is not visible
    if (cvData.sectionVisibility && !cvData.sectionVisibility[sectionType]) {
      return null;
    }

    switch (sectionType) {
      case 'personalInfo':
        return null; // PersonalInfo is always in header
      case 'contactInfo':
        return renderContactInfo();
      case 'careerObjective':
        return renderCareerObjective();
      case 'skills':
        return renderSkills();
      case 'education':
        return renderEducation();
      case 'experience':
        return renderExperience();
      case 'projects':
        return renderProjects();
      case 'languages':
        return renderLanguages();
      // Add other sections as needed
      default:
        return null;
    }
  };

  // Determine which sections go to which column based on their type
  const isLeftColumnSection = (sectionType: SectionType) => {
    return ['contactInfo', 'skills', 'languages', 'certificates', 'awards'].includes(sectionType);
  };

  const getOrderedSections = () => {
    const sectionOrder = cvData.sectionOrder || ['contactInfo', 'careerObjective', 'experience', 'education', 'skills', 'projects', 'languages'];
    return sectionOrder;
  };

  const leftColumnSections = getOrderedSections().filter(isLeftColumnSection);
  const rightColumnSections = getOrderedSections().filter(section => !isLeftColumnSection(section));

  return (
    <View style={styles.container}>
      {/* Header - PersonalInfo always visible */}
      {renderPersonalInfo()}

      {/* Three-column layout with dynamic sections */}
      <ScrollView style={styles.contentArea}>
        <View style={styles.threeColumnContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {leftColumnSections.map((sectionType) => (
              <React.Fragment key={sectionType}>
                {renderSectionByType(sectionType)}
              </React.Fragment>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {rightColumnSections.map((sectionType) => (
              <React.Fragment key={sectionType}>
                {renderSectionByType(sectionType)}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  headerSection: {
    backgroundColor: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  selectedSection: {
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 8,
    padding: 8,
    margin: 4,
  },
  personalInfoContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f59e0b',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameContainer: {
    alignItems: 'center',
  },
  fullName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  jobTitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  threeColumnContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 2,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    borderTopWidth: 4,
    borderTopColor: '#8b5cf6',
  },
  rightSection: {
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  bodyText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  skillsContainer: {
    gap: 12,
  },
  skillItem: {
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  skillPercent: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  skillBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    backgroundColor: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
    borderRadius: 4,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  proficiencyContainer: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proficiencyText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f59e0b',
    marginRight: 12,
    marginTop: 4,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  lastTimelineLine: {
    height: 0,
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    marginBottom: 4,
  },
  experiencePeriod: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 6,
  },
  achievementsList: {
    marginTop: 4,
  },
  achievementItem: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 2,
  },
  educationItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  educationContent: {
    flex: 1,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 4,
  },
  educationPeriod: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  gpaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  projectItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  projectRole: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  techTagText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '500',
  },
});
