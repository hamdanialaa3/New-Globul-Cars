/**
 * Short Link Resolver Hook
 * Handles /s/:shortCode resolution and redirect (301 or 302)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShortLinksService } from '@/services/short-links.service';
import { serviceLogger } from '@/services/logger-service';

/**
 * Hook for resolving and following short links
 * Usage in route: <Route path="/s/:shortCode" element={<ShortLinkResolver />} />
 */
export function useShortLinkResolver() {
  const navigate = useNavigate();
  const params = useParams<{ shortCode?: string }>();

  useEffect(() => {
    const resolveAndRedirect = async () => {
      if (!params.shortCode) {
        navigate('/not-found');
        return;
      }

      try {
        // Resolve short code asynchronously
        const targetUrl = await ShortLinksService.resolveShortCode(params.shortCode);

        if (!targetUrl) {
          serviceLogger.warn('Short link not found or expired', {
            shortCode: params.shortCode,
          });
          navigate('/not-found');
          return;
        }

        // Increment click count (non-blocking)
        ShortLinksService.incrementClickCount(params.shortCode).catch((err) => {
          serviceLogger.warn('Failed to increment click count', {
            shortCode: params.shortCode,
            error: err instanceof Error ? err.message : String(err),
          });
        });

        // Perform redirect (use 302 temporary, or 301 if canonical)
        serviceLogger.info('Resolving short link', {
          shortCode: params.shortCode,
          targetUrl,
        });

        // Use window.location for hard redirect (SEO-friendly 302/301)
        // Alternatively, use navigate() for SPA routing
        window.location.href = targetUrl;
      } catch (err) {
        serviceLogger.error('Error resolving short link', {
          shortCode: params.shortCode,
          error: err instanceof Error ? err.message : String(err),
        });
        navigate('/error');
      }
    };

    resolveAndRedirect();
  }, [params.shortCode, navigate]);
}

/**
 * Component wrapper for short link resolution
 * Usage: <Route path="/s/:shortCode" element={<ShortLinkResolverComponent />} />
 */
export function ShortLinkResolverComponent() {
  useShortLinkResolver();
  return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
}
