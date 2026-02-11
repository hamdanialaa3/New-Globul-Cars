/**
 * SEO City-Brand Page Template
 * Static pages for: /bmw-sofia, /audi-plovdiv, etc.
 * Pre-rendered at build time with Vite SSG
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { getSEOMetadata, BULGARIAN_CITIES, POPULAR_BRANDS } from '../data/seo-locations';

interface SEOPageParams {
  slug: string; // Format: "bmw-sofia"
}

const SEOCityBrandPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse slug: "bmw-sofia" → brandId="bmw", cityId="sofia"
  const [brandId, cityId] = slug?.split('-') || [];
  const metadata = getSEOMetadata(brandId, cityId);

  useEffect(() => {
    if (!metadata) return;

    const fetchListings = async () => {
      try {
        const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/firebase/firebase-config');
        const q = query(
          collection(db, 'passenger_cars'),
          where('make', '==', metadata.brand),
          where('city', '==', metadata.city),
          where('status', '==', 'active'),
          limit(20)
        );
        const snap = await getDocs(q);
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        // Silent fail - SEO page still renders with metadata
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [metadata]);

  if (!metadata) {
    return <NotFound>Страницата не е намерена</NotFound>;
  }

  const { brand, city, title, description, keywords } = metadata;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(', ')} />
        <link rel="canonical" href={metadata.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata.canonical} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': title,
            'description': description,
            'url': metadata.canonical,
            'itemListElement': [] // TODO: Add real listings
          })}
        </script>
      </Helmet>

      <Container>
        {/* Hero Section */}
        <Hero>
          <HeroContent>
            <h1>Използвани {brand.nameBg} в {city.nameBg}</h1>
            <Subtitle>
              Открийте проверени {brand.nameBg} автомобили в {city.nameBg}. 
              Реални снимки, честни цени, лесна комуникация.
            </Subtitle>
            <CTAButton to={`/search?brand=${brandId}&city=${cityId}`}>
              Виж всички обяви
            </CTAButton>
          </HeroContent>
        </Hero>

        {/* Stats Section */}
        <StatsSection>
          <StatCard>
            <StatNumber>12+</StatNumber>
            <StatLabel>{brand.nameBg} в {city.nameBg}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>5,000 лв - 50,000 лв</StatNumber>
            <StatLabel>Ценови диапазон</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>24/7</StatNumber>
            <StatLabel>Онлайн достъп</StatLabel>
          </StatCard>
        </StatsSection>

        {/* Featured Listings Placeholder */}
        <Section>
          <SectionTitle>Препоръчани {brand.nameBg} обяви</SectionTitle>
          
          {loading ? (
            <LoadingText>Зареждане на обяви...</LoadingText>
          ) : (
            <ListingsGrid>
              {/* TODO: Real listings from Firestore */}
              <PlaceholderCard>
                <p>Обявите се зареждат динамично...</p>
                <Link to={`/search?brand=${brandId}&city=${cityId}`}>
                  Виж всички →
                </Link>
              </PlaceholderCard>
            </ListingsGrid>
          )}
        </Section>

        {/* Why Choose Section */}
        <Section>
          <SectionTitle>Защо да изберете {brand.nameBg} в {city.nameBg}?</SectionTitle>
          <TextContent>
            <p>
              {brand.nameBg} е един от най-популярните автомобилни марки в България. 
              В {city.nameBg} има широк избор от използвани {brand.name} автомобили 
              за всеки бюджет и нужда.
            </p>
            <h3>Предимства на {brand.name}:</h3>
            <ul>
              <li>Надеждност и качество</li>
              <li>Добра поддръжка на резервни части</li>
              <li>Висока препродажна стойност</li>
              <li>Модерни технологии и комфорт</li>
            </ul>
            
            <h3>Пазар на автомобили в {city.nameBg}:</h3>
            <p>
              {city.nameBg} е {city.population > 500000 ? 'един от най-големите' : 'важен'} градове 
              за търговия с автомобили в България. Тук можете да намерите богат избор, 
              конкурентни цени и възможност за лична проверка.
            </p>
          </TextContent>
        </Section>

        {/* Other Cities Section */}
        <Section>
          <SectionTitle>{brand.nameBg} в други градове</SectionTitle>
          <CitiesGrid>
            {BULGARIAN_CITIES.filter(c => c.id !== cityId).slice(0, 6).map(otherCity => (
              <CityLink key={otherCity.id} to={`/${brandId}-${otherCity.id}`}>
                {brand.nameBg} {otherCity.nameBg}
              </CityLink>
            ))}
          </CitiesGrid>
        </Section>

        {/* Other Brands Section */}
        <Section>
          <SectionTitle>Други марки в {city.nameBg}</SectionTitle>
          <BrandsGrid>
            {POPULAR_BRANDS.filter(b => b.id !== brandId && b.popular).slice(0, 6).map(otherBrand => (
              <BrandLink key={otherBrand.id} to={`/${otherBrand.id}-${cityId}`}>
                {otherBrand.nameBg}
              </BrandLink>
            ))}
          </BrandsGrid>
        </Section>
      </Container>
    </>
  );
};

export default SEOCityBrandPage;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  text-align: center;
`;

const HeroContent = styled.div`
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: white;
  color: ${props => props.theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.text};
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const PlaceholderCard = styled.div`
  background: #f5f5f5;
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
  }
`;

const TextContent = styled.div`
  line-height: 1.8;
  color: ${props => props.theme.colors.text};

  h3 {
    margin: 2rem 0 1rem;
    color: ${props => props.theme.colors.primary};
  }

  ul {
    margin-left: 2rem;
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const CitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const CityLink = styled(Link)`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    color: ${props => props.theme.colors.primary};
  }
`;

const BrandsGrid = styled(CitiesGrid)``;
const BrandLink = styled(CityLink)``;

const LoadingText = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
`;

const NotFound = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  color: #666;
`;
