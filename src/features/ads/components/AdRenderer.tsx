import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AdCampaign } from '../types';
import { useAdTracker } from '../hooks/useAdHooks';

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
        return (
            <AdWrapper id={`ad-${ad.id}`} className="ad-unit ad-script">
                <div
                    dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
                    onClick={handleClick}
                />
            </AdWrapper>
        );
    }

    return null;
};
