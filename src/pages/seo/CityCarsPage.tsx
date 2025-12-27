// src/pages/seo/CityCarsPage.tsx
// City Cars Page - صفحة السيارات في المدينة
// الهدف: صفحات SEO محسّنة لكل مدينة في بلغاريا
// الموقع: بلغاريا | اللغات: BG/EN

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

// ==================== STYLED COMPONENTS ====================

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

const CityTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CitySubtitle = styled.p`
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
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary || '#FF8F10'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1.5rem;
`;

const TipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const TipCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.6)'
    : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${({ theme }) => theme.colors.primary || '#FF8F10'};
`;

const TipTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 0.5rem;
`;

const TipContent = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.6;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

// ==================== BULGARIAN CITIES MAPPING ====================

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

// ==================== COMPONENT ====================

const CityCarsPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalCars: 0,
    avgPrice: 0,
    popularBrands: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<any[]>([]);

  const cityInfo = city ? BULGARIAN_CITIES[city.toLowerCase()] : null;

  useEffect(() => {
    if (!city || !cityInfo) {
      navigate('/');
      return;
    }

    loadCityData();
  }, [city]);

  const loadCityData = async () => {
    if (!city || !cityInfo) return;

    try {
      setLoading(true);
      
      // Load cars from all collections
      const allCars: any[] = [];
      
      for (const collectionName of VEHICLE_COLLECTIONS) {
        try {
          const q = query(
            collection(db, collectionName),
            where('location', '==', cityInfo.bg),
            where('isActive', '==', true),
            where('isSold', '==', false),
            limit(20)
          );
          
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            allCars.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.warn(`Error loading from ${collectionName}:`, error);
        }
      }

      // Calculate stats
      const prices = allCars.map(c => c.price || c.netPrice || 0).filter(p => p > 0);
      const avgPrice = prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      // Get popular brands
      const brandCounts: Record<string, number> = {};
      allCars.forEach(car => {
        if (car.make) {
          brandCounts[car.make] = (brandCounts[car.make] || 0) + 1;
        }
      });
      const popularBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand]) => brand);

      setStats({
        totalCars: allCars.length,
        avgPrice,
        popularBrands
      });

      setCars(allCars.slice(0, 12));
    } catch (error) {
      console.error('Error loading city data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cityInfo) return null;

  // Generate SEO data
  const seoData = seoPrerenderService.generateCityPageSEO({
    city: city,
    cityBg: cityInfo.bg,
    totalCars: stats.totalCars,
    avgPrice: stats.avgPrice,
    popularBrands: stats.popularBrands,
    region: cityInfo.region
  });

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords.join(', ')} />
        <link rel="canonical" href={seoData.canonicalUrl} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonicalUrl} />
        <meta property="og:locale" content="bg_BG" />
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <PageContainer>
        <HeroSection>
          <CityTitle>
            {language === 'bg' 
              ? `Продажба на коли в ${cityInfo.bg}`
              : `Cars for Sale in ${cityInfo.bg}`}
          </CityTitle>
          <CitySubtitle>
            {language === 'bg'
              ? `Намерете идеалния автомобил в ${cityInfo.bg}. Българска платформа за българските автомобилисти.`
              : `Find the perfect car in ${cityInfo.bg}. Bulgarian platform for Bulgarian car enthusiasts.`}
          </CitySubtitle>

          {!loading && (
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.totalCars}</StatValue>
                <StatLabel>
                  {language === 'bg' ? 'Обяви' : 'Listings'}
                </StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.avgPrice.toLocaleString()} лв.</StatValue>
                <StatLabel>
                  {language === 'bg' ? 'Средна Цена' : 'Average Price'}
                </StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.popularBrands[0] || 'N/A'}</StatValue>
                <StatLabel>
                  {language === 'bg' ? 'Най-Популярна Марка' : 'Top Brand'}
                </StatLabel>
              </StatCard>
            </StatsGrid>
          )}
        </HeroSection>

        <ContentSection>
          <SectionTitle>
            {language === 'bg' ? 'Съвети за Купувачи' : 'Buyer Tips'}
          </SectionTitle>
          <TipsGrid>
            <TipCard>
              <TipTitle>
                {language === 'bg' ? 'Проверете Сервизната История' : 'Check Service History'}
              </TipTitle>
              <TipContent>
                {language === 'bg'
                  ? `Автомобилите в ${cityInfo.bg} често са по-добре поддържани поради наличието на сервизи. Препоръчваме ви да проверите сервизната история внимателно преди покупка.`
                  : `Cars in ${cityInfo.bg} are often better maintained due to the availability of service centers. We recommend checking the service history carefully before purchase.`}
              </TipContent>
            </TipCard>

            <TipCard>
              <TipTitle>
                {language === 'bg' ? 'Съвети за Продавачи' : 'Seller Tips'}
              </TipTitle>
              <TipContent>
                {language === 'bg'
                  ? `Цените в ${cityInfo.bg} са с 5-10% по-високи от провинцията. Вземете това предвид при определяне на цената на вашия автомобил.`
                  : `Prices in ${cityInfo.bg} are 5-10% higher than in the provinces. Take this into account when pricing your car.`}
              </TipContent>
            </TipCard>
          </TipsGrid>

          <SectionTitle>
            {language === 'bg' ? 'Налични Коли' : 'Available Cars'}
          </SectionTitle>
          {loading ? (
            <div>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</div>
          ) : (
            <CarsGrid>
              {cars.map(car => (
                <CarCardCompact key={car.id} car={car} />
              ))}
            </CarsGrid>
          )}
        </ContentSection>
      </PageContainer>
    </>
  );
};

export default CityCarsPage;

