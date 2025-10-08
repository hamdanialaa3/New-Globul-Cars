// City Cars Section - Main Component
// قسم السيارات حسب المدن البلغارية

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BULGARIAN_CITIES, BulgarianCity } from '../../../constants/bulgarianCities';
import CityCarCountService from '../../../services/cityCarCountService';
import GoogleMapSection from './GoogleMapSection';
import CityGrid from './CityGrid';
import * as S from './styles';

const CityCarsSection: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityCarCounts, setCityCarCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch REAL car counts for each city from Firebase
  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching real car counts from Firebase...');
        
        // Get all city counts from Firebase
        const counts = await CityCarCountService.getAllCityCounts();
        setCityCarCounts(counts);
        
        console.log('✅ City car counts loaded:', counts);
      } catch (error) {
        console.error('❌ Error fetching city car counts:', error);
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

        {/* Google Maps - Interactive */}
        <GoogleMapSection
          cities={BULGARIAN_CITIES}
          selectedCity={selectedCity}
          onCityClick={handleCityClick}
          cityCarCounts={cityCarCounts}
        />
        <S.MapHint>
          {t('home.cityCars.mapDescription')}
        </S.MapHint>

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

export default CityCarsSection;
