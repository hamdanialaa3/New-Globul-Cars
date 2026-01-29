/**
 * Car Details Page - German Marketplace Style
 * Based on the provided reference image (Fiat 500e listing)
 * 
 * Features:
 * - Large main image with thumbnails
 * - Price and financing information
 * - Quick info icons
 * - Battery information (for electric cars)
 * - Technical data table
 * - Features list
 * - Seller information with ratings
 * - Map location
 * - Additional services
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Gauge,
  Battery,
  Key,
  CheckCircle,
  FileText,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Bookmark,
  Edit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Trash2,
  ZoomIn
} from 'lucide-react';
import { CarListing } from '../../../types/CarListing';
import StaticMapEmbed from '../../../components/StaticMapEmbed';
import GlobulCarLogo from '../../../components/icons/GlobulCarLogo';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { logger } from '../../../services/logger-service';
import CarSuggestionsList from './CarSuggestionsList';
import ImageLightbox from '../../../components/common/ImageLightbox/ImageLightbox';
import { getCarLogoUrl } from '../../../services/car-logo-service';

interface CarDetailsGermanStyleProps {
  car: CarListing;
  language: 'bg' | 'en';
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
  onContact: (method: string) => void;
}

const translations = {
  bg: {
    back: 'Назад',
    edit: 'Редактирай',
    delete: 'Изтрий',
    netPrice: 'Нето',
    grossPrice: 'Бруто',
    financingFrom: 'Финансиране от',
    inquireNow: 'Запитване сега',
    firstRegistration: 'Първа регистрация',
    mileage: 'Пробег',
    power: 'Мощност',
    fuelType: 'Гориво',
    previousOwners: 'Предишен собственик',
    accidentFree: 'Без аварии',
    serviceHistory: 'Сервизна книжка',
    batteryCapacity: 'Капацитет на батерията',
    range: 'Обхват (WLTP)',
    chargeTimeAC: 'Време за зареждане (AC)',
    chargeTimeDC: 'Време за зареждане (DC)',
    batteryWarranty: 'Гаранция на батерията',
    technicalData: 'Технически данни',
    vehicleCondition: 'Състояние на превозното средство',
    category: 'Категория',
    transmission: 'Скоростна кутия',
    driveType: 'Задвижване',
    doors: 'Брой врати',
    seats: 'Брой места',
    color: 'Цвят',
    interior: 'Интериор',
    consumption: 'Разход (WLTP)',
    co2Emissions: 'CO₂ емисии',
    co2Efficiency: 'CO₂ ефективност',
    emissionClass: 'Клас на емисиите',
    manufacturerWarranty: 'Гаранция от производителя',
    warranty: 'Гаранция',
    vehicleNumber: 'Номер на превозното средство',
    modelYear: 'Моделна година',
    tires: 'Гуми',
    rimSize: 'Размер на джантите',
    numberOfKeys: 'Брой ключове',
    chargingCable: 'Кабел за зареждане',
    acChargingPower: 'Мощност на зареждане AC',
    dcChargingPower: 'Мощност на зареждане DC',
    rangeUnit: 'км',
    features: 'Оборудване',
    showAll: 'Покажи всички',
    comfort: 'Комфорт',
    entertainment: 'Развлечение/Медия',
    safety: 'Безопасност',
    other: 'Друго',
    vehicleDescription: 'Описание на превозното средство от продавача',
    aboutDealer: 'За този дилър',
    reviews: 'Оценки',
    allVehicles: 'Всички превозни средства',
    openingHours: 'Работно време',
    location: 'Локация',
    additionalServices: 'Допълнителни услуги',
    financing: 'Финансиране',
    leasing: 'Лизинг',
    tradeIn: 'Прием в замяна',
    registrationService: 'Услуга за регистрация',
    contactDealer: 'Свържи се с дилъра',
    save: 'Запази',
    share: 'Сподели',
    update: 'Актуализирай',
    km: 'км',
    kw: 'кВт',
    hp: 'кс',
    months: 'месеца',
    hours: 'ч',
    minutes: 'мин',
    notSpecified: 'Не е посочено',
  },
  en: {
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    netPrice: 'Net',
    grossPrice: 'Gross',
    financingFrom: 'Financing from',
    inquireNow: 'Inquire now',
    firstRegistration: 'First registration',
    mileage: 'Mileage',
    power: 'Power',
    fuelType: 'Fuel type',
    previousOwners: 'Previous owner',
    accidentFree: 'Accident-free',
    serviceHistory: 'Service history',
    batteryCapacity: 'Battery capacity',
    range: 'Range (WLTP)',
    chargeTimeAC: 'Charging time (AC)',
    chargeTimeDC: 'Charging time (DC)',
    batteryWarranty: 'Battery warranty',
    technicalData: 'Technical data',
    vehicleCondition: 'Vehicle condition',
    category: 'Category',
    transmission: 'Transmission',
    driveType: 'Drive type',
    doors: 'Number of doors',
    seats: 'Number of seats',
    color: 'Color',
    interior: 'Interior',
    consumption: 'Consumption (WLTP)',
    co2Emissions: 'CO₂ emissions',
    co2Efficiency: 'CO₂ efficiency',
    emissionClass: 'Emission class',
    manufacturerWarranty: 'Manufacturer warranty',
    warranty: 'Warranty',
    vehicleNumber: 'Vehicle number',
    modelYear: 'Model year',
    tires: 'Tires',
    rimSize: 'Rim size',
    numberOfKeys: 'Number of keys',
    chargingCable: 'Charging cable',
    acChargingPower: 'AC charging power',
    dcChargingPower: 'DC charging power',
    rangeUnit: 'km',
    features: 'Features',
    showAll: 'Show all',
    comfort: 'Comfort',
    entertainment: 'Entertainment/Media',
    safety: 'Safety',
    other: 'Other',
    vehicleDescription: 'Vehicle description according to seller',
    aboutDealer: 'About this dealer',
    reviews: 'Reviews',
    allVehicles: 'All vehicles',
    openingHours: 'Opening hours',
    location: 'Location',
    additionalServices: 'Additional services',
    financing: 'Financing',
    leasing: 'Leasing',
    tradeIn: 'Trade-in',
    registrationService: 'Registration service',
    contactDealer: 'Contact dealer',
    save: 'Save',
    share: 'Share',
    update: 'Update',
    km: 'km',
    kw: 'kW',
    hp: 'hp',
    months: 'months',
    hours: 'h',
    minutes: 'min',
    notSpecified: 'Not specified',
  },
} as const;

// ==================== Styled Components ====================

const PageWrapper = styled.div<{ $isDark: boolean }>`
  background: var(--bg-primary);
  min-height: 100vh;
  padding: 0;
  transition: background 0.3s ease;
  /* ✅ FIX: Prevent layout shifts */
  width: 100% !important;
  overflow-x: hidden;
