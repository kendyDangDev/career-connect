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

interface SimpleTemplateProps {
  cvData: CVData;
  onSectionClick?: (sectionType: SectionType, data: any) => void;
  selectedSection?: SectionType;
}

export const SimpleTemplate: React.FC<SimpleTemplateProps> = ({
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
        <View style={styles.nameContainer}>
          <Text style={styles.fullName}>{cvData.personalInfo.fullName || 'Your Name'}</Text>
          {cvData.personalInfo.title && (
            <Text style={styles.jobTitle}>{cvData.personalInfo.title}</Text>
          )}
        </View>
        {cvData.personalInfo.avatar ? (
          <Image
            source={{ uri: cvData.personalInfo.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={30} color="#666" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContactInfo = () => (
    <TouchableOpacity
      style={[
        styles.section,
        selectedSection === 'contactInfo' && styles.selectedSection,
      ]}
      onPress={() => handleSectionPress('contactInfo', cvData.contactInfo)}
    >
      <Text style={styles.sectionTitle}>LIÊN HỆ</Text>
      <View style={styles.contactRow}>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={14} color="#333" />
          <Text style={styles.contactText}>{cvData.contactInfo.email || 'email@example.com'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={14} color="#333" />
          <Text style={styles.contactText}>{cvData.contactInfo.phone || '0123456789'}</Text>
        </View>
        {cvData.contactInfo.address && (
          <View style={styles.contactItem}>
            <Ionicons name="location" size={14} color="#333" />
            <Text style={styles.contactText}>{cvData.contactInfo.address}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCareerObjective = () => {
    if (!cvData.careerObjective) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          selectedSection === 'careerObjective' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('careerObjective', cvData.careerObjective)}
      >
        <Text style={styles.sectionTitle}>MỤC TIÊU NGHỀ NGHIỆP</Text>
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
          selectedSection === 'experience' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('experience', cvData.experience)}
      >
        <Text style={styles.sectionTitle}>KINH NGHIỆM LÀM VIỆC</Text>
        {cvData.experience.map((exp) => (
          <View key={exp.id} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <Text style={styles.experienceTitle}>{exp.position}</Text>
              <Text style={styles.experienceCompany}>{exp.company}</Text>
            </View>
            <Text style={styles.experiencePeriod}>
              {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
            </Text>
            {exp.description && (
              <Text style={styles.experienceDescription}>{exp.description}</Text>
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
          selectedSection === 'education' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('education', cvData.education)}
      >
        <Text style={styles.sectionTitle}>HỌC VẤN</Text>
        {cvData.education.map((edu) => (
          <View key={edu.id} style={styles.educationItem}>
            <View style={styles.educationHeader}>
              <Text style={styles.educationTitle}>{edu.school}</Text>
              <Text style={styles.educationPeriod}>
                {edu.startDate} - {edu.isCurrent ? 'Hiện tại' : edu.endDate}
              </Text>
            </View>
            {edu.degree && (
              <Text style={styles.educationDegree}>
                {edu.degree} {edu.field && `- ${edu.field}`}
              </Text>
            )}
            {edu.gpa && <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const renderSkills = () => {
    if (!cvData.skills || cvData.skills.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          selectedSection === 'skills' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('skills', cvData.skills)}
      >
        <Text style={styles.sectionTitle}>KỸ NĂNG</Text>
        <View style={styles.skillsContainer}>
          {cvData.skills.map((skill, index) => (
            <Text key={skill.id} style={styles.skillItem}>
              {skill.name}{index < cvData.skills!.length - 1 ? ' • ' : ''}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderProjects = () => {
    if (!cvData.projects || cvData.projects.length === 0) return null;
    return (
      <TouchableOpacity
        style={[
          styles.section,
          selectedSection === 'projects' && styles.selectedSection,
        ]}
        onPress={() => handleSectionPress('projects', cvData.projects)}
      >
        <Text style={styles.sectionTitle}>DỰ ÁN</Text>
        {cvData.projects.map((project) => (
          <View key={project.id} style={styles.projectItem}>
            <Text style={styles.projectTitle}>{project.name}</Text>
            {project.role && (
              <Text style={styles.projectRole}>{project.role}</Text>
            )}
            {project.description && (
              <Text style={styles.projectDescription}>{project.description}</Text>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <Text style={styles.techList}>
                <Text style={styles.techLabel}>Công nghệ: </Text>
                {project.technologies.join(', ')}
              </Text>
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
        return renderPersonalInfo();
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
      // Add other sections as needed
      default:
        return null;
    }
  };

  const getOrderedSections = () => {
    const sectionOrder = cvData.sectionOrder || ['personalInfo', 'contactInfo', 'careerObjective', 'experience', 'education', 'skills', 'projects'];
    return sectionOrder;
  };

  return (
    <ScrollView style={styles.container}>
      {getOrderedSections().map((sectionType) => (
        <React.Fragment key={sectionType}>
          {renderSectionByType(sectionType)}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  section: {
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    paddingLeft: 0,
  },
  selectedSection: {
    backgroundColor: '#f8f9fa',
    borderLeftColor: '#000',
    paddingLeft: 12,
    marginLeft: -12,
    paddingVertical: 8,
  },
  personalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginLeft: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  bodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  experienceHeader: {
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  experienceCompany: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  experiencePeriod: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  achievementsList: {
    marginTop: 4,
  },
  achievementItem: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  educationPeriod: {
    fontSize: 12,
    color: '#999',
  },
  educationDegree: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  gpaText: {
    fontSize: 13,
    color: '#999',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    fontSize: 14,
    color: '#333',
  },
  projectItem: {
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  projectRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  techList: {
    fontSize: 13,
    color: '#666',
  },
  techLabel: {
    fontWeight: '500',
  },
});
