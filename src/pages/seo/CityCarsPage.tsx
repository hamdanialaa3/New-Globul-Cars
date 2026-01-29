// src/pages/seo/CityCarsPage.tsx
// City Cars Page - صفحة السيارات في المدينة
// الهدف: صفحات SEO محسّنة لكل مدينة في بلغاريا مع محتوى بلغاري أصيل
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
import { Info, CheckCircle, AlertCircle } from 'lucide-react';
import { logger } from '../../services/logger-service';

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
  margin-bottom: 1.5rem;
`;

const LocalTipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const TipCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#f8f9fa'};
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid #FF7900;
`;

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const TipIcon = styled.div`
  color: #FF7900;
  display: flex;
  align-items: center;
`;

const TipTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const TipText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.secondary};
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

// ==================== LOCAL TIPS DATA ====================

const LOCAL_TIPS: Record<string, { buyer: string; seller: string }> = {
  sofia: {
    buyer: 'Автомобилите в София често са по-добре поддържани поради наличието на множество официални сервизи и специализирани работилници. Препоръчваме винаги да проверявате сервизната история внимателно и да правите преглед преди покупка.',
    seller: 'Цените в София са с 5-10% по-високи от провинцията поради по-голямото търсене и по-високия стандарт на живот. Вземете това предвид при определяне на цената. Също така, платформата ни ви дава възможност да достигнете до по-широк кръг от потенциални купувачи.'
  },
  plovdiv: {
    buyer: 'Пловдив е вторият най-голям град в България и предлага добър избор от автомобили. Автомобилите тук често са на по-добра цена от тези в София, но с почти същото качество. Проверете внимателно състоянието на автомобила, особено ако е от стар модел.',
    seller: 'Пазарът в Пловдив е активен, но цените са малко по-ниски от столицата. Очаквайте по-бърза продажба за популярни марки като BMW, Audi и Mercedes. Платформата ви помага да достигнете до купувачи от целия регион.'
  },
  varna: {
    buyer: 'Варна е приморски град и автомобилите тук често са подложени на корозия поради морския климат. Препоръчваме внимателна проверка на каросерията и шасито, особено за по-стари модели. В същото време, тук има добър избор от луксозни автомобили.',
    seller: 'Варна привлича туристи и купувачи от близките градове. Летният сезон е най-добрият период за продажба на автомобили. Популярни са SUV-тата и автомобилите подходящи за извънградско каране.'
  },
  burgas: {
    buyer: 'Бургас предлага разнообразие от автомобили на разумни цени. Поради близостта до морето, проверете внимателно за корозия, особено на по-стари модели. Има добър избор от дизелови автомобили, популярни в региона.',
    seller: 'Пазарът в Бургас е активен през цялата година. Цените са конкурентни и купувачите са информирани. Дизеловите автомобили се продават по-бързо поради по-ниските разходи за гориво.'
  }
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
          logger.warn(`Error loading from ${collectionName}`, { error });
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
      logger.error('Error loading city data', error as Error);
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

  const localTips = LOCAL_TIPS[city.toLowerCase()] || {
    buyer: language === 'bg' 
      ? 'Препоръчваме винаги да проверявате сервизната история внимателно и да правите преглед преди покупка.'
      : 'We recommend always checking the service history carefully and having an inspection before purchase.',
    seller: language === 'bg'
      ? 'Определете конкурентна цена и подгответе детайлно описание с качествени снимки за по-бърза продажба.'
      : 'Set a competitive price and prepare a detailed description with quality photos for faster sale.'
  };

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords.join(', ')} />
        <link rel="canonical" href={seoData.canonicalUrl} />
      </Helmet>

      <PageContainer>
        <HeroSection>
          <CityTitle>
            {language === 'bg' 
              ? `Продажба на коли в ${cityInfo.bg}`
              : `Car Sales in ${cityInfo.bg}`}
          </CityTitle>
          <CitySubtitle>
            {language === 'bg'
              ? `Намерете идеалния автомобил в ${cityInfo.bg}. Българска платформа за българските автомобилисти.`
              : `Find your ideal car in ${cityInfo.bg}. Bulgarian platform for Bulgarian car enthusiasts.`}
          </CitySubtitle>

          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.avgPrice.toLocaleString()} лв.</StatValue>
              <StatLabel>{language === 'bg' ? 'Средна цена' : 'Average Price'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.popularBrands.length}</StatValue>
              <StatLabel>{language === 'bg' ? 'Популярни марки' : 'Popular Brands'}</StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        {/* Bulgarian Content Section */}
        <ContentSection>
          <ContentTitle>
            {language === 'bg' 
              ? `Купувайте и продавайте коли в ${cityInfo.bg} лесно`
              : `Buy and sell cars in ${cityInfo.bg} easily`}
          </ContentTitle>
          <ContentText>
            {language === 'bg'
              ? `${cityInfo.bg} е един от най-активните пазари за автомобили в България. Нашата платформа ви дава възможност да намерите или предложите кола в ${cityInfo.bg} с пълна сигурност и прозрачност. Работим с проверени продавачи и предлагаме интуитивен интерфейс за лесно справяне с покупката или продажбата на автомобил.`
              : `${cityInfo.bg} is one of the most active car markets in Bulgaria. Our platform gives you the opportunity to find or offer a car in ${cityInfo.bg} with full security and transparency. We work with verified sellers and offer an intuitive interface for easy handling of car purchase or sale.`}
          </ContentText>

          <LocalTipsGrid>
            <TipCard>
              <TipHeader>
                <TipIcon>
                  <CheckCircle size={24} />
                </TipIcon>
                <TipTitle>
                  {language === 'bg' ? 'Съвет за купувачи' : 'Tips for Buyers'}
                </TipTitle>
              </TipHeader>
              <TipText>
                {language === 'bg' ? localTips.buyer : 'Always check the service history carefully and have an inspection before purchase. Verify the car\'s condition and negotiate with confidence.'}
              </TipText>
            </TipCard>

            <TipCard>
              <TipHeader>
                <TipIcon>
                  <Info size={24} />
                </TipIcon>
                <TipTitle>
                  {language === 'bg' ? 'Съвет за продавачи' : 'Tips for Sellers'}
                </TipTitle>
              </TipHeader>
              <TipText>
                {language === 'bg' ? localTips.seller : 'Set a competitive price and prepare a detailed description with quality photos for faster sale. Respond quickly to inquiries to increase your chances of a successful sale.'}
              </TipText>
            </TipCard>
          </LocalTipsGrid>
        </ContentSection>

        {/* Cars Listings */}
        <ContentSection>
          <ContentTitle>
            {language === 'bg' ? 'Налични автомобили' : 'Available Cars'}
          </ContentTitle>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              {language === 'bg' ? 'Зареждане...' : 'Loading...'}
            </div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
              {language === 'bg' ? 'Няма налични автомобили в момента.' : 'No cars available at the moment.'}
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

export default CityCarsPage;
