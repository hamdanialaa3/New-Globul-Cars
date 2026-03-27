// src/pages/seo/AccidentCarsPage.tsx
// Accident Cars Page - Accident cars page
// Route: /koli/avarijni
// Goal: Display cars that have been in accidents or need repair

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { VEHICLE_COLLECTIONS } from '../../services/car/unified-car-types';
import CarCardCompact from '../../components/CarCard/CarCardCompact';
import { AlertTriangle } from 'lucide-react';
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

const WarningBanner = styled.div`
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  border: 2px solid #f44;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WarningIcon = styled.div`
  color: #f44;
  flex-shrink: 0;
`;

const WarningText = styled.p`
  font-size: 1rem;
  color: #c33;
  line-height: 1.6;
  margin: 0;
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
  color: #f44;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const AccidentCarsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    avgPrice: 0
  });

  useEffect(() => {
    loadAccidentCars();
  }, []);

  const loadAccidentCars = async () => {
    try {
      setLoading(true);
      
      const allCars: any[] = [];

      // Search for cars with accident-related keywords in description or condition
      for (const collectionName of VEHICLE_COLLECTIONS) {
        try {
          // Get all active cars and filter client-side for accident-related keywords
          const q = query(
            collection(db, collectionName),
            where('isActive', '==', true),
            where('isSold', '==', false),
            limit(100)
          );
          
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            const carData = { id: doc.id, ...doc.data() };
            const description = (carData.description || '').toLowerCase();
            const condition = (carData.condition || '').toLowerCase();
            
            // Bulgarian keywords for accident cars
            const accidentKeywords = [
              'авария', 'авариен', 'аварии', 'удар', 'удари',
              'повреден', 'повреда', 'ремонт', 'ремонтиран',
              'accident', 'damaged', 'repair', 'crashed'
            ];
            
            const hasAccidentKeyword = accidentKeywords.some(keyword => 
              description.includes(keyword) || condition.includes(keyword)
            );
            
            // Also check if condition explicitly states accident
            const isAccidentCar = hasAccidentKeyword || 
                                  condition.includes('accident') ||
                                  condition.includes('авариен') ||
                                  carData.hasAccident === true;
            
            if (isAccidentCar) {
              allCars.push(carData);
            }
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

      setCars(allCars.slice(0, 24));
    } catch (error) {
      logger.error('Error loading accident cars', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const seoTitle = language === 'bg'
    ? 'Аварийни коли - Автомобили с повреди - Koli One'
    : 'Accident Cars - Damaged Vehicles - Koli One';

  const seoDescription = language === 'bg'
    ? `Намерете автомобили с повреди или след ремонт. Прозрачни цени, детайлни описания на състоянието. Внимателно прочетете описанието преди покупка.`
    : `Find cars with damage or after repair. Transparent prices, detailed condition descriptions. Please read the description carefully before purchase.`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={language === 'bg' 
          ? 'аварийни коли, повредени автомобили, коли след ремонт, евтини коли, българия'
          : 'accident cars, damaged vehicles, cars after repair, cheap cars, bulgaria'} />
        <link rel="canonical" href="https://koli.one/koli/avarijni" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:locale" content="bg_BG" />
      </Helmet>

      <PageContainer>
        <HeroSection>
          <Title>
            <AlertTriangle size={40} />
            {language === 'bg' ? 'Аварийни коли' : 'Accident Cars'}
          </Title>
          <Subtitle>
            {language === 'bg'
              ? 'Автомобили с повреди или след ремонт'
              : 'Vehicles with damage or after repair'}
          </Subtitle>

          <WarningBanner>
            <WarningIcon>
              <AlertTriangle size={32} />
            </WarningIcon>
            <WarningText>
              {language === 'bg'
                ? '⚠️ ВНИМАНИЕ: Всички автомобили в тази категория имат повреди или са били ремонтирани след авария. Внимателно прочетете описанието и направете преглед преди покупка.'
                : '⚠️ WARNING: All cars in this category have damage or were repaired after an accident. Please read the description carefully and have an inspection before purchase.'}
            </WarningText>
          </WarningBanner>

          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>
                {language === 'bg' ? 'Налични обяви' : 'Available Listings'}
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.avgPrice > 0 ? `${stats.avgPrice.toLocaleString()} лв.` : 'N/A'}</StatValue>
              <StatLabel>
                {language === 'bg' ? 'Средна цена' : 'Average Price'}
              </StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        <ContentSection>
          <ContentTitle>
            {language === 'bg' 
              ? 'Аварийни и повредени автомобили'
              : 'Accident and Damaged Cars'}
          </ContentTitle>
          <ContentText>
            {language === 'bg'
              ? 'Тази категория включва автомобили, които са били повредени в авария или са претърпели други повреди. Всички продавачи са задължени да опишат точно състоянието на автомобила. Препоръчваме ви винаги да правите преглед от специалист преди покупка.'
              : 'This category includes cars that have been damaged in an accident or have suffered other damage. All sellers are required to accurately describe the condition of the vehicle. We recommend always having an inspection by a specialist before purchase.'}
          </ContentText>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              {t('common.loading')}
            </div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
              {language === 'bg' ? 'Няма налични автомобили в тази категория в момента.' : 'No cars available in this category at the moment.'}
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

export default AccidentCarsPage;

