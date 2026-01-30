/**
 * Marketplace Main Page
 * Entry point for Koli One Parts & Accessories Marketplace
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Star, TrendingUp, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { marketplaceProductService } from '@/services/marketplace/marketplace-product.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Product, ProductCategory } from '@/types/marketplace.types';

// Styled Components
const PageContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  padding-top: 100px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
  font-family: 'Martica', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled(motion.h1)<{ $isDark: boolean }>`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.125rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  margin-bottom: 2rem;
`;

const SearchBar = styled.div<{ $isDark: boolean }>`
  max-width: 600px;
  margin: 0 auto 3rem;
  display: flex;
  gap: 1rem;
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const SearchInput = styled.input<{ $isDark: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  color: ${props => props.$isDark ? 'white' : '#1e293b'};
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
  }
`;

const SearchButton = styled(motion.button)`
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const CategoryCard = styled(motion.div)<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  border: 2px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: #f97316;
    box-shadow: 0 8px 25px rgba(249, 115, 22, 0.2);
  }
`;

const CategoryIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const CategoryName = styled.h3<{ $isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 0.5rem;
`;

const CategoryCount = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const FeaturedSection = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const ProductCard = styled(motion.div)<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 0.5rem;
`;

const ProductRating = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const StatsBar = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  gap: 4rem;
  padding: 3rem 0;
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  border-radius: 16px;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin-top: 0.5rem;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

// Component
const MarketplacePage: React.FC = () => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'parts', icon: '🔧', name: { bg: 'Части', en: 'Parts' }, count: 0 },
    { id: 'accessories', icon: '✨', name: { bg: 'Аксесоари', en: 'Accessories' }, count: 0 },
    { id: 'tools', icon: '🛠️', name: { bg: 'Инструменти', en: 'Tools' }, count: 0 },
    { id: 'wheels', icon: '⚙️', name: { bg: 'Джанти', en: 'Wheels' }, count: 0 },
    { id: 'lighting', icon: '💡', name: { bg: 'Осветление', en: 'Lighting' }, count: 0 },
    { id: 'audio', icon: '🔊', name: { bg: 'Аудио', en: 'Audio' }, count: 0 }
  ];

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const products = await marketplaceProductService.getFeaturedProducts(12);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/marketplace/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/marketplace/category/${categoryId}`);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/marketplace/product/${productId}`);
  };

  const content = {
    title: { bg: 'Пазар за Части и Аксесоари', en: 'Parts & Accessories Marketplace' },
    subtitle: { bg: 'Открийте качествени части за вашия автомобил', en: 'Discover quality parts for your vehicle' },
    searchPlaceholder: { bg: 'Търсене на части, аксесоари...', en: 'Search parts, accessories...' },
    search: { bg: 'Търси', en: 'Search' },
    featured: { bg: 'Препоръчани Продукти', en: 'Featured Products' },
    stats: {
      products: { bg: 'Продукта', en: 'Products' },
      sellers: { bg: 'Продавачи', en: 'Sellers' },
      orders: { bg: 'Поръчки', en: 'Orders' }
    },
    comingSoon: { bg: 'Пазарът стартира скоро!', en: 'Marketplace launching soon!' },
    noProducts: { bg: 'Все още няма продукти', en: 'No products yet' }
  };

  if (loading) {
    return (
      <PageContainer $isDark={isDark}>
        <ContentWrapper>
          <LoadingSpinner />
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer $isDark={isDark}>
      <ContentWrapper>
        <HeroSection>
          <Title
            $isDark={isDark}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {content.title[language]}
          </Title>

          <Subtitle $isDark={isDark}>
            {content.subtitle[language]}
          </Subtitle>

          <SearchBar $isDark={isDark}>
            <SearchInput
              $isDark={isDark}
              type="text"
              placeholder={content.searchPlaceholder[language]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <SearchButton
              onClick={handleSearch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={20} />
              {content.search[language]}
            </SearchButton>
          </SearchBar>
        </HeroSection>

        <StatsBar $isDark={isDark}>
          <StatItem>
            <StatValue>1,500+</StatValue>
            <StatLabel $isDark={isDark}>{content.stats.products[language]}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>200+</StatValue>
            <StatLabel $isDark={isDark}>{content.stats.sellers[language]}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>5,000+</StatValue>
            <StatLabel $isDark={isDark}>{content.stats.orders[language]}</StatLabel>
          </StatItem>
        </StatsBar>

        <CategoriesGrid>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              $isDark={isDark}
              onClick={() => handleCategoryClick(category.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryName $isDark={isDark}>{category.name[language]}</CategoryName>
              <CategoryCount $isDark={isDark}>{category.count} {content.stats.products[language]}</CategoryCount>
            </CategoryCard>
          ))}
        </CategoriesGrid>

        <FeaturedSection>
          <SectionTitle $isDark={isDark}>{content.featured[language]}</SectionTitle>
          
          {featuredProducts.length === 0 ? (
            <EmptyState $isDark={isDark}>
              <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3>{content.comingSoon[language]}</h3>
              <p>{content.noProducts[language]}</p>
            </EmptyState>
          ) : (
            <ProductsGrid>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  $isDark={isDark}
                  onClick={() => handleProductClick(product.id)}
                  whileHover={{ scale: 1.03 }}
                >
                  <ProductImage
                    src={product.images[0]?.url || '/placeholder-product.jpg'}
                    alt={product.title}
                  />
                  <ProductInfo>
                    <ProductTitle $isDark={isDark}>{product.title}</ProductTitle>
                    <ProductPrice>
                      {product.price.toFixed(2)} {product.currency}
                    </ProductPrice>
                    <ProductRating $isDark={isDark}>
                      <Star size={16} fill="#f97316" color="#f97316" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </ProductRating>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          )}
        </FeaturedSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default MarketplacePage;
