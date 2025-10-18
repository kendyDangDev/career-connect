/**
 * HTML Parser utilities for job content processing
 */

export interface ParsedJobContent {
  description?: string;
  requirements?: string;
  benefits?: string;
}

/**
 * Check if content contains HTML tags
 */
export const isHtmlContent = (content: string): boolean => {
  if (!content) return false;
  
  // Check for common HTML tags
  const htmlTagRegex = /<[^>]*>/;
  return htmlTagRegex.test(content);
};

/**
 * Clean HTML content by removing dangerous tags and normalizing
 */
export const cleanHtmlContent = (content: string): string => {
  if (!content) return '';
  
  // Remove script and style tags completely
  let cleaned = content.replace(/<script[^>]*>.*?<\/script>/gis, '');
  cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gis, '');
  
  // Remove dangerous attributes
  cleaned = cleaned.replace(/\s*(onclick|onload|onerror|onmouseover)[^>]*/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Ensure proper HTML structure if it's a fragment
  if (!cleaned.includes('<html>') && !cleaned.includes('<body>')) {
    // Wrap in body tag for proper rendering
    cleaned = `<body>${cleaned}</body>`;
  }
  
  return cleaned;
};

/**
 * Parse job content to extract different sections
 * Looks for common patterns in job descriptions
 */
export const parseJobContent = (fullContent: string): ParsedJobContent => {
  if (!fullContent) {
    return {
      description: '',
      requirements: '',
      benefits: ''
    };
  }

  const content = fullContent.toLowerCase();
  const result: ParsedJobContent = {};

  // Define section keywords and patterns
  const sectionPatterns = {
    description: [
      'job description',
      'mô tả công việc',
      'about the role',
      'về vị trí này',
      'nhiệm vụ',
      'responsibilities'
    ],
    requirements: [
      'requirements',
      'yêu cầu',
      'qualifications',
      'skills',
      'kỹ năng',
      'kinh nghiệm',
      'experience'
    ],
    benefits: [
      'benefits',
      'quyền lợi',
      'package',
      'compensation',
      'what we offer',
      'chúng tôi cung cấp',
      'phúc lợi'
    ]
  };

  // Try to split content by sections
  const lines = fullContent.split('\n');
  let currentSection: keyof ParsedJobContent | null = null;
  let sectionContent: { [key in keyof ParsedJobContent]?: string[] } = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const lowerLine = trimmedLine.toLowerCase();

    // Check if line is a section header
    let foundSection: keyof ParsedJobContent | null = null;
    for (const [section, keywords] of Object.entries(sectionPatterns)) {
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        foundSection = section as keyof ParsedJobContent;
        break;
      }
    }

    if (foundSection) {
      currentSection = foundSection;
      if (!sectionContent[currentSection]) {
        sectionContent[currentSection] = [];
      }
      // Don't include the header line itself if it's just the keyword
      if (!sectionPatterns[currentSection].some(keyword => 
        lowerLine === keyword || lowerLine === keyword + ':'
      )) {
        sectionContent[currentSection]!.push(trimmedLine);
      }
    } else if (currentSection) {
      if (!sectionContent[currentSection]) {
        sectionContent[currentSection] = [];
      }
      sectionContent[currentSection]!.push(trimmedLine);
    } else {
      // If no section detected yet, assume it's description
      if (!sectionContent.description) {
        sectionContent.description = [];
      }
      sectionContent.description.push(trimmedLine);
    }
  }

  // Convert arrays back to strings
  if (sectionContent.description?.length) {
    result.description = sectionContent.description.join('\n');
  }
  if (sectionContent.requirements?.length) {
    result.requirements = sectionContent.requirements.join('\n');
  }
  if (sectionContent.benefits?.length) {
    result.benefits = sectionContent.benefits.join('\n');
  }

  // If no sections were found, return the full content as description
  if (!result.description && !result.requirements && !result.benefits) {
    result.description = fullContent;
  }

  return result;
};
