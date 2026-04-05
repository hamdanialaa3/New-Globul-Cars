import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Bulgaria regions with gear-inspired SVG paths
const BULGARIA_REGIONS = [
  {
    id: 'sofia',
    name: { en: 'Sofia', bg: 'София' },
    path: 'M 180,220 L 200,210 L 220,215 L 230,230 L 220,245 L 200,250 L 180,240 Z',
    cities: ['Sofia'],
    color: '#3b82f6',
    centerX: 205,
    centerY: 230,
    gearSize: 45,
    gearTeeth: 12
  },
  {
    id: 'plovdiv',
    name: { en: 'Plovdiv', bg: 'Пловдив' },
    path: 'M 250,260 L 280,255 L 300,265 L 295,285 L 270,290 L 250,280 Z',
    cities: ['Plovdiv'],
    color: '#8b5cf6',
    centerX: 275,
    centerY: 272,
    gearSize: 38,
    gearTeeth: 10
  },
  {
    id: 'varna',
    name: { en: 'Varna', bg: 'Варна' },
    path: 'M 420,150 L 445,145 L 460,160 L 455,180 L 435,185 L 420,170 Z',
    cities: ['Varna'],
    color: '#06b6d4',
    centerX: 440,
    centerY: 165,
    gearSize: 42,
    gearTeeth: 14
  },
  {
    id: 'burgas',
    name: { en: 'Burgas', bg: 'Бургас' },
    path: 'M 400,250 L 430,245 L 450,260 L 445,280 L 420,285 L 400,270 Z',
    cities: ['Burgas'],
    color: '#10b981',
    centerX: 425,
    centerY: 265,
    gearSize: 40,
    gearTeeth: 11
  },
  {
    id: 'ruse',
    name: { en: 'Ruse', bg: 'Русе' },
    path: 'M 320,100 L 345,95 L 360,110 L 355,130 L 330,135 L 320,120 Z',
    cities: ['Ruse'],
    color: '#f59e0b',
    centerX: 340,
    centerY: 115,
    gearSize: 35,
    gearTeeth: 9
  },
  {
    id: 'blagoevgrad',
    name: { en: 'Blagoevgrad', bg: 'Благоевград' },
    path: 'M 120,280 L 150,275 L 165,290 L 160,310 L 135,315 L 120,300 Z',
    cities: ['Blagoevgrad'],
    color: '#ec4899',
    centerX: 142,
    centerY: 295,
    gearSize: 33,
    gearTeeth: 8
  },
  {
    id: 'pleven',
    name: { en: 'Pleven', bg: 'Плевен' },
    path: 'M 260,140 L 285,135 L 300,150 L 295,170 L 270,175 L 260,160 Z',
    cities: ['Pleven'],
    color: '#14b8a6',
    centerX: 280,
    centerY: 155,
    gearSize: 36,
    gearTeeth: 10
  },
  {
    id: 'stara-zagora',
    name: { en: 'Stara Zagora', bg: 'Стара Загора' },
    path: 'M 310,230 L 340,225 L 355,240 L 350,260 L 325,265 L 310,250 Z',
    cities: ['Stara Zagora'],
    color: '#f97316',
    centerX: 332,
    centerY: 245,
    gearSize: 37,
    gearTeeth: 9
  }
];

// Animation keyframes
const gearRotation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 10px currentColor) brightness(1);
    transform: scale(1);
  }
  50% { 
    filter: drop-shadow(0 0 25px currentColor) brightness(1.2);
    transform: scale(1.05);
  }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

interface AdvancedBulgariaMapProps {
  carCounts?: { [cityId: string]: number };
  onCityClick?: (cityId: string) => void;
  highlightedCity?: string;
}

const MapContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px;
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 32px;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const MapTitle = styled.h2`
  font-size: 48px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const MapSubtitle = styled.p`
  font-size: 18px;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 50px;
  font-weight: 500;
`;

const SVGMap = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  background: transparent;
  border-radius: 24px;
  padding: 40px;
`;

