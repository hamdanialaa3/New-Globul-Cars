// src/pages/seo/NewCarsPage.tsx
// New Cars Page - صفحة السيارات الجديدة
// Route: /koli/novi
// الهدف: عرض السيارات المضافة مؤخراً (آخر 7-30 يوم)

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { VEHICLE_COLLECTIONS } from '../../services/car/unified-car-types';
import CarCardCompact from '../../components/CarCard/CarCardCompact';
import { logger } from '../../services/logger-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  padding: 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'white'};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ContentTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1.5rem;
`;

const ContentText = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #FF7900;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const NewCarsPage: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    last24Hours: 0,
    last7Days: 0
  });

  useEffect(() => {
    loadNewCars();
  }, []);

  const loadNewCars = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const allCars: any[] = [];
      let count24h = 0;
      let count7d = 0;

      for (const collectionName of VEHICLE_COLLECTIONS) {
        try {
          const q = query(
            collection(db, collectionName),
            where('isActive', '==', true),
            where('isSold', '==', false),
            where('createdAt', '>=', Timestamp.fromDate(last30Days)),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            const carData = { id: doc.id, ...doc.data() };
            allCars.push(carData);
            
            const createdAt = carData.createdAt?.toDate ? carData.createdAt.toDate() : new Date(carData.createdAt);
            if (createdAt >= last24Hours) count24h++;
            if (createdAt >= last7Days) count7d++;
          });
        } catch (error) {
          logger.warn(`Error loading from ${collectionName}`, { error });
        }
      }

      // Sort by createdAt (newest first)
      allCars.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setStats({
        totalCars: allCars.length,
        last24Hours: count24h,
        last7Days: count7d
      });

      setCars(allCars.slice(0, 24));
    } catch (error) {
      logger.error('Error loading new cars', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const seoTitle = language === 'bg'
    ? 'Нови коли - Последни добавени автомобили - Bulgarski Avtomobili'
    : 'New Cars - Recently Added Vehicles - Bulgarski Avtomobili';

  const seoDescription = language === 'bg'
    ? `Намерете най-новите автомобили, добавени в последните дни. Голям избор от нови обяви от частни лица, автосалони и компании. Българска платформа за българските автомобилисти.`
    : `Find the newest cars added in recent days. Wide selection of new listings from private sellers, dealerships and companies. Bulgarian platform for Bulgarian car enthusiasts.`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={language === 'bg' 
          ? 'нови коли, последни обяви, нови автомобили, българия, продажба коли'
          : 'new cars, latest listings, new vehicles, bulgaria, car sales'} />
        <link rel="canonical" href="https://globulcars.bg/koli/novi" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:locale" content="bg_BG" />
      </Helmet>

      <PageContainer>
        <HeroSection>
          <Title>
            {language === 'bg' ? 'Нови коли' : 'New Cars'}
          </Title>
          <Subtitle>
            {language === 'bg'
              ? 'Най-новите автомобили, добавени в последните дни'
              : 'The newest cars added in recent days'}
          </Subtitle>

          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>
                {language === 'bg' ? 'Нови обяви (30 дни)' : 'New Listings (30 days)'}
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.last7Days}</StatValue>
              <StatLabel>
                {language === 'bg' ? 'Последни 7 дни' : 'Last 7 Days'}
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.last24Hours}</StatValue>
              <StatLabel>
                {language === 'bg' ? 'Последни 24 часа' : 'Last 24 Hours'}
              </StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        <ContentSection>
          <ContentTitle>
            {language === 'bg' 
              ? 'Най-новите автомобили в България'
              : 'Latest Cars in Bulgaria'}
          </ContentTitle>
          <ContentText>
            {language === 'bg'
              ? 'Разгледайте най-новите автомобили, добавени в платформата ни. Всички обяви са проверени и актуализирани. Намерете идеалния автомобил с най-новите условия и цени.'
              : 'Browse the newest cars added to our platform. All listings are verified and up-to-date. Find your ideal car with the latest conditions and prices.'}
          </ContentText>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              {language === 'bg' ? 'Зареждане...' : 'Loading...'}
            </div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
              {language === 'bg' ? 'Няма нови автомобили в момента.' : 'No new cars available at the moment.'}
            </div>
          ) : (
            <CarsGrid>
              {cars.map((car) => (
                <CarCardCompact key={car.id} car={car} />
              ))}
            </CarsGrid>
          )}
        </ContentSection>
      </PageContainer>
    </>
  );
};

export default NewCarsPage;

