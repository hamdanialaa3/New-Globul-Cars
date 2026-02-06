/**
 * Car Details Page - Mobile.DE Style (Based on PDF Reference)
 * 
 * Features from mobile.de:
 * - Clean professional layout
 * - Large prominent images
 * - Clear price presentation
 * - Quick info icons at top
 * - Organized technical data
 * - Seller information with logo
 * - Contact methods prominently displayed
 * - Bulgarian/English bilingual
 * - EUR currency
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import './CarDetailsTheme.css'; // Import theme CSS
import { useToast } from '../../../components/Toast';
import OptimizedImage from '../../../components/OptimizedImage';
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  CheckCircle,
  X as XIcon,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Edit,
  ArrowLeft,
  User,
  Shield,
  Award,
  Clock,
  Star,
  FileText,
  Crown,
  Trash2,
  AlertTriangle,
  Facebook,
  Instagram,
  Linkedin,
  Copy,
  Check,
  Printer,
  PlayCircle // NEW
} from 'lucide-react';
import { CarListing } from '../../../types/CarListing';
import { useTheme } from '../../../contexts/ThemeContext';
import { DescriptionPreview } from '../../../components/SmartDescriptionGenerator/DescriptionPreview';
import { CarPrintSticker } from '../../../components/CarPrint/CarPrintSticker';
import { SimilarCarsWidget } from './SimilarCarsWidget';
import { FinancingCalculator } from './FinancingCalculator';
import CarBrandLogo from '../../../components/CarBrandLogo';
import { ExtendedSellerInfo } from './ExtendedSellerInfo';
import { Battery, ShieldCheck, Info } from 'lucide-react';
import RealisticPaperclipBadge from '../../../components/SoldBadge/RealisticPaperclipBadge';
import { logger } from '../../../services/logger-service';
import { FacebookSmartButton } from '../../../components/social/FacebookSmartButton';
import { PrintableWindowCard } from '../../../components/print/PrintableWindowCard';
import { userService } from '../../../services/user/canonical-user.service';



interface CarDetailsMobileDEStyleProps {
  car: CarListing;
  language: 'bg' | 'en';
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
  onContact: (method: string) => void;
  userProfileType?: 'private' | 'dealer' | 'company';
  monthlyDeletionsUsed?: number;
  activeListingsCount?: number;
}

const translations = {
  bg: {
    back: 'Назад',
    edit: 'Редактирай',
    vatDeductible: 'ДДС приспадащ',
    grossPrice: 'Бруто цена',
    netPrice: 'Нето цена',
    financingFrom: 'Финансиране от',
    perMonth: 'на месец',
    firstRegistration: 'Първа регистрация',
    mileage: 'Пробег',
    power: 'Мощност',
    fuelType: 'Гориво',
    transmission: 'Скоростна кутия',
    previousOwners: 'Предишни собственици',
    accidentFree: 'Без аварии',
    accidentFree: 'Без аварии',
    serviceHistory: 'Сервизна книжка',
    fullServiceHistory: 'Пълна сервизна история',
    technicalData: 'Технически данни',
    batteryInfo: 'Информация за батерията',
    rangeWLTP: 'Пробег (WLTP)',
    warrantyFromRegistration: 'Гаранция от първа регистрация',
    batteryNote: 'За повече информация относно състоянието на батерията, моля свържете се с продавача.',
    vehicleData: 'Данни за превозното средство',
    make: 'Марка',
    model: 'Модел',
    year: 'Година',
    category: 'Категория',
    doors: 'Брой врати',
    seats: 'Брой места',
    color: 'Цвят',
    interior: 'Интериор',
    driveType: 'Задвижване',
    emissionClass: 'Клас на емисиите',
    consumption: 'Разход на гориво',
    co2Emissions: 'CO₂ емисии',
    equipmentFeatures: 'Оборудване',
    comfort: 'Комфорт',
    safety: 'Безопасност',
    entertainment: 'Развлечение',
    other: 'Друго',
    vehicleDescription: 'Описание',
    sellerInformation: 'Информация за продавача',
    location: 'Локация',
    contactSeller: 'Свържи се с продавача',
    callNow: 'Обади се сега',
    sendEmail: 'Изпрати имейл',
    sendMessage: 'Изпрати съобщение',
    whatsapp: 'WhatsApp',
    viber: 'Viber',
    showPhoneNumber: 'Покажи телефон',
    requestInfo: 'Заяви информация',
    save: 'Запази',
    share: 'Сподели',
    similarVehicles: 'Подобни превозни средства',
    km: 'км',
    kw: 'кВт',
    hp: 'кс',
    liters100km: 'л/100км',
    gKm: 'г/км',
    owner: 'собственик',
    owners: 'собственици',
    yes: 'Да',
    no: 'Не',
    notSpecified: 'Не е посочено',
    reviews: 'Отзиви',
    deleteCar: 'Изтрий обява',
    deleteWarningTitle: 'Сигурни ли сте?',
    deleteWarningPrivate: 'Изтриването ще консумира 1 от вашите 3 обяви за месеца. Останали слотове: ',
    deleteWarningDealer: 'Имате право на 10 безплатни изтривания месечно. Използвани: ',
    deleteWarningCompany: 'Като компания имате неограничен брой изтривания.',
    deleteConfirm: 'Да, изтрий',
    deleteCancel: 'Отказ',
    deleteSuccess: 'Обявата е изтрита успешно',
    deleteError: 'Грешка при изтриване',
    quotaExceeded: 'Достигнахте лимита си за този месец',
    soldMark: 'ПРОДАДЕНО',
  },
  en: {
    back: 'Back',
    edit: 'Edit',
    vatDeductible: 'VAT deductible',
    grossPrice: 'Gross price',
    netPrice: 'Net price',
    financingFrom: 'Financing from',
    perMonth: 'per month',
    firstRegistration: 'First registration',
    mileage: 'Mileage',
    power: 'Power',
    fuelType: 'Fuel type',
    transmission: 'Transmission',
    previousOwners: 'Previous owners',
    accidentFree: 'Accident-free',
    accidentFree: 'Accident-free',
    serviceHistory: 'Service history',
    fullServiceHistory: 'Full service history',
    technicalData: 'Technical data',
    vehicleData: 'Vehicle data',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    category: 'Category',
    doors: 'Number of doors',
    seats: 'Number of seats',
    color: 'Color',
    interior: 'Interior',
    driveType: 'Drive type',
    emissionClass: 'Emission class',
    consumption: 'Fuel consumption',
    co2Emissions: 'CO₂ emissions',
    equipmentFeatures: 'Equipment & Features',
    comfort: 'Comfort',
    safety: 'Safety',
    entertainment: 'Entertainment',
    other: 'Other',
    vehicleDescription: 'Description',
    sellerInformation: 'Seller information',
    location: 'Location',
    contactSeller: 'Contact seller',
    callNow: 'Call now',
    sendEmail: 'Send email',
    sendMessage: 'Send message',
    whatsapp: 'WhatsApp',
    viber: 'Viber',
    showPhoneNumber: 'Show phone number',
    requestInfo: 'Request information',
    save: 'Save',
    share: 'Share',
    similarVehicles: 'Similar vehicles',
    km: 'km',
    kw: 'kW',
    hp: 'hp',
    liters100km: 'l/100km',
    gKm: 'g/km',
    owner: 'owner',
    owners: 'owners',
    yes: 'Yes',
    no: 'No',
    notSpecified: 'Not specified',
    reviews: 'Reviews',
    deleteCar: 'Delete Listing',
    deleteWarningTitle: 'Are you sure?',
    deleteWarningPrivate: 'Deleting will consume 1 of your 3 monthly listings. Remaining slots: ',
    deleteWarningDealer: 'You have 10 free deletions per month. Used: ',
    deleteWarningCompany: 'As a company, you have unlimited deletions.',
    deleteConfirm: 'Yes, Delete',
    deleteCancel: 'Cancel',
    deleteSuccess: 'Listing deleted successfully',
    deleteError: 'Error deleting listing',
    quotaExceeded: 'You have reached your monthly limit',
    // New Translations
    goodPrice: 'Good Price',
    fairPrice: 'Fair Price',
    highPrice: 'High Price',
    videoTour: 'Video Tour',
    aiHighlights: 'AI Highlights',
    featureOwner: 'First Owner',
    featureService: 'Full Service History',
    featureAccident: 'Accident Free',
    featureMileage: 'Low Mileage',
    featureWarranty: 'Warranty Included',
    batteryInfo: 'Battery information',
    rangeWLTP: 'Range (WLTP)',
    warrantyFromRegistration: 'Warranty from first registration',
    batteryNote: 'For more information on the battery health, please contact the seller.',
    soldMark: 'SOLD',
  },
};


// Styled Components
// Styled Components with Modern Gradient & Grid System
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  background: var(--bg-primary);
  position: relative;
  min-height: 100vh;
  
  /* Modern geometric grid background */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: var(--grid-opacity);
    pointer-events: none;
    z-index: 0;
  }


  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-header);
  position: relative;

  /* Subtle bottom accent line */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--accent-primary) 50%, 
      transparent 100%
    );
    opacity: 0.12;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: ${props => props.$primary ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.$primary ? '#1a1a1a' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? 'var(--accent-hover)' : 'var(--bg-hover)'};
    border-color: var(--accent-primary);
    color: ${props => props.$primary ? '#1a1a1a' : 'var(--accent-primary)'};
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-primary);
  border: none;
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  }

  &:active {
    background: var(--accent-active);
    transform: translateY(0);
  }
