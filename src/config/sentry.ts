/**
 * Sentry Configuration for Error Tracking and Performance Monitoring
 * 
 * Setup Instructions:
 * 1. Install packages: npm install @sentry/react @sentry/tracing
 * 2. Create Sentry account at sentry.io
 * 3. Get DSN from project settings
 * 4. Add REACT_APP_SENTRY_DSN to .env
 * 5. Import and call initSentry() in index.tsx before ReactDOM.render
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
    // Only initialize in production
    if (process.env.NODE_ENV !== 'production') {
    // Sentry disabled in development

    const dsn = process.env.REACT_APP_SENTRY_DSN;

    if (!dsn) {
// Sentry DSN not configured
        return;
    }

    Sentry.init({
        dsn,

        // Set environment
        environment: process.env.NODE_ENV,

        // Release version (use git commit hash or package version)
        release: `bulgarian-car-marketplace@${process.env.REACT_APP_VERSION || '1.0.0'}`,

        // Performance Monitoring
        integrations: [
            new BrowserTracing({
                // Trace all routes
                routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                    // Will be provided by React Router
                ),
            }),
        ],

        // Sample rate for performance monitoring (0.0 to 1.0)
        // 0.1 = 10% of transactions
        tracesSampleRate: 0.1,

        // Sample rate for error tracking (0.0 to 1.0)
        // 1.0 = 100% of errors
        sampleRate: 1.0,

        // Ignore specific errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'chrome-extension://',
            'moz-extension://',

            // Network errors (often user connectivity issues)
            'NetworkError',
            'Network request failed',

            // Firebase quota errors (expected in free tier)
            'quota-exceeded',

            // User cancelled actions
            'AbortError',
            'User cancelled',
        ],

        // Before sending error, filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data from error context
            if (event.request) {
                delete event.request.cookies;
                delete event.request.headers;
            }

            // Filter out errors from specific users (e.g., test accounts)
            if (event.user?.email?.includes('@test.com')) {
                return null;
            }

            return event;
        },

        // Before sending breadcrumb
        beforeBreadcrumb(breadcrumb) {
            // Don't send console.log breadcrumbs
            if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
                return null;
            }

            return breadcrumb;
        },
    });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: {
    id: string;
    email?: string;
    username?: string;
    planTier?: string;
}) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        planTier: user.planTier,
    });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setSentryContext(context: Record<string, any>) {
    Sentry.setContext('custom', context);
}

/**
 * Manually capture exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
    if (context) {
        Sentry.setContext('error_context', context);
    }
    Sentry.captureException(error);
}

/**
 * Manually capture message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
        message,
        data,
        level: 'info',
    });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
        name,
        op,
    });
}

/**
 * Example usage in components:
 * 
 * // In App.tsx or index.tsx
 * import { initSentry } from './config/sentry';
 * initSentry();
 * 
 * // Set user after login
 * import { setSentryUser } from './config/sentry';
 * setSentryUser({
 *   id: user.uid,
 *   email: user.email,
 *   planTier: user.planTier
 * });
 * 
 * // Capture custom error
 * import { captureException } from './config/sentry';
 * try {
 *   await createCar(data);
 * } catch (error) {
 *   captureException(error, { carData: data });
 * }
 * 
 * // Track performance
 * import { startTransaction } from './config/sentry';
 * const transaction = startTransaction('car-search', 'http');
 * // ... perform search
 * transaction.finish();
 */

/**
 * Error Boundary Component
 * Wrap your app with this to catch React errors
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Profiler Component
 * Wrap components to track rendering performance
 */
export const SentryProfiler = Sentry.Profiler;
