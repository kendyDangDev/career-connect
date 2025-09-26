/**
 * Utility functions to handle HTML content from API
 */

export interface ParsedJobContent {
  description?: string;
  requirements?: string;
  benefits?: string;
}

/**
 * Parse job content from API response
 * API returns content in format:
 * "About this job\nDescription\n<p>content...</p>\nRequirements\n<ul>...</ul>\nBenefits\n<ul>...</ul>"
 */
export const parseJobContent = (content: string): ParsedJobContent => {
  if (!content) return {};

  const result: ParsedJobContent = {};

  // Split content by main sections
  const sections = content.split(/(?=(?:Description|Requirements|Benefits))/i);

  sections.forEach(section => {
    const trimmedSection = section.trim();
    
    if (trimmedSection.toLowerCase().startsWith('description')) {
      // Extract HTML content after "Description"
      const htmlContent = trimmedSection.replace(/^description\s*/i, '').trim();
      if (htmlContent) {
        result.description = htmlContent;
      }
    } else if (trimmedSection.toLowerCase().startsWith('requirements')) {
      // Extract HTML content after "Requirements"
      const htmlContent = trimmedSection.replace(/^requirements\s*/i, '').trim();
      if (htmlContent) {
        result.requirements = htmlContent;
      }
    } else if (trimmedSection.toLowerCase().startsWith('benefits')) {
      // Extract HTML content after "Benefits"
      const htmlContent = trimmedSection.replace(/^benefits\s*/i, '').trim();
      if (htmlContent) {
        result.benefits = htmlContent;
      }
    }
  });

  return result;
};

/**
 * Clean HTML content by removing unnecessary whitespace and formatting
 */
export const cleanHtmlContent = (html: string): string => {
  if (!html) return '';

  return html
    .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/>\s+</g, '><'); // Remove whitespace between tags
};

/**
 * Extract plain text from HTML for preview/summary
 */
export const extractPlainText = (html: string): string => {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Check if content contains HTML tags
 */
export const isHtmlContent = (content: string): boolean => {
  if (!content) return false;
  return /<[^>]*>/.test(content);
};