`;

// Lightbox Styled Components
const LightboxOverlay = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.96);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

const LightboxHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  z-index: 10;
`;

const LightboxCounter = styled.span`
  color: white;
  font-size: 1rem;
  font-weight: 500;
`;

const LightboxCloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const LightboxImageContainer = styled.div<{ $zoom: number; $panX: number; $panY: number; $isDragging: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  cursor: ${props => props.$zoom > 1 ? (props.$isDragging ? 'grabbing' : 'grab') : 'zoom-in'};
  
  img {
    max-width: 90vw;
    max-height: calc(100vh - 200px);
    width: auto;
    height: auto;
    object-fit: contain;
    transform: scale(${props => props.$zoom}) translate(${props => props.$panX / props.$zoom}px, ${props => props.$panY / props.$zoom}px);
    transition: ${props => props.$isDragging ? 'none' : 'transform 0.2s ease'};
    user-select: none;
    -webkit-user-drag: none;
  }
`;

const LightboxNavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$position}: 1rem;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-50%) scale(1.1);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    ${props => props.$position}: 0.5rem;
  }
`;

const LightboxControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const ZoomButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
  font-weight: bold;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.span`
  color: white;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: center;
`;

const LightboxThumbnails = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow-x: auto;
  max-width: 90vw;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const LightboxThumb = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  width: 60px;
  height: 45px;
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'transparent'};
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  opacity: ${props => props.$active ? 1 : 0.6};
  transition: all 0.2s;
  background: transparent;
  padding: 0;
  
  &:hover {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  padding: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

// Image Gallery
const ImageGallery = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const MainImage = styled(OptimizedImage)`
  width: 100%;
  height: 100%;
  
  img {
    object-fit: contain;
  }
`;

const ImageNavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${props => props.$position}: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #fff;
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
    color: #333;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(8px);
`;

// 🌟 Featured image selection animations (MUST be defined before styled components that use them)
const pulseGold = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(255, 215, 0, 0.3); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const checkmarkPop = keyframes`
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(-45deg); opacity: 1; }
  100% { transform: scale(1) rotate(-45deg); opacity: 1; }
`;

const spinLoader = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  padding: 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
`;

const Thumbnail = styled.div<{ $active: boolean; $isFeatured?: boolean; $isSettingFeatured?: boolean }>`
  width: 100%;
  padding-top: 75%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isFeatured ? 'var(--accent-primary)' : props.$active ? 'var(--accent-primary)' : 'transparent'};
  transition: all 0.3s ease-out;
  box-shadow: ${props => props.$isFeatured ? '0 0 16px rgba(255, 215, 0, 0.5)' : 'none'};
  
  ${props => props.$isFeatured && css`
    animation: ${pulseGold} 2s ease-out;
  `}
  
  ${props => props.$isSettingFeatured && css`
    opacity: 0.7;
    pointer-events: none;
  `}

  &:hover {
    border-color: var(--accent-primary);
    transform: scale(1.02);
  }

  .optimized-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SetFeaturedButton = styled.button<{ $isLoading?: boolean; $isSuccess?: boolean }>`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$isSuccess ? 'var(--accent-primary)' : 'rgba(0, 0, 0, 0.7)'};
  color: ${props => props.$isSuccess ? '#1a1a1a' : '#fff'};
  cursor: ${props => props.$isLoading ? 'wait' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 5;
  backdrop-filter: blur(4px);
  opacity: ${props => props.$isLoading ? 0.8 : 1};
  box-shadow: ${props => props.$isSuccess ? '0 2px 8px rgba(255, 215, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.2)'};

  &:hover:not(:disabled) {
    background: var(--accent-primary);
    color: #1a1a1a;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  /* Loading spinner */
  ${props => props.$isLoading && css`
    &::after {
      content: '';
      display: block;
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: ${spinLoader} 0.8s linear infinite;
    }
  `}
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ffc107 100%);
  color: #1a1a1a;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 5;
  box-shadow: 0 3px 12px rgba(255, 215, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  ${css`animation: ${checkmarkPop} 0.4s ease-out;`}

  svg {
    width: 13px;
    height: 13px;
  }
`;

const pulseRed = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const StatusLED = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  ${css`animation: ${pulseRed} 2s infinite;`}
  display: inline-block;
  margin-left: 10px;
  flex-shrink: 0;
`;


// Price Card (Right Column - Top)
const PriceCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.03);
  position: sticky;
  top: 20px;
  overflow: hidden;

  /* Subtle accent border glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--accent-primary) 50%, 
      transparent 100%
    );
    opacity: 0.2;
  }
`;

const Section = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const CardSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 1.25rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid var(--border-primary);
  background: rgba(0,0,0,0.02);
`;

const PriceTitle = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const PriceValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const PriceSubtext = styled.div`
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
`;

const PriceFairnessContainer = styled.div`
  background: rgba(16, 185, 129, 0.06); /* Greenish background */
  border: 1px solid rgba(16, 185, 129, 0.12);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FairnessLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #10b981; /* Green text */
  margin-bottom: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: #10b981;
  }
