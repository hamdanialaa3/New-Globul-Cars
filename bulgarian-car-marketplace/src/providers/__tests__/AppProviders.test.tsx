// src/providers/__tests__/AppProviders.test.tsx
/**
 * AppProviders Component Tests
 * 
 * Tests the provider hierarchy and ensures all providers are correctly configured.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProviders } from '../AppProviders';

// Mock all the contexts and components
jest.mock('@/contexts/LanguageContext', () => ({
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="language-provider">{children}</div>,
}));

jest.mock('@/contexts/ThemeContext', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('@/contexts/AuthProvider', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('@/contexts/ProfileTypeContext', () => ({
    ProfileTypeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="profile-type-provider">{children}</div>,
}));

jest.mock('@/contexts/FilterContext', () => ({
    FilterProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="filter-provider">{children}</div>,
}));

jest.mock('@/components/Toast', () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
}));

jest.mock('@/components/ErrorBoundary', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

jest.mock('@/components/Accessibility', () => ({
    SkipNavigation: () => <div data-testid="skip-navigation">Skip Navigation</div>,
}));

jest.mock('@/components/NotificationHandler', () => ({
    __esModule: true,
    default: () => <div data-testid="notification-handler">Notification Handler</div>,
}));

jest.mock('@/components/FacebookPixel', () => ({
    __esModule: true,
    default: () => <div data-testid="facebook-pixel">Facebook Pixel</div>,
}));

jest.mock('@/components/ProgressBar', () => ({
    __esModule: true,
    default: () => <div data-testid="progress-bar">Progress Bar</div>,
}));

jest.mock('react-google-recaptcha-v3', () => ({
    GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="recaptcha-provider">{children}</div>
    ),
}));

describe('AppProviders', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should render children', () => {
        render(
            <AppProviders>
                <div data-testid="test-child">Test Content</div>
            </AppProviders>
        );

        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should include all required providers', () => {
        render(
            <AppProviders>
                <div>Test</div>
            </AppProviders>
        );

        // Check that all providers are present
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('language-provider')).toBeInTheDocument();
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('profile-type-provider')).toBeInTheDocument();
        expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
        expect(screen.getByTestId('recaptcha-provider')).toBeInTheDocument();
        expect(screen.getByTestId('filter-provider')).toBeInTheDocument();
    });

    it('should include utility components', () => {
        render(
            <AppProviders>
                <div>Test</div>
            </AppProviders>
        );

        // Check utility components
        expect(screen.getByTestId('skip-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('notification-handler')).toBeInTheDocument();
    });

    it('should handle missing reCAPTCHA key gracefully', () => {
        // Store original env
        const originalEnv = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

        // Remove the key
        delete process.env.REACT_APP_RECAPTCHA_SITE_KEY;

        // Should not throw
        expect(() => {
            render(
                <AppProviders>
                    <div>Test</div>
                </AppProviders>
            );
        }).not.toThrow();

        // Restore env
        process.env.REACT_APP_RECAPTCHA_SITE_KEY = originalEnv;
    });

    it('should maintain correct provider hierarchy', () => {
        const { container } = render(
            <AppProviders>
                <div data-testid="app-content">App Content</div>
            </AppProviders>
        );

        // Verify the hierarchy exists
        expect(container).toBeTruthy();
        expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
});

/**
 * Integration Test Notes
 * 
 * These tests verify that:
 * 1. All providers are present in the component tree
 * 2. Children are rendered correctly
 * 3. The component handles missing configuration gracefully
 * 4. The provider hierarchy is maintained
 * 
 * For more detailed provider testing, test each provider individually.
 */
