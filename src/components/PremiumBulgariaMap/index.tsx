import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Bulgaria regions with accurate SVG paths
const BULGARIA_REGIONS = [
  {
    id: 'sofia',
    name: { en: 'Sofia', bg: 'София' },
    path: 'M 180,220 L 200,210 L 220,215 L 230,230 L 220,245 L 200,250 L 180,240 Z',
    cities: ['Sofia'],
    color: '#3b82f6',
    centerX: 205,
    centerY: 230
  },
  {
    id: 'plovdiv',
    name: { en: 'Plovdiv', bg: 'Пловдив' },
    path: 'M 250,260 L 280,255 L 300,265 L 295,285 L 270,290 L 250,280 Z',
    cities: ['Plovdiv'],
    color: '#8b5cf6',
    centerX: 275,
    centerY: 272
  },
  {
    id: 'varna',
    name: { en: 'Varna', bg: 'Варна' },
    path: 'M 420,150 L 445,145 L 460,160 L 455,180 L 435,185 L 420,170 Z',
    cities: ['Varna'],
    color: '#06b6d4',
    centerX: 440,
    centerY: 165
  },
  {
    id: 'burgas',
    name: { en: 'Burgas', bg: 'Бургас' },
    path: 'M 400,250 L 430,245 L 450,260 L 445,280 L 420,285 L 400,270 Z',
    cities: ['Burgas'],
    color: '#10b981',
    centerX: 425,
    centerY: 265
  },
  {
    id: 'ruse',
    name: { en: 'Ruse', bg: 'Русе' },
    path: 'M 320,100 L 345,95 L 360,110 L 355,130 L 330,135 L 320,120 Z',
    cities: ['Ruse'],
    color: '#f59e0b',
    centerX: 340,
    centerY: 115
  },
  {
    id: 'blagoevgrad',
    name: { en: 'Blagoevgrad', bg: 'Благоевград' },
    path: 'M 120,280 L 150,275 L 165,290 L 160,310 L 135,315 L 120,300 Z',
    cities: ['Blagoevgrad'],
    color: '#ec4899',
    centerX: 142,
    centerY: 295
  },
  {
    id: 'pleven',
    name: { en: 'Pleven', bg: 'Плевен' },
    path: 'M 260,140 L 285,135 L 300,150 L 295,170 L 270,175 L 260,160 Z',
    cities: ['Pleven'],
    color: '#14b8a6',
    centerX: 280,
    centerY: 155
  },
  {
    id: 'stara-zagora',
    name: { en: 'Stara Zagora', bg: 'Стара Загора' },
    path: 'M 310,230 L 340,225 L 355,240 L 350,260 L 325,265 L 310,250 Z',
    cities: ['Stara Zagora'],
    color: '#f97316',
    centerX: 332,
    centerY: 245
  }
];

interface PremiumBulgariaMapProps {
  carCounts?: { [cityId: string]: number };
  onCityClick?: (cityId: string) => void;
  highlightedCity?: string;
}

const MapContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
`;

const MapTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SVGMap = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 24px;
  padding: 40px;
`;

const Region = styled.path<{ isHovered: boolean; isHighlighted: boolean }>`
  fill: ${props => props.isHighlighted ? '#fbbf24' : 'currentColor'};
  stroke: #ffffff;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.isHovered ? 1 : 0.85};
  transform-origin: center;
  
  &:hover {
    opacity: 1;
    stroke-width: 3;
    filter: brightness(1.2) drop-shadow(0 0 20px currentColor);
    transform: scale(1.05);
  }

  animation: ${props => props.isHighlighted ? 'pulse 2s ease-in-out infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 0.85;
    }
    50% {
      opacity: 1;
    }
  }
`;

const CityMarker = styled.g<{ isHovered: boolean }>`
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  
  &:hover {
    transform: scale(1.2);
  }

  circle {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transition: all 0.3s ease;
  }

  text {
    transition: all 0.3s ease;
  }

  ${props => props.isHovered && `
    transform: scale(1.2);
    
    circle {
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
    }
  `}
`;

const CityLabel = styled.text`
  font-size: 14px;
  font-weight: 700;
  fill: #1f2937;
  text-anchor: middle;
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9);
`;

const CarCountBadge = styled.text`
  font-size: 11px;
  font-weight: 600;
  fill: #ffffff;
  text-anchor: middle;
  pointer-events: none;
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(-10px)' : 'translateY(0)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
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
    border-top: 8px solid #764ba2;
  }
`;

const TooltipTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const TooltipStats = styled.div`
  font-size: 14px;
  opacity: 0.95;
  
  span {
    font-weight: 600;
    font-size: 24px;
    display: block;
    margin-top: 4px;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.color};
    box-shadow: 0 0 0 3px ${props => props.color}33;
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 32px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 16px;
  color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }

  h3 {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
  }
`;