`;

const FairnessBar = styled.div`
  width: 100%;
  height: 8px;
  background: linear-gradient(to right, #ef4444, #f59e0b, #10b981); /* Red, Yellow, Green */
  border-radius: 4px;
  margin-bottom: 8px;
`;

const ComparisonText = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const AIHighlightsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
`;

const AIHighlightItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);

  svg {
    width: 16px;
    height: 16px;
    color: var(--accent-primary);
  }
`;

const FinancingBox = styled.div`
  background: rgba(255, 215, 0, 0.03);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 1.5rem;
`;

const FinancingText = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

const FinancingAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
`;

const ContactButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: #1a1a1a;
    
    &:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    }

    &:active {
      background: var(--accent-active);
      transform: translateY(0);
    }
  ` : `
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--accent-primary);
    }
  `}
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SmallContactButton = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

// Quick Info Icons (Below Images)
const QuickInfoBar = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.015);
`;

const QuickInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  min-width: 100px;

  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-primary);
  }
`;

const QuickInfoLabel = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuickInfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

// Vehicle Title Section
const VehicleTitle = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.015);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  /* Override CarBrandLogo internal margins */
  & > div > div {
    margin: 0 !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
`;

const CarName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const CarSubtitle = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 1rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Badge = styled.div<{ $variant?: 'success' | 'info' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.06);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.12);
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.06);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.12);
        `;
      default:
        return `
          background: rgba(59, 130, 246, 0.06);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.12);
        `;
    }
  }}

  svg {
    width: 14px;
    height: 14px;
  }
`;

// Description Section
const DescriptionSection = styled.div`
  background: var(--bg-section-1);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  /* Subtle accent glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--accent-primary) 50%, 
      transparent 100%
    );
    opacity: 0.15;
  }
`;

const DescriptionText = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// Technical Data Section
const DataSection = styled.div`
  background: var(--bg-section-2);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;

  /* Subtle accent glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--accent-primary) 50%, 
      transparent 100%
    );
    opacity: 0.1;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-primary);
  }
`;

const DataTable = styled.div`
  display: grid;
  gap: 1rem;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-secondary);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const DataLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const DataValue = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

// Battery Section (EV Specific)
const BatterySection = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;

  /* Electric accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #10b981; /* Green/Teal for Electric */
  }
`;

const BatteryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
`;

const BatteryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const BatteryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BatteryLabel = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const BatteryValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const BatteryNote = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 13px;
  color: var(--text-secondary);
  align-items: flex-start;
  line-height: 1.5;

  svg {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    flex-shrink: 0;
    color: var(--text-tertiary);
  }
`;

// Equipment Section
const EquipmentSection = styled.div`
  background: var(--bg-section-3);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;

  /* Subtle accent glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--accent-primary) 50%, 
      transparent 100%
    );
    opacity: 0.08;
  }
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
`;

const EquipmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-primary);

  svg {
    width: 16px;
    height: 16px;
    color: var(--accent-primary);
    flex-shrink: 0;
  }
  }
`;

// Seller Info Card
const SellerCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.015);
`;

const SellerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-secondary);
`;

const SellerLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  border: 2px solid var(--border-primary);
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const SellerName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const SellerInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  
  svg {
    flex-shrink: 0;
  }
`;

const SellerType = styled.div`
  font-size: 13px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.375rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SellerStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
`;

const SellerStat = styled.div`
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: start;
  gap: 0.5rem;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 1rem;

  svg {
    width: 18px;
    height: 18px;
    color: var(--accent-primary);
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const LocationText = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
`;

// Delete Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ModalIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;

  svg {
    width: 28px;
    height: 28px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const WarningText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
`;

const QuotaInfo = styled.div`
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

const DeleteCarButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #ef4444;
  background: transparent;
  color: #ef4444;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;

  &:hover {
    background: rgba(239, 68, 68, 0.05);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Share Menu Components
const ShareMenuContainer = styled.div`
  position: relative;
  display: block;
  z-index: 999999;
  width: 100%;
  margin-top: 1rem;
`;

const ShareButtonHorizontal = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  pointer-events: auto;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  span {
    pointer-events: none;
  }
`;

const ShareMenuDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  overflow: hidden;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const ShareMenuHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%);
`;

const ShareMenuTitle = styled.h4`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShareOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.25rem;
`;

const ShareOption = styled.button<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--bg-hover);
    transform: translateX(4px);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$color || 'var(--text-primary)'};
    flex-shrink: 0;
  }

  span {
    flex: 1;
  }
`;

const ShareDivider = styled.div`
  height: 1px;
  background: var(--border-primary);
  margin: 0.5rem 0;
