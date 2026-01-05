// Share Utilities
// أدوات المشاركة

import { logger } from '../services/logger-service';

export interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Share content using Web Share API or fallback to clipboard
 * 
 * @param data - Share data (title, text, url)
 * @returns Promise<void>
 */
export const shareContent = async (data: ShareData): Promise<void> => {
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      logger.info('Content shared successfully', { title: data.title });
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(data.url);
      logger.info('Link copied to clipboard', { url: data.url });
      
      // Show a notification (you can integrate with toast here)
      if (typeof window !== 'undefined') {
        alert('Link copied to clipboard!');
      }
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      // AbortError is thrown when user cancels share, which is not an error
      logger.error('Error sharing content', error as Error, { data });
      throw error;
    }
  }
};

/**
 * Check if Web Share API is supported
 */
export const isShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    logger.info('Text copied to clipboard');
    return true;
  } catch (error) {
    logger.error('Failed to copy to clipboard', error as Error);
    return false;
  }
};
