// src/pages/HomePage/HeroSection.tsx
// Hero section component for HomePage

import React, { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core';
import { TrustStrip, LiveMomentumCounter } from '@globul-cars/ui';
import { db } from '@globul-cars/services';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

const HeroSection = styled.section`
  /* ✅ OPTIMIZED: Replaced heavy background image with CSS gradient */
  background: linear-gradient(135deg, #0055A4 0%, #003366 50%, #001122 100%);
  color: var(--text-primary);
  padding: 3rem 0;
  text-align: center;
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0.4;
    z-index: 0;
  }
  
  /* MOBILE OPTIMIZATION - Airbnb/Booking.com inspired */
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 50vh;  /* More prominent on mobile */
    background-position: center center;
    
    &::before {
      opacity: 0.75;  /* Lighter for better text contrast */
    }
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    min-height: 45vh;
  }
  
  @media (max-width: 380px) {
    padding: 1.25rem 0.75rem;
    min-height: 40vh;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
  color: var(--text-primary);

  /* MOBILE - Professional typography (Airbnb/Booking.com) */
  @media (max-width: 768px) {
    font-size: 1.75rem;  /* 28px */
    font-weight: 800;  /* Bolder for impact */
    line-height: 1.2;
    margin-bottom: 12px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;  /* 24px */
    line-height: 1.25;
    padding: 0 12px;
  }
  
  @media (max-width: 380px) {
    font-size: 1.375rem;  /* 22px */
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  /* MOBILE - Compact subtitle (LinkedIn pattern) */
  @media (max-width: 768px) {
    font-size: 0.9375rem;  /* 15px */
    line-height: 1.5;
    margin-bottom: 20px;
    padding: 0 20px;
    
    /* Limit to 3 lines */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;  /* 14px */
    -webkit-line-clamp: 2;  /* 2 lines on small screens */
    padding: 0 16px;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
  
  /* MOBILE - Full-width stacked buttons (Facebook/Instagram) */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 0 20px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px;
    gap: 10px;
  }
`;

const HeroButton = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  background: var(--accent-orange);
  color: #000000;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &.secondary {
    background: transparent;
    border: 2px solid var(--accent-orange);
    color: var(--accent-orange);

    &:hover {
      background: var(--accent-orange);
      color: #000000;
    }
  }
  
  /* MOBILE - Full-width touch-optimized (Facebook/Instagram CTA) */
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    padding: 14px 24px;
    font-size: 1rem;  /* 16px - clear */
    font-weight: 700;
    min-height: 52px;  /* Larger for hero CTAs */
    border-radius: 12px;  /* More rounded */
    text-align: center;
    
    /* Better touch feedback */
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.secondary {
      background: var(--bg-card);
      border: 2px solid var(--accent-orange);
      color: var(--accent-orange);
      
      &:active {
        background: var(--accent-orange);
        opacity: 0.1;
      }
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 0.9375rem;  /* 15px */
    min-height: 50px;
  }
`;

const LanguageDemoSection = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
  }
`;

const HeroSectionComponent: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeCount, setActiveCount] = useState<number>(11452);
  const [verifiedSellers, setVerifiedSellers] = useState<number>(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get active listings count
        const listingsQuery = query(
          collection(db, 'cars'),
          where('status', '==', 'active')
        );
        const listingsSnapshot = await getCountFromServer(listingsQuery);
        setActiveCount(listingsSnapshot.data().count);

        // Get verified sellers count
        const sellersQuery = query(
          collection(db, 'users'),
          where('isVerified', '==', true)
        );
        const sellersSnapshot = await getCountFromServer(sellersQuery);
        setVerifiedSellers(sellersSnapshot.data().count);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <HeroSection style={{ position: 'relative', zIndex: 1, minHeight: '750px', paddingBottom: '80px' }}>
      <HeroContent>
        <HeroTitle>
          {language === 'bg' 
            ? 'Лесно търсене. Намерете повече от кола.'
            : 'Easy search. Find more than a car.'}
        </HeroTitle>
        <HeroSubtitle>
          {t('home.hero.subtitle')}
        </HeroSubtitle>

        {/* Live Momentum Counter */}
        <LiveMomentumCounter count={activeCount} loading={loading} />

        <HeroButtons>
          <HeroButton to="/cars">
            {language === 'bg' ? 'Намери кола' : 'Find Cars'}
          </HeroButton>
          <HeroButton to="/sell" className="secondary">
            {language === 'bg' ? 'Продай лесно' : 'Sell Easily'}
          </HeroButton>
        </HeroButtons>
      </HeroContent>

      {/* Trust Strip at bottom */}
      <TrustStrip verifiedSellers={verifiedSellers} />
    </HeroSection>
  );
};

export default memo(HeroSectionComponent);