// src/pages/HomePage.tsx
// Smart Home Page for Bulgarian Car Marketplace with Global Translation

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle/LanguageToggle';
import { bulgarianCarService, BulgarianCar } from '../firebase';
import LazyImage from '../components/LazyImage';
import CompleteLogoCollection from '../components/CompleteLogoCollection';

// Styled Components
const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.default}; /* استخدام الثيم */
`;

const HeroSection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper}; /* أبيض مثل mobile.de */
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  text-align: center;
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
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
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.text.primary}; /* استخدام الثيم */

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  opacity: 0.9;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.secondary.main};
  color: white;
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary.dark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &.secondary {
    background: transparent;
    border: 2px solid white;
    color: white;

    &:hover {
      background: white;
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;

const StatsSection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper}; /* استخدام الثيم */
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
`;

const StatItem = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

const FeaturedCarsSection = styled.section`
  background: ${({ theme }) => theme.colors.background.default}; /* استخدام الثيم */
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const CarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CarImage = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.grey[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.grey[400]};
`;

const CarContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CarTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CarPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &::before {
    content: '€';
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CarDetail = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease-in-out;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper}; /* استخدام الثيم */
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};

  .icon {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: block;
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }
`;

// Home Page Component
const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [featuredCars, setFeaturedCars] = useState<BulgarianCar[]>([]);
  const [loading, setLoading] = useState(true);

  // Load featured cars
  useEffect(() => {
    const loadFeaturedCars = async () => {
      try {
        const cars = await bulgarianCarService.getPopularCars(6);
        setFeaturedCars(cars);
      } catch (error) {
        console.error('Error loading featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCars();
  }, []);

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection style={{ position: 'relative', zIndex: 1 }}>
        <HeroContent>
          <HeroTitle>
            {t('home.hero.title')}
          </HeroTitle>
          <HeroSubtitle>
            {t('home.hero.subtitle')}
          </HeroSubtitle>
          <HeroButtons>
            <HeroButton to="/cars">
              {t('home.hero.browseCars')}
            </HeroButton>
            <HeroButton to="/sell" className="secondary">
              {t('home.hero.sellCar')}
            </HeroButton>
          </HeroButtons>
          
          {/* Language Demo Section */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>🌐 Language:</span>
            <LanguageToggle size="medium" />
          </div>
        </HeroContent>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection style={{ position: 'relative', zIndex: 1 }}>
        <StatsContainer>
          <StatItem>
            <h3>15,000+</h3>
            <p>{t('home.stats.cars')}</p>
          </StatItem>
          <StatItem>
            <h3>8,500+</h3>
            <p>{t('home.stats.satisfiedCustomers')}</p>
          </StatItem>
          <StatItem>
            <h3>500+</h3>
            <p>{t('home.stats.dealers')}</p>
          </StatItem>
          <StatItem>
            <h3>98%</h3>
            <p>{t('home.stats.satisfaction')}</p>
          </StatItem>
        </StatsContainer>
      </StatsSection>

      {/* Complete Logo Collection Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
        padding: '4rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#005ca9',
              marginBottom: '0.5rem'
            }}>
              Complete Logo Collection
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6c757d',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Our logos are designed to be versatile, professional, and instantly recognizable across all platforms and media types.
            </p>
            <Link
              to="/brand-gallery"
              style={{
                display: 'inline-block',
                background: '#005ca9',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '2px solid #005ca9'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#005ca9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#005ca9';
                e.currentTarget.style.color = 'white';
              }}
            >
              View All Collections →
            </Link>
          </div>

          {/* Complete Logo Collection with Rotating Images */}
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading logo collection...</div>}>
            {React.createElement(
              lazy(() => import('../components/CompleteLogoCollection')),
              {
                imageSize: 140,
                rotationSpeed: 3000,
                showCount: 8
              }
            )}
          </Suspense>
        </div>
      </section>

      {/* Dynamic Image Gallery Section */}
      <section style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '4rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#005ca9',
              marginBottom: '0.5rem'
            }}>
              Dynamic Image Gallery
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6c757d',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Experience our rotating image gallery featuring beautiful car photography.
              Images change automatically with smooth circular transitions.
            </p>
            <Link
              to="/brand-gallery"
              style={{
                display: 'inline-block',
                background: '#005ca9',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '2px solid #005ca9'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#005ca9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#005ca9';
                e.currentTarget.style.color = 'white';
              }}
            >
              View Full Gallery →
            </Link>
          </div>

          {/* Import and use CircularImageGallery */}
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading gallery...</div>}>
            {React.createElement(
              lazy(() => import('../components/CircularImageGallery')),
              {
                imageSize: 160,
                rotationSpeed: 3500,
                showCount: 6
              }
            )}
          </Suspense>
        </div>
      </section>

      {/* Featured Cars Section */}
      <FeaturedCarsSection style={{ position: 'relative', zIndex: 1 }}>
        <SectionContainer>
          <SectionHeader>
            <h2>{t('home.featured.title')}</h2>
            <p>{t('home.featured.subtitle')}</p>
          </SectionHeader>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              {t('common.loading')}
            </div>
          ) : (
            <>
              <CarsGrid>
                {featuredCars.map((car) => {
                  const imgCount = Array.isArray(car.images) ? car.images.length : 0;
                  const firstImg = imgCount > 0 ? car.images![0] : undefined;
                  const city = car.location?.city ?? '—';
                  return (
                  <CarCard key={car.id}>
                    <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
                      <CarImage>
                        {firstImg ? (
                          <LazyImage src={firstImg} alt={car.title} placeholder="🚗" />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#ccc'
                          }}>
                            🚗
                          </div>
                        )}
                      </CarImage>
                      <CarContent>
                        <CarTitle>{car.title}</CarTitle>
                        <CarPrice>{car.price.toLocaleString()}</CarPrice>
                        <CarDetails>
                          <CarDetail>📅 {car.year}</CarDetail>
                          <CarDetail>⚡ {car.power} HP</CarDetail>
                          <CarDetail>⛽ {car.fuelType}</CarDetail>
                        </CarDetails>
                        <CarDetails>
                          <CarDetail>📍 {city}</CarDetail>
                          <CarDetail>👁️ {car.views}</CarDetail>
                        </CarDetails>
                      </CarContent>
                    </Link>
                  </CarCard>
                );})}
              </CarsGrid>

              <div style={{ textAlign: 'center' }}>
                <ViewAllButton to="/cars">
                  {t('home.featured.viewAll')}
                </ViewAllButton>
              </div>
            </>
          )}
        </SectionContainer>
      </FeaturedCarsSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionContainer>
          <SectionHeader>
            <h2>{t('home.features.title')}</h2>
            <p>{t('home.features.subtitle')}</p>
          </SectionHeader>

          <FeaturesGrid>
            <FeatureCard>
              <span className="icon">🔍</span>
              <h3>{t('home.features.search.title')}</h3>
              <p>{t('home.features.search.description')}</p>
            </FeatureCard>

            <FeatureCard>
              <span className="icon">✅</span>
              <h3>{t('home.features.verified.title')}</h3>
              <p>{t('home.features.verified.description')}</p>
            </FeatureCard>

            <FeatureCard>
              <span className="icon">💰</span>
              <h3>{t('home.features.finance.title')}</h3>
              <p>{t('home.features.finance.description')}</p>
            </FeatureCard>

            <FeatureCard>
              <span className="icon">🛡️</span>
              <h3>{t('home.features.insurance.title')}</h3>
              <p>{t('home.features.insurance.description')}</p>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default HomePage;