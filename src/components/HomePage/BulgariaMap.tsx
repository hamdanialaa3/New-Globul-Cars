// Bulgaria Interactive Map Component
// خريطة بلغاريا التفاعلية

import React, { useState } from 'react';
import styled from 'styled-components';
import { BulgarianCity, getCityName } from '@/constants/bulgarianCities';
import { useLanguage } from '@/contexts/LanguageContext';

interface BulgariaMapProps {
  cities: BulgarianCity[];
  selectedCity: string | null;
  onCityClick: (cityId: string) => void;
  cityCarCounts: Record<string, number>;
}

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    135deg,
    rgba(230, 243, 255, 0.5) 0%,
    rgba(240, 248, 255, 0.5) 100%
  );
  border-radius: 12px;
  overflow: hidden;
`;

const SVGMap = styled.svg`
  width: 100%;
  height: 100%;
  
  /* Bulgaria outline */
  .map-outline {
    fill: rgba(0, 92, 169, 0.1);
    stroke: #005ca9;
    stroke-width: 2;
    transition: all 0.3s ease;
  }

  &:hover .map-outline {
    fill: rgba(0, 92, 169, 0.15);
  }
`;

const CityMarker = styled.g<{ $isSelected?: boolean; $isActive?: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;

  circle {
    fill: ${props => props.$isSelected ? '#ff8f10' : props.$isActive ? '#0066cc' : '#005ca9'};
    stroke: white;
    stroke-width: 2;
    filter: ${props => props.$isSelected 
      ? 'drop-shadow(0 0 10px #ff8f10)' 
      : props.$isActive 
        ? 'drop-shadow(0 0 8px #0066cc)'
        : 'drop-shadow(0 0 4px rgba(0, 92, 169, 0.3))'};
    transition: all 0.3s ease;
  }

  &:hover circle {
    r: 8;
    fill: #ff8f10;
    filter: drop-shadow(0 0 15px #ff8f10);
  }

  text {
    font-size: 11px;
    font-weight: 600;
    fill: #212529;
    pointer-events: none;
    text-shadow: 
      -1px -1px 0 white,
      1px -1px 0 white,
      -1px 1px 0 white,
      1px 1px 0 white;
  }
`;

const Tooltip = styled.div<{ $x: number; $y: number; $visible: boolean }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  transform: translate(-50%, -100%);
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
  white-space: nowrap;
  margin-top: -10px;

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid white;
  }
`;

const TooltipCity = styled.div`
  font-weight: 700;
  color: #005ca9;
  margin-bottom: 0.25rem;
`;

const TooltipCars = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  
  strong {
    color: #212529;
  }
`;

const BulgariaMap: React.FC<BulgariaMapProps> = ({
  cities,
  selectedCity,
  onCityClick,
  cityCarCounts
}) => {
  const { language } = useLanguage();
  const [hoveredCity, setHoveredCity] = useState<BulgarianCity | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Convert geographic coordinates to SVG coordinates
  // Bulgaria approximate bounds: lat 41.2-44.2, lng 22.4-28.6
  const coordToSVG = (lat: number, lng: number): { x: number; y: number } => {
    const latMin = 41.2, latMax = 44.2;
    const lngMin = 22.4, lngMax = 28.6;
    const svgWidth = 800, svgHeight = 450;
    
    const x = ((lng - lngMin) / (lngMax - lngMin)) * svgWidth;
    const y = ((latMax - lat) / (latMax - latMin)) * svgHeight;
    
    return { x, y };
  };

  const handleCityHover = (
    city: BulgarianCity, 
    event: React.MouseEvent<SVGGElement>
  ) => {
    setHoveredCity(city);
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
    if (containerRect) {
      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top
      });
    }
  };

  const handleCityLeave = () => {
    setHoveredCity(null);
  };

  // Simplified Bulgaria outline path (approximate)
  const bulgariaOutline = `
    M 120,200 
    L 180,180 
    L 250,170 
    L 320,165 
    L 400,160 
    L 480,155 
    L 560,150 
    L 640,155 
    L 700,165 
    L 750,180 
    L 780,210 
    L 790,250 
    L 780,290 
    L 750,320 
    L 700,340 
    L 640,355 
    L 560,365 
    L 480,370 
    L 400,375 
    L 320,370 
    L 250,360 
    L 180,340 
    L 140,310 
    L 120,270 
    Z
  `;

  return (
    <MapContainer>
      <SVGMap viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet">
        {/* Bulgaria outline */}
        <path 
          className="map-outline" 
          d={bulgariaOutline}
        />

        {/* City markers */}
        {cities.map((city) => {
          const { x, y } = coordToSVG(
            city.coordinates.lat,
            city.coordinates.lng
          );
          const isSelected = city.id === selectedCity;
          const isActive = cityCarCounts[city.id] > 0;

          return (
            <CityMarker
              key={city.id}
              $isSelected={isSelected}
              $isActive={isActive}
              onClick={() => onCityClick(city.id)}
              onMouseEnter={(e) => handleCityHover(city, e)}
              onMouseLeave={handleCityLeave}
            >
              <circle cx={x} cy={y} r={isSelected ? 8 : 6} />
              {city.isCapital && (
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isSelected ? 14 : 12} 
                  fill="none" 
                  stroke="#ffd700" 
                  strokeWidth="2"
                  opacity="0.7"
                />
              )}
            </CityMarker>
          );
        })}
      </SVGMap>

      {/* Tooltip */}
      {hoveredCity && (
        <Tooltip 
          $x={tooltipPos.x} 
          $y={tooltipPos.y} 
          $visible={true}
        >
          <TooltipCity>
            {getCityName(hoveredCity.id, language)}
          </TooltipCity>
          <TooltipCars>
            <strong>{cityCarCounts[hoveredCity.id] || 0}</strong>{' '}
            {language === 'bg' ? 'коли' : 'cars'}
          </TooltipCars>
        </Tooltip>
      )}
    </MapContainer>
  );
};

export default BulgariaMap;


