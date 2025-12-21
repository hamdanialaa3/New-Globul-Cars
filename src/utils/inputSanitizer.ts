/**
 * Input Sanitizer Utility
 * أداة تنظيف المدخلات
 * 
 * Sanitizes user input to prevent XSS attacks
 * تنظيف مدخلات المستخدم لمنع هجمات XSS
 * 
 * @since December 2025
 */

import { logger } from '../services/logger-service';

/**
 * Sanitize search input
 * تنظيف مدخلات البحث
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove dangerous characters but keep Bulgarian Cyrillic and English
  sanitized = sanitized.replace(/[<>\"']/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 200);

  return sanitized;
}

/**
 * Sanitize text input (for messages, comments, etc.)
 * تنظيف النص (للرسائل والتعليقات)
 */
export function sanitizeTextInput(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove dangerous characters but keep newlines and basic punctuation
  sanitized = sanitized.replace(/[<>\"']/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);

  return sanitized;
}

/**
 * Validate and sanitize email
 * التحقق من صحة البريد الإلكتروني وتنظيفه
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = email.trim().toLowerCase();

  if (!emailRegex.test(sanitized)) {
    logger.warn('Invalid email format', { email: sanitized });
    return null;
  }

  // Remove any HTML/script tags
  return sanitized.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize phone number (Bulgarian format)
 * التحقق من صحة رقم الهاتف البلغاري وتنظيفه
 */
export function sanitizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters except +
  let sanitized = phone.replace(/[^\d+]/g, '');

  // Bulgarian phone format: +359XXXXXXXXX
  if (sanitized.startsWith('+359')) {
    if (sanitized.length === 13) {
      return sanitized;
    }
  } else if (sanitized.startsWith('359')) {
    sanitized = '+' + sanitized;
    if (sanitized.length === 13) {
      return sanitized;
    }
  } else if (sanitized.startsWith('0')) {
    sanitized = '+359' + sanitized.substring(1);
    if (sanitized.length === 13) {
      return sanitized;
    }
  }

  logger.warn('Invalid phone number format', { phone, sanitized });
  return null;
}

/**
 * Sanitize URL
 * تنظيف الروابط
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  let sanitized = url.trim();

  // Remove HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Validate URL format
  try {
    const urlObj = new URL(sanitized);
    
    // Only allow http and https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      logger.warn('Invalid URL protocol', { url: sanitized });
      return null;
    }

    return sanitized;
  } catch (error) {
    logger.warn('Invalid URL format', { url: sanitized });
    return null;
  }
}

/**
 * Sanitize numeric input
 * تنظيف المدخلات الرقمية
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }

  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove all non-numeric characters except decimal point and minus
  const sanitized = input.replace(/[^\d.-]/g, '');
  const number = parseFloat(sanitized);

  if (isNaN(number)) {
    return null;
  }

  return number;
}

/**
 * Sanitize car make/model input
 * تنظيف مدخلات الماركة/الموديل
 */
export function sanitizeCarMakeModel(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous characters but keep alphanumeric, spaces, hyphens, and Cyrillic
  sanitized = sanitized.replace(/[<>\"'&]/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 50);

  return sanitized;
}

/**
 * Log sanitization attempt (for monitoring)
 * تسجيل محاولات التنظيف (للمراقبة)
 */
export function logSanitization(
  original: string,
  sanitized: string,
  type: string
): void {
  if (original !== sanitized) {
    logger.warn('Input was sanitized', {
      type,
      originalLength: original.length,
      sanitizedLength: sanitized.length,
      original: original.substring(0, 100), // Log first 100 chars only
      sanitized: sanitized.substring(0, 100)
    });
  }
}