const TechPattern = styled.pattern`
  .tech-line {
    stroke: rgba(59, 130, 246, 0.1);
    stroke-width: 1;
    fill: none;
  }
  
  .tech-circle {
    fill: rgba(139, 92, 246, 0.05);
    stroke: rgba(139, 92, 246, 0.1);
    stroke-width: 0.5;
  }
`;

const GearGroup = styled.g<{ isHovered: boolean; isHighlighted: boolean }>`
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  
  &:hover {
    transform: scale(1.1);
    animation: ${pulseGlow} 1.5s ease-in-out infinite;
  }
  
  ${props => props.isHighlighted && `
    animation: ${pulseGlow} 2s ease-in-out infinite;
  `}
`;

const GearOuter = styled.circle<{ color: string; isHovered: boolean }>`
  fill: url(#gearGradient);
  stroke: ${props => props.color};
  stroke-width: 2;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  
  ${props => props.isHovered && `
    filter: drop-shadow(0 12px 24px ${props.color}40) brightness(1.1);
  `}
`;

const GearInner = styled.circle`
  fill: #1e293b;
  stroke: #334155;
  stroke-width: 1;
`;

const GearCenter = styled.circle<{ color: string }>`
  fill: ${props => props.color};
  stroke: #ffffff;
  stroke-width: 1;
  filter: drop-shadow(0 0 8px ${props => props.color}60);
`;

const GearRing = styled.circle<{ color: string }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 1;
  opacity: 0.6;
`;

const GearTeeth = styled.g<{ isHovered: boolean }>`
  animation: ${props => props.isHovered ? gearRotation : 'none'} 3s linear infinite;
  transform-origin: center;
`;

const CityLabel = styled.text<{ isHovered: boolean }>`
  font-size: 14px;
  font-weight: 700;
  fill: #ffffff;
  text-anchor: middle;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
  
  ${props => props.isHovered && `
    font-size: 16px;
    fill: #fbbf24;
    text-shadow: 0 0 12px #fbbf24;
  `}
`;

const CarCountBadge = styled.text<{ isHovered: boolean }>`
  font-size: 12px;
  font-weight: 800;
  fill: #ffffff;
  text-anchor: middle;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
  
  ${props => props.isHovered && `
    font-size: 14px;
    fill: #fbbf24;
    text-shadow: 0 0 8px #fbbf24;
  `}
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 20px 28px;
  border-radius: 20px;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(-15px) scale(1.05)' : 'translateY(0) scale(0.95)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  min-width: 220px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #334155;
  }
