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
import styled from 'styled-components';
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
    serviceHistory: 'Сервизна книжка',
    technicalData: 'Технически данни',
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
    serviceHistory: 'Service history',
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

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  padding: 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
`;

const Thumbnail = styled.div<{ $active: boolean; $isFeatured?: boolean }>`
  width: 100%;
  padding-top: 75%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isFeatured ? 'var(--accent-primary)' : props.$active ? 'var(--accent-primary)' : 'transparent'};
  transition: all 0.2s;
  box-shadow: ${props => props.$isFeatured ? '0 0 12px rgba(255, 215, 0, 0.4)' : 'none'};

  &:hover {
    border-color: var(--accent-primary);
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

const SetFeaturedButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
  backdrop-filter: blur(4px);

  &:hover {
    background: var(--accent-primary);
    color: #1a1a1a;
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--accent-primary);
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);

  svg {
    width: 12px;
    height: 12px;
  }
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
  const { toast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // SEO Meta Description Logic
  const seoDescription = `${car.make} ${car.model} ${car.year}, ${car.price} EUR. ${car.mileage}km. ${language === 'bg' ? 'Вижте повече на Bulgarski Mobili.' : 'See more on Bulgarski Mobili.'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(
    (car as any).featuredImageIndex ?? 0
  );

  const images = car.images && car.images.length > 0 ? car.images : ['/assets/placeholder-car.jpg'];

  const handleSetFeatured = async (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setFeaturedImageIndex(index);

    // If owner, save to database
    if (isOwner && car.id) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../../firebase/firebase-config');
        const carRef = doc(db, 'cars', car.id);
        await updateDoc(carRef, { featuredImageIndex: index });
      } catch (error) {
        console.error('Error updating featured image:', error);
      }
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
  const getCarShareUrl = () => {
    if (car.sellerNumericId && (car.carNumericId || (car as any).numericId)) {
      return `${window.location.origin}/car/${car.sellerNumericId}/${car.carNumericId || (car as any).numericId}`;
    }
    return `${window.location.origin}/car/${car.id}`;
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
                  console.error('Error setting showPrintDialog:', error);
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
            {isOwner && onEdit && (
              <EditButton onClick={onEdit}>
                <Edit size={18} />
                {t.edit}
              </EditButton>
            )}
          </HeaderActions>
        </Header>

        {/* Main Content */}
        <MainContent>
          {/* Left Column */}
          <LeftColumn>
            {/* Image Gallery */}
            <ImageGallery>
              <MainImageContainer>
                <MainImage
                  src={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : URL.createObjectURL(images[currentImageIndex] as File)}
                  alt={`${car.make} ${car.model}`}
                />
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
                      $isFeatured={index === featuredImageIndex}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      {index === featuredImageIndex && (
                        <FeaturedBadge>
                          <Crown />
                          {language === 'bg' ? 'Основна' : 'Featured'}
                        </FeaturedBadge>
                      )}
                      {isOwner && (
                        <SetFeaturedButton
                          onClick={(e) => handleSetFeatured(index, e)}
                          title={language === 'bg' ? 'Задай като основна снимка' : 'Set as featured image'}
                        >
                          <Crown />
                        </SetFeaturedButton>
                      )}
                      <OptimizedImage
                        src={typeof img === 'string' ? img : URL.createObjectURL(img as File)}
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

            {/* Vehicle Title */}
            <VehicleTitle>
              <TitleRow>
                <CarBrandLogo make={car.make} size={48} showName={false} />
                <CarName>{car.make} {car.model}</CarName>
              </TitleRow>
              <CarSubtitle>
                {car.year} • {car.fuelType} • {car.transmission}
              </CarSubtitle>
              <BadgeRow>
                {car.accidentHistory === false && (
                  <Badge $variant="success">
                    <CheckCircle size={14} />
                    {t.accidentFree}
                  </Badge>
                )}
                {car.serviceHistory && (
                  <Badge $variant="success">
                    <CheckCircle size={14} />
                    {t.serviceHistory}
                  </Badge>
                )}
                {car.sellerType === 'dealer' && (
                  <Badge $variant="info">
                    <Shield size={14} />
                    {language === 'bg' ? 'Дилър' : 'Dealer'}
                  </Badge>
                )}
              </BadgeRow>
            </VehicleTitle>

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
                    <CardSectionTitle>{t.equipment}</CardSectionTitle>

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
                    <CardSectionTitle>{t.equipment}</CardSectionTitle>
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

          {/* Right Column */}
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
                    // Navigate to seller profile using numeric ID
                    if (car.sellerNumericId) {
                      navigate(`/profile/${car.sellerNumericId}`);
                    } else if (car.sellerId) {
                      // Fallback to legacy ID if numeric ID not available
                      navigate(`/profile/${car.sellerId}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  title={language === 'bg' ? 'Виж профила на продавача' : 'View seller profile'}
                >
                  {car.sellerName ? car.sellerName.charAt(0).toUpperCase() : <User />}
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
            <FinancingCalculator
              price={car.price}
              currency={car.currency || 'EUR'}
              language={language}
            />
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
              console.error('PDF generation error:', error);
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
