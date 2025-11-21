// Dealer Spotlight Component
// Displays 3-4 verified dealers with ratings

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Star, MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';
import { db } from '@globul-cars/services';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

const SpotlightContainer = styled.section`
  padding: 40px 20px;
  margin: 40px 0;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    padding: 32px 16px;
    margin: 24px 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
`;

const DealersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DealerCard = styled(Link)`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-orange);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const DealerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const LogoWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const DealerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DealerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const DealerLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;

  svg {
    width: 16px;
    height: 16px;
    color: #FF8F10;
    fill: #FF8F10;
  }
`;

const RatingText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const VerifiedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #00966E;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 12px;
`;

interface Dealer {
  id: string;
  name: string;
  city?: string;
  logoUrl?: string;
  rating?: number;
  profileType: 'dealer' | 'company';
}

const DealerSpotlight: React.FC = () => {
  const { language } = useLanguage();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const dealersQuery = query(
          collection(db, 'users'),
          where('profileType', 'in', ['dealer', 'company']),
          where('isVerified', '==', true),
          limit(4)
        );

        const snapshot = await getDocs(dealersQuery);
        const dealersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Dealer[];

        // Sort by rating (highest first) and take top 4
        const sortedDealers = dealersData
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);

        setDealers(sortedDealers);
      } catch (error) {
        console.error('Error fetching dealers:', error);
        // Fallback to empty array
        setDealers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  if (loading) {
    return (
      <SpotlightContainer>
        <Container>
          <Title>
            {language === 'bg' ? 'Проверени Търговци' : 'Verified Dealers'}
          </Title>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            {language === 'bg' ? 'Зареждане...' : 'Loading...'}
          </div>
        </Container>
      </SpotlightContainer>
    );
  }

  if (dealers.length === 0) {
    return null; // Don't show if no dealers
  }

  return (
    <SpotlightContainer>
      <Container>
        <Title>
          {language === 'bg' ? 'Проверени Търговци' : 'Verified Dealers'}
        </Title>

        <DealersGrid>
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} to={`/dealer/${dealer.id}`}>
              <DealerHeader>
                <LogoWrapper>
                  {dealer.logoUrl ? (
                    <img src={dealer.logoUrl} alt={dealer.name} />
                  ) : (
                    <Building2 size={32} color="#999" />
                  )}
                </LogoWrapper>
                <DealerInfo>
                  <DealerName>{dealer.name}</DealerName>
                  {dealer.city && (
                    <DealerLocation>
                      <MapPin />
                      <span>{dealer.city}</span>
                    </DealerLocation>
                  )}
                </DealerInfo>
              </DealerHeader>

              {dealer.rating !== undefined && dealer.rating > 0 && (
                <RatingContainer>
                  <Stars>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        fill={i < Math.floor(dealer.rating || 0) ? '#FF8F10' : 'none'}
                      />
                    ))}
                  </Stars>
                  <RatingText>{dealer.rating.toFixed(1)}</RatingText>
                </RatingContainer>
              )}

              <VerifiedBadge>
                <Building2 size={12} />
                {language === 'bg' ? 'Проверен' : 'Verified'}
              </VerifiedBadge>
            </DealerCard>
          ))}
        </DealersGrid>
      </Container>
    </SpotlightContainer>
  );
};

export default DealerSpotlight;

