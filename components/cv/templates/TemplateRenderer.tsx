import React from 'react';
import { View } from 'react-native';
import { CVData, SectionType } from '../../../types/cvEditor.types';
import { ModernTemplate } from './ModernTemplate';
import { SimpleTemplate } from './SimpleTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '../../../constants/sectionConfig';

interface TemplateRendererProps {
  cvData: CVData;
  templateId?: string;
  selectedSection?: SectionType;
  onSectionClick?: (sectionType: SectionType, data: any) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  cvData,
  templateId = 'template-modern',
  selectedSection,
  onSectionClick,
}) => {
  // Ensure cvData has sectionOrder and sectionVisibility
  const enhancedCvData = {
    ...cvData,
    sectionOrder: cvData.sectionOrder || DEFAULT_SECTION_ORDER,
    sectionVisibility: cvData.sectionVisibility || DEFAULT_SECTION_VISIBILITY,
  };

  const renderTemplate = () => {
    const commonProps = {
      cvData: enhancedCvData,
      selectedSection,
      onSectionClick,
    };

    switch (templateId) {
      case 'template-simple':
        return <SimpleTemplate {...commonProps} />;
      case 'template-creative':
        return <CreativeTemplate {...commonProps} />;
      case 'template-modern':
      default:
        return <ModernTemplate {...commonProps} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderTemplate()}</View>;
};
