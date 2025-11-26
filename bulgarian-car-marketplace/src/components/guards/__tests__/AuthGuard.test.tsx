// src/components/guards/__tests__/AuthGuard.test.tsx
/**
 * AuthGuard Component Tests
 * 
 * Comprehensive test suite for the unified AuthGuard component
 * Tests all authentication and authorization scenarios
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthGuard } from '../AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/contexts/LanguageContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

// Test wrapper with Router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('AuthGuard', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Default language mock
        mockUseLanguage.mockReturnValue({
            language: 'en',
            t: (key: string) => key,
            setLanguage: jest.fn(),
        } as any);
    });

    // ==========================================
    // Loading State Tests
    // ==========================================
    describe('Loading State', () => {
        it('should show loading spinner when auth is loading', () => {
            mockUseAuth.mockReturnValue({
                currentUser: null,
                loading: true,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard>
                        <div>Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('common.loading')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // Authentication Tests
    // ==========================================
    describe('Authentication', () => {
        it('should render children when user is authenticated', () => {
            mockUseAuth.mockReturnValue({
                currentUser: { uid: '123', email: 'test@example.com' },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true}>
                        <div>Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should show login message when user is not authenticated', () => {
            mockUseAuth.mockReturnValue({
                currentUser: null,
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true}>
                        <div>Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('auth.required.title')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should render children when requireAuth is false', () => {
            mockUseAuth.mockReturnValue({
                currentUser: null,
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={false}>
                        <div>Public Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('Public Content')).toBeInTheDocument();
        });
    });

    // ==========================================
    // Admin Role Tests
    // ==========================================
    describe('Admin Role', () => {
        it('should render children when user is admin', () => {
            mockUseAuth.mockReturnValue({
                currentUser: { uid: '123', email: 'admin@example.com', role: 'admin' },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                        <div>Admin Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('Admin Content')).toBeInTheDocument();
        });

        it('should show admin required message when user is not admin', () => {
            mockUseAuth.mockReturnValue({
                currentUser: { uid: '123', email: 'user@example.com', role: 'user' },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                        <div>Admin Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText(/admin/i)).toBeInTheDocument();
            expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        });

        it('should show admin required message when user is not logged in', () => {
            mockUseAuth.mockReturnValue({
                currentUser: null,
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                        <div>Admin Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            // Should show login message first (auth check comes before admin check)
            expect(screen.getByText('auth.required.title')).toBeInTheDocument();
        });
    });

    // ==========================================
    // Email Verification Tests
    // ==========================================
    describe('Email Verification', () => {
        it('should render children when email is verified', () => {
            mockUseAuth.mockReturnValue({
                currentUser: {
                    uid: '123',
                    email: 'test@example.com',
                    emailVerified: true
                },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} requireVerified={true}>
                        <div>Verified Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('Verified Content')).toBeInTheDocument();
        });

        it('should show verification message when email is not verified', () => {
            mockUseAuth.mockReturnValue({
                currentUser: {
                    uid: '123',
                    email: 'test@example.com',
                    emailVerified: false
                },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} requireVerified={true}>
                        <div>Verified Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText(/verification/i)).toBeInTheDocument();
            expect(screen.queryByText('Verified Content')).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // Combined Requirements Tests
    // ==========================================
    describe('Combined Requirements', () => {
        it('should handle requireAuth + requireAdmin + requireVerified', () => {
            mockUseAuth.mockReturnValue({
                currentUser: {
                    uid: '123',
                    email: 'admin@example.com',
                    role: 'admin',
                    emailVerified: true
                },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard
                        requireAuth={true}
                        requireAdmin={true}
                        requireVerified={true}
                    >
                        <div>Super Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('Super Protected Content')).toBeInTheDocument();
        });

        it('should fail if any requirement is not met', () => {
            mockUseAuth.mockReturnValue({
                currentUser: {
                    uid: '123',
                    email: 'admin@example.com',
                    role: 'admin',
                    emailVerified: false  // Not verified
                },
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard
                        requireAuth={true}
                        requireAdmin={true}
                        requireVerified={true}
                    >
                        <div>Super Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.queryByText('Super Protected Content')).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // Message Display Tests
    // ==========================================
    describe('Message Display', () => {
        it('should show message when showMessage is true', () => {
            mockUseAuth.mockReturnValue({
                currentUser: null,
                loading: false,
            } as any);

            render(
                <TestWrapper>
                    <AuthGuard requireAuth={true} showMessage={true}>
                        <div>Protected Content</div>
                    </AuthGuard>
                </TestWrapper>
            );

            expect(screen.getByText('auth.required.title')).toBeInTheDocument();
        });

        // Note: Testing redirect behavior requires more complex setup with MemoryRouter
        // This is covered in integration tests
    });
});
