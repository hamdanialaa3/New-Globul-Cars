// Top Brands Page - Professional Brand Showcase with Algorithm
// صفحة الماركات الأكثر شيوعاً - عرض احترافي مع خوارزمية ذكية

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { bulgarianCarService } from '../firebase/car-service';
import { FEATURED_BRANDS_ORDER, POPULAR_BRANDS, ELECTRIC_BRANDS } from '../services/featuredBrands';
import brandsData from '../data/car-brands-complete.json';

// ============================================
// Styled Components
// ============================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const PageHeader = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #005ca9;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CategorySection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CategoryHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #005ca9;
`;

const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .icon {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CategoryDescription = styled.p`
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.6;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled.div<{ featured?: boolean }>`
  background: ${props => props.featured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  border: ${props => props.featured ? 'none' : '2px solid #e9ecef'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${props => props.featured && `
    color: white;
    
    &::before {
      content: '⭐';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 1.5rem;
    }
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.featured ? 'transparent' : '#005ca9'};
  }
`;

const BrandLogoWrapper = styled.div<{ featured?: boolean }>`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.featured ? 'rgba(255, 255, 255, 0.2)' : '#f8f9fa'};
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 0.75rem;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: ${props => props.featured ? 'brightness(0) invert(1)' : 'none'};
  }
