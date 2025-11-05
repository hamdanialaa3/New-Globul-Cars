// Professional Interactive Bulgaria Map with SVG
// خريطة بلغاريا التفاعلية الاحترافية مع SVG

import React, { useState } from 'react';
import styled from 'styled-components';
import { BulgarianCity, getCityName } from '../../../../../constants/bulgarianCities';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { MapPin, Car } from 'lucide-react';

interface InteractiveBulgariaMapProps {
  cities: BulgarianCity[];
  selectedCity: string | null;
  onCityClick: (cityId: string) => void;
  cityCarCounts: Record<string, number>;
}

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 92, 169, 0.2);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SVGContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2.2 / 1; /* عرضاني أكثر */
  background: linear-gradient(
    135deg,
    rgba(230, 243, 255, 0.3) 0%,
    rgba(240, 248, 255, 0.3) 100%
  );
  border-radius: 12px;
  overflow: visible;
`;

const MapSVG = styled.svg`
  width: 100%;
  height: 100%;
  
  .bulgaria-outline {
    fill: url(#mapGradient);
    stroke: #005ca9;
    stroke-width: 2;
    filter: drop-shadow(0 4px 10px rgba(0, 92, 169, 0.1));
  }
`;

const CityMarker = styled.g<{ $isSelected: boolean; $hasCards: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;

  circle {
    fill: ${props => 
      props.$isSelected ? '#ff8f10' : 
      props.$hasCards ? '#005ca9' : '#94a3b8'};
    stroke: white;
    stroke-width: 3;
    filter: ${props => 
      props.$isSelected 
        ? 'drop-shadow(0 0 12px #ff8f10)' 
        : props.$hasCards 
          ? 'drop-shadow(0 0 8px rgba(0, 92, 169, 0.5))'
          : 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))'};
    transition: all 0.3s ease;
  }

  &:hover circle {
    r: 14;
    fill: #ff8f10;
    filter: drop-shadow(0 0 18px #ff8f10);
  }

  text {
    font-size: 13px;
    font-weight: 600;
    fill: #212529;
    pointer-events: none;
    text-anchor: middle;
    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const Tooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -120%);
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 100;
  min-width: 200px;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

const TooltipCity = styled.div`
  font-weight: 700;
  color: #005ca9;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const TooltipCars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #6c757d;
  
  strong {
    color: #212529;
    font-size: 1.3rem;
  }
`;

const TooltipHint = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
  text-align: center;
`;

const InteractiveBulgariaMap: React.FC<InteractiveBulgariaMapProps> = ({
  cities,
  selectedCity,
  onCityClick,
  cityCarCounts
}) => {
  const { language } = useLanguage();
  const [hoveredCity, setHoveredCity] = useState<BulgarianCity | null>(null);

  // Simplified Bulgaria outline (professional approximation)
  const bulgariaPath = `
    M 150,220 L 200,200 L 280,185 L 360,175 L 440,170 L 520,168 
    L 600,170 L 680,175 L 760,185 L 840,200 L 900,220 L 950,250 
    L 980,290 L 990,340 L 980,390 L 950,430 L 900,460 L 840,480 
    L 760,495 L 680,505 L 600,510 L 520,512 L 440,510 L 360,505 
    L 280,495 L 200,480 L 150,460 L 110,430 L 80,390 L 70,340 
    L 80,290 L 110,250 Z
  `;

  // Convert geographic coordinates to SVG (wider aspect)
  const coordToSVG = (lat: number, lng: number): { x: number; y: number } => {
    const latMin = 41.2, latMax = 44.2;
    const lngMin = 22.4, lngMax = 28.6;
    const svgWidth = 1000, svgHeight = 450;
    
    const x = ((lng - lngMin) / (lngMax - lngMin)) * svgWidth;
    const y = ((latMax - lat) / (latMax - latMin)) * svgHeight;
    
    return { x: x + 50, y: y + 50 }; // padding
  };

  return (
    <MapContainer>
      <SVGContainer>
        <MapSVG viewBox="0 0 1100 550" preserveAspectRatio="xMidYMid meet">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(230, 243, 255, 0.5)" />
              <stop offset="50%" stopColor="rgba(240, 248, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(230, 243, 255, 0.5)" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Bulgaria outline */}
          <path className="bulgaria-outline" d={bulgariaPath} />

          {/* City markers */}
          {cities.map((city) => {
            const { x, y } = coordToSVG(
              city.coordinates.lat,
              city.coordinates.lng
            );
            const isSelected = city.id === selectedCity;
            const hasCards = cityCarCounts[city.id] > 0;

            return (
              <CityMarker
                key={city.id}
                $isSelected={isSelected}
                $hasCards={hasCards}
                onClick={() => onCityClick(city.id)}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <circle cx={x} cy={y} r={isSelected ? 12 : 10} />
                
                {/* Star for capital */}
                {city.isCapital && (
                  <>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={20} 
                      fill="none" 
                      stroke="#ffd700" 
                      strokeWidth="2"
                      opacity="0.7"
                    />
                    <text 
                      x={x} 
                      y={y - 25} 
                      fontSize="18"
                      textAnchor="middle"
                    >
                      ⭐
                    </text>
                  </>
                )}
                
                {/* Pulse animation for selected */}
                {isSelected && (
                  <circle cx={x} cy={y} r="12">
                    <animate
                      attributeName="r"
                      from="12"
                      to="20"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.8"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </CityMarker>
            );
          })}
        </MapSVG>

        {/* Tooltip */}
        {hoveredCity && (
          <Tooltip $visible={true}>
            <TooltipCity>
              {hoveredCity.isCapital && '⭐ '}
              {getCityName(hoveredCity.id, language)}
            </TooltipCity>
            <TooltipCars>
              <Car size={18} color="#005ca9" />
              <strong>{cityCarCounts[hoveredCity.id] || 0}</strong>
              {language === 'bg' ? 'коли' : 'cars'}
            </TooltipCars>
            <TooltipHint>
              {language === 'bg' ? 'Кликнете за преглед' : 'Click to view'}
            </TooltipHint>
          </Tooltip>
        )}
      </SVGContainer>
    </MapContainer>
  );
};

export default InteractiveBulgariaMap;


