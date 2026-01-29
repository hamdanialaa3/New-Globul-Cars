// City Grid Component with Show More/Less functionality
// مكون عرض المدن في شبكة مع إظهار المزيد/أقل

import React, { useState } from 'react';
import { MapPin, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { BulgarianCity, getCityName } from '@/constants/bulgarianCities';
import { useLanguage } from '@/contexts/LanguageContext';
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
            <S.LoadingCircle />
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
              title={`${cityName} - ${carCount} ${t('home.cityCars.carsAvailable')}`}
            >
              {/* أيقونة المدينة */}
              <S.CityIcon>
                <MapPin size={28} color="#005ca9" />
              </S.CityIcon>

              {/* اسم المدينة */}
              <S.CityName>
                {cityName}
              </S.CityName>

              {/* عدد السيارات */}
              {carCount > 0 && (
                <S.CarCount>
                  <Car size={14} />
                  <S.CarCountNumber>{carCount}</S.CarCountNumber>
                </S.CarCount>
              )}

              {/* شارة العاصمة */}
              {city.isCapital && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: '#7d6608',
                    boxShadow: '0 2px 6px rgba(255, 215, 0, 0.5)',
                    border: '2px solid rgba(255, 215, 0, 0.4)'
                  }}
                  title={language === 'bg' ? 'Столица' : 'Capital'}
                >
                  ★
                </div>
              )}
            </S.CityCard>
          );
        })}
      </S.GridContainer>

      {/* ✅ Show More/Less Button - English & Bulgarian */}
      {hasMore && (
        <S.ShowMoreButton onClick={() => setShowAll(!showAll)}>
          {showAll ? (
            <>
              <ChevronUp size={20} style={{ marginRight: '0.5rem' }} />
              {language === 'bg' ? 'Покажи по-малко' : 'Show Less'}
            </>
          ) : (
            <>
              <ChevronDown size={20} style={{ marginRight: '0.5rem' }} />
              {language === 'bg' 
                ? `Покажи всички региони (${cities.length - initialDisplayCount} повече)` 
                : `Show All Regions (${cities.length - initialDisplayCount} more)`}
            </>
          )}
        </S.ShowMoreButton>
      )}
    </>
  );
};

export default CityGrid;
