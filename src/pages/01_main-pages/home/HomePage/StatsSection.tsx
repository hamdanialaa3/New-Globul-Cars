// src/pages/HomePage/StatsSection.tsx
// Stats section component for HomePage

import React, { memo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionContainer } from './styles';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

const StatsSection = styled.section`
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 3rem 0;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    opacity: 0.75;
    z-index: 0;
  }
  
  @media (max-width: 600px) {
    padding: 2rem 0;
  }
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-orange);
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
    line-height: 1.5;
  }
  
  @media (max-width: 600px) {
    h3 {
      font-size: 1.75rem;
    }
    
    p {
      font-size: 0.8rem;
    }
  }
`;

const StatsSectionComponent: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ cars: 0, users: 0, dealers: 0 });

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const vehicleCollections = SellWorkflowCollections.getAllCollections();
        let totalCars = 0;
        await Promise.all(vehicleCollections.map(async (col) => {
          try {
            const snap = await getCountFromServer(collection(db, col));
            totalCars += snap.data().count;
          } catch { /* collection may not exist */ }
        }));

        let userCount = 0;
        try {
          const usersSnap = await getCountFromServer(collection(db, 'users'));
          userCount = usersSnap.data().count;
        } catch { /* fallback */ }

        let dealerCount = 0;
        try {
          const dealersSnap = await getCountFromServer(collection(db, 'dealerships'));
          dealerCount = dealersSnap.data().count;
        } catch { /* fallback */ }

        if (isActive) setStats({ cars: totalCars, users: userCount, dealers: dealerCount });
      } catch { /* silent */ }
    };
    load();
    return () => { isActive = false; };
  }, []);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+` : n > 0 ? `${n}+` : '—';

  return (
    <StatsSection style={{ position: 'relative', zIndex: 1 }}>
      <SectionContainer>
        <StatsContainer>
          <StatItem>
            <h3>{fmt(stats.cars)}</h3>
            <p>{t('home.stats.cars')}</p>
          </StatItem>
          <StatItem>
            <h3>{fmt(stats.users)}</h3>
            <p>{t('home.stats.satisfiedCustomers')}</p>
          </StatItem>
          <StatItem>
            <h3>{fmt(stats.dealers)}</h3>
            <p>{t('home.stats.dealers')}</p>
          </StatItem>
          <StatItem>
            <h3>98%</h3>
            <p>{t('home.stats.satisfaction')}</p>
          </StatItem>
        </StatsContainer>
      </SectionContainer>
    </StatsSection>
  );
};export default memo(StatsSectionComponent);
