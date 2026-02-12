// City Cars Section - Main Component

import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BULGARIAN_CITIES, BulgarianCity } from '@/constants/bulgarianCities';
import CityCarCountService from '@/services/cityCarCountService';
import { CityCarCountCache } from '@/services/cityCarCountCache';
import { convertCityCountsToRegionCounts } from '@/services/cityRegionMapper';
import GoogleMapSection from './GoogleMapSection';
import BulgariaMapFallback from '@/components/BulgariaMapFallback';
import PremiumBulgariaMap from '@/components/PremiumBulgariaMap';
import AdvancedBulgariaMap from '@/components/AdvancedBulgariaMap';
import LeafletBulgariaMap from '@/components/LeafletBulgariaMap';
import CityGrid from './CityGrid';
import * as S from './styles';
import { logger } from '../../services/logger-service';

const CityCarsSection: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityCarCounts, setCityCarCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch REAL car counts for each city from Firebase with caching
  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        setLoading(true);
        
        // ✅ Try to get from cache first
        const cachedCounts = CityCarCountCache.get();
        if (cachedCounts) {
          logger.info('City car counts loaded from cache', { 
            totalCities: Object.keys(cachedCounts).length,
            cacheAge: CityCarCountCache.getAge()
          });
          setCityCarCounts(cachedCounts);
          setLoading(false);
          return;
        }
        
        // Cache miss - fetch from Firebase
        logger.info('Cache miss - fetching city car counts from Firebase');
        const counts = await CityCarCountService.getAllCityCounts();
        
        // ✅ Save to cache
        CityCarCountCache.set(counts);
        setCityCarCounts(counts);
        
        logger.info('City car counts loaded and cached', { 
          totalCities: Object.keys(counts).length,
          expiresIn: CityCarCountCache.getTimeUntilExpiry()
        });
      } catch (error) {
        logger.error('Error fetching city car counts', error as Error);
        // Fallback to mock data if Firebase fails
        const mockCounts: Record<string, number> = {};
        BULGARIAN_CITIES.forEach(city => {
          mockCounts[city.id] = 0; // Show 0 if error
        });
        setCityCarCounts(mockCounts);
      } finally {
        setLoading(false);
      }
    };

    fetchCityCounts();
  }, []);

  const handleCityClick = (cityId: string) => {
    setSelectedCity(cityId);
    // Navigate to cars page with city filter
    navigate(`/cars?city=${cityId}`);
  };

  const handleViewAll = () => {
    navigate('/cars');
  };

  const getAllCitiesSorted = (): BulgarianCity[] => {
    return BULGARIAN_CITIES.sort((a, b) => (b.population || 0) - (a.population || 0));
  };

  return (
    <S.SectionContainer>
      <S.ContentWrapper>
        {/* Header */}
        <S.SectionHeader>
          <S.SectionTitle>{t('home.cityCars.title')}</S.SectionTitle>
          <S.SectionSubtitle>{t('home.cityCars.subtitle')}</S.SectionSubtitle>
          <S.ViewAllButton onClick={handleViewAll}>
            {t('home.cityCars.viewAll')} →
          </S.ViewAllButton>
        </S.SectionHeader>

        {/* Professional Leaflet Bulgaria Map */}
        <LeafletBulgariaMap
          carCounts={convertCityCountsToRegionCounts(cityCarCounts)}
          onCityClick={handleCityClick}
          highlightedCity={selectedCity || undefined}
        />

        {/* All Bulgarian Cities Grid - 28 Cities */}
        <CityGrid
          cities={getAllCitiesSorted()}
          carCounts={cityCarCounts}
          onCityClick={handleCityClick}
          loading={loading}
          language={language}
          initialDisplayCount={6}
        />
      </S.ContentWrapper>
    </S.SectionContainer>
  );
};

export default memo(CityCarsSection);
