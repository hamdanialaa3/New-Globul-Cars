import { logger } from '../services/logger-service';
// Sentry Error Monitoring (FREE - 5K errors/month)
// Track errors, performance, user sessions

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry (FREE tier - 5,000 errors/month)
 * Add to index.tsx BEFORE ReactDOM.render
 * 
 * Features included in FREE tier:
 * - Error tracking (5K/month)
 * - Performance monitoring (10K transactions/month)
 * - Session replay (free trial, then paid)
 * - Source maps support
 * - Release tracking
 * - User feedback
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn || dsn === 'https://your-sentry-dsn@sentry.io/project-id') {
    logger.warn('⚠️ Sentry DSN not configured - error monitoring disabled');
    return;
  }
  
  Sentry.init({
    dsn,
    
    // Environment (FREE - helps filter errors)
    environment: process.env.NODE_ENV || 'development',
    
    // Release tracking (FREE - track which version has bugs)
    release: `koli-one@${import.meta.env.VITE_VERSION || '1.0.0'}`,
    
    // Performance monitoring (FREE - 10K transactions/month)
    integrations: [
      new BrowserTracing({
        // Track navigation performance
        tracingOrigins: ['localhost', 'koli.one', 'mobilebg.eu', /^\//, /fire-new-globul/],
      }),
    ],
    
    // Performance sample rate (FREE tier limit)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod
    
    // Error filtering (FREE - reduce noise)
    beforeSend(event, hint) {
      // Ignore development errors
      if (process.env.NODE_ENV !== 'production') {
        return null;
      }
      
      // Ignore browser extension errors
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('chrome-extension://')
      )) {
        return null;
      }
      
      // Ignore network errors (too noisy)
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      
      return event;
    },
    
    // Ignore certain errors (FREE - save your quota)
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Random plugins
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    
    // User privacy (GDPR compliant - FREE)
    beforeBreadcrumb(breadcrumb) {
      // Don't send user input data
      if (breadcrumb.category === 'ui.input') {
        return null;
      }
      return breadcrumb;
    },
  });
  
  logger.info('✅ Sentry error monitoring initialized');
};

/**
 * Set user context (FREE - helps debug user-specific issues)
 */
export const setSentryUser = (userId: string, email?: string, profileType?: string) => {
  Sentry.setUser({
    id: userId,
    email: email || undefined,
    profileType,
  });
};

/**
 * Clear user context (FREE - on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add custom context (FREE - extra debugging info)
 */
export const setSentryContext = (key: string, data: any) => {
  Sentry.setContext(key, data);
};

/**
 * Add breadcrumb (FREE - track user actions before error)
 */
export const addSentryBreadcrumb = (message: string, category: string, data?: any) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

/**
 * Capture exception manually (FREE - custom error handling)
 */
export const captureException = (error: Error, context?: any) => {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext('additional', context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Capture message (FREE - non-error events)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Track performance (FREE - 10K transactions/month)
 */
export const trackPerformance = (name: string, operation: string) => {
  const transaction = Sentry.startTransaction({
    name,
    op: operation,
  });
  
  return {
    finish: () => transaction.finish(),
    setData: (key: string, value: any) => transaction.setData(key, value),
  };
};

/**
 * Custom error boundary (FREE - React integration)
 * Wrap your App with this
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Show user feedback dialog (FREE - collect user reports)
 */
export const showFeedbackDialog = () => {
  const eventId = Sentry.lastEventId();
  if (eventId) {
    Sentry.showReportDialog({
      eventId,
      title: 'Нещо се обърка!',
      subtitle: 'Нашият екип е известен за грешката.',
      subtitle2: 'Ако искате да помогнете, опишете какво се случи.',
      labelName: 'Име',
      labelEmail: 'Имейл',
      labelComments: 'Какво се случи?',
      labelClose: 'Затвори',
      labelSubmit: 'Изпрати',
      errorGeneric: 'Възникна грешка при изпращането. Моля, опитайте отново.',
      errorFormEntry: 'Някои полета са невалидни. Моля, коригирайте грешките и опитайте отново.',
      successMessage: 'Благодарим! Вашият доклад беше изпратен.',
    });
  }
};

// ========== Custom Error Handlers (FREE) ==========

/**
 * Handle Firebase errors (FREE - track Firebase issues)
 */
export const handleFirebaseError = (error: any, operation: string) => {
  captureException(error, {
    operation,
    code: (error as any).code,
    message: (error as Error).message,
  });
  
  logger.error(`Firebase ${operation} error:`, error);
};

/**
 * Handle API errors (FREE - track backend issues)
 */
export const handleAPIError = (error: any, endpoint: string, method: string) => {
  captureException(error, {
    endpoint,
    method,
    status: (error as any).response?.status,
    data: (error as any).response?.data,
  });
  
  logger.error(`API ${method} ${endpoint} error:`, error);
};

/**
 * Handle validation errors (FREE - track UX issues)
 */
export const handleValidationError = (field: string, value: any, rule: string) => {
  captureMessage(`Validation error: ${field} failed ${rule}`, 'warning');
  
  addSentryBreadcrumb('Validation error', 'validation', {
    field,
    value,
    rule,
  });
};

// ========== Performance Monitoring (FREE - 10K/month) ==========

/**
 * Track component render time (FREE)
 * 
 * @example
 * const perf = trackComponentRender('CarDetailsPage');
 * // ... component logic
 * perf.finish();
 */
export const trackComponentRender = (componentName: string) => {
  return trackPerformance(`render.${componentName}`, 'ui.react.render');
};

/**
 * Track API call performance (FREE)
 */
export const trackAPICall = (endpoint: string, method: string) => {
  return trackPerformance(`api.${method}.${endpoint}`, 'http.client');
};

/**
 * Track Firebase query performance (FREE)
 */
export const trackFirebaseQuery = (collection: string, operation: string) => {
  return trackPerformance(`firebase.${collection}.${operation}`, 'db.query');
};

/**
 * Environment variables needed (.env):
 * 
 * REACT_APP_SENTRY_DSN=https://your-key@sentry.io/project-id
 * REACT_APP_VERSION=1.0.0
 * 
 * Setup steps (FREE):
 * 1. Create account at sentry.io (FREE tier - 5K errors/month)
 * 2. Create new React project
 * 3. Copy DSN to .env
 * 4. Add to index.tsx:
 *    import { initSentry } from './utils/sentry';
 *    initSentry();
 * 5. Wrap App with ErrorBoundary:
 *    import { SentryErrorBoundary } from './utils/sentry';
 *    <SentryErrorBoundary fallback={<ErrorPage />}>
 *      <App />
 *    </SentryErrorBoundary>
 */

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  addSentryBreadcrumb,
  captureException,
  captureMessage,
  trackPerformance,
  SentryErrorBoundary,
  showFeedbackDialog,
  handleFirebaseError,
  handleAPIError,
  handleValidationError,
  trackComponentRender,
  trackAPICall,
  trackFirebaseQuery,
};