`;

const TopBar = styled.div<{ $isDark: boolean }>`
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const TopBarLeft = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: transparent;
  transition: background 0.3s ease;
`;

const BackButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
`;

const EditButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--btn-primary-bg);
  border: none;
  color: var(--btn-primary-text);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: ${props => props.$isDark
    ? '0 2px 4px rgba(37, 99, 235, 0.4)'
    : '0 2px 4px rgba(24, 119, 242, 0.2)'};

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: ${props => props.$isDark
    ? '0 4px 8px rgba(37, 99, 235, 0.5)'
    : '0 4px 8px rgba(24, 119, 242, 0.3)'};
  }
`;

const Container = styled.div<{ $isDark: boolean }>`
  max-width: 1200px !important;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  transition: background 0.3s ease;
  /* ✅ FIX: Prevent container from changing width */
  width: 100%;
  box-sizing: border-box;
  /* ✅ FIX: Force container to maintain desktop width */
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
    max-width: 100% !important;
  }

  /* ✅ FIX: Ensure desktop width for screens > 768px */
  @media (min-width: 769px) {
    max-width: 1200px !important;
    padding: 2rem !important;
  }
`;

const MainSection = styled.div<{ $isDark: boolean }>`
  display: grid !important;
  grid-template-columns: 2fr 1fr !important;
  gap: 2rem;
  margin-bottom: 2rem;
  background: transparent;
  transition: background 0.3s ease;
  /* ✅ FIX: Prevent layout shifts */
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  /* ✅ FIX: Force desktop layout by default */
  position: relative;

  /* ✅ FIX: Only change to single column on mobile (≤768px) */
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
    gap: 1.5rem;
  }

  /* ✅ FIX: Force 2-column layout on tablets and desktop (≥769px) - CRITICAL */
  @media (min-width: 769px) {
    grid-template-columns: 2fr 1fr !important;
  }

  /* ✅ FIX: Ensure desktop layout for all screens wider than 768px */
  @media (min-width: 769px) and (max-width: 9999px) {
    grid-template-columns: 2fr 1fr !important;
  }
`;

const LeftColumn = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: transparent;
  transition: background 0.3s ease;
`;

const RightColumn = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: transparent;
  transition: background 0.3s ease;
  /* ✅ FIX: Prevent layout shifts */
  min-width: 0;
  width: 100%;
`;

const Card = styled.div<{ $isDark: boolean }>`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const ImageSection = styled(Card) <{ $isDark: boolean }>`
  padding: 0;
  overflow: hidden;
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
`;

const MainImageContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100% !important;
  /* ✅ FIX: Fixed height for desktop to prevent layout shifts */
  height: 500px !important;
  max-height: 500px !important;
  min-height: 500px !important;
  background: var(--bg-primary);
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
  /* ✅ FIX: Prevent container from resizing */
  box-sizing: border-box;
  /* ✅ FIX: Force GPU acceleration and prevent reflow */
  will-change: auto;
  /* ✅ FIX: Prevent layout shifts during image load */
  contain: layout style paint;

  @media (max-width: 1024px) {
    height: 400px !important;
    max-height: 400px !important;
    min-height: 400px !important;
  }

  @media (max-width: 768px) {
    height: 280px !important;
    max-height: 280px !important;
    min-height: 280px !important;
  }

  /* ✅ FIX: Ensure desktop height for screens > 768px */
  @media (min-width: 769px) {
    height: 500px !important;
    max-height: 500px !important;
    min-height: 500px !important;
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  /* ✅ FIX: Prevent image from causing layout shifts */
  flex-shrink: 0;
`;

const ImageNavButton = styled.button<{ $position: 'left' | 'right'; $isDark: boolean }>`
  position: absolute;
  ${props => props.$position}: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  max-width: 50px;
  max-height: 50px;
  border-radius: 50%;
  background: ${props => props.$isDark
    ? 'rgba(255, 215, 0, 0.25)'
    : 'rgba(255, 143, 16, 0.25)'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 215, 0, 0.5)'
    : 'rgba(255, 143, 16, 0.5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  backdrop-filter: blur(8px);
  box-shadow: ${props => props.$isDark
    ? '0 4px 16px rgba(255, 215, 0, 0.2)'
    : '0 4px 16px rgba(255, 143, 16, 0.2)'};

  svg {
    color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
    width: 24px !important;
    height: 24px !important;
    flex-shrink: 0;
    transition: transform 0.3s ease;
    display: block;
  }

  &:hover {
    background: ${props => props.$isDark
    ? 'rgba(255, 215, 0, 0.4)'
    : 'rgba(255, 143, 16, 0.4)'};
    border-color: var(--accent-primary);
    transform: translateY(-50%) translateX(${props => props.$position === 'left' ? '-4px' : '4px'});
    box-shadow: ${props => props.$isDark
    ? '0 6px 24px rgba(255, 215, 0, 0.3)'
    : '0 6px 24px rgba(255, 143, 16, 0.3)'};
    
    svg {
      color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
      transform: translateX(${props => props.$position === 'left' ? '-2px' : '2px'});
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    max-width: 50px;
    max-height: 50px;
    border-radius: 50%;
    
    svg {
      width: 24px !important;
      height: 24px !important;
    }
  }
`;

const ThumbnailGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 4px;
  padding: 8px;
  background: var(--bg-secondary);
  transition: background 0.3s ease;
`;

const Thumbnail = styled.div<{ $isActive: boolean; $isDark: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => {
    if (props.$isActive) {
      return 'var(--accent-primary)';
    }
    return 'transparent';
  }};
  opacity: ${props => props.$isActive ? 1 : 0.7};
  transition: all 0.2s;
  background: var(--bg-card);

  &:hover {
    opacity: 1;
    transform: scale(1.05);
    border-color: ${props => {
    if (props.$isActive) {
      return 'var(--accent-primary)';
    }
    return 'var(--border-secondary)';
  }};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DealerLogos = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
`;

const DealerLogo = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
`;

const CarBrandLogos = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const BrandLogo = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  padding: 4px 8px;
  background: var(--bg-accent);
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const TitleSection = styled(Card) <{ $isDark: boolean }>`
  padding: 1.5rem;
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CarTitle = styled.h1<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 0 0 0.75rem 0;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
`;

const NetPrice = styled.div<{ $isDark: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const GrossPrice = styled.div<{ $isDark: boolean }>`
  font-size: 16px;
  color: var(--text-tertiary);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const FinancingOffer = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 12px;
  background: var(--bg-accent);
  border-radius: 8px;
  flex-wrap: wrap;
  border: 1px solid var(--border-accent);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 10px;
    margin-bottom: 0.75rem;
    gap: 0.375rem;
  }
`;

const FinancingText = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-primary);
  line-height: 1.4;
  word-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const KeyDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
`;

const KeyDataItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-tertiary);
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 0.375rem;
  }

  svg {
    flex-shrink: 0;
    color: var(--accent-primary);
  }
`;

const QuickInfoIcons = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
  margin: 1rem 0;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0.75rem 0;
    margin: 0.75rem 0;
  }
`;

const QuickInfoItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 0.375rem;
  }

  svg {
    flex-shrink: 0;
    color: var(--accent-primary);
  }
`;

const IconWrapper = styled.div<{ $isDark: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  transition: color 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.375rem;
    margin-top: 0.75rem;
  }
`;

const DeleteButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.$isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'};
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;

  &:hover {
    background: ${props => props.$isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'};
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled.button<{ $isDark: boolean }>`
  flex: 1;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: var(--shadow-button);

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    flex: 1 1 100%;
  }

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: ${props => props.$isDark
    ? '0 4px 8px rgba(37, 99, 235, 0.5)'
    : '0 4px 8px rgba(24, 119, 242, 0.3)'};
  }
