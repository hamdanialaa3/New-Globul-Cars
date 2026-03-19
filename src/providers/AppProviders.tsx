// src/providers/AppProviders.tsx
/**
 * Application Providers Stack
 * 
 * Consolidates all application-level providers into a single, well-documented component.
 * This file extracts the provider hierarchy from App.tsx for better organization and maintainability.
 * 
 * ⚠️ CRITICAL WARNING: Provider Order Must NOT Be Changed!
 * 
 * The order of these providers is carefully designed to ensure proper dependency resolution.
 * Changing the order will break the application. Each provider depends on the ones above it.
 * 
 * Provider Hierarchy (from outer to inner):
 * 1. ThemeProvider (styled-components) - Provides base theme tokens
 * 2. GlobalStyles - Applies global CSS using theme
 * 3. ErrorBoundary - Catches all errors in children
 * 4. LanguageProvider - MUST be before AuthProvider (auth uses translations)
 * 5. CustomThemeProvider - Dark/Light mode toggle
 * 6. AuthProvider - MUST be before ProfileTypeProvider
 * 7. ProfileTypeProvider - Depends on auth user data
 * 8. ToastProvider - Notifications system
 * 9. GoogleReCaptchaProvider - Security layer
 * 10. Router (BrowserRouter) - Routing (must wrap FilterProvider)
 * 11. FilterProvider - Depends on Router context
 * 
 * @example
 * import { AppProviders } from '@/providers/AppProviders';
 * 
 * const App = () => (
 *   <AppProviders>
 *     <AppRoutes />
 *   </AppProviders>
 * );
 */

