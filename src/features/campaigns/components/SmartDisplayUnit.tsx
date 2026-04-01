import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { logger } from '@/services/logger-service';

// Add type definition for window.adsbygoogle
declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdContainer = styled.div<{ $minHeight?: string }>`
  display: block;
  width: 100%;
  min-height: ${props => props.$minHeight || '280px'}; /* Prevent layout shift */
  overflow: hidden;
  position: relative;
  background: transparent;
  
  &.ad-filled {
    min-height: auto;
  }
`;

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #adb5bd;
  font-size: 0.8rem;
  width: 100%;
  height: 100%;
  min-height: 250px;
  border: 1px dashed #dee2e6;
`;

interface SmartAdSenseUnitProps {
    client?: string; // ca-pub-XXXXXXXXXXXXXXXX
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    layoutKey?: string; // For In-feed ads
    responsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
    debug?: boolean;
    minHeight?: string;
    // Contextual signals
    pageUrl?: string;
}

export const SmartAdSenseUnit: React.FC<SmartAdSenseUnitProps> = ({
    client = import.meta.env.VITE_GOOGLE_ADSENSE_ID || 'ca-pub-TEST', // Fallback for dev
    slot,
    format = 'auto',
    layoutKey,
    responsive = true,
    style,
    className,
    debug = false,
    minHeight
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // 1. Check if ad is already filled
        if (adRef.current && adRef.current.innerHTML.trim().length > 0) {
            setLoaded(true);
            return;
        }

        // 2. Push to adsbygoogle
        try {
            const pushAd = () => {
                if (typeof window !== 'undefined') {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    setLoaded(true);
                }
            };

            // Lazy load logic could go here (IntersectionObserver)
            // For now, we push immediately on mount
            pushAd();

        } catch (e) {
            logger.error('AdSense push error:', e);
            setError(true);
        }
    }, [slot]); // Re-run if slot changes

    if (error && debug) {
        return (
            <Placeholder>
                AdSense Error (Slot: {slot})
            </Placeholder>
        );
    }

    return (
        <AdContainer className={`${className} ${loaded ? 'ad-filled' : ''}`} $minHeight={minHeight}>
            {debug && !loaded && <Placeholder>AdSense Loading...</Placeholder>}

            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
                data-ad-layout-key={layoutKey}
            />
        </AdContainer>
    );
};
