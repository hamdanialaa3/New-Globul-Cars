/**
 * Listing Slug Redirect Page
 * Handles 301 redirects for listing URLs with slugs
 * 
 * Routes handled:
 * - /car/:sellerId/:listingId → /car/:listingNumericId/:slug (301)
 * - /car/:listingNumericId/:oldSlug → /car/:listingNumericId/:newSlug (301 if slug changed)
 * - /car/:listingNumericId/:correctSlug → Renders NumericCarDetailsPage
 * 
 * @file ListingSlugRedirectPage.tsx
 * @since 2026-02-19
 */

import React, { Suspense } from 'react';
import { useSlugRedirect } from '../../hooks/useSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the actual car details page
const NumericCarDetailsPage = React.lazy(() => import('../01_main-pages/NumericCarDetailsPage'));

const ListingSlugRedirectPage: React.FC = () => {
  // Hook handles all redirect logic internally (navigates if slug mismatch)
  useSlugRedirect();

  // After redirect logic completes (or if no redirect needed), render the actual listing page
  return (
    <Suspense fallback={<LoadingSpinner size="medium" />}>
      <NumericCarDetailsPage />
    </Suspense>
  );
};

export default ListingSlugRedirectPage;
