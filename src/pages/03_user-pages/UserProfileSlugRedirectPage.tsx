/**
 * User Profile Slug Redirect Page
 * Handles 301 redirects for user profile URLs with slugs
 * 
 * Routes handled:
 * - /profile/:userNumericId → /u/:userNumericId/:slug (301)
 * - /u/:userNumericId/:oldSlug → /u/:userNumericId/:newSlug (301 if slug changed)
 * - /u/:userNumericId/:correctSlug → Renders NumericProfileRouter
 * 
 * @file UserProfileSlugRedirectPage.tsx
 * @since 2026-02-19
 */

import React, { Suspense } from 'react';
import { useUserSlugRedirect } from '../../hooks/useUserSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the actual profile router
const NumericProfileRouter = React.lazy(() => import('../../routes/NumericProfileRouter'));

const UserProfileSlugRedirectPage: React.FC = () => {
  useUserSlugRedirect();

  // The hook handles all redirects; if we reach here, render the profile
  return (
    <Suspense fallback={<LoadingSpinner size="medium" text="Loading profile..." />}>
      <NumericProfileRouter />
    </Suspense>
  );
};

export default UserProfileSlugRedirectPage;