`;

const TooltipTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TooltipStats = styled.div`
  font-size: 16px;
  opacity: 0.9;
  
  span {
    font-weight: 800;
    font-size: 28px;
    display: block;
    margin-top: 6px;
    color: #34d399;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const StatCard = styled.div<{ index: number }>`
  background: linear-gradient(135deg, 
    ${props => {
      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
      return colors[props.index % colors.length];
    }} 0%, 
    ${props => {
      const colors = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#0f766e', '#ea580c'];
      return colors[props.index % colors.length];
    }} 100%
  );
  padding: 32px;
  border-radius: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    
    &::before {
      transform: translateX(100%);
    }
  }

  h3 {
    font-size: 42px;
    font-weight: 900;
    margin-bottom: 12px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 16px;
    opacity: 0.95;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 40px;
  padding: 32px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const LegendItem = styled.div<{ color: string; isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(51, 65, 85, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid ${props => props.isHovered ? props.color : 'transparent'};

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    background: rgba(51, 65, 85, 1);
  }

  &::before {
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.color};
    box-shadow: 0 0 0 4px ${props => props.color}33, 0 0 20px ${props => props.color}60;
    transition: all 0.3s ease;
  }

  span {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
`;

// Gear tooth component
const GearTooth: React.FC<{ 
  centerX: number; 
  centerY: number; 
  radius: number; 
  teeth: number; 
  toothIndex: number;
  color: string;
}> = ({ centerX, centerY, radius, teeth, toothIndex, color }) => {
  const angle = (toothIndex * 360) / teeth;
  const radian = (angle * Math.PI) / 180;
  
  const innerRadius = radius * 0.7;
  const outerRadius = radius * 1.1;
  
  const x1 = centerX + Math.cos(radian) * innerRadius;
  const y1 = centerY + Math.sin(radian) * innerRadius;
  const x2 = centerX + Math.cos(radian) * outerRadius;
  const y2 = centerY + Math.sin(radian) * outerRadius;
  
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
};

export const AdvancedBulgariaMap: React.FC<AdvancedBulgariaMapProps> = ({
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
    locationData?: { cityName?: string; regionName?: string; };
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
        y: event.clientY - container.top - 100,
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
        {language === 'bg' ? 'БЪЛГАРИЯ' : 'BULGARIA'}
      </MapTitle>
      <MapSubtitle>
        {language === 'bg' ? 'Интерактивна карта с автомобили' : 'Interactive Car Marketplace Map'}
      </MapSubtitle>

      <div style={{ position: 'relative' }}>
        <SVGMap viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient definitions */}
            <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.7" />
            </linearGradient>
            
            {/* Tech pattern */}
            <pattern id="techPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="rgba(59, 130, 246, 0.1)" />
              <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
              <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
            </pattern>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background tech pattern */}
          <rect width="600" height="400" fill="url(#techPattern)" opacity="0.3"/>

          {/* Gear groups */}
          <g>
            {BULGARIA_REGIONS.map(region => {
              const count = carCounts[region.id] || 0;
              const isHovered = hoveredRegion === region.id;
              const isHighlighted = highlightedCity === region.id;
              
              return (
                <GearGroup
                  key={region.id}
                  isHovered={isHovered}
                  isHighlighted={isHighlighted}
                  onClick={() => handleRegionClick(region.id)}
                  onMouseMove={(e) => handleRegionHover(e, region)}
                  onMouseLeave={handleRegionLeave}
                >
                  {/* Main gear */}
                  <GearOuter
                    cx={region.centerX}
                    cy={region.centerY}
                    r={region.gearSize}
                    color={region.color}
                    isHovered={isHovered}
                  />
                  
                  {/* Inner gear circle */}
                  <GearInner
                    cx={region.centerX}
                    cy={region.centerY}
                    r={region.gearSize * 0.6}
                  />
                  
                  {/* Center circle */}
                  <GearCenter
                    cx={region.centerX}
                    cy={region.centerY}
                    r={region.gearSize * 0.3}
                    color={region.color}
                  />
                  
                  {/* Inner ring */}
                  <GearRing
                    cx={region.centerX}
                    cy={region.centerY}
                    r={region.gearSize * 0.45}
                    color={region.color}
                  />
                  
                  {/* Gear teeth */}
                  <GearTeeth isHovered={isHovered}>
                    {Array.from({ length: region.gearTeeth }, (_, i) => (
                      <GearTooth
                        key={i}
                        centerX={region.centerX}
                        centerY={region.centerY}
                        radius={region.gearSize}
                        teeth={region.gearTeeth}
                        toothIndex={i}
                        color={region.color}
                      />
                    ))}
                  </GearTeeth>
                  
                  {/* Car count */}
                  <CarCountBadge
                    x={region.centerX}
                    y={region.centerY + 4}
                    isHovered={isHovered}
                  >
                    {count > 999 ? '999+' : count}
                  </CarCountBadge>
                  
                  {/* City name */}
                  <CityLabel
                    x={region.centerX}
                    y={region.centerY + region.gearSize + 25}
                    isHovered={isHovered}
                  >
                    {region.name[language as keyof typeof region.name]}
                  </CityLabel>
                </GearGroup>
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
              {tooltipData.locationData?.regionName}
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
        <StatCard index={0}>
          <h3>{totalCars.toLocaleString()}</h3>
          <p>{language === 'bg' ? 'Общо автомобили' : 'Total Cars'}</p>
        </StatCard>
        <StatCard index={1}>
          <h3>{BULGARIA_REGIONS.length}</h3>
          <p>{language === 'bg' ? 'Региони' : 'Regions'}</p>
        </StatCard>
        <StatCard index={2}>
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
            isHovered={hoveredRegion === region.id}
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

export default AdvancedBulgariaMap;