`;

const CarDetailsMobileDEStyle: React.FC<CarDetailsMobileDEStyleProps> = ({
  car,
  language,
  onBack,
  onEdit,
  onDelete,
  isOwner,
  onContact,
  userProfileType = 'private',
  monthlyDeletionsUsed = 0,
  activeListingsCount = 0,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = translations[language];
  /* Fix Toast Context usage */
  const toast = useToast();

  const [fetchedSellerAvatar, setFetchedSellerAvatar] = useState<string | null>(null);

  // Fetch seller avatar if missing from car object
  useEffect(() => {
    const hasAvatar = (car as any).sellerAvatarUrl || (car as any).user?.photoURL;
    if (!hasAvatar) {
      // Try to fetch using sellerNumericId or sellerId
      const fetchId = car.sellerId || (car.sellerNumericId ? String(car.sellerNumericId) : undefined);
      if (fetchId) {
        userService.getUserProfile(fetchId).then(profile => {
          if (profile && profile.photoURL) {
            setFetchedSellerAvatar(profile.photoURL);
          }
        }).catch(err => {
          logger.warn('Failed to fetch seller avatar', err as Error);
        });
      }
    }
  }, [car.sellerId, car.sellerNumericId, (car as any).sellerAvatarUrl, (car as any).user?.photoURL]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // SEO Meta Description Logic
  const seoDescription = `${car.make} ${car.model} ${car.year}, ${car.price} EUR. ${car.mileage}km. ${language === 'bg' ? 'Вижте повече на Koli One.' : 'See more on Koli One.'
    }`;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
      // Toast will be handled by parent or here if needed, but parent usually handles logic
      setShowDeleteModal(false);
    }
  };



  const handleSave = () => {
    // This would typically toggle a favorite state
    toast.success(language === 'bg' ? 'Обявата е запазена!' : 'Listing saved!');
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(car.featuredImageIndex ?? 0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(
    car.featuredImageIndex ?? 0
  );
  const [isSettingFeatured, setIsSettingFeatured] = useState(false);
  const [settingFeaturedIndex, setSettingFeaturedIndex] = useState<number | null>(null);
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);

  // Sync featuredImageIndex with car prop when it changes (e.g., after page reload)
  useEffect(() => {
    const carFeaturedIndex = car.featuredImageIndex ?? 0;
    setFeaturedImageIndex(carFeaturedIndex);
  }, [car.id, car.featuredImageIndex]);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const images = car.images && car.images.length > 0 ? car.images : ['/images/placeholder.png'];

  const handleSetFeatured = async (index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    // Prevent double-clicks and setting the same image
    if (isSettingFeatured || index === featuredImageIndex) {
      return;
    }

    const previousIndex = featuredImageIndex;

    // Optimistic update - set immediately for instant feedback
    setFeaturedImageIndex(index);
    setSettingFeaturedIndex(index);

    // If owner, save to database with full feedback
    if (isOwner && car.id) {
      setIsSettingFeatured(true);

      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../../firebase/firebase-config');
        const { SellWorkflowCollections } = await import('../../../services/sell-workflow-collections');

        // Determine correct collection based on vehicleType
        const vehicleType = (car as any).vehicleType || 'car';
        const collectionName = SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);

        const carRef = doc(db, collectionName, car.id);
        await updateDoc(carRef, { featuredImageIndex: index });

        // ✅ Verify the save by reading back the data
        const { getDoc } = await import('firebase/firestore');
        const verifySnap = await getDoc(carRef);
        const verifiedIndex = verifySnap.data()?.featuredImageIndex;

        if (verifiedIndex === index) {
          logger.info('Featured image updated and verified', { carId: car.id, collection: collectionName, index });

          // Success toast
          toast.success(
            language === 'bg'
              ? `Снимка ${index + 1} е зададена като основна!`
              : `Image ${index + 1} set as featured!`,
            language === 'bg' ? 'Успешно' : 'Success'
          );
        } else {
          // Save didn't persist - rollback
          setFeaturedImageIndex(previousIndex);
          logger.error('Featured image save verification failed', null, { carId: car.id, expected: index, actual: verifiedIndex });
          toast.error(
            language === 'bg'
              ? 'Неуспешна промяна. Моля, опитайте отново.'
              : 'Failed to save. Please try again.',
            language === 'bg' ? 'Грешка' : 'Error'
          );
        }

      } catch (error) {
        // Rollback on error
        setFeaturedImageIndex(previousIndex);
        logger.error('Error updating featured image', error as Error);

        // Error toast with helpful message
        toast.error(
          language === 'bg'
            ? 'Неуспешна промяна. Моля, опитайте отново.'
            : 'Failed to update. Please try again.',
          language === 'bg' ? 'Грешка' : 'Error'
        );
      } finally {
        setIsSettingFeatured(false);
        setSettingFeaturedIndex(null);
      }
    } else {
      // Not owner - just local update (for preview purposes)
      setSettingFeaturedIndex(null);
    }
  };

  const isSold = (car as any).isSold || car.status === 'sold';

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setLightboxImageLoaded(false);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = '';
  };

  const handleLightboxPrev = () => {
    setLightboxImageLoaded(false);
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleLightboxNext = () => {
    setLightboxImageLoaded(false);
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          handleLightboxPrev();
          break;
        case 'ArrowRight':
          handleLightboxNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);

  // Share menu handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        shareButtonRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        !shareButtonRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  // Toggle share menu
  const handleShareMenuToggle = () => {
    setShowShareMenu(!showShareMenu);
  };

  // Get car share URL
  // ✅ CONSTITUTION: Use numeric URL pattern
  const getCarShareUrl = () => {
    const sellerNumericId = car.sellerNumericId || (car as any).ownerNumericId;
    const carNumericId = car.carNumericId || (car as any).userCarSequenceId || (car as any).numericId;

    if (sellerNumericId && carNumericId) {
      return `${window.location.origin}/car/${sellerNumericId}/${carNumericId}`;
    }
    // Fallback to current URL
    return window.location.href;
  };

  const getCarShareTitle = () => {
    return `${car.make} ${car.model} ${car.year} - ${car.price}€`;
  };

  const handleShare = (platform: string) => {
    const carUrl = getCarShareUrl();
    const shareTitle = getCarShareTitle();
    const encodedUrl = encodeURIComponent(carUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, show message
        toast.info(language === 'bg'
          ? 'Копирайте линка и го споделете в Instagram Stories или публикация'
          : 'Copy the link and share it in Instagram Stories or post');
        navigator.clipboard.writeText(carUrl);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        break;
      case 'tiktok':
        // TikTok doesn't support direct sharing, show message
        toast.info(language === 'bg'
          ? 'Копирайте линка и го споделете в TikTok'
          : 'Copy the link and share it on TikTok');
        navigator.clipboard.writeText(carUrl);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${carUrl}`)}`, '_blank');
        break;
      case 'viber':
        window.open(`viber://forward?text=${encodeURIComponent(`${shareTitle} ${carUrl}`)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this car: ${carUrl}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(carUrl);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateFinancing = (price: number) => {
    // Simple financing calculation: 20% down, 5% interest, 60 months
    const downPayment = price * 0.2;
    const loanAmount = price - downPayment;
    const monthlyRate = 0.05 / 12;
    const months = 60;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(monthlyPayment);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('bg-BG').format(mileage) + ' ' + t.km;
  };

  const formatPower = (kw: number) => {
    const hp = Math.round(kw * 1.36);
    return `${kw} ${t.kw} (${hp} ${t.hp})`;
  };

  const handleDelete = () => {
    // Check quotas based on user profile type
    let canDelete = true;
    let warningMessage = '';

    if (userProfileType === 'private') {
      // Private users have 3 listings/month, deletions count against quota
      if (activeListingsCount >= 3) {
        canDelete = false;
        warningMessage = t.quotaExceeded;
      }
    } else if (userProfileType === 'dealer') {
      // Dealers have 10 free deletions/month
      if (monthlyDeletionsUsed >= 10) {
        canDelete = false;
        warningMessage = t.quotaExceeded;
      }
    }
    // Companies have unlimited deletions - always canDelete = true

    if (canDelete) {
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete();
      }
    } else {
      alert(warningMessage);
    }
  };

  const getDeleteWarningMessage = () => {
    if (userProfileType === 'company') {
      return t.deleteWarningCompany;
    } else if (userProfileType === 'dealer') {
      const remaining = 10 - monthlyDeletionsUsed;
      return `${t.deleteWarningDealer} ${remaining}`;
    } else {
      // private
      const remaining = 3 - activeListingsCount;
      return `${t.deleteWarningPrivate} ${remaining}`;
    }
  };

  const getEquipmentItems = () => {
    const items: string[] = [];

    // Try multiple property names for equipment
    const equipmentData = (car as any).equipment || (car as any).features;

    if (equipmentData) {
      if (Array.isArray(equipmentData)) {
        items.push(...equipmentData);
      } else if (typeof equipmentData === 'object') {
        ['comfort', 'safety', 'entertainment', 'extras', 'other'].forEach(category => {
          if (equipmentData[category] && Array.isArray(equipmentData[category])) {
            items.push(...equipmentData[category]);
          }
        });
      }
    }

    return items;
  };

  return (
    <>
      <Container>
        {/* Header */}
        <Header>
          <HeaderLeft>
            <BackButton onClick={onBack}>
              <ArrowLeft size={20} />
              {t.back}
            </BackButton>
          </HeaderLeft>
          <HeaderActions>
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setShowPrintDialog(true);
                } catch (error) {
                  logger.error('Error setting showPrintDialog', error as Error);
                }
              }}
              title={language === 'bg' ? 'Печат' : 'Print'}
              type="button"
            >
              <Printer size={20} />
            </IconButton>
            <IconButton>
              <Heart size={20} />
            </IconButton>
            {isOwner && (
              <FacebookSmartButton
                adId={car.id}
                adData={car}
                isOwner={isOwner}
                className="mr-2"
              />
            )}
            {isOwner && onEdit && (
              <>
                <EditButton onClick={onEdit}>
                  <Edit size={18} />
                  {t.edit}
                </EditButton>
                {/* 🔥 NEW: Car History Report Button */}
                {car.sellerNumericId && (car.carNumericId || (car as any).numericId) && (
                  <EditButton
                    onClick={() => {
                      window.location.href = `/car/${car.sellerNumericId}/${car.carNumericId || (car as any).numericId}/history`;
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      marginLeft: '8px'
                    }}
                  >
                    📋 {language === 'bg' ? 'История' : 'History'}
                  </EditButton>
                )}
              </>
            )}
          </HeaderActions>
        </Header>

        {/* Main Content */}
        <MainContent>
          {/* Left Column */}
          <LeftColumn>
            {/* Vehicle Title (Moved to top) */}
            <VehicleTitle style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', width: '100%' }}>

                {/* 1. Logo (Fixed) */}
                <div style={{ flex: '0 0 auto' }}>
                  <CarBrandLogo make={car.make} size={50} showName={false} />
                </div>

                {/* 2. Text Content (Flexible) */}
                <div style={{ flex: '1 1 300px', minWidth: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', lineHeight: '1.4' }}>
                    <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'normal', wordBreak: 'break-word', display: 'flex', alignItems: 'center' }}>
                      {car.make} {car.model}
                      {isSold && <StatusLED title={t.soldMark} />}
                    </h1>

                    <span style={{ color: 'var(--text-tertiary)', display: 'inline-block' }}>•</span>

                    <div style={{ margin: 0, fontSize: 'clamp(14px, 3vw, 15px)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {car.year} • {car.fuelType} • {car.transmission}
                    </div>
                  </div>
                </div>

                {/* 3. Badges (Auto width, wrap if needed) */}
                <div style={{ flex: '0 0 auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {car.accidentHistory === false && (
                    <Badge $variant="success" style={{ whiteSpace: 'nowrap' }}>
                      <CheckCircle size={14} />
                      {t.accidentFree}
                    </Badge>
                  )}
                  {car.serviceHistory && (
                    <Badge $variant="success" style={{ whiteSpace: 'nowrap' }}>
                      <CheckCircle size={14} />
                      {t.fullServiceHistory}
                    </Badge>
                  )}
                </div>
              </div>
            </VehicleTitle>

            {/* Image Gallery */}
            <ImageGallery>
              <MainImageContainer>
                <MainImage
                  src={images[currentImageIndex] || '/images/placeholder.png'}
                  alt={`${car.make} ${car.model}`}
                  onClick={() => openLightbox(currentImageIndex)}
                  style={{ cursor: 'zoom-in' }}
                />
                {isSold && <RealisticPaperclipBadge text={t.soldMark} language={language} />}
                {images.length > 1 && (
                  <>
                    <ImageNavButton $position="left" onClick={handlePrevImage}>
                      <ChevronLeft />
                    </ImageNavButton>
                    <ImageNavButton $position="right" onClick={handleNextImage}>
                      <ChevronRight />
                    </ImageNavButton>
                    <ImageCounter>
                      {currentImageIndex + 1} / {images.length}
                    </ImageCounter>
                  </>
                )}
              </MainImageContainer>
              {images.length > 1 && (
                <ThumbnailGrid>
                  {images.map((img, index) => (
                    <Thumbnail
                      key={index}
                      $active={index === currentImageIndex}
                      $isFeatured={isOwner && index === featuredImageIndex}
                      $isSettingFeatured={settingFeaturedIndex === index}
                      onClick={() => setCurrentImageIndex(index)}
                      onDoubleClick={() => openLightbox(index)}
                      title={language === 'bg' ? 'Кликнете два пъти за пълен екран' : 'Double-click for fullscreen'}
                    >
                      {isOwner && index === featuredImageIndex && (
                        <FeaturedBadge>
                          <Crown />
                          {language === 'bg' ? 'Основна' : 'Featured'}
                        </FeaturedBadge>
                      )}
                      {isOwner && index !== featuredImageIndex && (
                        <SetFeaturedButton
                          onClick={(e) => handleSetFeatured(index, e)}
                          title={language === 'bg' ? 'Задай като основна снимка' : 'Set as featured image'}
                          $isLoading={settingFeaturedIndex === index && isSettingFeatured}
                          disabled={isSettingFeatured}
                        >
                          {settingFeaturedIndex === index && isSettingFeatured ? null : <Crown />}
                        </SetFeaturedButton>
                      )}
                      <OptimizedImage
                        src={img || '/images/placeholder.png'}
                        alt={`Thumbnail ${index + 1}`}
                        className="optimized-image"
                        width={200}
                        height={150}
                      />
                    </Thumbnail>
                  ))}
                </ThumbnailGrid>
              )}
            </ImageGallery>

            {/* Quick Info Bar */}
            <QuickInfoBar>
              <QuickInfoItem>
                <Calendar />
                <QuickInfoLabel>{t.firstRegistration}</QuickInfoLabel>
                <QuickInfoValue>{car.year || t.notSpecified}</QuickInfoValue>
              </QuickInfoItem>
              <QuickInfoItem>
                <Gauge />
                <QuickInfoLabel>{t.mileage}</QuickInfoLabel>
                <QuickInfoValue>{car.mileage ? formatMileage(car.mileage) : t.notSpecified}</QuickInfoValue>
              </QuickInfoItem>
              <QuickInfoItem>
                <Fuel />
                <QuickInfoLabel>{t.fuelType}</QuickInfoLabel>
                <QuickInfoValue>{car.fuelType || t.notSpecified}</QuickInfoValue>
              </QuickInfoItem>
              <QuickInfoItem>
                <Cog />
                <QuickInfoLabel>{t.power}</QuickInfoLabel>
                <QuickInfoValue>
                  {(car as any).enginePower ? formatPower((car as any).enginePower) : t.notSpecified}
                </QuickInfoValue>
              </QuickInfoItem>
            </QuickInfoBar>

            {(car.fuelType === 'Electric' || car.fuelType === 'Електрически' || car.fuelType?.toLowerCase().includes('electric')) && (
              <BatterySection>
                <BatteryHeader>
                  <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                    <Battery size={20} />
                  </div>
                  <h3>{t.batteryInfo}</h3>
                </BatteryHeader>

                <BatteryGrid>
                  <BatteryItem>
                    <BatteryLabel>{t.rangeWLTP}</BatteryLabel>
                    <BatteryValue>{car.batteryRangeWLTP ? `${car.batteryRangeWLTP} km` : t.notSpecified}</BatteryValue>
                  </BatteryItem>

                  <BatteryItem>
                    <BatteryLabel>{t.warrantyFromRegistration}</BatteryLabel>
                    <BatteryValue>{car.batteryWarranty || t.notSpecified}</BatteryValue>
                  </BatteryItem>
                </BatteryGrid>

                <BatteryNote>
                  <Info size={16} />
                  {t.batteryNote}
                </BatteryNote>
              </BatterySection>
            )}



            {/* Description Section */}
            {car.description && (
              <DescriptionSection>
                <SectionTitle>
                  <FileText />
                  {language === 'bg' ? 'Описание' : 'Description'}
                </SectionTitle>
                <DescriptionText>{car.description}</DescriptionText>
              </DescriptionSection>
            )}

            {/* Technical Data */}
            <DataSection>
              <SectionTitle>
                <Cog />
                {t.technicalData}
              </SectionTitle>
              <DataTable>
                <DataRow>
                  <DataLabel>{t.make}</DataLabel>
                  <DataValue>{car.make || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.model}</DataLabel>
                  <DataValue>{car.model || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.year}</DataLabel>
                  <DataValue>{car.year || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.mileage}</DataLabel>
                  <DataValue>{car.mileage ? formatMileage(car.mileage) : t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.fuelType}</DataLabel>
                  <DataValue>{car.fuelType || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.transmission}</DataLabel>
                  <DataValue>{car.transmission || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.power}</DataLabel>
                  <DataValue>
                    {(car as any).enginePower ? formatPower((car as any).enginePower) : t.notSpecified}
                  </DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.doors}</DataLabel>
                  <DataValue>{car.doors || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.seats}</DataLabel>
                  <DataValue>{car.seats || t.notSpecified}</DataValue>
                </DataRow>
                <DataRow>
                  <DataLabel>{t.color}</DataLabel>
                  <DataValue>{car.color || t.notSpecified}</DataValue>
                </DataRow>
              </DataTable>
            </DataSection>

            {/* Equipment */}
            {/* Equipment */}
            {((car.safetyEquipment && car.safetyEquipment.length > 0) ||
              (car.comfortEquipment && car.comfortEquipment.length > 0) ||
              (car.infotainmentEquipment && car.infotainmentEquipment.length > 0) ||
              getEquipmentItems().length > 0) && (

                (car.safetyEquipment || car.comfortEquipment || car.infotainmentEquipment) ? (
                  <Section>
                    <CardSectionTitle>{t.equipmentFeatures}</CardSectionTitle>

                    {car.safetyEquipment && car.safetyEquipment.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-primary)' }}>
                          {language === 'bg' ? 'Безопасност' : 'Safety'}
                        </h4>
                        <EquipmentGrid>
                          {car.safetyEquipment.map((item, index) => (
                            <EquipmentItem key={`safe-${index}`}>
                              <Check size={16} />
                              {item}
                            </EquipmentItem>
                          ))}
                        </EquipmentGrid>
                      </div>
                    )}

                    {car.comfortEquipment && car.comfortEquipment.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-primary)' }}>
                          {language === 'bg' ? 'Комфорт' : 'Comfort'}
                        </h4>
                        <EquipmentGrid>
                          {car.comfortEquipment.map((item, index) => (
                            <EquipmentItem key={`comf-${index}`}>
                              <Check size={16} />
                              {item}
                            </EquipmentItem>
                          ))}
                        </EquipmentGrid>
                      </div>
                    )}

                    {/* Fallback for others if needed */}
                  </Section>
                ) : (
                  /* Fallback to unified list if no specific groups */
                  <Section>
                    <CardSectionTitle>{t.equipmentFeatures}</CardSectionTitle>
                    <EquipmentGrid>
                      {getEquipmentItems().map((item, index) => (
                        <EquipmentItem key={index}>
                          <Check size={16} />
                          {item}
                        </EquipmentItem>
                      ))}
                    </EquipmentGrid>
                  </Section>
                )
              )}

            {/* Description */}
            <DescriptionSection>
              {car.description ? (
                <DescriptionPreview description={car.description} />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <FileText size={48} style={{ opacity: 0.3 }} />
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500 }}>
                      {language === 'bg' ? 'Няма описание' : 'No Description'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
                      {language === 'bg'
                        ? isOwner
                          ? 'Добавете професионално описание, за да привлечете повече купувачи'
                          : 'Продавачът не е добавил описание за този автомобил'
                        : isOwner
                          ? 'Add a professional description to attract more buyers'
                          : 'The seller has not added a description for this vehicle'
                      }
                    </p>
                  </div>
                  {isOwner && onEdit && (
                    <button
                      onClick={onEdit}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Edit size={16} />
                      {language === 'bg' ? 'Добави описание' : 'Add Description'}
                    </button>
                  )}
                </div>
              )}
            </DescriptionSection>
          </LeftColumn>

          <RightColumn>
            {/* Price Card */}
            <PriceCard>
              <PriceTitle>{t.grossPrice}</PriceTitle>
              <PriceValue>{formatPrice(car.price)}</PriceValue>
              <PriceSubtext>{t.vatDeductible}</PriceSubtext>



              <ContactButton $variant="primary" onClick={() => onContact('phone')}>
                <Phone size={20} />
                {showPhoneNumber && car.sellerPhone ? car.sellerPhone : t.showPhoneNumber}
              </ContactButton>

              <ContactButton $variant="secondary" onClick={() => onContact('message')}>
                <MessageCircle size={18} />
                {t.requestInfo}
              </ContactButton>

              <ContactGrid>
                <SmallContactButton onClick={() => onContact('whatsapp')}>
                  WhatsApp
                </SmallContactButton>
                <SmallContactButton onClick={() => onContact('viber')}>
                  Viber
                </SmallContactButton>
                <SmallContactButton onClick={() => onContact('email')}>
                  <Mail size={16} />
                  {t.sendEmail}
                </SmallContactButton>
                <SmallContactButton onClick={() => onContact('phone')}>
                  <Phone size={16} />
                  {t.callNow}
                </SmallContactButton>
              </ContactGrid>
            </PriceCard>

            {/* Financing Calculator Widget */}
            <FinancingCalculator price={car.price} currency="EUR" language={language} />

            {/* Seller Info */}
            <SellerCard>
              <SectionTitle>{t.sellerInformation}</SectionTitle>
              <SellerHeader>
                <SellerLogo
                  onClick={() => {
                    // 🔒 STRICT: Use /profile/{numericId} for own profile, /profile/view/{numericId} for others
                    if (car.sellerNumericId) {
                      if (isOwner) {
                        // Own profile
                        navigate(`/profile/${car.sellerNumericId}`);
                      } else {
                        // Other user's profile
                        navigate(`/profile/view/${car.sellerNumericId}`);
                      }
                    } else if (car.sellerId) {
                      // Fallback to legacy ID - always use view path for other users
                      navigate(`/profile/view/${car.sellerId}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  title={language === 'bg' ? 'Виж профила на продавача' : 'View seller profile'}
                >
                  {(car as any).sellerAvatarUrl || (car as any).user?.photoURL || fetchedSellerAvatar ? (
                    <img
                      src={(car as any).sellerAvatarUrl || (car as any).user?.photoURL || fetchedSellerAvatar}
                      alt="Seller"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  ) : (
                    car.sellerName ? car.sellerName.charAt(0).toUpperCase() : <User />
                  )}
                </SellerLogo>
                <SellerInfo>
                  <SellerName>{car.sellerName || t.notSpecified}</SellerName>

                  {/* Dealer Rating Badge */}
                  {car.sellerType !== 'private' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', color: '#fbbf24' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={14} fill={i <= 4 ? "#fbbf24" : "none"} />
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>(34 reviews)</span>
                    </div>
                  )}

                  <SellerInfoRow>
                    <MapPin size={16} />
                    {car.city}, {car.region} {car.postalCode}
                  </SellerInfoRow>
                  <SellerType>
                    {car.sellerType === 'dealer' ? <Shield size={14} /> : <User size={14} />}
                    {car.sellerType === 'dealer'
                      ? (language === 'bg' ? 'Дилър' : 'Dealer')
                      : (language === 'bg' ? 'Частно лице' : 'Private seller')}
                  </SellerType>
                </SellerInfo>
              </SellerHeader>

              {car.sellerType === 'dealer' && (
                <SellerStats>
                  <SellerStat>
                    <StatValue>4.8</StatValue>
                    <StatLabel>
                      <Star size={12} style={{ display: 'inline' }} /> {t.reviews}
                    </StatLabel>
                  </SellerStat>
                  <SellerStat>
                    <StatValue>127</StatValue>
                    <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
                  </SellerStat>
                  <SellerStat>
                    <StatValue>95%</StatValue>
                    <StatLabel>{language === 'bg' ? 'Отговори' : 'Response'}</StatLabel>
                  </SellerStat>
                </SellerStats>
              )}

              <LocationInfo>
                <MapPin />
                <LocationText>
                  {car.city && car.region
                    ? `${car.city}, ${car.region}`
                    : car.city || car.region || t.notSpecified}
                </LocationText>
              </LocationInfo>

              {/* Share Button - Horizontal */}
              <ShareMenuContainer>
                <ShareButtonHorizontal
                  ref={shareButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareMenuToggle();
                  }}
                  type="button"
                >
                  <Share2 size={18} />
                  <span>{language === 'bg' ? 'Сподели' : 'Share'}</span>
                </ShareButtonHorizontal>
                {showShareMenu && (
                  <ShareMenuDropdown
                    ref={shareMenuRef}
                    $isOpen={showShareMenu}
                  >
                    <ShareMenuHeader>
                      <ShareMenuTitle>
                        {language === 'bg' ? 'Сподели' : 'Share'}
                      </ShareMenuTitle>
                    </ShareMenuHeader>
                    <ShareOptionsList>
                      <ShareOption onClick={() => handleShare('facebook')} $color="#1877F2">
                        <Facebook size={20} />
                        <span>Facebook</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('instagram')} $color="#E4405F">
                        <Instagram size={20} />
                        <span>Instagram</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('tiktok')} $color="#000000">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                        <span>TikTok</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('twitter')} $color="#1DA1F2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>Twitter/X</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('linkedin')} $color="#0077B5">
                        <Linkedin size={20} />
                        <span>LinkedIn</span>
                      </ShareOption>
                      <ShareDivider />
                      <ShareOption onClick={() => handleShare('whatsapp')} $color="#25D366">
                        <MessageCircle size={20} />
                        <span>WhatsApp</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('viber')} $color="#665CAC">
                        <MessageCircle size={20} />
                        <span>Viber</span>
                      </ShareOption>
                      <ShareOption onClick={() => handleShare('email')} $color="#EA4335">
                        <Mail size={20} />
                        <span>{language === 'bg' ? 'Имейл' : 'Email'}</span>
                      </ShareOption>
                      <ShareDivider />
                      <ShareOption onClick={() => handleShare('copy')}>
                        {isLinkCopied ? <Check size={20} color="#22c55e" /> : <Copy size={20} />}
                        <span>
                          {isLinkCopied
                            ? (language === 'bg' ? 'Копирано!' : 'Copied!')
                            : (language === 'bg' ? 'Копирай линк' : 'Copy Link')
                          }
                        </span>
                      </ShareOption>
                    </ShareOptionsList>
                  </ShareMenuDropdown>
                )}
              </ShareMenuContainer>
            </SellerCard>
          </RightColumn>
        </MainContent>

        {/* Similar Cars Widget - Full Width */}
        <div style={{ padding: '0 2rem 3rem 2rem' }}>
          <SimilarCarsWidget currentCar={car} language={language} />
        </div>

        {/* Delete Button - Only for owner */}
        {isOwner && (
          <DeleteCarButton onClick={() => setShowDeleteModal(true)}>
            <Trash2 />
            {t.deleteCar}
          </DeleteCarButton>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <ModalOverlay onClick={() => setShowDeleteModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalIcon>
                  <AlertTriangle />
                </ModalIcon>
                <ModalTitle>{t.deleteWarningTitle}</ModalTitle>
              </ModalHeader>

              <ModalBody>
                <WarningText>{getDeleteWarningMessage()}</WarningText>

                {userProfileType === 'dealer' && (
                  <QuotaInfo>
                    {language === 'bg'
                      ? `Използвани безплатни изтривания: ${monthlyDeletionsUsed}/10`
                      : `Free deletions used: ${monthlyDeletionsUsed}/10`}
                  </QuotaInfo>
                )}

                {userProfileType === 'private' && (
                  <QuotaInfo>
                    {language === 'bg'
                      ? `Активни обяви: ${activeListingsCount}/3`
                      : `Active listings: ${activeListingsCount}/3`}
                  </QuotaInfo>
                )}
              </ModalBody>

              <ModalActions>
                <CancelButton onClick={() => setShowDeleteModal(false)}>
                  {t.deleteCancel}
                </CancelButton>
                <DeleteButton onClick={handleDelete}>
                  <Trash2 />
                  {t.deleteConfirm}
                </DeleteButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}


        {/* Extended Seller Info (Map, Imprint, Footer) */}
        <ExtendedSellerInfo car={car} language={language} />

        {/* 🚀 Feature 1: Sticky Mobile Action Bar */}
        <StickyMobileAction>
          <ActionButton onClick={() => onContact('phone')} $variant="primary">
            <Phone size={18} />
            {t.callNow}
          </ActionButton>
          <ActionButton onClick={() => onContact('message')} $variant="secondary">
            <MessageCircle size={18} />
            {t.sendMessage}
          </ActionButton>
          {car.videoUrl && (
            <VideoMiniButton onClick={() => window.open(car.videoUrl, '_blank')}>
              <PlayCircle size={20} />
            </VideoMiniButton>
          )}
        </StickyMobileAction>

      </Container>

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <LightboxOverlay onClick={closeLightbox}>
          <LightboxHeader onClick={(e) => e.stopPropagation()}>
            <LightboxCounter>
              {lightboxIndex + 1} / {images.length}
            </LightboxCounter>
            <LightboxCloseBtn onClick={closeLightbox} title={language === 'bg' ? 'Затвори' : 'Close'}>
              <XIcon size={24} />
            </LightboxCloseBtn>
          </LightboxHeader>

          {images.length > 1 && (
            <>
              <LightboxNavButton
                $position="left"
                onClick={(e) => { e.stopPropagation(); handleLightboxPrev(); }}
                title={language === 'bg' ? 'Предишна' : 'Previous'}
              >
                <ChevronLeft size={28} />
              </LightboxNavButton>
              <LightboxNavButton
                $position="right"
                onClick={(e) => { e.stopPropagation(); handleLightboxNext(); }}
                title={language === 'bg' ? 'Следваща' : 'Next'}
              >
                <ChevronRight size={28} />
              </LightboxNavButton>
            </>
          )}

          <LightboxImageContainer
            $zoom={zoomLevel}
            $panX={panPosition.x}
            $panY={panPosition.y}
            $isDragging={isDragging}
            onClick={(e) => {
              e.stopPropagation();
              if (zoomLevel === 1) handleZoomIn();
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!lightboxImageLoaded && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', minHeight: '200px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            <img
              src={images[lightboxIndex] || '/images/placeholder.png'}
              alt={`${car.make} ${car.model} - ${lightboxIndex + 1}`}
              draggable={false}
              onLoad={() => setLightboxImageLoaded(true)}
              onError={(e) => {
                logger.error('Lightbox image failed to load', null, {
                  index: lightboxIndex,
                  src: (e.target as HTMLImageElement).src
                });
                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                setLightboxImageLoaded(true);
              }}
              style={{ display: lightboxImageLoaded ? 'block' : 'none', minWidth: '200px', minHeight: '200px' }}
            />
          </LightboxImageContainer>

          <LightboxControls onClick={(e) => e.stopPropagation()}>
            <ZoomButton onClick={handleZoomOut} disabled={zoomLevel <= 1} title={language === 'bg' ? 'Намали' : 'Zoom Out'}>
              −
            </ZoomButton>
            <ZoomLevel>{Math.round(zoomLevel * 100)}%</ZoomLevel>
            <ZoomButton onClick={handleZoomIn} disabled={zoomLevel >= 4} title={language === 'bg' ? 'Увеличи' : 'Zoom In'}>
              +
            </ZoomButton>
          </LightboxControls>

          {images.length > 1 && (
            <LightboxThumbnails onClick={(e) => e.stopPropagation()}>
              {images.map((img, index) => (
                <LightboxThumb
                  key={index}
                  $active={index === lightboxIndex}
                  onClick={() => {
                    setLightboxIndex(index);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                >
                  <img
                    src={typeof img === 'string' && img.length > 0 ? img : '/images/placeholder.png'}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </LightboxThumb>
              ))}
            </LightboxThumbnails>
          )}
        </LightboxOverlay>
      )}

      {/* Print Dialog - Outside Container, positioned below Header */}
      {showPrintDialog && (
        <CarPrintSticker
          car={car}
          language={language}
          onClose={() => setShowPrintDialog(false)}
          onPrint={() => {
            window.print();
            setShowPrintDialog(false);
          }}
          onDownloadPDF={async () => {
            try {
              const html2canvas = (await import('html2canvas')).default;
              const jsPDF = (await import('jspdf')).jsPDF;

              const printElement = document.querySelector('[data-print-content]');
              if (printElement) {
                const canvas = await html2canvas(printElement as HTMLElement, {
                  scale: 2,
                  backgroundColor: '#ffffff',
                  useCORS: true,
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                  position = heightLeft - imgHeight;
                  pdf.addPage();
                  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                  heightLeft -= pageHeight;
                }

                pdf.save(`${car.make}-${car.model}-${car.year}.pdf`);
                setShowPrintDialog(false);
              }
            } catch (error) {
              logger.error('PDF generation error', error as Error);
              alert(language === 'bg'
                ? 'Моля инсталирайте библиотеките: npm install jspdf html2canvas'
                : 'Please install libraries: npm install jspdf html2canvas');
            }
          }}
        />
      )}
    </>
  );
};

// Sticky Mobile Action Bar Styles
const StickyMobileAction = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0,0,0,0.1);
  display: flex;
  gap: 12px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: #1a1a1a;
  ` : `
    background: #1a1a1a;
    color: white;
  `}
`;

const VideoMiniButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ff0000;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default CarDetailsMobileDEStyle;
