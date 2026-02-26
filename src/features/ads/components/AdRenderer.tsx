import React, { useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { AdCampaign } from '../types';
import { useAdTracker } from '../hooks/useAdHooks';
import { SmartAdSenseUnit } from './SmartAdSenseUnit';

const AdWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin: 1rem 0;
  
  img {
    max-width: 100%;
    height: auto;
    object-fit: cover;
  }
`;

interface AdRendererProps {
    ad: AdCampaign;
    placementId: string;
    hasConsent?: boolean;
}

export const AdRenderer: React.FC<AdRendererProps> = ({ ad, placementId, hasConsent = true }) => {
    const { trackImpression, trackClick } = useAdTracker(ad.id, placementId);
    const impressionLogged = useRef(false);

    useEffect(() => {
        const node = document.getElementById(`ad-${ad.id}`);
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !impressionLogged.current) {
                    trackImpression();
                    impressionLogged.current = true;
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [ad.id, trackImpression]);

    const handleClick = () => {
        trackClick();
    };

    // Google Smart Unit - New Professional Integration
    if (ad.type === 'google_smart') {
        // Assuming scriptCode might contain the slot ID or we use a separate field in future
        // For now, let's parse slot ID from scriptCode if it's there, or fallback to a test slot
        // A better way is to add 'slotId' to AdCampaign type, but let's be flexible
        const slotId = ad.scriptCode || '1234567890'; // Default/Fallback

        return (
            <AdWrapper id={`ad-${ad.id}`} className="ad-unit ad-smart">
                <SmartAdSenseUnit
                    slot={slotId}
                    format="auto"
                    responsive={true}
                    debug={process.env.NODE_ENV === 'development'}
                />
            </AdWrapper>
        );
    }

    if (ad.type === 'image' && ad.imageUrl) {
        return (
            <AdWrapper id={`ad-${ad.id}`} className="ad-unit ad-image">
                <a
                    href={ad.destinationUrl || '#'}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    onClick={handleClick}
                >
                    <img
                        src={ad.imageUrl}
                        alt={ad.name || 'Ad'}
                        loading="lazy"
                    />
                </a>
            </AdWrapper>
        );
    }

    // GDPR Guard
    if (!hasConsent && (ad.type.startsWith('google') || ad.type === 'html_js')) {
        return null;
    }

    if ((ad.type === 'html_js' || ad.type.startsWith('google')) && ad.scriptCode) {
        // SECURITY: Render ad scripts in a sandboxed iframe to prevent XSS
        const srcDoc = `<!DOCTYPE html><html><head><style>body{margin:0;overflow:hidden}</style></head><body>${ad.scriptCode}</body></html>`;
        return (
            <AdWrapper id={`ad-${ad.id}`} className="ad-unit ad-script" onClick={handleClick}>
                <iframe
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                    style={{ border: 'none', width: '100%', minHeight: '90px' }}
                    title={`Ad: ${ad.name || ad.id}`}
                    loading="lazy"
                />
            </AdWrapper>
        );
    }

    return null;
};