import React, { Suspense, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';

// Styles
import { bulgarianTheme, GlobalStyles } from '../styles/theme';

// Contexts
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider as CustomThemeProvider, useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthProvider';
import { ProfileTypeProvider } from '../contexts/ProfileTypeContext';
import { ToastProvider } from '../components/Toast';
import { FilterProvider } from '../contexts/FilterContext';
import { ComparisonProvider } from '../contexts/ComparisonContext';
// StripeProvider removed - Stripe deprecated, using manual bank transfers

// Components
import ErrorBoundary from '../components/ErrorBoundary';
import { SkipNavigation } from '../components/Accessibility';
import NotificationHandler from '../components/NotificationHandler';

// Lazy-loaded components
const FacebookPixel = React.lazy(() => import('../components/FacebookPixel'));
const ProgressBar = React.lazy(() => import('../components/ProgressBar'));
const ComparisonFloatingBar = React.lazy(() => import('../components/comparison/ComparisonFloatingBar'));

// Services
import { logger } from '../services/logger-service';

/**
 * Props for AppProviders component
 */
interface AppProvidersProps {
    /**
     * Child components to be wrapped by all providers
     */
    children: React.ReactNode;
}

/**
 * Inner component that has access to CustomThemeProvider
 */
const ThemedApp: React.FC<{ children: React.ReactNode; recaptchaKey: string }> = ({ children, recaptchaKey }) => {
    const { theme: themeMode } = useCustomTheme();
    
    // Create dynamic theme object with current mode
    // Ensure all required properties are present with fallbacks
    const currentTheme = useMemo(() => {
        const theme = {
            ...bulgarianTheme,
            mode: themeMode
        };
        
        // Ensure typography exists
        if (!theme.typography) {
            theme.typography = bulgarianTheme.typography;
        }
        
        // Ensure spacing exists
        if (!theme.spacing) {
            theme.spacing = bulgarianTheme.spacing;
        }
        
        // Ensure colors exists
        if (!theme.colors) {
            theme.colors = bulgarianTheme.colors;
        }
        
        return theme;
    }, [themeMode]);

    return (
        <ThemeProvider theme={currentTheme}>
            <GlobalStyles />
            <HelmetProvider>
                <AuthProvider>
                        <ProfileTypeProvider>
                            <ToastProvider>
                                <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
                                    <Router>
                                        <FilterProvider>
                                          <ComparisonProvider>
                                            {/* Facebook Pixel - Analytics */}
                                            <Suspense fallback={<div style={{ height: '0' }} />}>
                                                <FacebookPixel />
                                            </Suspense>

                                            {/* Skip Navigation - Accessibility */}
                                            <SkipNavigation />

                                            {/* Notification Handler - Real-time notifications */}
                                            <NotificationHandler />

                                            {/* Comparison Floating Bar */}
                                            <Suspense fallback={null}>
                                                <ComparisonFloatingBar />
                                            </Suspense>

                                            {/* Progress Bar - Loading indicator */}
                                            <Suspense
                                                fallback={
                                                    <Suspense fallback={<div>Loading...</div>}>
                                                        <ProgressBar duration={2000} />
                                                    </Suspense>
                                                }
                                            >
                                                {children}
                                            </Suspense>
                                          </ComparisonProvider>
                                        </FilterProvider>
                                    </Router>
                                </GoogleReCaptchaProvider>
                            </ToastProvider>
                        </ProfileTypeProvider>
                </AuthProvider>
            </HelmetProvider>
        </ThemeProvider>
    );
};

/**
 * Application Providers Component
 * 
 * Wraps the entire application with all necessary providers in the correct order.
 * 
 * Features:
 * - Centralized provider management
 * - Well-documented provider hierarchy
 * - Type-safe with TypeScript
 * - Includes all necessary contexts and utilities
 * 
 * @param {AppProvidersProps} props - Component props
 * @returns {JSX.Element} Provider stack wrapping children
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    // Get reCAPTCHA key from environment
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    // Warn if reCAPTCHA is not configured in production
    if (!recaptchaKey && process.env.NODE_ENV === 'production') {
        logger.warn('reCAPTCHA Site Key is not configured');
    }

    return (
        <ErrorBoundary>
            <LanguageProvider>
                <CustomThemeProvider>
                    <ThemedApp recaptchaKey={recaptchaKey || 'dummy-key'}>
                        {children}
                    </ThemedApp>
                </CustomThemeProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
};

/**
 * Provider Dependency Graph
 * 
 * This diagram shows the dependency relationships between providers:
 * 
 * ```
 * ThemeProvider (styled-components)
 *   └─ GlobalStyles
 *       └─ ErrorBoundary
 *           └─ LanguageProvider
 *               └─ CustomThemeProvider (uses LanguageProvider)
 *                   └─ AuthProvider (uses LanguageProvider)
 *                       └─ ProfileTypeProvider (uses AuthProvider)
 *                           └─ ToastProvider (uses LanguageProvider)
 *                               └─ GoogleReCaptchaProvider
 *                                   └─ Router
 *                                       └─ FilterProvider (uses Router)
 *                                           └─ Children (App Routes)
 * ```
 * 
 * Key Dependencies:
 * - CustomThemeProvider needs LanguageProvider for translations
 * - AuthProvider needs LanguageProvider for error messages
 * - ProfileTypeProvider needs AuthProvider for user data
 * - ToastProvider needs LanguageProvider for notification messages
 * - FilterProvider needs Router for navigation context
 */

/**
 * Provider Order Rationale
 * 
 * 1. **ThemeProvider (styled-components)**
 *    - Must be outermost to provide theme tokens to all styled components
 *    - No dependencies
 * 
 * 2. **GlobalStyles**
 *    - Applies global CSS using theme tokens
 *    - Depends on: ThemeProvider
 * 
 * 3. **ErrorBoundary**
 *    - Catches all errors in child components
 *    - Should be high in the tree to catch all errors
 *    - No dependencies
 * 
 * 4. **LanguageProvider**
 *    - Provides translation functions to all components
 *    - MUST be before AuthProvider (auth uses translations)
 *    - MUST be before CustomThemeProvider (theme uses translations)
 *    - MUST be before ToastProvider (toasts use translations)
 *    - No dependencies
 * 
 * 5. **CustomThemeProvider**
 *    - Provides dark/light mode toggle
 *    - Depends on: LanguageProvider (for UI text)
 * 
 * 6. **AuthProvider**
 *    - Provides authentication state and functions
 *    - MUST be before ProfileTypeProvider (profile needs user data)
 *    - Depends on: LanguageProvider (for error messages)
 * 
 * 7. **ProfileTypeProvider**
 *    - Provides user profile type and permissions
 *    - Depends on: AuthProvider (needs current user)
 * 
 * 8. **ToastProvider**
 *    - Provides toast notification system
 *    - Depends on: LanguageProvider (for notification messages)
 * 
 * 9. **GoogleReCaptchaProvider**
 *    - Provides reCAPTCHA functionality
 *    - No dependencies on other providers
 * 
 * 10. **Router (BrowserRouter)**
 *     - Provides routing context
 *     - MUST wrap FilterProvider (filter uses navigation)
 *     - No dependencies on other providers
 * 
 * 11. **FilterProvider**
 *     - Provides search and filter state
 *     - Depends on: Router (for navigation)
 *     - Must be innermost before children
 */

/**
 * Testing Notes
 * 
 * When testing components that use these providers, you can:
 * 
 * 1. Use the full AppProviders wrapper:
 *    ```tsx
 *    render(
 *      <AppProviders>
 *        <YourComponent />
 *      </AppProviders>
 *    );
 *    ```
 * 
 * 2. Or create a minimal wrapper with only needed providers:
 *    ```tsx
 *    const MinimalProviders = ({ children }) => (
 *      <LanguageProvider>
 *        <AuthProvider>
 *          {children}
 *        </AuthProvider>
 *      </LanguageProvider>
 *    );
 *    ```
 * 
 * 3. Mock providers for unit tests:
 *    ```tsx
 *    jest.mock('@/contexts/AuthProvider', () => ({
 *      useAuth: () => ({ user: mockUser, loading: false })
 *    }));
 *    ```
 */

/**
 * Performance Considerations
 * 
 * - All providers use React Context, which can cause re-renders
 * - Each provider should memoize its value to prevent unnecessary re-renders
 * - Lazy loading is used for non-critical components (FacebookPixel, ProgressBar)
 * - The provider order is optimized to minimize re-render cascades
 */

/**
 * Migration Notes
 * 
 * This file was created as part of Week 1, Day 4 refactoring.
 * 
 * Before:
 * - All providers were nested directly in App.tsx (90+ lines)
 * - Provider order was not documented
 * - Difficult to test and maintain
 * 
 * After:
 * - Providers extracted to dedicated file
 * - Provider order well-documented with rationale
 * - Easier to test and maintain
 * - App.tsx reduced by ~90 lines
 */

export default AppProviders;
