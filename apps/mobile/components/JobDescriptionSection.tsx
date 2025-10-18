import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { parseJobContent, cleanHtmlContent, isHtmlContent } from '../utils/htmlParser';

interface JobDescriptionSectionProps {
  description?: string;
  requirements?: string;
  benefits?: string;
  // Single content string from API (contains all sections)
  fullContent?: string;
}

const { width } = Dimensions.get('window');

const HtmlSectionBlock: React.FC<{ title: string; content?: string }> = ({ title, content }) => {
  if (!content) return null;

  // Custom styles for HTML rendering
  const tagsStyles = {
    body: {
      color: '#374151', // text-gray-700
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      marginBottom: 12,
      color: '#374151',
      fontSize: 16,
      lineHeight: 24,
    },
    ul: {
      marginBottom: 12,
      paddingLeft: 16,
    },
    ol: {
      marginBottom: 12,
      paddingLeft: 16,
    },
    li: {
      marginBottom: 6,
      color: '#374151',
      fontSize: 16,
      lineHeight: 24,
    },
    strong: {
      fontWeight: '600',
      color: '#111827', // text-gray-900
    },
    b: {
      fontWeight: '600',
      color: '#111827',
    },
    h1: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 12,
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
  };

  const systemFonts = ['System'];

  // Check if content is HTML or plain text
  const shouldRenderHtml = isHtmlContent(content);
  const cleanContent = shouldRenderHtml ? cleanHtmlContent(content) : content;

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>
      {shouldRenderHtml ? (
        <RenderHtml
          contentWidth={width - 64} // Account for padding
          source={{ html: cleanContent }}
          tagsStyles={tagsStyles}
          systemFonts={systemFonts}
        />
      ) : (
        <Text className="text-gray-700 text-base leading-6">
          {content}
        </Text>
      )}
    </View>
  );
};

const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({ description, requirements, benefits, fullContent }) => {
  // If fullContent is provided, parse it to extract sections
  let parsedDescription = description;
  let parsedRequirements = requirements;
  let parsedBenefits = benefits;

  if (fullContent && (!description && !requirements && !benefits)) {
    const parsed = parseJobContent(fullContent);
    parsedDescription = parsed.description;
    parsedRequirements = parsed.requirements;
    parsedBenefits = parsed.benefits;
  }

  if (!parsedDescription && !parsedRequirements && !parsedBenefits) return null;

  return (
    <View className="bg-white rounded-2xl mx-4 mb-24 p-6 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-4">About this job</Text>
      <HtmlSectionBlock title="Description" content={parsedDescription} />
      <HtmlSectionBlock title="Requirements" content={parsedRequirements} />
      <HtmlSectionBlock title="Benefits" content={parsedBenefits} />
    </View>
  );
};

export default JobDescriptionSection;
