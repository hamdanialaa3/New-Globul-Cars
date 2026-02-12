// src/pages/seo/BrandCityPage.tsx
// Brand City Page - Brand page in the city
// Route: /koli/:city/:brand
// Example: /koli/sofia/bmw

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';
import { seoPrerenderService } from '../../services/seo/seo-prerender.service';
import styled from 'styled-components';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const BULGARIAN_CITIES: Record<string, { bg: string; region: string }> = {
  sofia: { bg: 'София', region: 'София-град' },
  plovdiv: { bg: 'Пловдив', region: 'Пловдив' },
  varna: { bg: 'Варна', region: 'Варна' },
  burgas: { bg: 'Бургас', region: 'Бургас' },
  ruse: { bg: 'Русе', region: 'Русе' },
  stara: { bg: 'Стара Загора', region: 'Стара Загора' },
  pleven: { bg: 'Плевен', region: 'Плевен' },
  sliven: { bg: 'Сливен', region: 'Сливен' }
};

const BrandCityPage: React.FC = () => {
  const { city, brand } = useParams<{ city: string; brand: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalCars: 0,
    avgPrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<any[]>([]);

  const cityInfo = city ? BULGARIAN_CITIES[city.toLowerCase()] : null;
  const brandDisplay = brand ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() : '';

  useEffect(() => {
    if (!city || !brand || !cityInfo) {
      navigate('/');
      return;
    }

    loadBrandCityData();
  }, [city, brand]);

  const loadBrandCityData = async () => {
    if (!city || !brand || !cityInfo) return;

    try {
      setLoading(true);
      
      const allCars: any[] = [];
      
      for (const collectionName of VEHICLE_COLLECTIONS) {
        try {
          const q = query(
            collection(db, collectionName),
            where('location', '==', cityInfo.bg),
            where('make', '==', brandDisplay),
            where('isActive', '==', true),
            where('isSold', '==', false),
            limit(20)
          );
          
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            allCars.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          logger.warn(`Error loading from ${collectionName}`, { error });
        }
      }

      const prices = allCars.map(c => c.price || c.netPrice || 0).filter(p => p > 0);
      const avgPrice = prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      setStats({
        totalCars: allCars.length,
        avgPrice
      });

      setCars(allCars.slice(0, 12));
    } catch (error) {
      logger.error('Error loading brand city data', error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!cityInfo || !brand) return null;

  // Generate SEO data with Bulgarian content
  const seoDescription = language === 'bg'
    ? `Намерете ${brandDisplay} автомобили в ${cityInfo.bg}. Голям избор от нови и употребявани ${brandDisplay} коли на конкурентни цени. Средна цена: ${stats.avgPrice} лв. Българска платформа за българските автомобилисти. Проверени продавачи, прозрачни цени, лесно справяне.`
    : `Find ${brandDisplay} cars in ${cityInfo.bg}. Wide selection of new and used ${brandDisplay} cars at competitive prices. Average price: ${stats.avgPrice} BGN. Bulgarian platform for Bulgarian car enthusiasts. Verified sellers, transparent prices, easy handling.`;

  const seoData = {
    title: language === 'bg' 
      ? `${brandDisplay} в ${cityInfo.bg} - Продажба на коли - Koli One`
      : `${brandDisplay} in ${cityInfo.bg} - Car Sales - Koli One`,
    description: seoDescription,
    keywords: [
      `${brandDisplay.toLowerCase()} ${cityInfo.bg.toLowerCase()}`,
      `коли ${brandDisplay} ${cityInfo.bg}`,
      `продажба ${brandDisplay} ${cityInfo.bg}`,
      `${brandDisplay} българия`,
      `автомобили ${brandDisplay}`,
      `втора употреба ${brandDisplay}`,
    ]
  };

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords.join(', ')} />
        <link rel="canonical" href={`https://koli.one/koli/${city}/${brand}`} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:locale" content="bg_BG" />
      </Helmet>

      <PageContainer>
        <HeroSection>
          <Title>
            {language === 'bg' 
              ? `${brandDisplay} в ${cityInfo.bg}`
              : `${brandDisplay} in ${cityInfo.bg}`}
          </Title>
          <Subtitle>
            {language === 'bg'
              ? `Намерете ${brandDisplay} автомобили в ${cityInfo.bg}`
              : `Find ${brandDisplay} cars in ${cityInfo.bg}`}
          </Subtitle>

          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.avgPrice.toLocaleString()} лв.</StatValue>
              <StatLabel>{language === 'bg' ? 'Средна цена' : 'Avg Price'}</StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            {language === 'bg' ? 'Зареждане...' : 'Loading...'}
          </div>
        ) : (
          <CarsGrid>
            {cars.map((car) => (
              <CarCardCompact key={car.id} car={car} />
            ))}
          </CarsGrid>
        )}
      </PageContainer>
    </>
  );
};

export default BrandCityPage;

