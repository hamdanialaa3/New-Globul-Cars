// Top Brands Page - Main Component
// Displays categorized car brands with smart sorting algorithm
// Constitution compliant: No emojis, under 300 lines, modular structure

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { unifiedCarService } from '@/services/car';
import brandsData from '../../../../data/car-brands-complete.json';
import { BrandWithStats } from './types';
import { calculateBrandStats, categorizeBrands } from './utils';
import CategorySection from './CategorySection';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageSubtitle,
  ContentContainer,
  LoadingContainer
} from './styles';

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
        
        const allBrands = brandsData.brands;
        let brandCounts: Record<string, number> = {};
        
        try {
          // Fetch cars and count by brand
          const allCars = await bulgarianCarService.searchCars(
            {}, 
            'createdAt', 
            'desc', 
            1000
          );
          
          allCars.cars.forEach(car => {
            const make = car.make;
            brandCounts[make] = (brandCounts[make] || 0) + 1;
          });
        } catch (error) {
          console.error('Error fetching car counts:', error);
        }
        
        // Map brands with statistics
        const brandsWithCounts = allBrands.map((brand) => 
          calculateBrandStats(
            brand.id,
            brand.name,
            brand.logo,
            brand.series?.length || 0,
            brandCounts[brand.name] || 0
          )
        );
        
        setBrandsWithStats(brandsWithCounts);
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

  // Categorize brands using intelligent algorithm
  const { popular, electric, others } = categorizeBrands(brandsWithStats);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
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
        <CategorySection
          title={language === 'bg' ? 'Най-популярни марки' : 'Most Popular Brands'}
          description={
            language === 'bg'
              ? 'Най-търсените и надеждни марки на българския пазар'
              : 'Most searched and reliable brands in the Bulgarian market'
          }
          icon="*"
          brands={popular}
          language={language}
          onBrandClick={handleBrandClick}
        />

        <CategorySection
          title={language === 'bg' ? 'Електрически марки' : 'Electric Brands'}
          description={
            language === 'bg'
              ? 'Водещи марки в електрическите и хибридни автомобили'
              : 'Leading brands in electric and hybrid vehicles'
          }
          icon="+"
          brands={electric}
          language={language}
          onBrandClick={handleBrandClick}
        />

        <CategorySection
          title={language === 'bg' ? 'Всички марки' : 'All Brands'}
          description={
            language === 'bg'
              ? 'Пълна колекция от всички налични марки автомобили'
              : 'Complete collection of all available car brands'
          }
          icon="#"
          brands={others}
          language={language}
          onBrandClick={handleBrandClick}
        />
      </ContentContainer>
    </PageContainer>
  );
};

export default TopBrandsPage;

