// DealerSpotlight.tsx
// Highlights top verified dealers with real data from Firebase

import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../../../services/analytics/UnifiedAnalyticsService';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { DealershipRepository } from '../../../../repositories/DealershipRepository';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import { logger } from '../../../../services/logger-service';

interface DealerInfo {
  id: string;
  name: string;
  rating: number;
  listings: number;
  verified: boolean;
  slug?: string;
}

const SectionContainer = styled.section`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  margin: 0;
  font-family: 'Martica', 'Arial', sans-serif;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const DealerContainer = styled.div`
  /* Container for horizontal scroll */
`;

const DealerCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
`;

const DealerName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const DealerMeta = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const VerifiedBadge = styled.span`
  background: var(--accent-success);
  color: #fff;
  font-size: 0.625rem;
  padding: 3px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const ViewAllLink = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

const DealerSpotlight: React.FC = memo(() => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dealerSectionRef = useRef<HTMLDivElement>(null);
  const [dealers, setDealers] = useState<DealerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch verified dealerships from Firebase
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const verifiedDealerships = await DealershipRepository.getVerified(6);
        
        // Get listings count for each dealer
        const dealersWithListings = await Promise.all(
          verifiedDealerships.map(async (dealership) => {
            try {
              // Count cars for this dealer
              const carsQuery = query(
                collection(db, 'cars'),
                where('sellerId', '==', dealership.uid),
                where('isActive', '==', true)
              );
              const carsSnapshot = await getDocs(carsQuery);
              const listingsCount = carsSnapshot.size;

              // Get rating (default to 4.5 if not available)
              const rating = dealership.rating || 4.5;

              return {
                id: dealership.uid,
                name: language === 'bg' 
                  ? (dealership.dealershipNameBG || dealership.dealershipNameEN || 'Dealer')
                  : (dealership.dealershipNameEN || dealership.dealershipNameBG || 'Dealer'),
                rating,
                listings: listingsCount,
                verified: dealership.verification?.status === 'verified',
                slug: dealership.slug || dealership.uid
              } as DealerInfo;
            } catch (error) {
              logger.error('Error fetching dealer listings', error as Error, { dealerId: dealership.uid });
              return {
                id: dealership.uid,
                name: language === 'bg' 
                  ? (dealership.dealershipNameBG || dealership.dealershipNameEN || 'Dealer')
                  : (dealership.dealershipNameEN || dealership.dealershipNameBG || 'Dealer'),
                rating: 4.5,
                listings: 0,
                verified: true,
                slug: dealership.slug || dealership.uid
              } as DealerInfo;
            }
          })
        );

        // Sort by listings count (descending) and take top 6
        const sortedDealers = dealersWithListings
          .sort((a, b) => b.listings - a.listings)
          .slice(0, 6);

        setDealers(sortedDealers);
      } catch (error) {
        logger.error('Error fetching dealers', error as Error);
        // Fallback to empty array on error
        setDealers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, [language]);

  useEffect(() => {
    // Fire 'home_dealerspotlight_view' when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          analyticsService.trackEvent('home_dealerspotlight_view', {
            dealerCount: dealers?.length || 0,
          });
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );

    if (dealerSectionRef.current) {
      observer.observe(dealerSectionRef.current);
    }

    return () => observer.disconnect();
  }, [dealers]);

  // When dealer is clicked:
  const handleDealerClick = (dealer: DealerInfo) => {
    // Track 'home_dealerspotlight_click_dealer' with dealer id
    analyticsService.trackEvent('home_dealerspotlight_click_dealer', {
      dealerId: dealer.id,
    });
    navigate(`/dealer/${dealer.slug || dealer.id}`);
  };

  // When "View All" is clicked:
  const handleViewAll = () => {
    // Track 'home_dealerspotlight_view_all'
    analyticsService.trackEvent('home_dealerspotlight_view_all', {});
    navigate('/dealers');
  };

  if (loading) {
    return (
      <SectionContainer aria-label={t('home.dealerSpotlight.title')}>
        <Header>
          <Title>{t('home.dealerSpotlight.title')}</Title>
          <Subtitle>{t('home.dealerSpotlight.subtitle')}</Subtitle>
        </Header>
        <DealerContainer>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('common.loading', 'Loading...')}
          </div>
        </DealerContainer>
      </SectionContainer>
    );
  }

  if (dealers.length === 0) {
    return null; // Don't show section if no dealers
  }

  return (
    <SectionContainer ref={dealerSectionRef} aria-label={t('home.dealerSpotlight.title')}>
      <Header>
        <Title>{t('home.dealerSpotlight.title')}</Title>
        <Subtitle>{t('home.dealerSpotlight.subtitle')}</Subtitle>
      </Header>
      <DealerContainer>
        <HorizontalScrollContainer
          gap="16px"
          padding="0"
          itemMinWidth="220px"
          showArrows={true}
        >
          {dealers.map(d => (
            <DealerCard 
              key={d.id} 
              data-dealer-id={d.id} 
              onClick={() => handleDealerClick(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDealerClick(d);
                }
              }}
            >
              <DealerName>{d.name}</DealerName>
              <DealerMeta>
                <span>{t('home.dealerSpotlight.rating')}: {d.rating.toFixed(1)}</span>
                <span>{t('home.dealerSpotlight.listings')}: {d.listings}</span>
                {d.verified && <VerifiedBadge>{t('home.dealerSpotlight.verified')}</VerifiedBadge>}
              </DealerMeta>
            </DealerCard>
          ))}
        </HorizontalScrollContainer>
      </DealerContainer>
      <ViewAllLink type="button" onClick={handleViewAll}>{t('home.dealerSpotlight.viewAll')}</ViewAllLink>
    </SectionContainer>
  );
});

export default DealerSpotlight;
