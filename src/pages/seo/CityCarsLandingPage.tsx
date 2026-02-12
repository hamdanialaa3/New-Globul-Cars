import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { serviceLogger } from '@/services/logger-service';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { MapPin, TrendingUp, Users, Car, Search } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

// Bulgarian cities with SEO data
const CITIES = {
  sofia: {
    bg: 'София',
    en: 'Sofia',
    population: 1236000,
    region: 'София-град',
    postalCode: '1000',
    description: {
      bg: 'Столицата на България с най-голям автомобилен пазар в страната',
      en: 'Capital of Bulgaria with the largest automotive market in the country'
    }
  },
  plovdiv: {
    bg: 'Пловдив',
    en: 'Plovdiv',
    population: 346893,
    region: 'Пловдив',
    postalCode: '4000',
    description: {
      bg: 'Вторият по големина град с активен пазар на автомобили',
      en: 'Second largest city with an active automotive market'
    }
  },
  varna: {
    bg: 'Варна',
    en: 'Varna',
    population: 335177,
    region: 'Варна',
    postalCode: '9000',
    description: {
      bg: 'Морската столица на България с динамичен автопазар',
      en: 'Maritime capital of Bulgaria with a dynamic car market'
    }
  },
  burgas: {
    bg: 'Бургас',
    en: 'Burgas',
    population: 202766,
    region: 'Бургас',
    postalCode: '8000',
    description: {
      bg: 'Важен икономически център на южното Черноморие',
      en: 'Important economic center of the southern Black Sea coast'
    }
  },
  ruse: {
    bg: 'Русе',
    en: 'Ruse',
    population: 144936,
    region: 'Русе',
    postalCode: '7000',
    description: {
      bg: 'Дунавски град с традиции в автомобилната търговия',
      en: 'Danube city with traditions in automotive trade'
    }
  },
  stara_zagora: {
    bg: 'Стара Загора',
    en: 'Stara Zagora',
    population: 136781,
    region: 'Стара Загора',
    postalCode: '6000',
    description: {
      bg: 'Бързо развиващ се град с растящ автомобилен пазар',
      en: 'Fast-growing city with an expanding automotive market'
    }
  },
  pleven: {
    bg: 'Плевен',
    en: 'Pleven',
    population: 106954,
    region: 'Плевен',
    postalCode: '5800',
    description: {
      bg: 'Седми по големина град с добре развита инфраструктура',
      en: 'Seventh largest city with well-developed infrastructure'
    }
  },
  sliven: {
    bg: 'Сливен',
    en: 'Sliven',
    population: 89848,
    region: 'Сливен',
    postalCode: '8800',
    description: {
      bg: 'Град в подножието на Сини камък с активна търговия',
      en: 'City at the foot of Sinite Kamani with active trade'
    }
  },
  dobrich: {
    bg: 'Добрич',
    en: 'Dobrich',
    population: 89026,
    region: 'Добрич',
    postalCode: '9300',
    description: {
      bg: 'Селскостопански регион с растящ интерес към автомобилите',
      en: 'Agricultural region with growing interest in automobiles'
    }
  },
  shumen: {
    bg: 'Шумен',
    en: 'Shumen',
    population: 80855,
    region: 'Шумен',
    postalCode: '9700',
    description: {
      bg: 'Исторически град с модерен автомобилен пазар',
      en: 'Historic city with a modern automotive market'
    }
  }
};

const CityCarsLandingPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [carsCount, setCarsCount] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [popularBrands, setPopularBrands] = useState<string[]>([]);

  const cityData = city ? CITIES[city as keyof typeof CITIES] : null;

  const texts = {
    bg: {
      title: 'Автомобили в',
      subtitle: 'Открийте най-добрите предложения за автомобили',
      availableCars: 'Налични автомобили',
      avgPrice: 'Средна цена',
      popularBrands: 'Популярни марки',
      whyBuyHere: 'Защо да купите автомобил в',
      advantages: [
        'Голям избор от автомобили',
        'Конкурентни цени',
        'Проверени продавачи',
        'Лесно финансиране',
        'Безплатна проверка на документи'
      ],
      searchCars: 'Търси автомобили в',
      viewAllCars: 'Виж всички автомобили',
      recentListings: 'Последни обяви',
      cityStats: 'Статистика за',
      dealerships: 'Автокъщи',
      privateSellers: 'Частни продавачи',
      newCars: 'Нови автомобили',
      usedCars: 'Употребявани',
      otherCities: 'Други градове',
      notFound: 'Градът не е намерен'
    },
    en: {
      title: 'Cars in',
      subtitle: 'Discover the best car deals',
      availableCars: 'Available Cars',
      avgPrice: 'Average Price',
      popularBrands: 'Popular Brands',
      whyBuyHere: 'Why buy a car in',
      advantages: [
        'Wide selection of cars',
        'Competitive prices',
        'Verified sellers',
        'Easy financing',
        'Free document check'
      ],
      searchCars: 'Search cars in',
      viewAllCars: 'View all cars',
      recentListings: 'Recent Listings',
      cityStats: 'Statistics for',
      dealerships: 'Dealerships',
      privateSellers: 'Private Sellers',
      newCars: 'New Cars',
      usedCars: 'Used Cars',
      otherCities: 'Other Cities',
      notFound: 'City not found'
    }
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    let isActive = true;
    const loadCityData = async () => {
      if (!cityData) return;
      try {
        const vehicleCollections = SellWorkflowCollections.getAllCollections();
        let totalCount = 0;
        let totalPrice = 0;
        let priceCount = 0;
        const brandMap: Record<string, number> = {};

        const promises = vehicleCollections.map(async (col) => {
          try {
            const q = query(
              collection(db, col),
              where('city', '==', cityData.bg),
              where('status', '==', 'active')
            );
            const snap = await getDocs(q);
            snap.docs.forEach((d) => {
              const data = d.data();
              totalCount++;
              if (data.price && typeof data.price === 'number') {
                totalPrice += data.price;
                priceCount++;
              }
              const make = data.make || data.brand;
              if (make) {
                brandMap[make] = (brandMap[make] || 0) + 1;
              }
            });
          } catch {
            // Collection may not exist yet — skip silently
          }
        });

        await Promise.all(promises);

        if (!isActive) return;

        setCarsCount(totalCount);
        setAvgPrice(priceCount > 0 ? Math.round(totalPrice / priceCount) : 0);

        const sortedBrands = Object.entries(brandMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([brand]) => brand);
        setPopularBrands(sortedBrands.length > 0 ? sortedBrands : ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota']);
      } catch (err) {
        serviceLogger.error('CityCarsLandingPage', 'Failed to load city data', err);
        if (isActive) {
          setCarsCount(0);
          setAvgPrice(0);
          setPopularBrands([]);
        }
      }
    };
    loadCityData();
    return () => { isActive = false; };
  }, [city, cityData]);

  if (!cityData) {
    return (
      <NotFoundContainer>
        <h2>{t.notFound}</h2>
      </NotFoundContainer>
    );
  }

  const cityName = language === 'bg' ? cityData.bg : cityData.en;
  const cityDesc = language === 'bg' ? cityData.description.bg : cityData.description.en;

  return (
    <>
      <Helmet>
        <title>{`${t.title} ${cityName} | Koli.one`}</title>
        <meta 
          name="description" 
          content={`${cityDesc}. ${t.availableCars}: ${carsCount}. ${t.searchCars} ${cityName}.`} 
        />
        <meta name="keywords" content={`автомобили ${cityName}, коли ${cityName}, кола ${cityData.bg}, car ${cityData.en}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t.title} ${cityName}`} />
        <meta property="og:description" content={cityDesc} />
        <meta property="og:type" content="website" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: cityName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: cityName,
              addressRegion: cityData.region,
              postalCode: cityData.postalCode,
              addressCountry: 'BG'
            },
            description: cityDesc
          })}
        </script>
      </Helmet>

      <PageContainer>
        <Hero>
          <HeroContent>
            <HeroTitle>
              {t.title} <Highlight>{cityName}</Highlight>
            </HeroTitle>
            <HeroSubtitle>{cityDesc}</HeroSubtitle>
            
            <StatsRow>
              <StatCard>
                <StatIcon><Car size={32} /></StatIcon>
                <StatValue>{carsCount}+</StatValue>
                <StatLabel>{t.availableCars}</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatIcon><TrendingUp size={32} /></StatIcon>
                <StatValue>{avgPrice.toLocaleString()} BGN</StatValue>
                <StatLabel>{t.avgPrice}</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatIcon><Users size={32} /></StatIcon>
                <StatValue>{cityData.population.toLocaleString()}</StatValue>
                <StatLabel>{language === 'bg' ? 'Жители' : 'Population'}</StatLabel>
              </StatCard>
            </StatsRow>

            <CTAButton onClick={() => navigate(`/cars?city=${city}`)}>
              <Search size={20} />
              {t.searchCars} {cityName}
            </CTAButton>
          </HeroContent>
        </Hero>

        <Section>
          <SectionTitle>{t.popularBrands}</SectionTitle>
          <BrandsGrid>
            {popularBrands.map((brand) => (
              <BrandCard key={brand} onClick={() => navigate(`/cars?brand=${brand}&city=${city}`)}>
                {brand}
              </BrandCard>
            ))}
          </BrandsGrid>
        </Section>

        <Section>
          <SectionTitle>{t.whyBuyHere} {cityName}</SectionTitle>
          <AdvantagesGrid>
            {t.advantages.map((advantage, idx) => (
              <AdvantageCard key={idx}>
                <CheckIcon>✓</CheckIcon>
                <AdvantageText>{advantage}</AdvantageText>
              </AdvantageCard>
            ))}
          </AdvantagesGrid>
        </Section>

        <Section>
          <SectionTitle>{t.otherCities}</SectionTitle>
          <CitiesGrid>
            {Object.entries(CITIES)
              .filter(([key]) => key !== city)
              .slice(0, 6)
              .map(([key, data]) => (
                <CityCard key={key} onClick={() => navigate(`/cars/city/${key}`)}>
                  <MapPin size={24} />
                  <CityName>{language === 'bg' ? data.bg : data.en}</CityName>
                  <CityRegion>{data.region}</CityRegion>
                </CityCard>
              ))}
          </CitiesGrid>
        </Section>
      </PageContainer>
    </>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme?.colors?.background || '#f8f9fa'};
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Highlight = styled.span`
  color: #ffc107;
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.9;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
`;

const StatIcon = styled.div`
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const CTAButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  background: white;
  color: #007bff;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
  }
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 2rem;
  text-align: center;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const BrandCard = styled.div`
  background: white;
  padding: 2rem 1rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    color: #007bff;
  }
`;

const AdvantagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const AdvantageCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CheckIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const AdvantageText = styled.div`
  color: ${(props) => props.theme?.colors?.text || '#333'};
  font-size: 1rem;
`;

const CitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
`;

const CityCard = styled.div`
  background: white;
  padding: 2rem 1rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    color: #007bff;
  }
`;

const CityName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
`;

const CityRegion = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

export default CityCarsLandingPage;
