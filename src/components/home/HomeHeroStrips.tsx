/**
 * HomeHeroStrips.tsx
 * Container for "Recently viewed" + "Top DEALS for you" strips
 * حاوية لأشرطة "شاهدت مؤخراً" + "أفضل العروض لك"
 *
 * Placed under the 3rd hero element in HomePageComposer.
 * Uses styled-components + CSS variables.
 */

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { CarSummary } from '../../types/car';
import { getGuestIdFromCookiesOrLocalStorage } from '../../lib/guestIdentity';
import { getRecentlyViewedCars, getTopDealsForUser } from '../../lib/api/homeStrips';
import { CarStripSection } from './CarStripSection';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 28px;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingWrap = styled.div`
  width: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary, #e2e8f0);
  border-top-color: var(--accent-primary, #FF6B35);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const LoadingText = styled.p`
  font-size: 13px;
  color: var(--text-tertiary, #a0aec0);
  margin: 0;
`;

// ============================================================================
// COMPONENT
// ============================================================================

export const HomeHeroStrips: React.FC = () => {
  const [recent, setRecent] = useState<CarSummary[]>([]);
  const [deals, setDeals] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const guestId = getGuestIdFromCookiesOrLocalStorage();
        const [r, d] = await Promise.all([
          getRecentlyViewedCars(guestId),
          getTopDealsForUser(guestId),
        ]);
        if (!cancelled) {
          setRecent(r);
          setDeals(d);
        }
      } catch {
        // Silently fail — sections will simply not show
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <LoadingWrap>
        <Spinner />
        <LoadingText>Loading your personalized picks…</LoadingText>
      </LoadingWrap>
    );
  }

  // If both empty, render nothing
  if (recent.length === 0 && deals.length === 0) return null;

  return (
    <Wrapper>
      {recent.length > 0 && (
        <CarStripSection
          title="Recently viewed"
          subtitle="Pick up where you left off"
          cars={recent}
          showAllHref="/cars"
        />
      )}

      {deals.length > 0 && (
        <CarStripSection
          title="Top DEALS for you"
          subtitle="Hand-picked offers based on market analysis"
          cars={deals}
          showAllHref="/cars"
        />
      )}
    </Wrapper>
  );
};