export const PremiumBulgariaMap: React.FC<PremiumBulgariaMapProps> = ({
  carCounts = {},
  onCityClick,
  highlightedCity
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    visible: boolean;
    region?: typeof BULGARIA_REGIONS[0];
    count?: number;
  }>({ x: 0, y: 0, visible: false });
  
  const navigate = useNavigate();
  const { language } = useLanguage();

  const totalCars = useMemo(() => {
    return Object.values(carCounts).reduce((sum, count) => sum + count, 0);
  }, [carCounts]);

  const handleRegionClick = (regionId: string) => {
    if (onCityClick) {
      onCityClick(regionId);
    }
    navigate(`/search?region=${regionId}`);
  };

  const handleRegionHover = (event: React.MouseEvent, region: typeof BULGARIA_REGIONS[0]) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('svg')?.getBoundingClientRect();
    
    if (container) {
      setTooltipData({
        x: event.clientX - container.left,
        y: event.clientY - container.top - 80,
        visible: true,
        region,
        count: carCounts[region.id] || 0
      });
    }
    setHoveredRegion(region.id);
  };

  const handleRegionLeave = () => {
    setTooltipData(prev => ({ ...prev, visible: false }));
    setHoveredRegion(null);
  };

  return (
    <MapContainer>
      <MapTitle>
        {language === 'bg' ? 'Разгледайте автомобили в цяла България' :
         'Explore Cars Across Bulgaria'}
      </MapTitle>

      <div style={{ position: 'relative' }}>
        <SVGMap viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient definitions for each region */}
            {BULGARIA_REGIONS.map(region => (
              <linearGradient key={region.id} id={`gradient-${region.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={region.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={region.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
          <rect width="600" height="400" fill="url(#grid)" opacity="0.3"/>

          {/* Regions */}
          <g>
            {BULGARIA_REGIONS.map(region => (
              <Region
                key={region.id}
                d={region.path}
                style={{ color: `url(#gradient-${region.id})` }}
                isHovered={hoveredRegion === region.id}
                isHighlighted={highlightedCity === region.id}
                onClick={() => handleRegionClick(region.id)}
                onMouseMove={(e) => handleRegionHover(e, region)}
                onMouseLeave={handleRegionLeave}
              />
            ))}
          </g>

          {/* City markers */}
          <g>
            {BULGARIA_REGIONS.map(region => {
              const count = carCounts[region.id] || 0;
              return (
                <CityMarker
                  key={`marker-${region.id}`}
                  isHovered={hoveredRegion === region.id}
                  onClick={() => handleRegionClick(region.id)}
                  onMouseMove={(e) => handleRegionHover(e, region)}
                  onMouseLeave={handleRegionLeave}
                >
                  {/* Outer glow circle */}
                  <circle
                    cx={region.centerX}
                    cy={region.centerY}
                    r="18"
                    fill={region.color}
                    opacity="0.2"
                  />
                  
                  {/* Main circle */}
                  <circle
                    cx={region.centerX}
                    cy={region.centerY}
                    r="12"
                    fill={region.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  {/* Car count */}
                  <CarCountBadge
                    x={region.centerX}
                    y={region.centerY + 4}
                  >
                    {count > 999 ? '999+' : count}
                  </CarCountBadge>
                  
                  {/* City name */}
                  <CityLabel
                    x={region.centerX}
                    y={region.centerY + 35}
                  >
                    {region.name[language as keyof typeof region.name]}
                  </CityLabel>
                </CityMarker>
              );
            })}
          </g>
        </SVGMap>

        {/* Tooltip */}
        {tooltipData.visible && tooltipData.locationData?.regionName && (
          <Tooltip
            x={tooltipData.x}
            y={tooltipData.y}
            visible={tooltipData.visible}
          >
            <TooltipTitle>
              {language === 'bg' ? tooltipData.locationData?.regionName.name.bg : tooltipData.locationData?.regionName.name.en}
            </TooltipTitle>
            <TooltipStats>
              {language === 'bg' ? 'Налични автомобили' : 'Available Cars'}
              <span>{tooltipData.count || 0}</span>
            </TooltipStats>
          </Tooltip>
        )}
      </div>

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <h3>{totalCars.toLocaleString()}</h3>
          <p>{language === 'bg' ? 'Общо автомобили' : 'Total Cars'}</p>
        </StatCard>
        <StatCard>
          <h3>{BULGARIA_REGIONS.length}</h3>
          <p>{language === 'bg' ? 'Региони' : 'Regions'}</p>
        </StatCard>
        <StatCard>
          <h3>{Object.keys(carCounts).length}</h3>
          <p>{language === 'bg' ? 'Активни градове' : 'Active Cities'}</p>
        </StatCard>
      </StatsContainer>

      {/* Legend */}
      <LegendContainer>
        {BULGARIA_REGIONS.map(region => (
          <LegendItem
            key={`legend-${region.id}`}
            color={region.color}
            onClick={() => handleRegionClick(region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <span>{region.name[language as keyof typeof region.name]}</span>
          </LegendItem>
        ))}
      </LegendContainer>
    </MapContainer>
  );
};

export default PremiumBulgariaMap;

