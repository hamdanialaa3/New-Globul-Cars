/**
 * Slug Redirect Service
 * Handles 301 redirects from old listing URLs to canonical slug URLs
 * 
 * Usage in React Router:
 * - Old route: /car/:sellerId/:listingId
 * - Redirects to: /car/:listingNumericId (with slug if available)
 * - Canonical: /car/{listingNumericId}/{slug}
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListingById, getListingByNumericId } from '../services/listings.service';
import { serviceLogger } from '../services/logger-service';

/**
 * Hook for handling legacy /car/:sellerId/:listingId redirects
 * Fetches listing and redirects to canonical URL if slug exists
 */
export function useSlugRedirect() {
  const navigate = useNavigate();
  const params = useParams<{ sellerId?: string; listingId?: string; listingNumericId?: string; slug?: string }>();

  useEffect(() => {
    const redirectIfNeeded = async () => {
      try {
        // Case 1: Legacy route /car/:sellerId/:listingId
        if (params.sellerId && params.listingId && !params.listingNumericId) {
          const listing = await getListingById(params.listingId);
          if (!listing) {
            serviceLogger.warn('Listing not found', { listingId: params.listingId });
            navigate('/not-found');
            return;
          }
          
          // Redirect to canonical URL if slug exists
          if (listing.slug) {
            const canonicalUrl = `/car/${listing.listingNumericId}/${listing.slug}`;
            serviceLogger.info('Redirecting from legacy route to canonical', {
              from: `/car/${params.sellerId}/${params.listingId}`,
              to: canonicalUrl,
            });
            navigate(canonicalUrl, { replace: true });
          }
          return;
        }

        // Case 2: /car/:listingNumericId with old or mismatched slug
        if (params.listingNumericId && params.slug) {
          const listing = await getListingByNumericId(parseInt(params.listingNumericId, 10));
          if (!listing) {
            navigate('/not-found');
            return;
          }

          // If slug mismatch, redirect to current canonical
          if (listing.slug && listing.slug !== params.slug) {
            const canonicalUrl = `/car/${listing.listingNumericId}/${listing.slug}`;
            serviceLogger.info('Redirecting from old slug to current', {
              from: `/car/${params.listingNumericId}/${params.slug}`,
              to: canonicalUrl,
              oldSlug: params.slug,
              newSlug: listing.slug,
            });
            navigate(canonicalUrl, { replace: true });
          }
        }
      } catch (err) {
        serviceLogger.error('Error processing slug redirect', {
          error: err instanceof Error ? err.message : String(err),
          params,
        });
        // Continue rendering; don't break the page
      }
    };

    redirectIfNeeded();
  }, [params.sellerId, params.listingId, params.listingNumericId, params.slug, navigate]);
}

/**
 * Redirect middleware for React Router
 * Wraps route components with auto-redirect logic
 */
export function withSlugRedirect<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    useSlugRedirect();
    return <Component {...props} />;
  };
}
