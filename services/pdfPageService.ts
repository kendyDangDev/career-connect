/**
 * PDF Page Service - Convert PDF to multiple page images for multi-page viewing
 */

export interface PDFPageInfo {
  pageUrls: string[];
  totalPages: number;
  originalUrl: string;
} 

class PDFPageService {

  /**
   * Convert PDF URL to multiple page image URLs using Cloudinary
   */
  async getPDFPages(pdfUrl: string): Promise<PDFPageInfo> {
    try {
      console.log('🔍 Converting PDF to pages:', pdfUrl);

      // Use Cloudinary PDF conversion (if PDF is on Cloudinary)
      const cloudinaryResponse = await this.tryCloudinaryConversion(pdfUrl);
      if (cloudinaryResponse) {
        return cloudinaryResponse;
      }

      // Fallback - return single page (original PDF)
      console.log('📄 Fallback to single page view');
      return {
        pageUrls: [pdfUrl],
        totalPages: 1,
        originalUrl: pdfUrl,
      };
    } catch (error) {
      console.error('💥 Error converting PDF pages:', error);
      // Return single page fallback
      return {
        pageUrls: [pdfUrl],
        totalPages: 1,
        originalUrl: pdfUrl,
      };
    }
  }

  /**
   * Convert PDF using Cloudinary transformations
   */
  private async tryCloudinaryConversion(pdfUrl: string): Promise<PDFPageInfo | null> {
    try {
      // Check if URL is from Cloudinary
      if (!pdfUrl.includes('cloudinary.com')) {
        return null;
      }

      // Extract public ID from Cloudinary URL
      const publicId = this.extractCloudinaryPublicId(pdfUrl);
      if (!publicId) {
        return null;
      }

      // Generate page URLs using Cloudinary transformations
      const pageUrls = await this.generateCloudinaryPageUrls(publicId, pdfUrl);
      
      if (pageUrls.length > 1) {
        console.log('✅ Cloudinary conversion successful:', pageUrls.length, 'pages');
        return {
          pageUrls,
          totalPages: pageUrls.length,
          originalUrl: pdfUrl,
        };
      }
    } catch {
      console.log('⚠️ Cloudinary conversion failed');
    }
    return null;
  }

  /**
   * Extract Cloudinary public ID from URL
   */
  private extractCloudinaryPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/raw/upload/sample.pdf
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate Cloudinary page URLs for PDF
   */
  private async generateCloudinaryPageUrls(publicId: string, originalUrl: string): Promise<string[]> {
    try {
      // Get cloud name from original URL
      const cloudMatch = originalUrl.match(/\/\/res\.cloudinary\.com\/([^\/]+)\//);
      if (!cloudMatch) {
        return [originalUrl];
      }
      
      const cloudName = cloudMatch[1];
      const pageUrls: string[] = [];

      // Try to get PDF info to determine page count
      // For now, we'll try up to 10 pages and see which ones exist
      const maxPages = 10;
      
      for (let page = 1; page <= maxPages; page++) {
        const pageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_jpg,pg_${page}/${publicId}.jpg`;
        
        // Check if page exists
        const exists = await this.checkImageExists(pageUrl);
        if (exists) {
          pageUrls.push(pageUrl);
        } else {
          // If page doesn't exist, we've reached the end
          break;
        }
      }

      return pageUrls.length > 0 ? pageUrls : [originalUrl];
    } catch {
      console.error('Error generating Cloudinary pages');
      return [originalUrl];
    }
  }

  /**
   * Check if image URL exists
   */
  private async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get high-quality image URL for a specific page
   */
  getHighQualityPageUrl(originalPageUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
    if (!originalPageUrl.includes('cloudinary.com')) {
      return originalPageUrl;
    }

    let qualityTransform = '';
    switch (quality) {
      case 'low':
        qualityTransform = 'q_auto:low,w_800';
        break;
      case 'medium':
        qualityTransform = 'q_auto:good,w_1200';
        break;
      case 'high':
        qualityTransform = 'q_auto:best,w_1600';
        break;
    }

    // Insert quality transform into URL
    return originalPageUrl.replace('/upload/', `/upload/${qualityTransform}/`);
  }
}

export default new PDFPageService();
