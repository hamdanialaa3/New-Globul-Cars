import { logger } from '../services/logger-service';

/**
 * CONSTITUTION COMPLIANCE AUDIT TOOL
 * 
 * This module validates that all car URLs follow the strict constitution pattern:
 * /car/{sellerNumericId}/{carNumericId}
 * 
 * Usage: Call auditCarUrl() before any navigate/redirect to ensure compliance
 */

interface CarUrlParams {
  sellerNumericId?: number | string;
  carNumericId?: number | string;
  ownerNumericId?: number | string;
  userCarSequenceId?: number | string;
}

/**
 * Validate and build constitution-compliant car URL
 * 
 * @param params - Car identifier parameters
 * @returns Valid URL string or null if invalid
 * 
 * @example
 * const url = buildStrictCarUrl({ sellerNumericId: 90, carNumericId: 5 });
 * // Returns: "/car/90/5"
 */
export const buildStrictCarUrl = (params: CarUrlParams): string | null => {
  const sellerId = params.sellerNumericId || params.ownerNumericId;
  const carId = params.carNumericId || params.userCarSequenceId;

  if (!sellerId || !carId) {
    logger.error('CONSTITUTION VIOLATION: Missing numeric IDs for car URL', params);
    return null;
  }

  const sellerNum = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
  const carNum = typeof carId === 'string' ? parseInt(carId, 10) : carId;

  if (isNaN(sellerNum) || isNaN(carNum) || sellerNum <= 0 || carNum <= 0) {
    logger.error('CONSTITUTION VIOLATION: Invalid numeric IDs', { sellerId, carId });
    return null;
  }

  return `/car/${sellerNum}/${carNum}`;
};

/**
 * Build strict profile URL
 * 
 * @param numericId - User numeric ID
 * @returns Valid URL string or null if invalid
 * 
 * @example
 * const url = buildStrictProfileUrl(90);
 * // Returns: "/profile/90"
 */
export const buildStrictProfileUrl = (numericId: number | string): string | null => {
  const id = typeof numericId === 'string' ? parseInt(numericId, 10) : numericId;

  if (isNaN(id) || id <= 0) {
    logger.error('CONSTITUTION VIOLATION: Invalid user numeric ID', { numericId });
    return null;
  }

  return `/profile/${id}`;
};

/**
 * Build strict edit car URL
 * 
 * @param params - Car identifier parameters
 * @returns Valid URL string or null if invalid
 * 
 * @example
 * const url = buildStrictEditUrl({ sellerNumericId: 90, carNumericId: 5 });
 * // Returns: "/car/90/5/edit"
 */
export const buildStrictEditUrl = (params: CarUrlParams): string | null => {
  const baseUrl = buildStrictCarUrl(params);
  return baseUrl ? `${baseUrl}/edit` : null;
};

/**
 * Build strict messaging URL
 * 
 * @param senderId - Sender numeric ID
 * @param recipientId - Recipient numeric ID
 * @returns Valid URL string or null if invalid
 * 
 * @example
 * const url = buildStrictMessagingUrl(1, 90);
 * // Returns: "/messages/1/90"
 */
export const buildStrictMessagingUrl = (
  senderId: number | string,
  recipientId: number | string
): string | null => {
  const sender = typeof senderId === 'string' ? parseInt(senderId, 10) : senderId;
  const recipient = typeof recipientId === 'string' ? parseInt(recipientId, 10) : recipientId;

  if (isNaN(sender) || isNaN(recipient) || sender <= 0 || recipient <= 0) {
    logger.error('CONSTITUTION VIOLATION: Invalid messaging numeric IDs', { senderId, recipientId });
    return null;
  }

  return `/messages/${sender}/${recipient}`;
};

/**
 * Audit existing URL for constitution compliance
 * 
 * @param url - URL to audit
 * @returns Object with compliance status and details
 */
export const auditUrl = (url: string): {
  compliant: boolean;
  type: 'car' | 'profile' | 'messages' | 'unknown';
  issues: string[];
} => {
  const issues: string[] = [];

  // Car URL pattern: /car/{sellerId}/{carId}
  const carMatch = url.match(/^\/car\/(\d+)\/(\d+)(?:\/edit)?$/);
  if (carMatch) {
    const [, seller, car] = carMatch;
    if (parseInt(seller) <= 0 || parseInt(car) <= 0) {
      issues.push('Invalid numeric IDs (must be positive integers)');
    }
    return { compliant: issues.length === 0, type: 'car', issues };
  }

  // Profile URL pattern: /profile/{userId}
  const profileMatch = url.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    const [, userId] = profileMatch;
    if (parseInt(userId) <= 0) {
      issues.push('Invalid user ID (must be positive integer)');
    }
    return { compliant: issues.length === 0, type: 'profile', issues };
  }

  // Messages URL pattern: /messages/{id1}/{id2}
  const messagesMatch = url.match(/^\/messages\/(\d+)\/(\d+)$/);
  if (messagesMatch) {
    const [, id1, id2] = messagesMatch;
    if (parseInt(id1) <= 0 || parseInt(id2) <= 0) {
      issues.push('Invalid numeric IDs (must be positive integers)');
    }
    return { compliant: issues.length === 0, type: 'messages', issues };
  }

  // Check for common violations
  if (url.includes('uuid') || url.includes('uid')) {
    issues.push('URL contains UUID/UID instead of numeric ID');
  }
  if (url.includes('/car-details/')) {
    issues.push('Legacy /car-details/ pattern detected (use /car/{seller}/{car})');
  }

  return { compliant: false, type: 'unknown', issues };
};

/**
 * Development helper: Log all URL patterns in component
 * Only runs in development mode
 */
export const logUrlPatterns = (componentName: string, urls: string[]): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const violations: string[] = [];
  urls.forEach(url => {
    const audit = auditUrl(url);
    if (!audit.compliant) {
      violations.push(`${url} -> ${audit.issues.join(', ')}`);
    }
  });

  if (violations.length > 0) {
    logger.warn(`[${componentName}] Constitution violations found:`, violations);
  }
};
