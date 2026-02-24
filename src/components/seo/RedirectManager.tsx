/**
 * RedirectManager.tsx
 * 🔀 Handles 301 Redirects and 404 Not Found Pages
 * 
 * Features:
 * - 301 Permanent Redirects from old URLs
 * - Custom 404 Not Found page with SEO
 * - Automatic redirect logging
 * - Redirect rules from JSON config
 * 
 * @example
 * // In AppRoutes.tsx:
 * <Route path="*" element={<RedirectManager />} />
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SEOHelmet from '@/utils/seo/SEOHelmet';
import { logger } from '@/services/logger-service';

// ============================================================================
// REDIRECT RULES
// ============================================================================

/**
 * 301 Redirect Rules
 * Add your old URLs here to redirect to new ones
 */
const REDIRECT_RULES: Record<string, string> = {
    // Old to New mappings
    '/old-cars': '/cars',
    '/automobiles': '/cars',
    '/sell-car': '/sell',
    '/contact-us': '/contact',
    '/about-us': '/about',
    '/privacy': '/privacy-policy',
    '/terms': '/terms-of-service',
    '/dealer': '/dealers',
    '/cars-for-sale': '/search',
    '/used-cars': '/cars',
    
    // Legacy profile URLs (before numeric IDs)
    // Example: /profile/firebase-uid -> /profile/123
    // These should be handled by NumericIdGuard in production
};

/**
 * Pattern-based redirects (regex)
 */
const PATTERN_REDIRECTS: Array<{ pattern: RegExp; replacement: string }> = [
    // Example: /blog/post-slug/ (with trailing slash) -> /blog/post-slug
    { 
        pattern: /^\/blog\/([^/]+)\/$/, 
        replacement: '/blog/$1' 
    },
    // Example: /car/123/details -> /car/123
    { 
        pattern: /^\/car\/(\d+)\/details$/, 
        replacement: '/car/$1' 
    },
];

// ============================================================================
// STYLED COMPONENTS (404 Page)
// ============================================================================

const NotFoundContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
    text-align: center;
`;

const ErrorCode = styled.h1`
    font-size: 8rem;
    font-weight: 900;
    color: ${props => props.theme.colors?.primary || '#FF7900'};
    margin: 0;
    line-height: 1;
    
    @media (max-width: 768px) {
        font-size: 6rem;
    }
`;

const ErrorTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.theme.colors?.text || '#333'};
    margin: 1rem 0;
`;

const ErrorMessage = styled.p`
    font-size: 1.125rem;
    color: ${props => props.theme.colors?.textSecondary || '#666'};
    max-width: 600px;
    margin: 0 auto 2rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    
    ${props => props.variant === 'primary' ? `
        background: ${props.theme.colors?.primary || '#FF7900'};
        color: white;
        
        &:hover {
            background: ${props.theme.colors?.primaryDark || '#E66D00'};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
        }
    ` : `
        background: transparent;
        color: ${props.theme.colors?.text || '#333'};
        border: 2px solid ${props.theme.colors?.border || '#DDD'};
        
        &:hover {
            background: ${props.theme.colors?.backgroundSecondary || '#F5F5F5'};
        }
    `}
`;

const SuggestionList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 2rem 0;
    max-width: 400px;
`;

const SuggestionItem = styled.li`
    margin: 0.5rem 0;
    
    a {
        color: ${props => props.theme.colors?.primary || '#FF7900'};
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;

// ============================================================================
// UTILS
// ============================================================================

/**
 * Check if path matches redirect rules
 */
const findRedirect = (pathname: string): string | null => {
    // Direct match
    if (REDIRECT_RULES[pathname]) {
        return REDIRECT_RULES[pathname];
    }

    // Pattern match
    for (const { pattern, replacement } of PATTERN_REDIRECTS) {
        if (pattern.test(pathname)) {
            return pathname.replace(pattern, replacement);
        }
    }

    return null;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * 404 Not Found Page
 */
const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Log 404 for analytics
        logger.warn('[404] Page not found', { path: location.pathname });
    }, [location.pathname]);

    return (
        <>
            <SEOHelmet
                title="Страницата не е намерена - 404"
                description="Търсената от вас страница не съществува или е преместена."
                noindex={true}
            />
            
            <NotFoundContainer>
                <ErrorCode>404</ErrorCode>
                <ErrorTitle>Страницата не е намерена</ErrorTitle>
                <ErrorMessage>
                    Съжаляваме, но страницата, която търсите, не съществува или е била преместена.
                </ErrorMessage>

                <ButtonGroup>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/')}
                    >
                        Начална страница
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </Button>
                </ButtonGroup>

                <SuggestionList>
                    <strong>Може би търсите:</strong>
                    <SuggestionItem>
                        <a href="/cars">🚗 Всички автомобили</a>
                    </SuggestionItem>
                    <SuggestionItem>
                        <a href="/search">🔍 Търсене</a>
                    </SuggestionItem>
                    <SuggestionItem>
                        <a href="/dealers">👔 Дилъри</a>
                    </SuggestionItem>
                    <SuggestionItem>
                        <a href="/contact">📞 Контакти</a>
                    </SuggestionItem>
                </SuggestionList>
            </NotFoundContainer>
        </>
    );
};

/**
 * Redirect Manager Component
 * Handles both redirects and 404s
 */
export const RedirectManager: React.FC = () => {
    const location = useLocation();

    // Check for redirect
    const redirectTo = findRedirect(location.pathname);

    useEffect(() => {
        if (redirectTo) {
            logger.info('[301 Redirect]', {
                from: location.pathname,
                to: redirectTo
            });
        }
    }, [redirectTo, location.pathname]);

    // If redirect found, perform 301 (permanent redirect)
    if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
    }

    // Otherwise, show 404
    return <NotFoundPage />;
};

export default RedirectManager;
