// Bulgaria Map Fallback - SVG Map when Google Maps fails
// خريطة بلغاريا البديلة - عندما تفشل خرائط جوجل

import React, { useState } from 'react';
import styled from 'styled-components';
import { BulgarianCity, getCityName } from '../../constants/bulgarianCities';
import { useLanguage } from '../../contexts/LanguageContext';
import { Car } from 'lucide-react';

const MapContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 92, 169, 0.15);
`;

const MapSVGContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const MapSVG = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const CityMarker = styled.circle<{ $isActive: boolean; $hasCards: boolean }>`
  fill: ${props => 
    props.$isActive ? '#FF7900' : 
    props.$hasCards ? '#005ca9' : 
    '#ccc'};
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    fill: #FF7900;
    r: 8;
    filter: drop-shadow(0 0 6px rgba(255, 121, 0, 0.6));
  }
`;

const CityLabel = styled.text<{ $isCapital?: boolean }>`
  fill: #2c3e50;
  font-size: ${props => props.$isCapital ? '14px' : '11px'};
  font-weight: ${props => props.$isCapital ? '700' : '600'};
  pointer-events: none;
  text-anchor: middle;
`;

const Tooltip = styled.div<{ $show: boolean; $x: number; $y: number }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 1000;
  display: ${props => props.$show ? 'block' : 'none'};
  transform: translate(-50%, -120%);
  min-width: 180px;
`;

const TooltipTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #005ca9;
  font-size: 1.1rem;
  font-weight: 700;
`;

const TooltipInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TooltipButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.3);
  }
`;

const InfoBanner = styled.div`
  background: rgba(255, 121, 0, 0.1);
  border: 2px solid rgba(255, 121, 0, 0.3);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #FF7900;
  font-weight: 600;
`;

interface BulgariaMapFallbackProps {
  cities: BulgarianCity[];
  selectedCity: string | null;
  onCityClick: (cityId: string) => void;
  cityCarCounts: Record<string, number>;
}

const BulgariaMapFallback: React.FC<BulgariaMapFallbackProps> = ({
  cities,
  selectedCity,
  onCityClick,
  cityCarCounts
}) => {
  const { language, t } = useLanguage();
  const [hoveredCity, setHoveredCity] = useState<BulgarianCity | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleCityHover = (city: BulgarianCity, event: React.MouseEvent) => {
    setHoveredCity(city);
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleCityLeave = () => {
    setHoveredCity(null);
  };

  const handleCityClickInternal = (cityId: string) => {
    onCityClick(cityId);
  };

  // Convert real coordinates to SVG positions
  // Bulgaria bounds: lat 41.2-44.2, lng 22.4-28.6
  const coordsToSVG = (lat: number, lng: number) => {
    const svgWidth = 800;
    const svgHeight = 500;
    
    // Bulgaria geographic bounds
    const latMin = 41.2;
    const latMax = 44.2;
    const lngMin = 22.4;
    const lngMax = 28.6;
    
    const x = ((lng - lngMin) / (lngMax - lngMin)) * svgWidth;
    const y = svgHeight - ((lat - latMin) / (latMax - latMin)) * svgHeight;
    
    return { x, y };
  };

  return (
    <MapContainer>
      <InfoBanner>
        {language === 'bg' 
          ? '🗺️ Interactive map of Bulgaria - Click on any city to view cars'
          : '🗺️ Interactive Bulgaria Map - Click any city to view cars'}
      </InfoBanner>

      <MapSVGContainer>
        <MapSVG viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e3f2fd" />
              <stop offset="100%" stopColor="#bbdefb" />
            </linearGradient>
          </defs>
          
          <rect width="800" height="500" fill="url(#bg-gradient)" rx="12" />
          
          {/* Grid lines */}
          <g opacity="0.1" stroke="#005ca9" strokeWidth="1">
            {[0, 100, 200, 300, 400, 500].map(y => (
              <line key={`h-${y}`} x1="0" y1={y} x2="800" y2={y} />
            ))}
            {[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="500" />
            ))}
          </g>

          {/* Cities */}
          {cities.map((city) => {
            const pos = coordsToSVG(city.coordinates.lat, city.coordinates.lng);
            const carCount = cityCarCounts[city.id] || 0;
            const isActive = city.id === selectedCity;
            const hasCards = carCount > 0;

            return (
              <g key={city.id}>
                <CityMarker
                  cx={pos.x}
                  cy={pos.y}
                  r={city.isCapital ? 8 : 5}
                  $isActive={isActive}
                  $hasCards={hasCards}
                  onClick={() => handleCityClickInternal(city.id)}
                  onMouseEnter={(e) => handleCityHover(city, e)}
                  onMouseLeave={handleCityLeave}
                />
                
                {city.isCapital && (
                  <>
                    <CityLabel
                      x={pos.x}
                      y={pos.y - 15}
                      $isCapital={true}
                    >
                      ⭐ {getCityName(city.id, language)}
                    </CityLabel>
                    {hasCards && (
                      <CityLabel
                        x={pos.x}
                        y={pos.y + 25}
                        style={{ fontSize: '10px', fill: '#005ca9', fontWeight: 700 }}
                      >
                        {carCount} {language === 'bg' ? 'коли' : 'cars'}
                      </CityLabel>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g transform="translate(620, 420)">
            <rect x="0" y="0" width="160" height="60" fill="white" rx="8" opacity="0.95" />
            <circle cx="15" cy="20" r="5" fill="#005ca9" />
            <text x="25" y="24" fontSize="11" fill="#2c3e50">{language === 'bg' ? 'Има коли' : 'Has cars'}</text>
            <circle cx="15" cy="40" r="5" fill="#ccc" />
            <text x="25" y="44" fontSize="11" fill="#2c3e50">{language === 'bg' ? 'Няма коли' : 'No cars'}</text>
          </g>
        </MapSVG>

        {/* Tooltip */}
        {hoveredCity && (
          <Tooltip $show={true} $x={tooltipPos.x} $y={tooltipPos.y}>
            <TooltipTitle>
              {hoveredCity.isCapital && '⭐ '}
              {getCityName(hoveredCity.id, language)}
            </TooltipTitle>
            <TooltipInfo>
              <Car size={16} />
              <strong>{cityCarCounts[hoveredCity.id] || 0}</strong> 
              {language === 'bg' ? ' коли' : ' cars'}
            </TooltipInfo>
            {hoveredCity.population && (
              <TooltipInfo style={{ fontSize: '0.8rem' }}>
                👥 {hoveredCity.population.toLocaleString()} 
                {language === 'bg' ? ' души' : ' people'}
              </TooltipInfo>
            )}
            <TooltipButton onClick={() => handleCityClickInternal(hoveredCity.id)}>
              {language === 'bg' ? 'Вижте колите' : 'View Cars'}
            </TooltipButton>
          </Tooltip>
        )}
      </MapSVGContainer>
    </MapContainer>
  );
};

export default BulgariaMapFallback;