`;

const SecondaryButton = styled.button<{ $isDark: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: var(--btn-secondary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
  }

  &:hover {
    background: var(--btn-secondary-hover);
    border-color: var(--border-secondary);
  }

  svg {
    width: 20px;
    height: 20px;
    color: var(--btn-secondary-text);

    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const BatteryInfoSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
    : 'linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(37, 99, 235, 0.3)' : '#b3d9ff'};
  transition: all 0.3s ease;
`;

const BatteryTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.75rem 0;
  }
`;

const BatteryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const BatteryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BatteryLabel = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
  line-height: 1.4;
  word-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const BatteryValue = styled.div<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  word-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const TechnicalDataTable = styled.table<{ $isDark: boolean }>`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableRow = styled.tr<{ $isDark: boolean }>`
  border-bottom: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;

  &:last-child {
    border-bottom: none;
  }
`;

const TableLabel = styled.td<{ $isDark: boolean }>`
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
  width: 50%;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  vertical-align: top;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px 0;
    width: 45%;
  }
`;

const TableValue = styled.td<{ $isDark: boolean }>`
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  vertical-align: top;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px 0;
    width: 55%;
  }
`;

const FeaturesSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
`;

const FeaturesTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.75rem 0;
  }
`;

const FeaturesCategory = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 0.5rem 0;
  }
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }
`;

const FeatureItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 0.375rem;
  }

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${props => props.$isDark ? '#22c55e' : '#22c55e'};
  }
`;

const CheckIcon = styled(CheckCircle)`
  width: 18px;
  height: 18px;
  color: #22c55e;
  flex-shrink: 0;
`;

const DescriptionSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
`;

const DescriptionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.75rem 0;
  }
`;

const DescriptionText = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const DealerSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
`;

const DealerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DealerInfo = styled.div`
  flex: 1;
  min-width: 0; /* Allow flex item to shrink below content size */
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const DealerName = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  min-width: 0;

  &:hover {
    color: var(--accent-primary);
  }

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.375rem 0;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    gap: 0.375rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const ProfileLink = styled.a<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  min-width: 0;

  &:hover {
    color: var(--accent-primary);
    
    svg {
      transform: scale(1.1);
    }
  }

  svg {
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
`;

const DealerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    gap: 0.375rem;
  }
`;

const BrandInfo = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 8px;
  transition: background 0.3s ease;

  @media (max-width: 480px) {
    gap: 0.5rem;
    padding: 0.5rem;
  }
`;

const BrandLogoContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  min-width: 50px;
  background: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.1)' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
`;

const BrandLogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;

  @media (max-width: 480px) {
    padding: 6px;
  }
`;

const BrandNameText = styled.span<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;

  @media (max-width: 480px) {
    gap: 0.125rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const StarIcon = styled(Star)`
  width: 18px;
  height: 18px;
  fill: #fbbf24;
  color: #fbbf24;
`;

const RatingValue = styled.span<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const RatingCount = styled.span<{ $isDark: boolean }>`
  font-size: 14px;
  color: var(--text-tertiary);
  margin-left: 0.5rem;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-left: 0.375rem;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-left: 0.25rem;
    display: block;
    margin-left: 0;
    margin-top: 0.25rem;
    width: 100%;
  }
`;

const DealerButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    gap: 0.375rem;
  }
`;

const DealerButton = styled.button<{ $isDark: boolean }>`
  padding: 8px 16px;
  border: 1px solid var(--btn-secondary-border);
  background: var(--btn-secondary-bg);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--btn-secondary-text);
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
  text-decoration: none;
  display: inline-block;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  text-align: center;
  min-width: fit-content;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    flex: 1 1 auto;
    min-width: calc(50% - 0.25rem);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
    flex: 1 1 100%;
    min-width: 100%;
  }

  &:hover {
    background: var(--btn-secondary-hover);
    border-color: var(--border-secondary);
  }
`;

const DealerContact = styled.div<{ $isDark: boolean }>`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
`;

const ContactItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 0.375rem;
    margin-bottom: 0.5rem;
  }

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--accent-primary);
  }

  a {
    word-break: break-all;
    overflow-wrap: break-word;
    color: var(--accent-primary);
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const OpeningHours = styled.div<{ $isDark: boolean }>`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
`;

const HoursTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 0.375rem 0;
  }
`;

const HoursItem = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
  line-height: 1.5;
  word-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 0.2rem;
  }
`;

const FinancingSection = styled.div<{ $isDark: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.$isDark ? 'rgba(37, 99, 235, 0.15)' : '#f0f8ff'};
  border-radius: 8px;
  border: 1px solid ${props => props.$isDark ? 'rgba(37, 99, 235, 0.3)' : '#b3d9ff'};
  transition: all 0.3s ease;
`;

const FinancingTitle = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  word-wrap: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 0.375rem;
  }
`;

const FinancingButton = styled.button<{ $isDark: boolean }>`
  width: 100%;
  background: var(--accent-primary);
  color: var(--btn-primary-text);
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  text-align: center;
  box-shadow: ${props => props.$isDark
    ? '0 2px 4px rgba(124, 58, 237, 0.4)'
    : '0 2px 4px rgba(139, 92, 246, 0.2)'};
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 13px;
  }

  &:hover {
    background: var(--accent-secondary);
    box-shadow: ${props => props.$isDark
    ? '0 4px 8px rgba(124, 58, 237, 0.5)'
    : '0 4px 8px rgba(139, 92, 246, 0.3)'};
  }
`;

const MapSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
`;

const MapTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.75rem 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ServicesSection = styled(Card) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#fff'};
  border: ${props => props.$isDark ? '1px solid #334155' : 'none'};
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
`;

const ServicesTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
  transition: color 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 0.75rem 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const ServiceCheckbox = styled.label<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: color 0.3s ease;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 0.375rem;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    gap: 0.5rem;
  }

  span {
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;
    flex: 1;
  }

  input[type="checkbox"] {
    flex-shrink: 0;
    margin-top: 2px;
    accent-color: ${props => props.$isDark ? '#60a5fa' : '#1877f2'};
  }
