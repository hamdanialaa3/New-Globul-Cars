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

import React, { useState } from 'react';
import styled from 'styled-components';
import './CarDetailsTheme.css'; // Import theme CSS
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
  AlertTriangle
} from 'lucide-react';
import { CarListing } from '../../../types/CarListing';
import { useTheme } from '../../../contexts/ThemeContext';

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

  /* Diagonal accent for modern touch */
  &::after {
    content: '';
    position: fixed;
    top: -50%;
    right: -10%;
    width: 40%;
    height: 200%;
    background: linear-gradient(135deg, transparent 40%, var(--accent-glow) 50%, transparent 60%);
    opacity: 0.01;
    pointer-events: none;
    z-index: 0;
    transform: rotate(-15deg);
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

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  background: #fafafa;
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

  img {
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
  position: relative;
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
  const { theme } = useTheme();
  const t = translations[language];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        console.log('Featured image updated successfully');
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
          <IconButton onClick={() => onContact('share')}>
            <Share2 size={20} />
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
                    <img 
                      src={typeof img === 'string' ? img : URL.createObjectURL(img as File)} 
                      alt={`Thumbnail ${index + 1}`} 
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
            <CarName>{car.make} {car.model}</CarName>
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
          {getEquipmentItems().length > 0 && (
            <EquipmentSection>
              <SectionTitle>{t.equipmentFeatures}</SectionTitle>
              <EquipmentGrid>
                {getEquipmentItems().map((item, index) => (
                  <EquipmentItem key={index}>
                    <CheckCircle />
                    {item}
                  </EquipmentItem>
                ))}
              </EquipmentGrid>
            </EquipmentSection>
          )}

          {/* Description */}
          {car.description && (
            <DescriptionSection>
              <SectionTitle>{t.vehicleDescription}</SectionTitle>
              <DescriptionText>{car.description}</DescriptionText>
            </DescriptionSection>
          )}
        </LeftColumn>

        {/* Right Column */}
        <RightColumn>
          {/* Price Card */}
          <PriceCard>
            <PriceTitle>{t.grossPrice}</PriceTitle>
            <PriceValue>{formatPrice(car.price)}</PriceValue>
            <PriceSubtext>{t.vatDeductible}</PriceSubtext>

            <FinancingBox>
              <FinancingText>{t.financingFrom}</FinancingText>
              <FinancingAmount>
                {formatPrice(calculateFinancing(car.price))} {t.perMonth}
              </FinancingAmount>
            </FinancingBox>

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

          {/* Seller Info */}
          <SellerCard>
            <SectionTitle>{t.sellerInformation}</SectionTitle>
            <SellerHeader>
              <SellerLogo>
                {car.sellerName ? car.sellerName.charAt(0).toUpperCase() : <User />}
              </SellerLogo>
              <SellerInfo>
                <SellerName>{car.sellerName || t.notSpecified}</SellerName>
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
          </SellerCard>
        </RightColumn>
      </MainContent>

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
    </Container>
  );
};

export default CarDetailsMobileDEStyle;
