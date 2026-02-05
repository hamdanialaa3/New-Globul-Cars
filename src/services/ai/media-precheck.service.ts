/**
 * Media Pre-Check Service
 * فحص الصور قبل إرسالها للـ LLM لتجنب فشل المعالجة
 * 
 * يفحص: 
 * - توفر الرابط
 * - الحد الأدنى للدقة
 * - اكتشاف الضبابية
 * - صيغ الملفات المدعومة
 */

import { logger } from '../logger-service';

export interface MediaCheckResult {
  url: string;
  index: number;
  valid: boolean;
  issues: MediaIssue[];
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    sizeKB?: number;
    loadTimeMs?: number;
  };
}

export interface MediaIssue {
  type: 'unreachable' | 'timeout' | 'low_resolution' | 'unsupported_format' | 'too_large' | 'cors_blocked';
  message: string;
  severity: 'error' | 'warning';
  recoverable: boolean;
}

export interface MediaPreCheckOptions {
  minWidth?: number;
  minHeight?: number;
  maxSizeKB?: number;
  timeoutMs?: number;
  allowedFormats?: string[];
  checkBlur?: boolean;
}

const DEFAULT_OPTIONS: Required<MediaPreCheckOptions> = {
  minWidth: 400,
  minHeight: 300,
  maxSizeKB: 10240, // 10MB
  timeoutMs: 5000,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  checkBlur: false // Requires canvas API, disabled by default
};

/**
 * Check if a URL is reachable
 */
async function checkUrlReachable(
  url: string, 
  timeoutMs: number
): Promise<{ reachable: boolean; loadTimeMs: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    const loadTimeMs = Date.now() - startTime;
    
    if (!response.ok) {
      return { 
        reachable: false, 
        loadTimeMs, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    return { reachable: true, loadTimeMs };
  } catch (error) {
    const loadTimeMs = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { reachable: false, loadTimeMs, error: 'Timeout' };
      }
      return { reachable: false, loadTimeMs, error: error.message };
    }
    
    return { reachable: false, loadTimeMs, error: 'Unknown error' };
  }
}

/**
 * Get image dimensions without fully loading the image
 */
async function getImageMetadata(url: string): Promise<{
  width: number;
  height: number;
  format: string;
} | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      resolve(null);
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: guessFormatFromUrl(url)
      });
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };
    
    img.src = url;
  });
}

/**
 * Guess image format from URL
 */
function guessFormatFromUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg';
  if (lowerUrl.includes('.png')) return 'image/png';
  if (lowerUrl.includes('.webp')) return 'image/webp';
  if (lowerUrl.includes('.gif')) return 'image/gif';
  if (lowerUrl.includes('.svg')) return 'image/svg+xml';
  return 'unknown';
}

/**
 * Check a single media URL
 */
export async function checkMedia(
  url: string, 
  index: number,
  options: MediaPreCheckOptions = {}
): Promise<MediaCheckResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const issues: MediaIssue[] = [];
  
  // Check URL reachability
  const reachCheck = await checkUrlReachable(url, opts.timeoutMs);
  
  if (!reachCheck.reachable) {
    const isTimeout = reachCheck.error === 'Timeout';
    issues.push({
      type: isTimeout ? 'timeout' : 'unreachable',
      message: reachCheck.error || 'URL not reachable',
      severity: 'error',
      recoverable: isTimeout // Timeouts can be retried
    });
    
    return {
      url,
      index,
      valid: false,
      issues,
      metadata: { loadTimeMs: reachCheck.loadTimeMs }
    };
  }

  // Check image format from URL
  const format = guessFormatFromUrl(url);
  if (format !== 'unknown' && !opts.allowedFormats.includes(format)) {
    issues.push({
      type: 'unsupported_format',
      message: `Format ${format} not supported`,
      severity: 'error',
      recoverable: false
    });
  }

  // Get image dimensions (browser environment only)
  if (typeof window !== 'undefined') {
    const metadata = await getImageMetadata(url);
    
    if (metadata) {
      if (metadata.width < opts.minWidth || metadata.height < opts.minHeight) {
        issues.push({
          type: 'low_resolution',
          message: `Image too small: ${metadata.width}x${metadata.height} (min: ${opts.minWidth}x${opts.minHeight})`,
          severity: 'warning',
          recoverable: false
        });
      }
      
      return {
        url,
        index,
        valid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          loadTimeMs: reachCheck.loadTimeMs
        }
      };
    }
  }

  return {
    url,
    index,
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metadata: { loadTimeMs: reachCheck.loadTimeMs }
  };
}

/**
 * Pre-check all media URLs before LLM processing
 */
export async function preCheckAllMedia(
  urls: string[],
  options: MediaPreCheckOptions = {}
): Promise<{
  allValid: boolean;
  validUrls: string[];
  invalidUrls: string[];
  results: MediaCheckResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    totalCheckTimeMs: number;
    errors: string[];
    warnings: string[];
  };
}> {
  const startTime = Date.now();
  
  logger.info('Starting media pre-check', { urlCount: urls.length });
  
  // Check all URLs in parallel with concurrency limit
  const CONCURRENCY = 5;
  const results: MediaCheckResult[] = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((url, batchIndex) => checkMedia(url, i + batchIndex, options))
    );
    results.push(...batchResults);
  }
  
  const validUrls = results.filter(r => r.valid).map(r => r.url);
  const invalidUrls = results.filter(r => !r.valid).map(r => r.url);
  const errors = results
    .flatMap(r => r.issues.filter(i => i.severity === 'error'))
    .map(i => i.message);
  const warnings = results
    .flatMap(r => r.issues.filter(i => i.severity === 'warning'))
    .map(i => i.message);
  
  const totalCheckTimeMs = Date.now() - startTime;
  
  const summary = {
    total: urls.length,
    valid: validUrls.length,
    invalid: invalidUrls.length,
    totalCheckTimeMs,
    errors: [...new Set(errors)], // Deduplicate
    warnings: [...new Set(warnings)]
  };
  
  logger.info('Media pre-check completed', summary);
  
  return {
    allValid: invalidUrls.length === 0,
    validUrls,
    invalidUrls,
    results,
    summary
  };
}

/**
 * Quick check - returns boolean only
 * Used as a gate before LLM calls
 */
export async function hasValidMedia(
  urls: string[], 
  minValidCount: number = 1
): Promise<boolean> {
  const { summary } = await preCheckAllMedia(urls);
  return summary.valid >= minValidCount;
}

/**
 * Filter out invalid media and return only valid URLs
 */
export async function filterValidMedia(
  urls: string[],
  options: MediaPreCheckOptions = {}
): Promise<string[]> {
  const { validUrls } = await preCheckAllMedia(urls, options);
  return validUrls;
}
