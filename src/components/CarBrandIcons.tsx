// src/components/CarBrandIcons.tsx
// Car Brand Icons with Original Logos for Koli One

import React from 'react';
import styled from 'styled-components';

// Icon wrapper styling
const IconWrapper = styled.span<{ size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size = 20 }) => size}px;
  height: ${({ size = 20 }) => size}px;
  margin-right: 8px;
  
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Car brand icons mapping
const brandIcons: Record<string, React.FC<{ size?: number }>> = {
  // BMW - Original blue and white logo
  'BMW': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#0066CC" stroke="#fff" strokeWidth="1"/>
        <path d="M12 1C18.075 1 23 5.925 23 12S18.075 23 12 23 1 18.075 1 12 5.925 1 12 1Z" fill="#0066CC"/>
        <path d="M12 2.5C17.25 2.5 21.5 6.75 21.5 12S17.25 21.5 12 21.5 2.5 17.25 2.5 12 6.75 2.5 12 2.5Z" fill="#fff"/>
        <path d="M12 12V2.5C17.25 2.5 21.5 6.75 21.5 12H12Z" fill="#0066CC"/>
        <path d="M12 12H2.5C2.5 6.75 6.75 2.5 12 2.5V12Z" fill="#0066CC"/>
        <text x="12" y="16" textAnchor="middle" fontSize="4" fill="#0066CC" fontWeight="bold">BMW</text>
      </svg>
    </IconWrapper>
  ),

  // Mercedes-Benz - Famous three-pointed star
  'Mercedes-Benz': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#000" stroke="#C0C0C0" strokeWidth="1"/>
        <path d="M12 3L12 12L18.5 18.5L12 12L5.5 18.5L12 12Z" fill="#C0C0C0" stroke="#C0C0C0" strokeWidth="0.5"/>
        <path d="M12 3L12 12M12 12L18.5 18.5M12 12L5.5 18.5" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </IconWrapper>
  ),

  // Audi - Four rings logo
  'Audi': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="12" r="4" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
        <circle cx="10" cy="12" r="4" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
        <circle cx="14" cy="12" r="4" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
        <circle cx="18" cy="12" r="4" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
      </svg>
    </IconWrapper>
  ),

  // Toyota - ?????? ????????
  'Toyota': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="7" fill="none" stroke="#CC0000" strokeWidth="2"/>
        <ellipse cx="12" cy="12" rx="6" ry="10" fill="none" stroke="#CC0000" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="none" stroke="#CC0000" strokeWidth="2"/>
      </svg>
    </IconWrapper>
  ),

  // Volkswagen - VW
  'Volkswagen': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#0066CC" stroke="#fff" strokeWidth="1"/>
        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">VW</text>
      </svg>
    </IconWrapper>
  ),

  // Ford - ?????? ???????? ??????
  'Ford': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="11" ry="8" fill="#0066CC"/>
        <text x="12" y="16" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">Ford</text>
      </svg>
    </IconWrapper>
  ),

  // Honda - H ??????
  'Honda': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="#CC0000"/>
        <text x="12" y="16" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">H</text>
      </svg>
    </IconWrapper>
  ),

  // Hyundai - H ??????
  'Hyundai': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="11" ry="8" fill="none" stroke="#0066CC" strokeWidth="2"/>
        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#0066CC" fontWeight="bold" fontStyle="italic">H</text>
      </svg>
    </IconWrapper>
  ),

  // Nissan - ??????? ???????
  'Nissan': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#CC0000" strokeWidth="2"/>
        <rect x="4" y="11" width="16" height="2" fill="#CC0000"/>
        <text x="12" y="9" textAnchor="middle" fontSize="4" fill="#CC0000" fontWeight="bold">NISSAN</text>
      </svg>
    </IconWrapper>
  ),

  // Renault - ??????
  'Renault': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2L20 12L12 22L4 12Z" fill="#FFD700" stroke="#000" strokeWidth="1"/>
      </svg>
    </IconWrapper>
  ),

  // Peugeot - ?????
  'Peugeot': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="#0066CC" strokeWidth="2"/>
        <circle cx="8" cy="8" r="1" fill="#0066CC"/>
        <path d="M6 12C8 10 10 10 12 12C14 14 16 14 18 12" stroke="#0066CC" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Citroën - ???????? ???????
  'Citroën': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 16L12 8L18 16" stroke="#CC0000" strokeWidth="2" fill="none"/>
        <path d="M6 20L12 12L18 20" stroke="#CC0000" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Skoda - ????? ?? ???????
  'Skoda': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#008000" strokeWidth="2"/>
        <path d="M8 12L12 8L16 12L12 16Z" fill="#008000"/>
      </svg>
    </IconWrapper>
  ),

  // SEAT - S ??????
  'SEAT': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="#CC0000"/>
        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">S</text>
      </svg>
    </IconWrapper>
  ),

  // Fiat - ?????? ??????
  'Fiat': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="8" width="20" height="8" fill="#CC0000"/>
        <text x="12" y="14" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">FIAT</text>
      </svg>
    </IconWrapper>
  ),

  // Opel - ?????
  'Opel': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#FFD700" strokeWidth="2"/>
        <path d="M8 6L16 12L8 18L12 12Z" fill="#FFD700"/>
      </svg>
    </IconWrapper>
  ),

  // Mazda - ??????? ?? ??????
  'Mazda': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#0066CC" strokeWidth="2"/>
        <path d="M6 15C8 8 10 8 12 12C14 8 16 8 18 15" stroke="#0066CC" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Mitsubishi - ??????? ??????
  'Mitsubishi': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3L8 9L16 9Z" fill="#CC0000"/>
        <path d="M8 9L4 15L12 15Z" fill="#CC0000"/>
        <path d="M16 9L12 15L20 15Z" fill="#CC0000"/>
      </svg>
    </IconWrapper>
  ),

  // Subaru - Stars constellation
  'Subaru': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#0066CC" strokeWidth="2"/>
        <circle cx="8" cy="8" r="1" fill="#0066CC"/>
        <circle cx="16" cy="8" r="1" fill="#0066CC"/>
        <circle cx="6" cy="14" r="1" fill="#0066CC"/>
        <circle cx="12" cy="14" r="1" fill="#0066CC"/>
        <circle cx="18" cy="14" r="1" fill="#0066CC"/>
      </svg>
    </IconWrapper>
  ),

  // Kia - Stylized script logo
  'Kia': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="11" ry="8" fill="none" stroke="#CC0000" strokeWidth="2"/>
        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#CC0000" fontWeight="bold">KIA</text>
      </svg>
    </IconWrapper>
  ),

  // Lexus - Stylized L emblem
  'Lexus': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#000" fontWeight="bold">L</text>
      </svg>
    </IconWrapper>
  ),

  // Infiniti - Curved infinity symbol
  'Infiniti': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="11" ry="8" fill="none" stroke="#000" strokeWidth="2"/>
        <path d="M6 8C10 16 14 16 18 8" stroke="#000" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Acura - A
  'Acura': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#000" fontWeight="bold">A</text>
      </svg>
    </IconWrapper>
  ),

  // Genesis - ???????
  'Genesis': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#000" strokeWidth="2"/>
        <path d="M4 12C8 8 10 8 12 12C14 8 16 8 20 12" stroke="#000" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Tesla - T
  'Tesla': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="10" y="6" width="4" height="12" fill="#CC0000"/>
        <rect x="6" y="6" width="12" height="3" fill="#CC0000"/>
      </svg>
    </IconWrapper>
  ),

  // Jeep - ????
  'Jeep': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" fill="none" stroke="#008000" strokeWidth="2"/>
        <line x1="4" y1="8" x2="20" y2="8" stroke="#008000" strokeWidth="1"/>
        <line x1="4" y1="12" x2="20" y2="12" stroke="#008000" strokeWidth="1"/>
        <line x1="4" y1="16" x2="20" y2="16" stroke="#008000" strokeWidth="1"/>
        <line x1="8" y1="4" x2="8" y2="20" stroke="#008000" strokeWidth="1"/>
        <line x1="12" y1="4" x2="12" y2="20" stroke="#008000" strokeWidth="1"/>
        <line x1="16" y1="4" x2="16" y2="20" stroke="#008000" strokeWidth="1"/>
      </svg>
    </IconWrapper>
  ),

  // Mini - ??????? ?? ???????
  'Mini': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#000" strokeWidth="2"/>
        <path d="M2 12L6 8L6 16Z" fill="#000"/>
        <path d="M22 12L18 8L18 16Z" fill="#000"/>
        <text x="12" y="16" textAnchor="middle" fontSize="5" fill="#000" fontWeight="bold">MINI</text>
      </svg>
    </IconWrapper>
  ),

  // Land Rover - ?????? ????????
  'Land Rover': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="11" ry="8" fill="none" stroke="#008000" strokeWidth="2"/>
        <text x="12" y="16" textAnchor="middle" fontSize="4" fill="#008000" fontWeight="bold">LAND ROVER</text>
      </svg>
    </IconWrapper>
  ),

  // Jaguar - ?????
  'Jaguar': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="8" cy="10" r="1" fill="#000"/>
        <circle cx="16" cy="10" r="1" fill="#000"/>
        <path d="M6 14C8 12 10 12 12 14C14 12 16 12 18 14" stroke="#000" strokeWidth="2" fill="none"/>
      </svg>
    </IconWrapper>
  ),

  // Default Car Icon (replaced emoji with professional SVG)
  'Other': ({ size = 20 }) => (
    <IconWrapper size={size}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FF7900" stroke="#FF7900" strokeWidth="1"/>
        {/* Modern Car Shape */}
        <path
          d="M7 14C7 14.1989 7.07902 14.3897 7.21967 14.5303C7.36032 14.671 7.55109 14.75 7.75 14.75H8C8.14889 14.75 8.29267 14.691 8.39645 14.5872C8.50022 14.4834 8.55556 14.3428 8.55556 14.1944V14H15.4444V14.1944C15.4444 14.3428 15.4998 14.4834 15.6036 14.5872C15.7073 14.691 15.8511 14.75 16 14.75H16.25C16.4489 14.75 16.6397 14.671 16.7803 14.5303C16.921 14.3897 17 14.1989 17 14V11.5L16.125 8.5C16.0273 8.14845 15.8225 7.83518 15.5391 7.60266C15.2556 7.37015 14.9082 7.23142 14.5475 7.20713H9.4525C9.09178 7.23142 8.7444 7.37015 8.46094 7.60266C8.17748 7.83518 7.97272 8.14845 7.875 8.5L7 11.5V14Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wheels */}
        <circle cx="9.5" cy="14" r="0.6" fill="#FF7900"/>
        <circle cx="14.5" cy="14" r="0.6" fill="#FF7900"/>
        {/* Window */}
        <path d="M9.5 9H14.5L15 11.5H9L9.5 9Z" fill="#FF7900" fillOpacity="0.3"/>
      </svg>
    </IconWrapper>
  )
};

