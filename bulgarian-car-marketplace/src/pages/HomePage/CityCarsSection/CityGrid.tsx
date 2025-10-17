// City Grid Component with Show More/Less functionality
// مكون عرض المدن في شبكة مع إظهار المزيد/أقل

import React, { useState } from 'react';
import { MapPin, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { BulgarianCity, getCityName } from '../../../constants/bulgarianCities';
import { useLanguage } from '../../../contexts/LanguageContext';
import * as S from './styles';

interface CityGridProps {
  cities: BulgarianCity[];
  carCounts: Record<string, number>;
  onCityClick: (cityId: string) => void;
  loading: boolean;
  language: 'en' | 'bg';
  initialDisplayCount?: number;
}

const CityGrid: React.FC<CityGridProps> = ({
  cities,
  carCounts,
  onCityClick,
  loading,
  language,
  initialDisplayCount = 8 // عرض 8 مدن بشكل افتراضي
}) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  // تحديد المدن المعروضة - جميع الـ 28 مدينة
  const displayedCities = showAll ? cities : cities.slice(0, initialDisplayCount);
  const hasMore = cities.length > initialDisplayCount;

  if (loading) {
    return (
      <S.GridContainer>
        {Array.from({ length: initialDisplayCount }).map((_, index) => (
          <S.LoadingCard key={index}>
            <S.LoadingText />
            <S.LoadingText style={{ width: '60%' }} />
            <S.LoadingText style={{ width: '40%', marginTop: '1rem' }} />
          </S.LoadingCard>
        ))}
      </S.GridContainer>
    );
  }

  if (cities.length === 0) {
    return (
      <S.EmptyState>
        <Car />
        <p>{language === 'bg' ? 'Няма налични градове' : 'No cities available'}</p>
      </S.EmptyState>
    );
  }

  return (
    <>
      <S.GridContainer>
        {displayedCities.map((city) => {
          const carCount = carCounts[city.id] || 0;
          const cityName = getCityName(city.id, language);

          return (
            <S.CityCard
              key={city.id}
              onClick={() => onCityClick(city.id)}
              role="button"
              aria-label={`View cars in ${cityName}`}
            >
              <S.CityName>
                <S.CityIcon>
                  <MapPin size={24} color="#005ca9" />
                </S.CityIcon>
                {cityName}
              </S.CityName>

              <S.CarCount>
                <Car size={18} />
                <S.CarCountNumber>{carCount}</S.CarCountNumber>
                <span>{t('home.cityCars.carsAvailable')}</span>
              </S.CarCount>

              <S.ViewCarsButton>
                {t('home.cityCars.viewCars')}
              </S.ViewCarsButton>

              {city.isCapital && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#7d6608'
                  }}
                >
                  ★ {language === 'bg' ? 'Столица' : 'Capital'}
                </div>
              )}
            </S.CityCard>
          );
        })}
      </S.GridContainer>

      {/* ✅ زر عرض المزيد/أقل - محسّن */}
      {hasMore && (
        <S.ShowMoreButton onClick={() => setShowAll(!showAll)}>
          {showAll ? (
            <>
              <ChevronUp size={20} style={{ marginRight: '0.5rem' }} />
              {language === 'bg' ? 'إخفاء' : 'Show Less'}
            </>
          ) : (
            <>
              <ChevronDown size={20} style={{ marginRight: '0.5rem' }} />
              {language === 'bg' 
                ? `عرض جميع المدن (${cities.length - initialDisplayCount} أخرى)` 
                : `Show All Cities (${cities.length - initialDisplayCount} more)`}
            </>
          )}
        </S.ShowMoreButton>
      )}
    </>
  );
};

export default CityGrid;