`;

const BrandName = styled.h3<{ featured?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.featured ? 'white' : '#212529'};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const BrandStats = styled.div<{ featured?: boolean }>`
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.featured ? 'rgba(255, 255, 255, 0.3)' : '#e9ecef'};
`;

const StatItem = styled.div<{ featured?: boolean }>`
  text-align: center;
  
  .label {
    font-size: 0.75rem;
    color: ${props => props.featured ? 'rgba(255, 255, 255, 0.8)' : '#6c757d'};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.featured ? 'white' : '#005ca9'};
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Badge = styled.span<{ variant?: 'popular' | 'electric' | 'commercial' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.variant) {
      case 'popular':
        return `
          background: #ffc107;
          color: #212529;
        `;
      case 'electric':
        return `
          background: #28a745;
          color: white;
        `;
      case 'commercial':
        return `
          background: #17a2b8;
          color: white;
        `;
      default:
        return `
          background: #6c757d;
          color: white;
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #6c757d;
`;

// ============================================
// Interface
// ============================================

interface BrandWithStats {
  id: string;
  name: string;
  logo: string;
  totalSeries: number;
  totalCars: number;
  featured?: boolean;
  reason?: 'popular' | 'electric' | 'commercial';
  description?: string;
}

// ============================================
// Component
// ============================================

const TopBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [brandsWithStats, setBrandsWithStats] = useState<BrandWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load brand statistics
  useEffect(() => {
    const loadBrandStats = async () => {
      try {
        setLoading(true);
        
        // Get all brands from the JSON data
        const allBrands = brandsData.brands;
        
        // Get car counts from Firebase for all brands at once (more efficient)
        let brandCounts: Record<string, number> = {};
        
        try {
          // Try to fetch all cars and count by brand
          const allCars = await bulgarianCarService.searchCars({}, 'createdAt', 'desc', 1000);
          
          // Count cars per brand
          allCars.cars.forEach(car => {
            const make = car.make;
            brandCounts[make] = (brandCounts[make] || 0) + 1;
          });
        } catch (error) {
          console.error('Error fetching car counts:', error);
          // Continue with empty counts
        }
        
        // Map brands with their statistics
        const brandsWithCounts = allBrands.map((brand) => {
          // Check if brand is featured
          const featuredInfo = FEATURED_BRANDS_ORDER.find(f => f.name === brand.name);
          
          return {
            id: brand.id,
            name: brand.name,
            logo: brand.logo,
            totalSeries: brand.series?.length || 0,
            totalCars: brandCounts[brand.name] || 0,
            featured: !!featuredInfo,
            reason: featuredInfo?.reason,
            description: featuredInfo?.description
          };
        });
        
        // Sort: Featured first (by order), then by car count
        const sorted = brandsWithCounts.sort((a, b) => {
          // Featured brands first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          // If both featured, sort by FEATURED_BRANDS_ORDER
          if (a.featured && b.featured) {
            const indexA = FEATURED_BRANDS_ORDER.findIndex(f => f.name === a.name);
            const indexB = FEATURED_BRANDS_ORDER.findIndex(f => f.name === b.name);
            return indexA - indexB;
          }
          
          // Otherwise sort by total cars (descending)
          return b.totalCars - a.totalCars;
        });
        
        setBrandsWithStats(sorted);
      } catch (error) {
        console.error('Error loading brand statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandStats();
  }, []);

  const handleBrandClick = (brandId: string) => {
    navigate(`/cars?brand=${brandId}`);
  };

  // Categorize brands
  const popularBrandsWithStats = brandsWithStats.filter(b => 
    b.featured && b.reason === 'popular'
  );
  
  const electricBrandsWithStats = brandsWithStats.filter(b => 
    ELECTRIC_BRANDS.includes(b.name)
  );
  
  const otherBrandsWithStats = brandsWithStats.filter(b => 
    !b.featured && !ELECTRIC_BRANDS.includes(b.name)
  );

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          Loading top brands...
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          {language === 'bg' ? 'Топ Марки Автомобили' : 'Top Car Brands'}
        </PageTitle>
        <PageSubtitle>
          {language === 'bg' 
            ? 'Разгледайте най-популярните автомобилни марки в България с реални данни и статистика'
            : 'Explore the most popular car brands in Bulgaria with real data and statistics'}
        </PageSubtitle>
      </PageHeader>

      <ContentContainer>
        {/* Popular Brands Section */}
        {popularBrandsWithStats.length > 0 && (
          <CategorySection>
            <CategoryHeader>
              <CategoryTitle>
                <span className="icon">⭐</span>
                {language === 'bg' ? 'Най-популярни марки' : 'Most Popular Brands'}
              </CategoryTitle>
              <CategoryDescription>
                {language === 'bg'
                  ? 'Най-търсените и надеждни марки на българския пазар'
                  : 'Most searched and reliable brands in the Bulgarian market'}
              </CategoryDescription>
            </CategoryHeader>
            
            <BrandsGrid>
              {popularBrandsWithStats.map((brand) => (
                <BrandCard
                  key={brand.id}
                  featured={true}
                  onClick={() => handleBrandClick(brand.id)}
                >
                  <BrandLogoWrapper featured={true}>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/brands/placeholder.svg';
                      }}
                    />
                  </BrandLogoWrapper>
                  
                  <BrandName featured={true}>{brand.name}</BrandName>
                  
                  <BrandStats featured={true}>
                    <StatItem featured={true}>
                      <div className="label">
                        {language === 'bg' ? 'Серии' : 'Series'}
                      </div>
                      <div className="value">{brand.totalSeries}</div>
                    </StatItem>
                    
                    <StatItem featured={true}>
                      <div className="label">
                        {language === 'bg' ? 'Коли' : 'Cars'}
                      </div>
                      <div className="value">{brand.totalCars}</div>
                    </StatItem>
                  </BrandStats>
                  
                  {brand.description && (
                    <BadgeContainer>
                      <Badge variant="popular">{brand.description}</Badge>
                    </BadgeContainer>
                  )}
                </BrandCard>
              ))}
            </BrandsGrid>
          </CategorySection>
        )}

        {/* Electric Brands Section */}
        {electricBrandsWithStats.length > 0 && (
          <CategorySection>
            <CategoryHeader>
              <CategoryTitle>
                <span className="icon">⚡</span>
                {language === 'bg' ? 'Електрически марки' : 'Electric Brands'}
              </CategoryTitle>
              <CategoryDescription>
                {language === 'bg'
                  ? 'Водещи марки в електрическите и хибридни автомобили'
                  : 'Leading brands in electric and hybrid vehicles'}
              </CategoryDescription>
            </CategoryHeader>
            
            <BrandsGrid>
              {electricBrandsWithStats.map((brand) => (
                <BrandCard
                  key={brand.id}
                  onClick={() => handleBrandClick(brand.id)}
                >
                  <BrandLogoWrapper>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/brands/placeholder.svg';
                      }}
                    />
                  </BrandLogoWrapper>
                  
                  <BrandName>{brand.name}</BrandName>
                  
                  <BrandStats>
                    <StatItem>
                      <div className="label">
                        {language === 'bg' ? 'Серии' : 'Series'}
                      </div>
                      <div className="value">{brand.totalSeries}</div>
                    </StatItem>
                    
                    <StatItem>
                      <div className="label">
                        {language === 'bg' ? 'Коли' : 'Cars'}
                      </div>
                      <div className="value">{brand.totalCars}</div>
                    </StatItem>
                  </BrandStats>
                  
                  <BadgeContainer>
                    <Badge variant="electric">⚡ EV/Hybrid</Badge>
                  </BadgeContainer>
                </BrandCard>
              ))}
            </BrandsGrid>
          </CategorySection>
        )}

        {/* All Other Brands Section */}
        {otherBrandsWithStats.length > 0 && (
          <CategorySection>
            <CategoryHeader>
              <CategoryTitle>
                <span className="icon">🚗</span>
                {language === 'bg' ? 'Всички марки' : 'All Brands'}
              </CategoryTitle>
              <CategoryDescription>
                {language === 'bg'
                  ? 'Пълна колекция от всички налични марки автомобили'
                  : 'Complete collection of all available car brands'}
              </CategoryDescription>
            </CategoryHeader>
            
            <BrandsGrid>
              {otherBrandsWithStats.map((brand) => (
                <BrandCard
                  key={brand.id}
                  onClick={() => handleBrandClick(brand.id)}
                >
                  <BrandLogoWrapper>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/brands/placeholder.svg';
                      }}
                    />
                  </BrandLogoWrapper>
                  
                  <BrandName>{brand.name}</BrandName>
                  
                  <BrandStats>
                    <StatItem>
                      <div className="label">
                        {language === 'bg' ? 'Серии' : 'Series'}
                      </div>
                      <div className="value">{brand.totalSeries}</div>
                    </StatItem>
                    
                    <StatItem>
                      <div className="label">
                        {language === 'bg' ? 'Коли' : 'Cars'}
                      </div>
                      <div className="value">{brand.totalCars}</div>
                    </StatItem>
                  </BrandStats>
                </BrandCard>
              ))}
            </BrandsGrid>
          </CategorySection>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default TopBrandsPage;