// (Comment removed - was in Arabic)
interface CarBrandIconProps {
  brand: string;
  size?: number;
  showName?: boolean;
}

const CarBrandIcon: React.FC<CarBrandIconProps> = ({ brand, size = 20, showName = true }) => {
  const IconComponent = brandIcons[brand] || brandIcons['Other'];
  
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <IconComponent size={size} />
      {showName && <span>{brand}</span>}
    </span>
  );
};

// (Comment removed - was in Arabic)
export const getBrandIcon = (brand: string, size: number = 20) => {
  const IconComponent = brandIcons[brand] || brandIcons['Other'];
  return <IconComponent size={size} />;
};

// (Comment removed - was in Arabic)
export const extractBrandFromTitle = (title: string): string => {
  const firstWord = title.split(' ')[0];
  
  // (Comment removed - was in Arabic)
  const knownBrands = Object.keys(brandIcons);
  
  // (Comment removed - was in Arabic)
  if (knownBrands.includes(firstWord)) {
    return firstWord;
  }
  
  // (Comment removed - was in Arabic)
  const matchingBrand = knownBrands.find(brand => 
    brand.toLowerCase() === firstWord.toLowerCase()
  );
  
  if (matchingBrand) {
    return matchingBrand;
  }
  
  // (Comment removed - was in Arabic)
  const specialCases: Record<string, string> = {
    'VW': 'Volkswagen',
    'Benz': 'Mercedes-Benz',
    'Mercedes': 'Mercedes-Benz',
    'Alfa': 'Alfa Romeo',
    'Land': 'Land Rover',
    'Range': 'Land Rover',
    'Rover': 'Land Rover',
    'Mini': 'Mini',
    'MINI': 'Mini',
    'Rolls': 'Rolls-Royce',
    'Rolls-Royce': 'Rolls-Royce'
  };
  
  if (specialCases[firstWord]) {
    return specialCases[firstWord];
  }
  
  // Search in full title for compound brand names
  const title_lower = title.toLowerCase();
  
  if (title_lower.includes('mercedes') || title_lower.includes('benz')) {
    return 'Mercedes-Benz';
  }
  if (title_lower.includes('land rover') || title_lower.includes('range rover')) {
    return 'Land Rover';
  }
  if (title_lower.includes('alfa romeo')) {
    return 'Alfa Romeo';
  }
  if (title_lower.includes('rolls royce') || title_lower.includes('rolls-royce')) {
    return 'Rolls-Royce';
  }
  
  return 'Other';
};

export default CarBrandIcon;