`;

const UpdateButton = styled.button<{ $isDark: boolean }>`
  margin-top: 1rem;
  width: 100%;
  padding: 10px;
  background: var(--btn-secondary-bg);
  border: 1px solid var(--btn-secondary-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 13px;
    margin-top: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 8px 6px;
    font-size: 12px;
  }

  &:hover {
    background: var(--btn-secondary-hover);
    border-color: var(--border-secondary);
  }
`;

// ==================== Component ====================

const CarDetailsGermanStyle: React.FC<CarDetailsGermanStyleProps> = ({
  car,
  language,
  onBack,
  onEdit,
  onDelete,
  isOwner,
  onContact
}) => {
  const t = translations[language];
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ✅ FIX: Add previewUrlsRef for File objects
  const previewUrlsRef = useRef<Map<number, string>>(new Map());
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  // ✅ FIX: Lock layout on mount - prevent changes after load
  useEffect(() => {
    // Lock initial layout - CSS media queries handle responsive behavior
    return undefined;
  }, []); // Only run once on mount

  // ✅ FIX: Resolve images immediately to prevent layout shifts
  useEffect(() => {
    const images = car.images || [];
    const cleanUp: string[] = [];

    // Resolve all images immediately (synchronously if possible)
    const urls = images.map((image) => {
      if (typeof image === 'string') {
        return image;
      }
      // For File objects, create object URL
      const url = URL.createObjectURL(image);
      cleanUp.push(url);
      return url;
    });

    // ✅ FIX: Set images immediately without waiting
    setResolvedImages(urls);

    // Store in ref for backward compatibility
    urls.forEach((url, index) => {
      previewUrlsRef.current.set(index, url);
    });

    return () => {
      // Cleanup object URLs
      cleanUp.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, [car.images]);

  // Get seller ID for profile link (prefer numeric ID for new URL system)
  const sellerId = car.sellerId || car.userId;
  const profileId = car.sellerNumericId || sellerId;

  // Handler functions
  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (profileId) {
      // 🔒 STRICT: Use /profile/view/{numericId} for other users' profiles
      let currentUserNumericId: number | undefined;
      if (currentUser?.uid) {
        try {
          const { BulgarianProfileService } = await import('../../../services/bulgarian-profile-service');
          const currentUserProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);
          currentUserNumericId = currentUserProfile?.numericId;
        } catch (error) {
          logger.debug('Could not get current user numeric ID', { error });
        }
      }
      
      // Convert profileId to number if it's a string
      const targetNumericId = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
      const isOwnProfile = currentUserNumericId !== undefined && targetNumericId === currentUserNumericId;
      
      if (isOwnProfile) {
        navigate(`/profile/${targetNumericId}`);
      } else {
        navigate(`/profile/view/${targetNumericId}`);
      }
    }
  };

  const handleContactDealer = async () => {
    logger.debug('handleContactDealer called', {
      sellerId,
      profileId,
      carId: car.id,
      'car.sellerId': car.sellerId,
      'car.userId': car.userId,
      'car.sellerNumericId': car.sellerNumericId
    });

    // ✅ CRITICAL FIX: Use numeric messaging URL if available
    try {
      if (car.sellerNumericId && currentUser?.uid) {
        // Get current user's numeric ID
        const { BulgarianProfileService } = await import('../../../services/bulgarian-profile-service');
        const currentUserProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);

        if (currentUserProfile?.numericId) {
          navigate(`/messages/${currentUserProfile.numericId}/${car.sellerNumericId}`);
          return;
        }
      }

      // 🚨 CONSTITUTION: Do NOT fallback to UID-based URLs
      // Show error instead of using legacy URL
      logger.error('Missing numeric IDs for messaging', {
        sellerNumericId: car.sellerNumericId,
        sellerId: sellerId
      });
      onContact('phone');
    } catch (error) {
      logger.error('Error navigating to messages', error as Error);
      // Fallback to phone contact
      onContact('phone');
    }
  };

  const handleInquireNow = () => {
    // Navigate to finance page or messages
    navigate('/finance');
  };

  const handleReviews = async () => {
    if (profileId) {
      // 🔒 STRICT: Use /profile/view/{numericId} for other users' profiles
      let currentUserNumericId: number | undefined;
      if (currentUser?.uid) {
        try {
          const { BulgarianProfileService } = await import('../../../services/bulgarian-profile-service');
          const currentUserProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);
          currentUserNumericId = currentUserProfile?.numericId;
        } catch (error) {
          logger.debug('Could not get current user numeric ID', { error });
        }
      }
      
      const targetNumericId = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
      const isOwnProfile = currentUserNumericId !== undefined && targetNumericId === currentUserNumericId;
      
      if (isOwnProfile) {
        navigate(`/profile/${targetNumericId}#reviews`);
      } else {
        navigate(`/profile/view/${targetNumericId}#reviews`);
      }
    }
  };

  const handleAllVehicles = async () => {
    if (profileId) {
      // 🔒 STRICT: Use /profile/view/{numericId} for other users' profiles
      let currentUserNumericId: number | undefined;
      if (currentUser?.uid) {
        try {
          const { BulgarianProfileService } = await import('../../../services/bulgarian-profile-service');
          const currentUserProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);
          currentUserNumericId = currentUserProfile?.numericId;
        } catch (error) {
          logger.debug('Could not get current user numeric ID', { error });
        }
      }
      
      const targetNumericId = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
      const isOwnProfile = currentUserNumericId !== undefined && targetNumericId === currentUserNumericId;
      
      if (isOwnProfile) {
        navigate(`/profile/${targetNumericId}/my-ads`);
      } else {
        navigate(`/profile/view/${targetNumericId}/my-ads`);
      }
    } else {
      navigate('/cars');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car.make} ${car.model} ${car.year}`,
        text: `Check out this ${car.make} ${car.model} for ${formatPrice(car.price)}`,
        url: window.location.href
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSave = () => {
    // Navigate to favorites or save to localStorage
    navigate('/favorites');
  };

  // ✅ FIX: Use resolved images instead of raw car.images
  const images = resolvedImages.length > 0 ? resolvedImages : (car.images || []);
  const hasImages = images.length > 0;

  // Helper function to get location string
  const getLocationString = () => {
    if (car.companyAddress) return car.companyAddress;
    if (typeof car.location === 'string') return car.location;
    if (car.location && typeof car.location === 'object') {
      // Handle location object
      if (language === 'bg' && car.locationData?.cityNameNameBg) {
        return `${car.locationData?.cityNameNameBg}${car.location.regionNameBg ? `, ${car.location.regionNameBg}` : ''}`;
      }
      if (car.locationData?.cityNameNameEn) {
        return `${car.locationData?.cityNameNameEn}${car.location.regionNameEn ? `, ${car.location.regionNameEn}` : ''}`;
      }
      if (car.location.address) return car.location.address;
    }
    // Fallback to city and region
    const city = typeof car.city === 'string' ? car.city : (car.location?.cityNameBg || car.location?.cityNameEn || '');
    const region = typeof car.region === 'string' ? car.region : (car.location?.regionNameBg || car.location?.regionNameEn || '');
    if (city || region) {
      return `${city}${region ? `, ${region}` : ''}`;
    }
    return language === 'bg' ? 'България' : 'Bulgaria';
  };

  // Helper function to get city string
  const getCityString = () => {
    if (typeof car.city === 'string') return car.city;
    if (car.location && typeof car.location === 'object') {
      return language === 'bg' ? (car.locationData?.cityNameNameBg || car.locationData?.cityNameNameEn || '') : (car.locationData?.cityNameNameEn || car.locationData?.cityNameNameBg || '');
    }
    return '';
  };

  // Helper function to get region string
  const getRegionString = () => {
    if (typeof car.region === 'string') return car.region;
    if (car.location && typeof car.location === 'object') {
      return language === 'bg' ? (car.location.regionNameBg || car.location.regionNameEn || '') : (car.location.regionNameEn || car.location.regionNameBg || '');
    }
    return '';
  };

  // Helper function to get coordinates
  const getCoordinates = () => {
    if (car.coordinates) return car.coordinates;
    if (car.location && typeof car.location === 'object' && car.location.coordinates) {
      return car.location.coordinates;
    }
    return undefined;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateGrossPrice = (netPrice: number) => {
    // VAT in Bulgaria is 20%
    return netPrice * 1.20;
  };

  const formatDate = (date: string | number | undefined) => {
    if (!date) return t.notSpecified;
    if (typeof date === 'number') {
      const d = new Date(date);
      return d.toLocaleDateString('bg-BG', { month: '2-digit', year: 'numeric' });
    }
    return date;
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString('bg-BG')} ${t.km}`;
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const fuelMap: Record<string, { bg: string; en: string }> = {
      'electric': { bg: 'Електрически', en: 'Electric' },
      'petrol': { bg: 'Бензин', en: 'Petrol' },
      'diesel': { bg: 'Дизел', en: 'Diesel' },
      'hybrid': { bg: 'Хибрид', en: 'Hybrid' },
      'lpg': { bg: 'Газ', en: 'LPG' },
    };
    const normalized = fuelType.toLowerCase().replace(/\s+/g, '');
    return fuelMap[normalized]?.[language] || fuelType;
  };

  const getTransmissionLabel = (transmission: string) => {
    const transMap: Record<string, { bg: string; en: string }> = {
      'automatic': { bg: 'Автоматична', en: 'Automatic' },
      'manual': { bg: 'Ръчна', en: 'Manual' },
      'semiautomatic': { bg: 'Полуавтоматична', en: 'Semi-automatic' },
    };
    const normalized = transmission.toLowerCase().replace(/\s+/g, '');
    return transMap[normalized]?.[language] || transmission;
  };

  const getDriveTypeLabel = (driveType: string) => {
    const driveMap: Record<string, { bg: string; en: string }> = {
      'frontwheeldrive': { bg: 'Предно', en: 'Front-wheel' },
      'rearwheeldrive': { bg: 'Задно', en: 'Rear-wheel' },
      'allwheeldrive': { bg: '4x4', en: 'All-wheel' },
    };
    const normalized = driveType?.toLowerCase().replace(/\s+/g, '') || '';
    return driveMap[normalized]?.[language] || driveType || t.notSpecified;
  };

  const nextImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const isElectric = car.fuelType?.toLowerCase().includes('electric') ||
    car.fuelType?.toLowerCase().includes('електрически');

  // Categorize features
  const categorizeFeatures = () => {
    const features = car.features || [];
    const comfort: string[] = [];
    const entertainment: string[] = [];
    const safety: string[] = [];
    const other: string[] = [];

    features.forEach(feature => {
      const lower = feature.toLowerCase();
      if (lower.includes('climate') || lower.includes('heating') || lower.includes('seat') ||
        lower.includes('parking') || lower.includes('sensor') || lower.includes('light')) {
        comfort.push(feature);
      } else if (lower.includes('radio') || lower.includes('bluetooth') || lower.includes('navigation') ||
        lower.includes('carplay') || lower.includes('android') || lower.includes('usb')) {
        entertainment.push(feature);
      } else if (lower.includes('airbag') || lower.includes('abs') || lower.includes('esp') ||
        lower.includes('safety') || lower.includes('emergency')) {
        safety.push(feature);
      } else {
        other.push(feature);
      }
    });

    return { comfort, entertainment, safety, other };
  };

  const { comfort, entertainment, safety, other } = categorizeFeatures();
  const displayedFeatures = showAllFeatures
    ? { comfort, entertainment, safety, other }
    : {
      comfort: comfort.slice(0, 10),
      entertainment: entertainment.slice(0, 10),
      safety: safety.slice(0, 10),
      other: other.slice(0, 10)
    };

  return (
    <PageWrapper $isDark={isDark}>
      <TopBar $isDark={isDark}>
        <TopBarLeft $isDark={isDark}>
          <BackButton $isDark={isDark} onClick={onBack}>
            <ArrowLeft size={18} />
            {t.back}
          </BackButton>
        </TopBarLeft>
        {isOwner && onEdit && (
          <EditButton $isDark={isDark} onClick={onEdit}>
            <Edit size={18} />
            {t.edit}
          </EditButton>
        )}
      </TopBar>

      <Container $isDark={isDark}>
        <MainSection $isDark={isDark}>
          <LeftColumn $isDark={isDark}>
            {/* Image Gallery */}
            <ImageSection $isDark={isDark}>
              {hasImages ? (
                <>
                  <MainImageContainer $isDark={isDark} onClick={() => setIsLightboxOpen(true)}>
                    <MainImage
                      src={images[selectedImageIndex] || ''}
                      alt={`${car.make} ${car.model}`}
                      loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                      decoding="sync"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                      }}
                    />

                    {/* Zoom Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: '50%',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      className: 'zoom-indicator' // We'll target this with hover
                    }}
                      className="zoom-overlay"
                    >
                      <ZoomIn size={48} color="white" />
                    </div>

                    {/* Add hover effect via style tag for simplicity or styled component */}
                    <style>{`
                        .zoom-overlay { opacity: 0; }
                        div:hover > .zoom-overlay { opacity: 1; }
                      `}</style>

                    {images.length > 1 && (
                      <>
                        <ImageNavButton $position="left" $isDark={isDark} onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                          <ChevronLeft size={24} />
                        </ImageNavButton>
                        <ImageNavButton $position="right" $isDark={isDark} onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                          <ChevronRight size={24} />
                        </ImageNavButton>
                      </>
                    )}

                    {/* ✅ New: Make Main Photo Button */}
                    {isOwner && selectedImageIndex !== 0 && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!car.id) return;

                          try {
                            const newImages = [...images];
                            const [selected] = newImages.splice(selectedImageIndex, 1);
                            newImages.unshift(selected);

                            // Optimistic update
                            setResolvedImages(newImages);
                            setSelectedImageIndex(0);

                            const { unifiedCarService } = await import('../../../services/car/unified-car-service');
                            await unifiedCarService.updateCar(car.id, { images: newImages });

                            // Use toast or alert based on availability
                            const msg = language === 'bg' ? 'Снимката е зададена като основна' : 'Main photo updated';
                            // try/catch for toast if not available
                            try { require('react-toastify').toast.success(msg); } catch (e) { alert(msg); }

                          } catch (error) {
                            logger.error('Failed to update main photo', error as Error);
                            // Revert on error would go here ideally
                            const msg = language === 'bg' ? 'Грешка при обновяване' : 'Update failed';
                            try { require('react-toastify').toast.error(msg); } catch (e) { alert(msg); }
                          }
                        }}
                        style={{
                          position: 'absolute',
                          bottom: '20px',
                          right: '20px',
                          zIndex: 10,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                          fontSize: '14px',
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Star size={16} fill="white" />
                        {language === 'bg' ? 'Направи основна' : 'Set as Main Photo'}
                      </button>
                    )}
                  </MainImageContainer>
                  <ThumbnailGrid $isDark={isDark}>
                    {images.map((image, index) => (
                      <Thumbnail
                        key={index}
                        $isActive={index === selectedImageIndex}
                        $isDark={isDark}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image || ''}
                          alt={`Thumbnail ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </Thumbnail>
                    ))}
                  </ThumbnailGrid>
                </>
              ) : (
                <MainImageContainer $isDark={isDark}>
                  <GlobulCarLogo size={120} />
                </MainImageContainer>
              )}

              <DealerLogos $isDark={isDark}>
                <DealerLogo $isDark={isDark}>{car.sellerName || car.companyName || 'Dealer'}</DealerLogo>
                <CarBrandLogos>
                  <BrandLogo $isDark={isDark}>{car.make}</BrandLogo>
                </CarBrandLogos>
              </DealerLogos>
            </ImageSection>

            {/* Title and Price */}
            <TitleSection $isDark={isDark}>
              <CarTitle $isDark={isDark}>{car.make} {car.model} {car.year}</CarTitle>

              <PriceSection>
                <NetPrice $isDark={isDark}>{t.netPrice}: {formatPrice(car.price)}</NetPrice>
                <GrossPrice $isDark={isDark}>{t.grossPrice} {formatPrice(calculateGrossPrice(car.price))}</GrossPrice>
              </PriceSection>

              <FinancingOffer $isDark={isDark}>
                <FinancingText $isDark={isDark}>
                  {t.financingFrom} €124 {language === 'bg' ? 'месечно' : 'monthly'}
                </FinancingText>
              </FinancingOffer>

              <KeyDataGrid>
                <KeyDataItem $isDark={isDark}>
                  <Calendar size={18} />
                  {t.firstRegistration}: {formatDate(car.year?.toString())}
                </KeyDataItem>
                <KeyDataItem $isDark={isDark}>
                  <Gauge size={18} />
                  {formatMileage(car.mileage)}
                </KeyDataItem>
                <KeyDataItem $isDark={isDark}>
                  <Battery size={18} />
                  {car.powerKW ? `${car.powerKW} ${t.kw} (${car.power || Math.round(car.powerKW * 1.36)} ${t.hp})` : `${car.power || 0} ${t.hp}`}
                </KeyDataItem>
                <KeyDataItem $isDark={isDark}>
                  <Battery size={18} />
                  {getFuelTypeLabel(car.fuelType || '')}
                </KeyDataItem>
              </KeyDataGrid>

              <QuickInfoIcons $isDark={isDark}>
                <QuickInfoItem $isDark={isDark}>
                  <IconWrapper $isDark={isDark}><Calendar size={18} /></IconWrapper>
                  {t.firstRegistration} {formatDate(car.year?.toString())}
                </QuickInfoItem>
                <QuickInfoItem $isDark={isDark}>
                  <IconWrapper $isDark={isDark}><Gauge size={18} /></IconWrapper>
                  {formatMileage(car.mileage)}
                </QuickInfoItem>
                <QuickInfoItem $isDark={isDark}>
                  <IconWrapper $isDark={isDark}><Battery size={18} /></IconWrapper>
                  {getFuelTypeLabel(car.fuelType || '')}
                </QuickInfoItem>
                <QuickInfoItem $isDark={isDark}>
                  <IconWrapper $isDark={isDark}><Key size={18} /></IconWrapper>
                  {car.previousOwners || car.numberOfOwners || 1} {language === 'bg' ? 'предишен собственик' : 'previous owner'}
                </QuickInfoItem>
                {car.accidentHistory === false && (
                  <QuickInfoItem $isDark={isDark}>
                    <IconWrapper $isDark={isDark}><CheckCircle size={18} /></IconWrapper>
                    {t.accidentFree}
                  </QuickInfoItem>
                )}
                {car.serviceHistory && (
                  <QuickInfoItem $isDark={isDark}>
                    <IconWrapper $isDark={isDark}><FileText size={18} /></IconWrapper>
                    {t.serviceHistory}
                  </QuickInfoItem>
                )}
              </QuickInfoIcons>

              <ActionButtons>
                <PrimaryButton $isDark={isDark} onClick={handleContactDealer}>
                  {t.contactDealer}
                </PrimaryButton>
                <SecondaryButton $isDark={isDark} onClick={() => onContact('phone')} title={t.phone}>
                  <Phone size={20} />
                </SecondaryButton>
                <SecondaryButton $isDark={isDark} onClick={() => onContact('email')} title={t.email}>
                  <Mail size={20} />
                </SecondaryButton>
                <SecondaryButton $isDark={isDark} onClick={() => onContact('whatsapp')} title="WhatsApp">
                  <MessageCircle size={20} />
                </SecondaryButton>
                <SecondaryButton $isDark={isDark} onClick={handleShare} title={t.share}>
                  <Share2 size={20} />
                </SecondaryButton>
                <SecondaryButton $isDark={isDark} onClick={handleSave} title={t.save}>
                  <Bookmark size={20} />
                </SecondaryButton>
                {isOwner && onDelete && (
                  <DeleteButton $isDark={isDark} onClick={onDelete} title={t.delete}>
                    <Trash2 size={20} />
                    <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>{t.delete}</span>
                  </DeleteButton>
                )}
              </ActionButtons>
            </TitleSection>

            {/* Battery Information (for electric cars) */}
            {isElectric && (
              <BatteryInfoSection $isDark={isDark}>
                <BatteryTitle $isDark={isDark}>{t.batteryCapacity}</BatteryTitle>
                <BatteryGrid>
                  <BatteryItem>
                    <BatteryLabel $isDark={isDark}>{t.batteryCapacity}</BatteryLabel>
                    <BatteryValue $isDark={isDark}>37 kWh</BatteryValue>
                  </BatteryItem>
                  <BatteryItem>
                    <BatteryLabel $isDark={isDark}>{t.range}</BatteryLabel>
                    <BatteryValue $isDark={isDark}>321 {t.rangeUnit}</BatteryValue>
                  </BatteryItem>
                  <BatteryItem>
                    <BatteryLabel $isDark={isDark}>{t.chargeTimeAC}</BatteryLabel>
                    <BatteryValue $isDark={isDark}>4{t.hours} 15{t.minutes}</BatteryValue>
                  </BatteryItem>
                  <BatteryItem>
                    <BatteryLabel $isDark={isDark}>{t.chargeTimeDC}</BatteryLabel>
                    <BatteryValue $isDark={isDark}>35 {t.minutes}</BatteryValue>
                  </BatteryItem>
                </BatteryGrid>
                <div style={{ marginTop: '1rem', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  {t.batteryWarranty}
                </div>
              </BatteryInfoSection>
            )}

            {/* Technical Data */}
            <Card $isDark={isDark}>
              <FeaturesTitle $isDark={isDark}>{t.technicalData}</FeaturesTitle>
              <TechnicalDataTable $isDark={isDark}>
                <tbody>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.vehicleCondition}</TableLabel>
                    <TableValue $isDark={isDark}>{car.accidentHistory === false ? (language === 'bg' ? 'Без аварии' : 'Accident-free') : t.notSpecified}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.category}</TableLabel>
                    <TableValue $isDark={isDark}>{car.vehicleType || t.notSpecified}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{language === 'bg' ? 'Предишни собственици' : 'Previous owners'}</TableLabel>
                    <TableValue $isDark={isDark}>{car.previousOwners || car.numberOfOwners || 1}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.firstRegistration}</TableLabel>
                    <TableValue $isDark={isDark}>{formatDate(car.year?.toString())}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.mileage}</TableLabel>
                    <TableValue $isDark={isDark}>{formatMileage(car.mileage)}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.power}</TableLabel>
                    <TableValue $isDark={isDark}>{car.powerKW ? `${car.powerKW} ${t.kw} (${car.power || Math.round(car.powerKW * 1.36)} ${t.hp})` : `${car.power || 0} ${t.hp}`}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.fuelType}</TableLabel>
                    <TableValue $isDark={isDark}>{getFuelTypeLabel(car.fuelType || '')}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.transmission}</TableLabel>
                    <TableValue $isDark={isDark}>{getTransmissionLabel(car.transmission || '')}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.driveType}</TableLabel>
                    <TableValue $isDark={isDark}>{getDriveTypeLabel(car.driveType || '')}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.doors}</TableLabel>
                    <TableValue $isDark={isDark}>{car.doors || car.numberOfDoors || t.notSpecified}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.seats}</TableLabel>
                    <TableValue $isDark={isDark}>{car.seats || car.numberOfSeats || t.notSpecified}</TableValue>
                  </TableRow>
                  <TableRow $isDark={isDark}>
                    <TableLabel $isDark={isDark}>{t.color}</TableLabel>
                    <TableValue $isDark={isDark}>{car.color || car.exteriorColor || t.notSpecified}</TableValue>
                  </TableRow>
                  {car.fuelConsumption && (
                    <TableRow $isDark={isDark}>
                      <TableLabel $isDark={isDark}>{t.consumption}</TableLabel>
                      <TableValue $isDark={isDark}>{car.fuelConsumption} {isElectric ? 'kWh/100 km' : 'l/100 km'}</TableValue>
                    </TableRow>
                  )}
                  {car.co2Emissions !== undefined && (
                    <TableRow $isDark={isDark}>
                      <TableLabel $isDark={isDark}>{t.co2Emissions}</TableLabel>
                      <TableValue $isDark={isDark}>{car.co2Emissions} g/km</TableValue>
                    </TableRow>
                  )}
                  {car.euroStandard && (
                    <TableRow $isDark={isDark}>
                      <TableLabel $isDark={isDark}>{t.emissionClass}</TableLabel>
                      <TableValue $isDark={isDark}>{car.euroStandard}</TableValue>
                    </TableRow>
                  )}
                </tbody>
              </TechnicalDataTable>
              <UpdateButton $isDark={isDark}>{t.update}</UpdateButton>
            </Card>

            {/* Features */}
            {(comfort.length > 0 || entertainment.length > 0 || safety.length > 0 || other.length > 0) && (
              <FeaturesSection $isDark={isDark}>
                <FeaturesTitle $isDark={isDark}>{t.features}</FeaturesTitle>

                {displayedFeatures.comfort.length > 0 && (
                  <FeaturesCategory>
                    <CategoryTitle $isDark={isDark}>{t.comfort}</CategoryTitle>
                    <FeaturesList>
                      {displayedFeatures.comfort.map((feature, idx) => (
                        <FeatureItem key={idx} $isDark={isDark}>
                          <CheckIcon size={18} />
                          {feature}
                        </FeatureItem>
                      ))}
                    </FeaturesList>
                  </FeaturesCategory>
                )}

                {displayedFeatures.entertainment.length > 0 && (
                  <FeaturesCategory>
                    <CategoryTitle $isDark={isDark}>{t.entertainment}</CategoryTitle>
                    <FeaturesList>
                      {displayedFeatures.entertainment.map((feature, idx) => (
                        <FeatureItem key={idx} $isDark={isDark}>
                          <CheckIcon size={18} />
                          {feature}
                        </FeatureItem>
                      ))}
                    </FeaturesList>
                  </FeaturesCategory>
                )}

                {displayedFeatures.safety.length > 0 && (
                  <FeaturesCategory>
                    <CategoryTitle $isDark={isDark}>{t.safety}</CategoryTitle>
                    <FeaturesList>
                      {displayedFeatures.safety.map((feature, idx) => (
                        <FeatureItem key={idx} $isDark={isDark}>
                          <CheckIcon size={18} />
                          {feature}
                        </FeatureItem>
                      ))}
                    </FeaturesList>
                  </FeaturesCategory>
                )}

                {displayedFeatures.other.length > 0 && (
                  <FeaturesCategory>
                    <CategoryTitle $isDark={isDark}>{t.other}</CategoryTitle>
                    <FeaturesList>
                      {displayedFeatures.other.map((feature, idx) => (
                        <FeatureItem key={idx} $isDark={isDark}>
                          <CheckIcon size={18} />
                          {feature}
                        </FeatureItem>
                      ))}
                    </FeaturesList>
                  </FeaturesCategory>
                )}

                {(comfort.length > 10 || entertainment.length > 10 || safety.length > 10 || other.length > 10) && !showAllFeatures && (
                  <UpdateButton $isDark={isDark} onClick={() => setShowAllFeatures(true)}>
                    {t.showAll}
                  </UpdateButton>
                )}
              </FeaturesSection>
            )}

            {/* Vehicle Description - Similar to mobile.de */}
            <DescriptionSection $isDark={isDark}>
              <DescriptionTitle $isDark={isDark}>{t.vehicleDescription}</DescriptionTitle>
              {car.description ? (
                <DescriptionText $isDark={isDark}>{car.description}</DescriptionText>
              ) : (
                <DescriptionText $isDark={isDark} style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
                  {language === 'bg' 
                    ? 'Продавачът не е добавил описание за това превозно средство.'
                    : 'The seller has not added a description for this vehicle.'}
                </DescriptionText>
              )}
            </DescriptionSection>
          </LeftColumn>

          <RightColumn $isDark={isDark}>
            {/* Dealer Information */}
            <DealerSection $isDark={isDark}>
              <DealerHeader>
                <DealerInfo>
                  <DealerRating>
                    <RatingStars>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} size={18} />
                      ))}
                    </RatingStars>
                    <RatingValue $isDark={isDark}>4.7</RatingValue>
                    <RatingCount $isDark={isDark}>(119 {t.reviews})</RatingCount>
                  </DealerRating>
                  
                  {/* Brand Logo and Name */}
                  {car.make && (
                    <BrandInfo $isDark={isDark}>
                      <BrandLogoContainer $isDark={isDark}>
                        <BrandLogoImage
                          src={getCarLogoUrl(car.make)}
                          alt={car.make}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/images/professional_car_logos/mein_logo_rest.png';
                          }}
                        />
                      </BrandLogoContainer>
                      <BrandNameText $isDark={isDark}>
                        {car.make}
                      </BrandNameText>
                    </BrandInfo>
                  )}
                  
                  <DealerName $isDark={isDark} onClick={handleProfileClick}>
                    {sellerId && (
                      <User size={20} style={{ flexShrink: 0 }} />
                    )}
                    <ProfileLink
                      $isDark={isDark}
                      href={car.sellerNumericId ? `/profile/view/${car.sellerNumericId}` : (sellerId ? `/profile/view/${sellerId}` : '#')}
                      onClick={handleProfileClick}
                    >
                      {car.sellerName || car.companyName || 'Dealer'}
                    </ProfileLink>
                  </DealerName>
                </DealerInfo>
                <DealerButtons>
                  <DealerButton $isDark={isDark} onClick={handleReviews}>
                    {t.reviews}
                  </DealerButton>
                  <DealerButton $isDark={isDark} onClick={handleAllVehicles}>
                    {t.allVehicles}
                  </DealerButton>
                </DealerButtons>
              </DealerHeader>

              <DealerContact $isDark={isDark}>
                <ContactItem $isDark={isDark}>
                  <MapPin size={16} />
                  {getLocationString()}
                </ContactItem>
                <ContactItem $isDark={isDark}>
                  <Phone size={16} />
                  <a href={`tel:${car.sellerPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {car.sellerPhone || t.notSpecified}
                  </a>
                </ContactItem>
                <ContactItem $isDark={isDark}>
                  <Mail size={16} />
                  <a href={`mailto:${car.sellerEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {car.sellerEmail || t.notSpecified}
                  </a>
                </ContactItem>
                {car.companyWebsite && (
                  <ContactItem $isDark={isDark}>
                    <span>🌐</span>
                    <a href={car.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {car.companyWebsite}
                    </a>
                  </ContactItem>
                )}
              </DealerContact>

              <OpeningHours $isDark={isDark}>
                <HoursTitle $isDark={isDark}>{t.openingHours}</HoursTitle>
                <HoursItem $isDark={isDark}>Mo-Fr: 09:00 - 18:00 {language === 'bg' ? 'ч' : 'h'}</HoursItem>
                <HoursItem $isDark={isDark}>Sa: 09:00 - 13:00 {language === 'bg' ? 'ч' : 'h'}</HoursItem>
                <HoursItem $isDark={isDark}>{language === 'bg' ? 'Не: Затворено' : 'Sun: Closed'}</HoursItem>
              </OpeningHours>

              <FinancingSection $isDark={isDark}>
                <FinancingTitle $isDark={isDark}>
                  {language === 'bg' ? 'Интересувате ли се от финансиране?' : 'Interested in financing?'}
                </FinancingTitle>
                <FinancingButton $isDark={isDark} onClick={handleInquireNow}>
                  {t.inquireNow}
                </FinancingButton>
              </FinancingSection>
            </DealerSection>

            {/* Location Map */}
            {(getCoordinates() || getCityString()) && (
              <MapSection $isDark={isDark}>
                <MapTitle $isDark={isDark}>{t.location}</MapTitle>
                <StaticMapEmbed
                  location={{
                    city: getCityString() || 'България',
                    region: getRegionString() || '',
                    coordinates: getCoordinates()
                  }}
                />
              </MapSection>
            )}

            {/* Additional Services */}
            <ServicesSection $isDark={isDark}>
              <ServicesTitle $isDark={isDark}>{t.additionalServices}</ServicesTitle>
              <ServicesGrid>
                <ServiceCheckbox $isDark={isDark}>
                  <input type="checkbox" defaultChecked />
                  <span>{t.financing}</span>
                </ServiceCheckbox>
                <ServiceCheckbox $isDark={isDark}>
                  <input type="checkbox" defaultChecked />
                  <span>{t.leasing}</span>
                </ServiceCheckbox>
                <ServiceCheckbox $isDark={isDark}>
                  <input type="checkbox" />
                  <span>{t.tradeIn}</span>
                </ServiceCheckbox>
                <ServiceCheckbox $isDark={isDark}>
                  <input type="checkbox" />
                  <span>{t.registrationService}</span>
                </ServiceCheckbox>
              </ServicesGrid>
              <FinancingButton $isDark={isDark} style={{ marginTop: '1rem' }} onClick={handleInquireNow}>
                {t.inquireNow}
              </FinancingButton>
            </ServicesSection>
          </RightColumn>
        </MainSection>

        {/* ✅ Car Suggestions List - Outside grid to prevent layout shift */}
        {car && (car.id || (car as any).carId) && (
          <CarSuggestionsList
            currentCar={car}
            language={language}
            limit={6}
          />
        )}
      </Container>

      {/* Lightbox Overlay */}
      <ImageLightbox
        images={images.filter(img => typeof img === 'string') as string[]}
        initialIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </PageWrapper>
  );
};

export default CarDetailsGermanStyle;

