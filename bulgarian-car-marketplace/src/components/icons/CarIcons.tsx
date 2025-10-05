/**
 * 🚗 Professional Car Icons Component
 * أيقونات احترافية متخصصة في عالم السيارات
 */

import React from 'react';
import styled from 'styled-components';
import { colors } from '../../design-system';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const IconContainer = styled.div<{
  $size: number;
  $color: string;
}>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

// Car Body Types
export const SedanIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11L6.5 6.5H17.5L19 11V16H17V14H7V16H5V11M6.5 7.5L5.5 11H18.5L17.5 7.5H6.5M8 12.5C8.83 12.5 9.5 11.83 9.5 11S8.83 9.5 8 9.5 6.5 10.17 6.5 11 7.17 12.5 8 12.5M16 12.5C16.83 12.5 17.5 11.83 17.5 11S16.83 9.5 16 9.5 14.5 10.17 14.5 11 15.17 12.5 16 12.5M7 13H9V15H7V13M15 13H17V15H15V13Z"/>
    </svg>
  </IconContainer>
);

export const SuvIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.92 6C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6M6.5 6.5H17.5L19 11H5L6.5 6.5M7 13.5C7.83 13.5 8.5 12.83 8.5 12S7.83 10.5 7 10.5 5.5 11.17 5.5 12 6.17 13.5 7 13.5M17 13.5C17.83 13.5 18.5 12.83 18.5 12S17.83 10.5 17 10.5 15.5 11.17 15.5 12 16.17 13.5 17 13.5M5 14H6V16H5V14M18 14H19V16H18V14Z"/>
    </svg>
  </IconContainer>
);

export const HatchbackIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11L6.5 6.5H17.5L19 11V16H17V14H7V16H5V11M6.5 7.5L5.5 11H18.5L17.5 7.5H6.5M8 12.5C8.83 12.5 9.5 11.83 9.5 11S8.83 9.5 8 9.5 6.5 10.17 6.5 11 7.17 12.5 8 12.5M16 12.5C16.83 12.5 17.5 11.83 17.5 11S16.83 9.5 16 9.5 14.5 10.17 14.5 11 15.17 12.5 16 12.5M7 13H9V15H7V13M15 13H17V15H15V13Z"/>
    </svg>
  </IconContainer>
);

export const CoupeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11L6.5 6.5H17.5L19 11V16H17V14H7V16H5V11M6.5 7.5L5.5 11H18.5L17.5 7.5H6.5M8 12.5C8.83 12.5 9.5 11.83 9.5 11S8.83 9.5 8 9.5 6.5 10.17 6.5 11 7.17 12.5 8 12.5M16 12.5C16.83 12.5 17.5 11.83 17.5 11S16.83 9.5 16 9.5 14.5 10.17 14.5 11 15.17 12.5 16 12.5M7 13H9V15H7V13M15 13H17V15H15V13Z"/>
    </svg>
  </IconContainer>
);

// Engine & Performance Icons
export const EngineIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7,4V6H10V8H7L5,10V13H3V10H1V18H3V15H5V18H8V15H10V18H13V15H15V18H18V15H20V18H22V10H20V13H18V10L16,8V6H19V4H7M9,6H17V7H9V6M7,10H17V11H7V10M5,12H7V13H5V12M17,12H19V13H17V12Z"/>
    </svg>
  </IconContainer>
);

export const FuelIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3,2H6C6.28,2 6.53,2.11 6.71,2.29L8,3.59L9.29,2.29C9.47,2.11 9.72,2 10,2H13V4H12L14,6H16L18,4H17V2H20C20.55,2 21,2.45 21,3V21C21,21.55 20.55,22 20,22H4C3.45,22 3,21.55 3,21V3C3,2.45 3.45,2 3,2M5,20H19V8H17L15,10H13L11,8H9L7,10H5V20Z"/>
    </svg>
  </IconContainer>
);

export const SpeedometerIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
    </svg>
  </IconContainer>
);

export const TransmissionIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
    </svg>
  </IconContainer>
);

// Feature Icons
export const AirConditioningIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.59,0.66C8.93,-1.15 11.47,1.06 12.04,4.5C12.47,4.5 12.89,4.62 13.27,4.84C13.79,5.15 14.15,5.71 14.15,6.35L14.15,6.35C14.15,7.12 13.5,7.75 12.72,7.75C12.25,7.75 11.82,7.5 11.58,7.11C11.17,6.41 10.24,6.14 9.54,6.55C8.84,6.96 8.57,7.89 8.98,8.59C9.67,9.81 10.98,10.5 12.35,10.5C13.72,10.5 15.03,9.81 15.72,8.59C16.13,7.89 15.86,6.96 15.16,6.55C14.46,6.14 13.53,6.41 13.12,7.11C12.88,7.5 12.45,7.75 11.98,7.75C11.2,7.75 10.55,7.12 10.55,6.35C10.55,5.71 10.91,5.15 11.43,4.84C11.81,4.62 12.23,4.5 12.66,4.5C12.09,1.06 9.55,-1.15 7.21,0.66C5.57,1.92 5.57,4.08 6.59,0.66Z"/>
    </svg>
  </IconContainer>
);

export const BluetoothIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.71,7.71L12,2H11V9.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L11,14.41V22H12L17.71,16.29L13.41,12L17.71,7.71M13,5.83L14.88,7.71L13,9.59V5.83M14.88,16.29L13,18.17V14.41L14.88,16.29Z"/>
    </svg>
  </IconContainer>
);

export const NavigationIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
    </svg>
  </IconContainer>
);

export const SafetyIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
    </svg>
  </IconContainer>
);

// Status Icons
export const AvailableIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.status.success,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
    </svg>
  </IconContainer>
);

export const SoldIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.status.error,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
    </svg>
  </IconContainer>
);

export const PendingIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.status.warning,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>
  </IconContainer>
);

// Action Icons
export const FavoriteIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
    </svg>
  </IconContainer>
);

export const ShareIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12S8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19C20.92,17.39 19.61,16.08 18,16.08Z"/>
    </svg>
  </IconContainer>
);

export const CompareIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = colors.text.primary,
  className 
}) => (
  <IconContainer $size={size} $color={color} className={className}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
    </svg>
  </IconContainer>
);

// Export all icons
export const CarIcons = {
  // Body Types
  Sedan: SedanIcon,
  Suv: SuvIcon,
  Hatchback: HatchbackIcon,
  Coupe: CoupeIcon,
  
  // Engine & Performance
  Engine: EngineIcon,
  Fuel: FuelIcon,
  Speedometer: SpeedometerIcon,
  Transmission: TransmissionIcon,
  
  // Features
  AirConditioning: AirConditioningIcon,
  Bluetooth: BluetoothIcon,
  Navigation: NavigationIcon,
  Safety: SafetyIcon,
  
  // Status
  Available: AvailableIcon,
  Sold: SoldIcon,
  Pending: PendingIcon,
  
  // Actions
  Favorite: FavoriteIcon,
  Share: ShareIcon,
  Compare: CompareIcon,
};

export default CarIcons;
