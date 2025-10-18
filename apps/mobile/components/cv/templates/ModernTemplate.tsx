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

interface ModernTemplateProps {
  cvData: CVData;
  onSectionClick?: (sectionType: SectionType, data: any) => void;
  selectedSection?: SectionType;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({
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
        styles.section,
        selectedSection === 'personalInfo' && styles.selectedSection,
      ]}
      onPress={() => handleSectionPress('personalInfo', cvData.personalInfo)}
    >
      <View style={styles.personalInfoContainer}>
        {cvData.personalInfo.avatar ? (
          <Image
            source={{ uri: cvData.personalInfo.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
        )}
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
      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.contactItem}>
        <Ionicons name="mail-outline" size={16} color="#2563eb" />
        <Text style={styles.contactText}>{cvData.contactInfo.email || 'email@example.com'}</Text>
      </View>
      <View style={styles.contactItem}>
        <Ionicons name="call-outline" size={16} color="#2563eb" />
        <Text style={styles.contactText}>{cvData.contactInfo.phone || '0123456789'}</Text>
      </View>
      {cvData.contactInfo.address && (
        <View style={styles.contactItem}>
          <Ionicons name="location-outline" size={16} color="#2563eb" />
          <Text style={styles.contactText}>{cvData.contactInfo.address}</Text>
        </View>
      )}
      {cvData.contactInfo.linkedin && (
        <View style={styles.contactItem}>
          <Ionicons name="logo-linkedin" size={16} color="#2563eb" />
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
        <Text style={styles.sectionTitle}>Kỹ năng</Text>
        {cvData.skills.map((skill) => (
          <View key={skill.id} style={styles.skillItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            {skill.percentage && (
              <View style={styles.skillBarContainer}>
                <View
                  style={[
                    styles.skillBar,
                    { width: `${skill.percentage}%` },
                  ]}
                />
              </View>
            )}
          </View>
        ))}
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
        <Text style={styles.sectionTitle}>Ngoại ngữ</Text>
        {cvData.languages.map((lang) => (
          <View key={lang.id} style={styles.languageItem}>
            <Text style={styles.languageName}>{lang.name}</Text>
            <Text style={styles.languageLevel}>
              {lang.proficiency === 'native' && 'Bản ngữ'}
              {lang.proficiency === 'fluent' && 'Thành thạo'}
              {lang.proficiency === 'conversational' && 'Giao tiếp'}
              {lang.proficiency === 'basic' && 'Cơ bản'}
            </Text>
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
        <Text style={styles.sectionTitle}>Mục tiêu nghề nghiệp</Text>
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
        <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
        {cvData.experience.map((exp) => (
          <View key={exp.id} style={styles.timelineItem}>
            <Text style={styles.timelinePeriod}>
              {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
            </Text>
            <Text style={styles.timelineTitle}>{exp.position}</Text>
            <Text style={styles.timelineSubtitle}>{exp.company}</Text>
            {exp.location && (
              <Text style={styles.bodyText}>📍 {exp.location}</Text>
            )}
            {exp.description && (
              <Text style={styles.bodyText}>{exp.description}</Text>
            )}
            {exp.achievements && exp.achievements.length > 0 && (
              <View style={styles.achievementsList}>
                {exp.achievements.map((achievement, index) => (
                  <Text key={index} style={styles.achievementItem}>
                    • {achievement}
                  </Text>
                ))}
              </View>
            )}
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
        <Text style={styles.sectionTitle}>Học vấn</Text>
        {cvData.education.map((edu) => (
          <View key={edu.id} style={styles.timelineItem}>
            <Text style={styles.timelinePeriod}>
              {edu.startDate} - {edu.isCurrent ? 'Hiện tại' : edu.endDate}
            </Text>
            <Text style={styles.timelineTitle}>{edu.school}</Text>
            {edu.degree && (
              <Text style={styles.timelineSubtitle}>
                {edu.degree} {edu.field && `- ${edu.field}`}
              </Text>
            )}
            {edu.gpa && <Text style={styles.bodyText}>GPA: {edu.gpa}</Text>}
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
        <Text style={styles.sectionTitle}>Dự án</Text>
        {cvData.projects.map((project) => (
          <View key={project.id} style={styles.timelineItem}>
            <Text style={styles.timelineTitle}>{project.name}</Text>
            {project.role && (
              <Text style={styles.timelineSubtitle}>{project.role}</Text>
            )}
            {project.description && (
              <Text style={styles.bodyText}>{project.description}</Text>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <View style={styles.techStack}>
                {project.technologies.map((tech, index) => (
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
      <View style={styles.headerSection}>
        {renderPersonalInfo()}
      </View>

      {/* Two-column layout with dynamic sections */}
      <ScrollView style={styles.contentArea}>
        <View style={styles.twoColumnContainer}>
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
    backgroundColor: '#f8fafc',
  },
  headerSection: {
    backgroundColor: '#2563eb',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  twoColumnContainer: {
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
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    borderLeftColor: '#2563eb',
  },
  rightSection: {
    borderLeftColor: '#10b981',
  },
  selectedSection: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  personalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#475569',
  },
  bodyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  skillItem: {
    marginBottom: 12,
  },
  skillName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 4,
  },
  skillBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  languageItem: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  languageLevel: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timelineItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  timelinePeriod: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '500',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 4,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  techTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  techTagText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
});
