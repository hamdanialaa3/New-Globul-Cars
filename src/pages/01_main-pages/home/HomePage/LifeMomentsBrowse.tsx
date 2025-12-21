// LifeMomentsBrowse.tsx
// Presents lifestyle-oriented entry points to car discovery

import React, { memo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../../../services/analytics/UnifiedAnalyticsService';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';

interface LifeMomentItem {
  key: string;
  icon?: string; // Placeholder for future icon integration
}

const MOMENTS: LifeMomentItem[] = [
  { key: 'family' },
  { key: 'work' },
  { key: 'adventure' },
  { key: 'eco' },
  { key: 'city' },
  { key: 'luxury' }
];

const Section = styled.section`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-family: 'Martica', 'Arial', sans-serif;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const MomentsContainer = styled.div`
  /* Container for horizontal scroll */
`;

const MomentCard = styled.button`
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  padding: 14px 12px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Martica', 'Arial', sans-serif;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
  }
`;

const MomentLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
`;

const MomentTitle = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
`;

const LifeMomentsBrowse: React.FC = memo(() => {
  const { t } = useLanguage();
  const browseSectionRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Fire 'home_lifemoments_view' once visible
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        analyticsService.trackEvent('home_lifemoments_view', {
          momentCount: MOMENTS?.length || 0,
        });
        observer.unobserve(entries[0].target);
      }
    },
    { threshold: 0.3 }
  );

  if (browseSectionRef.current) {
    observer.observe(browseSectionRef.current);
  }

  return () => observer.disconnect();
}, []);

// When moment is clicked:
const handleMomentClick = (momentKey: string) => {
  // Track 'home_lifemoments_click' with moment key
  analyticsService.trackEvent('home_lifemoments_click', {
    momentKey,
  });
  navigate(`/browse?moment=${momentKey}`);
};

  return (
    <Section aria-label={t('home.lifeMomentsBrowse.title')}>
      <Header>
        <Title>{t('home.lifeMomentsBrowse.title')}</Title>
        <Subtitle>{t('home.lifeMomentsBrowse.subtitle')}</Subtitle>
      </Header>
      <MomentsContainer>
        <HorizontalScrollContainer
          gap="14px"
          padding="0"
          itemMinWidth="140px"
          showArrows={true}
        >
          {MOMENTS.map(m => (
            <MomentCard key={m.key} data-moment={m.key} onClick={() => handleMomentClick(m.key)}>
              <MomentLabel>{t('home.lifeMomentsBrowse.title')}</MomentLabel>
              <MomentTitle>{t(`home.lifeMomentsBrowse.moments.${m.key}.title`)}</MomentTitle>
            </MomentCard>
          ))}
        </HorizontalScrollContainer>
      </MomentsContainer>
    </Section>
  );
});

export default LifeMomentsBrowse;
