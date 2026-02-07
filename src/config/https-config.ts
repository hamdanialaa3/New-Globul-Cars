/**
 * HTTPS Configuration
 * Enforces HTTPS in production and secure contexts
 * Eliminates third-party cookie partition warnings
 */

/**
 * Check if current environment should use HTTPS
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if current connection is secure (HTTPS or localhost)
 */
export const isSecureContext = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Redirect to HTTPS if in production and not secure
 * Should be called early in app initialization
 */
export const enforceHttpsInProduction = () => {
  if (isProduction() && !isSecureContext()) {
    // Redirect from http to https
    const url = window.location.href.replace(/^http:/, 'https:');
    window.location.replace(url);
  }
};

/**
 * Get the correct API URL based on environment
 */
export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL || 'https://api.koliauction.com';
  }

  const protocol = isSecureContext() ? 'https' : 'http';
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  return `${protocol}://${hostname}`;
};

/**
 * Get Stripe or third-party service URL with secure context
 */
export const getSecureThirdPartyUrl = (baseUrl: string): string => {
  if (isSecureContext()) {
    return baseUrl.replace(/^http:/, 'https:');
  }
  return baseUrl;
};

/**
 * Initialize HTTPS enforcement on app start
 * Add this to your main App.tsx useEffect
 */
export const initializeHttpsEnforcement = () => {
  if (typeof window === 'undefined') return;

  if (isProduction()) {
    enforceHttpsInProduction();
    
    // Log HTTPS status
    console.info('[HTTPS] Production mode: HTTPS enforcement enabled');
  } else {
    console.info('[HTTPS] Development mode: HTTPS enforcement disabled');
  }

  // Monitor for mixed content warnings
  if (window.addEventListener) {
    window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
      console.warn('[Mixed Content] Security policy violation:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber
      });
    });
  }
};

export default {
  isProduction,
  isSecureContext,
  enforceHttpsInProduction,
  getApiUrl,
  getSecureThirdPartyUrl,
  initializeHttpsEnforcement
};
