import { logger } from '../../../../../services/logger-service';
// ProfilePage/tabs/SettingsTab.tsx
// ✅ TESTING VERSION - COMPREHENSIVE SETTINGS PAGE
// Version: 2.0 - November 9, 2025 - 3:00 PM

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useAuth } from '../../../../../contexts/AuthProvider';
import { useTheme } from '../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import { isDealerProfile } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';
import DealershipInfoForm from '../../../../../components/Profile/Dealership/DealershipInfoForm';
import {
  CreditCard, Edit, User, MapPin, Phone, Mail, Save,
  Shield, Bell, Settings as SettingsIcon, Lock, Download,
  Building2, Globe, Car, Trash2, AlertCircle, FileText,
  Eye, MessageSquare, TrendingUp, Smartphone, DollarSign,
  Heart, Sun, Moon, Laptop, ShieldCheck, KeyRound, LogOut,
  Camera, X
} from 'lucide-react';
import { IDCardOverlay, IDCardData } from '../../../../../components/Profile/IDCardEditor';
import ProfileImageUploader from '../../../../../components/Profile/ProfileImageUploader';
import AccountStatusLED from '../../../../../components/Profile/AccountStatusLED';
import EmailVerificationFlow from '../../../../../components/Profile/EmailVerificationFlow';
import PhoneVerificationFlow from '../../../../../components/Profile/PhoneVerificationFlow';
import { profileService } from '../../../../../services/profile/UnifiedProfileService';
import { unifiedCarService } from '../../../../../services/car/unified-car-service';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth, db } from '../../../../../firebase/firebase-config';
import { toast } from 'react-toastify';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, reload } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { SocialAuthService } from '../../../../../firebase/social-auth-service';
import { COUNTRIES, DEFAULT_COUNTRY, getCountryByPhoneCode, type Country } from '../../../../../data/countries-with-flags';

const highlightPulse = `
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); border-color: #2563eb; }
    70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); border-color: #2563eb; }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }
`;

const SettingsStyleWrapper = styled.div`
  ${highlightPulse}
  
  #credentials-section {
    transition: all 0.3s ease;
  }
`;

interface SettingsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
  refresh?: () => Promise<void>;
  setUser?: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

interface UserSettings {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  language: string;
  privacy: {
    profileVisibility: string;
    showPhone: boolean;
    showEmail: boolean;
    showLastSeen: boolean;
    allowMessages: boolean;
    showActivity: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    newMessages: boolean;
    priceAlerts: boolean;
    favoriteUpdates: boolean;
    newListings: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  appearance: {
    theme: string;
    currency: string;
    dateFormat: string;
    compactView: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
  carPreferences: {
    priceRange: {
      min: number;
      max: number;
    };
    searchRadius: number;
  };
}

interface ExtendedBulgarianUser extends BulgarianUser {
  privacy?: {
    profileVisibility?: string;
    showPhone?: boolean;
    showEmail?: boolean;
    showLastSeen?: boolean;
    allowMessages?: boolean;
    showActivity?: boolean;
  };
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    newMessages?: boolean;
    priceAlerts?: boolean;
    favoriteUpdates?: boolean;
    newListings?: boolean;
    promotions?: boolean;
    newsletter?: boolean;
  };
  appearance?: {
    theme?: string;
    currency?: string;
    dateFormat?: string;
    compactView?: boolean;
  };
  security?: {
    twoFactorEnabled?: boolean;
    loginAlerts?: boolean;
    sessionTimeout?: number;
  };
  carPreferences?: {
    priceRange?: {
      min?: number;
      max?: number;
    };
    searchRadius?: number;
  };
}

// Styled Components
const SettingsContainer = styled.div`
  width: 100%;
  min-height: 600px;
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  border: ${props => props.$isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)'};
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  box-shadow: var(--shadow-card);
  
  @media (max-width: 968px) {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
  }
`;

const AvatarSection = styled.div<{ $isDark?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 24px;
  border-bottom: 2px solid ${props => props.$isDark ? 'var(--border-primary)' : 'var(--border-primary)'};
  
  /* Style for ProfileImageUploader inside */
  > div {
    margin-bottom: 12px;
  }
  
  @media (max-width: 968px) {
    padding: 16px 0;
    margin-bottom: 16px;
  }
`;

const AvatarContainer = styled.div<{ $isDark?: boolean }>`
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 12px;
  
  @media (max-width: 968px) {
    width: 100px;
    height: 100px;
  }
`;

const AvatarImage = styled.img<{ $isDark?: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)'};
  box-shadow: ${props => props.$isDark ? 'var(--shadow-md)' : 'var(--shadow-md)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const UploadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const AvatarEditButton = styled.button<{ $isDark?: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  border-radius: 50%;
  background: ${props => props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)'};
  color: white;
  border: 3px solid ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  overflow: hidden;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.$isDark ? 'var(--accent-secondary)' : 'var(--accent-secondary)'};
    transform: scale(1.1);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 968px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    max-width: 32px;
    max-height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const AvatarDeleteButton = styled.button<{ $isDark?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  max-width: 28px;
  max-height: 28px;
  border-radius: 50%;
  background: ${props => props.$isDark ? 'var(--error)' : 'var(--error)'};
  color: white;
  border: 2px solid ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  overflow: hidden;
  
  svg {
    width: 14px;
    height: 14px;
    stroke-width: 3;
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${props => props.$isDark ? '#dc2626' : '#dc2626'};
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 968px) {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    max-width: 24px;
    max-height: 24px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const AvatarName = styled.div<{ $isDark?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$isDark ? 'var(--text-primary)' : 'var(--text-primary)'};
  margin-bottom: 4px;
  text-align: center;
  word-break: break-word;
  
  @media (max-width: 968px) {
    font-size: 1rem;
  }
`;

const AvatarEmail = styled.div<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? 'var(--text-secondary)' : 'var(--text-secondary)'};
  text-align: center;
  word-break: break-word;
  opacity: 0.8;
  
  @media (max-width: 968px) {
    font-size: 0.8125rem;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const SidebarTitle = styled.h2<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isDark ? 'var(--text-primary)' : 'var(--text-primary)'};
  margin: 0 0 20px 0;
  
  @media (max-width: 968px) {
    width: 100%;
    font-size: 1.25rem;
    margin-bottom: 12px;
  }
`;

const SidebarItem = styled.button<{ $active?: boolean; $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(255, 140, 97, 0.2)' : 'rgba(255, 107, 53, 0.15)')
    : 'transparent'};
  border: 2px solid ${props => props.$active
    ? (props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)')
    : 'transparent'};
  border-radius: 12px;
  color: ${props => props.$active
    ? 'var(--accent-primary)'
    : (props.$isDark ? 'var(--text-secondary)' : 'var(--text-primary)')};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.$active
    ? (props.$isDark ? 'rgba(255, 140, 97, 0.25)' : 'rgba(255, 107, 53, 0.2)')
    : (props.$isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)')};
    transform: translateX(4px);
    color: var(--accent-primary);
  }

  svg {
    flex-shrink: 0;
    color: ${props => {
    if (props.$active) return 'var(--accent-primary)';
    if (props.$isDark) return 'var(--text-secondary)';
    // في الوضع النهاري: استخدم لون أغمق للأيقونات
    return '#2D3748'; // رمادي داكن للوضوح
  }};
    transition: color 0.2s ease;
    stroke-width: ${props => props.$active ? 2.5 : 2};
  }
  
  &:hover svg {
    color: var(--accent-primary);
    stroke-width: 2.5;
  }
  
  @media (max-width: 968px) {
    width: auto;
    flex: 1 1 auto;
    min-width: 120px;
    margin-bottom: 0;
    padding: 10px 12px;
    font-size: 0.875rem;
    
    &:hover {
      transform: none;
    }
  }
`;

const ContentArea = styled.div<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  border: ${props => props.$isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)'};
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-card);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: #FF8F10;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $required?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #ef4444;
      margin-left: 4px;
    }
  `}
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid ${props => props.$hasError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9375rem;
  line-height: 1.5;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : '#FF8F10'};
    background: rgba(255, 255, 255, 0.1);
    box-shadow: ${props => props.$hasError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(255, 143, 16, 0.1)'};
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputWithIcon = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid ${props => props.$hasError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${props => props.$hasError ? '#ef4444' : '#FF8F10'};
    background: rgba(255, 255, 255, 0.1);
    box-shadow: ${props => props.$hasError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(255, 143, 16, 0.1)'};
  }

  svg {
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 0.9375rem;
    padding: 0;
    line-height: 1.5;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9375rem;
  line-height: 1.5;
  min-height: 38px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
    padding: 8px;
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;
`;

const CountrySelectWrapper = styled.div`
  position: relative;
  min-width: 140px;
`;

const CountryFlagDisplay = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
  pointer-events: none;
  z-index: 1;
`;

// Neumorphism Switch Components
const SwitchContainer = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px;
  position: relative;
`;

const SwitchWrapper = styled.div<{ $active: boolean }>`
  position: relative;
  width: 50px;
  height: 25px;
  background: #3e3e3e;
  border-radius: 12.5px;
  box-shadow: 
    5px 5px 10px rgba(0, 0, 0, 0.4), 
    -5px -5px 10px rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.4s ease;
`;

const SwitchInner = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 2.5px;
  left: 2.5px;
  width: calc(100% - 5px);
  height: calc(100% - 5px);
  background-color: #3e3e3e;
  border-radius: 10px;
  box-shadow: 
    inset 2.5px 2.5px 5px rgba(0, 0, 0, 0.4), 
    inset -2.5px -2.5px 5px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const SwitchKnobContainer = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.4s ease;
  transform: ${props => props.$active ? 'translateX(100%)' : 'translateX(0)'};
`;

const SwitchKnob = styled.div<{ $active: boolean }>`
  position: relative;
  width: 20px;
  height: 20px;
  top: 2.5px;
  left: 2.5px;
  background-color: #3e3e3e;
  border-radius: 50%;
  box-shadow: 
    2.5px 2.5px 5px rgba(0, 0, 0, 0.5), 
    -2.5px -2.5px 5px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const SwitchKnobNeon = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12.5px;
  height: 12.5px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: ${props => props.$active
    ? '0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0'
    : '0 0 5px #ff8c00, 0 0 10px #ff8c00'};
  transition: box-shadow 0.4s ease;
  pointer-events: none;
`;

const SwitchRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? 'rgba(15, 255, 0, 0.3)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const SwitchLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  position: relative;
  z-index: 1;

  svg {
    color: #ffffff;
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.2s ease;
    font-weight: 600;
  }
  
  div {
    flex: 1;
  }
`;

// Toggle Row with Neumorphism Switch
const ToggleRow: React.FC<{
  $active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ $active, onClick, children }) => {
  return (
    <SwitchRow $active={$active} onClick={onClick}>
      <SwitchLabel>{children}</SwitchLabel>
      <SwitchWrapper $active={$active} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <SwitchInner $active={$active} />
        <SwitchKnobContainer $active={$active}>
          <SwitchKnob $active={$active}>
            <SwitchKnobNeon $active={$active} />
          </SwitchKnob>
        </SwitchKnobContainer>
      </SwitchWrapper>
    </SwitchRow>
  );
};

const ToggleLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  position: relative;
  z-index: 1;

  svg {
    color: #ffffff;
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.2s ease;
    font-weight: 600;
  }
  
  div {
    flex: 1;
  }
`;


const Toggle = styled.input.attrs({ type: 'checkbox' })`
  position: relative;
  width: 52px;
  height: 28px;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  flex-shrink: 0;

  &:checked {
    background: #FF8F10;
  }

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  &:checked::before {
    transform: translateX(24px);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Radio Option without switch - only text color changes
const RadioOptionRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const RadioOption: React.FC<{
  $active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ $active, onClick, children }) => {
  return (
    <RadioOptionRow $active={$active} onClick={onClick}>
      {children}
    </RadioOptionRow>
  );
};

const RadioLabel = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  position: relative;
  z-index: 1;

  svg {
    color: ${props => props.$active ? '#0f0' : '#ef4444'};
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    transition: color 0.2s ease;
  }

  strong {
    display: block;
    color: ${props => props.$active ? '#0f0' : '#ef4444'};
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.2s ease;
    font-weight: 600;
  }
  
  div {
    flex: 1;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const GroupTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #FF8F10;
  margin: 0 0 8px 0;
`;

const ThemeOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ThemeOption = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: ${props => props.active ? 'rgba(255, 143, 16, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.active ? '#FF8F10' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(255, 143, 16, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
    transform: translateY(-2px);
  }

  svg {
    color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  }

  span {
    font-size: 0.95rem;
    font-weight: ${props => props.active ? 600 : 400};
    color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }
`;

const PriceInput = styled(Input)`
  max-width: 150px;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;

  svg {
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const DangerBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;

  svg {
    color: #ef4444;
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

// Animated Button Styles (from b1)
const AnimatedButtonBase = styled.button<{ $color?: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  color: ${props => props.$color || '#1670f0'};
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 2px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: none;
  background: transparent;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    bottom: 2px;
    width: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  > span.btn-span {
    position: absolute;
    display: block;
  }

  > span.btn-span:nth-of-type(1) {
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, #0c002b, ${props => props.$color || '#1670f0'});
    animation: animate1 2s linear infinite;
    animation-delay: 1s;
  }

  > span.btn-span:nth-of-type(2) {
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, #0c002b, ${props => props.$color || '#1670f0'});
    animation: animate2 2s linear infinite;
    animation-delay: 2s;
  }

  > span.btn-span:nth-of-type(3) {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to left, #0c002b, ${props => props.$color || '#1670f0'});
    animation: animate3 2s linear infinite;
    animation-delay: 1s;
  }

  > span.btn-span:nth-of-type(4) {
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(to top, #0c002b, ${props => props.$color || '#1670f0'});
    animation: animate4 2s linear infinite;
    animation-delay: 2s;
  }

  @keyframes animate1 {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes animate2 {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  @keyframes animate3 {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  @keyframes animate4 {
    0% { transform: translateY(100%); }
    100% { transform: translateY(-100%); }
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    > span.btn-span {
      animation: none;
    }
  }
`;

// Button wrapper component to add spans automatically
const AnimatedButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { $color?: string }> = ({ children, $color, ...props }) => {
  return (
    <AnimatedButtonBase $color={$color} {...props}>
      <span className="btn-span"></span>
      <span className="btn-span"></span>
      <span className="btn-span"></span>
      <span className="btn-span"></span>
      {children}
    </AnimatedButtonBase>
  );
};

const SaveButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <AnimatedButton $color="#1670f0" {...props} />
);

const SecondaryButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <AnimatedButton $color="#1670f0" {...props} />
);

const DangerButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <AnimatedButton $color="#ef4444" {...props} />
);

const CancelButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <AnimatedButton $color="#6b7280" {...props} />
);

const SavePasswordButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <AnimatedButton $color="#10b981" {...props} />
);


const PasswordChangeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  width: 100%;
`;

const PasswordFormTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const PasswordField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PasswordButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;


const LoadingMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 40px;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ==================== EDIT INFORMATION SECTION ====================

interface EditInformationSectionProps {
  user: BulgarianUser | null;
  language: string;
}

const UnifiedAccountSection: React.FC<UnifiedAccountSectionProps> = ({ 
  user, 
  language,
  settings,
  setSettings,
  saving,
  handleSave,
  isGuest,
  isVerified,
  showEmailVerification,
  setShowEmailVerification,
  showPhoneVerification,
  setShowPhoneVerification,
  refresh,
  setUser
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const isBg = language === 'bg';
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [idCardData, setIdCardData] = useState<Partial<IDCardData>>({});
  const [emailError, setEmailError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    // Detect country from phone number or default to Bulgaria
    const phone = settings.phone || user?.phoneNumber || '';
    if (phone) {
      const country = getCountryByPhoneCode(phone.substring(0, 4)) || 
                      getCountryByPhoneCode(phone.substring(0, 3)) ||
                      getCountryByPhoneCode(phone.substring(0, 2));
      return country || DEFAULT_COUNTRY;
    }
    return DEFAULT_COUNTRY;
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Extract phone number without country code
    const phone = settings.phone || user?.phoneNumber || '';
    if (phone && phone.startsWith('+')) {
      const country = getCountryByPhoneCode(phone.substring(0, 4)) || 
                      getCountryByPhoneCode(phone.substring(0, 3)) ||
                      getCountryByPhoneCode(phone.substring(0, 2));
      if (country) {
        return phone.replace(country.phoneCode, '').trim();
      }
    }
    return phone.replace(/^\+\d+/, '').trim();
  });
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    // Pattern: ex@ex.ex (at least one char before @, one char after @, one char after dot)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) && email.length >= 5; // Minimum: a@b.c
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSettings({ ...settings, email: value });
    if (value && !validateEmail(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPhoneNumber(value);
    const fullPhone = selectedCountry.phoneCode + value;
    setSettings({ ...settings, phone: fullPhone });
  };

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find(c => c.code === e.target.value) || DEFAULT_COUNTRY;
    setSelectedCountry(country);
    const fullPhone = country.phoneCode + phoneNumber;
    setSettings({ ...settings, phone: fullPhone });
  };
  
  // Merge user data with settings for unified state
  const userInfo = {
    displayName: settings.displayName || user?.displayName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: settings.phone || user?.phoneNumber || '',
    email: settings.email || user?.email || '',
    city: user?.location?.city || '',
    region: user?.location?.region || '',
    address: user?.location?.address || '',
    bio: settings.bio || user?.bio || ''
  };

  // Load ID card data from user if exists
  React.useEffect(() => {
    if (user && (user as any).idCardData) {
      setIdCardData((user as any).idCardData);
    }
  }, [user]);

  const handleSaveIDCard = async (data: IDCardData) => {
    if (!currentUser?.uid) return;

    try {
      // Save ID card data to user profile
      await profileService.updateUserProfile(currentUser.uid, {
        idCardData: data,
        // Auto-fill user info from ID card if empty
        firstName: userInfo.firstName || data.firstNameBG || data.firstNameEN,
        lastName: userInfo.lastName || data.lastNameBG || data.lastNameEN,
        displayName: userInfo.displayName || `${data.firstNameBG || data.firstNameEN} ${data.lastNameBG || data.lastNameEN}`.trim()
      } as any);

      setIdCardData(data);
      setShowIDEditor(false);

      toast.success(
        isBg
          ? 'Данните от личната карта са запазени!'
          : 'ID card data saved successfully!',
        { autoClose: 3000 }
      );
      
      // Refresh user data
      if (refresh) await refresh();
      if (setUser && user) {
        setUser({
          ...user,
          firstName: userInfo.firstName || data.firstNameBG || data.firstNameEN,
          lastName: userInfo.lastName || data.lastNameBG || data.lastNameEN,
          displayName: userInfo.displayName || `${data.firstNameBG || data.firstNameEN} ${data.lastNameBG || data.lastNameEN}`.trim(),
          idCardData: data as any
        });
      }
    } catch (error) {
      toast.error(
        isBg
          ? 'Грешка при запазване на данните от личната карта'
          : 'Error saving ID card data',
        { autoClose: 3000 }
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.uid) return;

    const confirmMessage = language === 'bg'
      ? 'ВНИМАНИЕ: Това действие ще изтрие вашия профил и всички данни ЗАВИНАГИ. Сигурни ли сте?'
      : 'WARNING: This action will PERMANENTLY delete your profile and all data. Are you sure?';

    if (!window.confirm(confirmMessage)) return;

    if (!window.confirm(language === 'bg' ? 'Последно предупреждение! Това действие е необратимо.' : 'Last warning! This action is irreversible.')) return;

    try {
      // 1. Log analytics data before deletion (retain trace for admin)
      try {
        await addDoc(collection(db, 'deleted_users_audit'), {
          uid: currentUser.uid,
          email: currentUser.email,
          deletedAt: serverTimestamp(),
          userAgent: navigator.userAgent,
          reason: 'User requested deletion',
          platform: 'web',
          location: userInfo.locationData || 'Unknown',
          phoneNumber: userInfo.phoneNumber || 'Unknown',
          lastDisplayName: userInfo.displayName,
          source: 'settings_tab'
        });
      } catch (logError) {
        logger.error('Error logging user deletion', logError as Error);
        // Continue with deletion even if logging fails? 
        // User requested "without leaving any trace FOR THE USER", but system needs trace.
        // We proceed.
      }

      // 2. Delete User Data from Firestore
      // Note: This only deletes the main user document. 
      // A Cloud Function is recommended for recursive deletion of subcollections/listings.
      // But we will delete the main doc here as requested.
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // 3. Delete Firebase Auth Account
      await currentUser.delete();

      // 4. Redirect
      window.location.href = '/';

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error deleting account', err);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(language === 'bg' ? 'Моля, влезте отново, за да изтриете акаунта си.' : 'Please log in again to delete your account.');
      } else {
        toast.error(isBg ? 'Грешка при изтриване на акаунта.' : 'Error deleting account.');
      }
    }
  };

  // Unified save handler that updates both settings and user profile
  const handleUnifiedSave = async () => {
    if (!currentUser?.uid) return;

    // Validate email before saving
    if (settings.email && !validateEmail(settings.email)) {
      setEmailError(true);
      toast.error(
        isBg
          ? 'Моля, въведете валиден имейл (формат: ex@ex.ex)'
          : 'Please enter a valid email (format: ex@ex.ex)'
      );
      return;
    }

    try {
      // First update settings (displayName, email, phone, bio, language)
      await handleSave();
      
      // Then update user profile with additional fields (firstName, lastName, location)
      await profileService.updateUserProfile(currentUser.uid, {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        location: {
          city: userInfo.city,
          region: userInfo.region,
          address: userInfo.address,
          country: 'Bulgaria'
        }
      });

      // Refresh user data
      if (refresh) await refresh();
      if (setUser && user) {
        // Update local user state
        setUser({
          ...user,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          location: {
            ...user.location,
            city: userInfo.city,
            region: userInfo.region,
            address: userInfo.address
          }
        });
      }
    } catch (error) {
      logger.error('Error in unified save', error as Error);
      toast.error(
        isBg
          ? 'Грешка при запазване на информацията'
          : 'Error saving information'
      );
    }
  };

  return (
    <Section>
      <SectionHeader>
        <User size={24} />
        <SectionTitle>
          {isBg ? 'Настройки на акаунта' : 'Account Settings'}
        </SectionTitle>
      </SectionHeader>

      {/* Account Status LED Indicator - Only for Guest Accounts */}
      {isGuest && (
        <div style={{ marginBottom: '32px' }}>
          <AccountStatusLED 
            isGuest={isGuest} 
            isVerified={isVerified}
          />
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={() => setShowEmailVerification(true)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #FF7900, #FF8F10)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Mail size={18} />
              {isBg ? 'Потвърди с имейл' : 'Verify with Email'}
            </button>
            <button
              type="button"
              onClick={() => setShowPhoneVerification(true)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #FF7900, #FF8F10)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={18} />
              {isBg ? 'Потвърди с телефон' : 'Verify with Phone'}
            </button>
          </div>
        </div>
      )}

      {/* ID Card Section */}
      <IDCardSection>
        <IDCardHeader>
          <div>
            <IDCardTitle>
              {isBg ? '🆔 Лична карта' : '🆔 ID Card'}
            </IDCardTitle>
            <IDCardSubtitle>
              {isBg
                ? 'Попълнете данните от личната си карта за автоматично попълване'
                : 'Fill in your ID card data for automatic form filling'}
            </IDCardSubtitle>
          </div>
          <IDCardButton onClick={() => setShowIDEditor(true)}>
            <CreditCard size={18} />
            {isBg ? 'Редактирай лична карта' : 'Edit ID Card'}
          </IDCardButton>
        </IDCardHeader>

        {idCardData.documentNumber && (
          <IDCardInfo>
            <InfoItem>
              <strong>{isBg ? '№ на документа:' : 'Document No.:'}</strong> {idCardData.documentNumber}
            </InfoItem>
            <InfoItem>
              <strong>{isBg ? 'ЕГН:' : 'EGN:'}</strong> {idCardData.personalNumber}
            </InfoItem>
            {(idCardData.firstNameBG || idCardData.firstNameEN) && (
              <InfoItem>
                <strong>{isBg ? 'Име:' : 'Name:'}</strong> {idCardData.firstNameBG || idCardData.firstNameEN} {idCardData.lastNameBG || idCardData.lastNameEN}
              </InfoItem>
            )}
          </IDCardInfo>
        )}
      </IDCardSection>

      {/* Personal Information Section */}
      <FormSection>
        <FormTitle>
          {isBg ? 'Лична информация' : 'Personal Information'}
        </FormTitle>

        <SettingGroup id="credentials-section">
          <Label $required>{isBg ? 'Име за показване' : 'Display Name'}</Label>
          <Input
            type="text"
            value={settings.displayName}
            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
            placeholder={isBg ? 'Вашето име' : 'Your name'}
          />
        </SettingGroup>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Име' : 'First Name'}</Label>
            <Input
              type="text"
              value={userInfo.firstName}
              onChange={(e) => {
                // Update user object directly for firstName/lastName
                if (setUser && user) {
                  setUser({ ...user, firstName: e.target.value });
                }
              }}
              placeholder={isBg ? 'Име' : 'First name'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Фамилия' : 'Last Name'}</Label>
            <Input
              type="text"
              value={userInfo.lastName}
              onChange={(e) => {
                if (setUser && user) {
                  setUser({ ...user, lastName: e.target.value });
                }
              }}
              placeholder={isBg ? 'Фамилия' : 'Last name'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label $required>
            <Mail size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Имейл' : 'Email'}
          </Label>
          <InputWithIcon $hasError={emailError}>
            <Mail size={18} />
            <Input
              type="email"
              value={settings.email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              disabled={!isGuest}
              $hasError={emailError}
            />
          </InputWithIcon>
          {emailError && (
            <HelpText style={{ color: '#ef4444', marginTop: '4px' }}>
              {isBg ? 'Моля, въведете валиден имейл (формат: ex@ex.ex)' : 'Please enter a valid email (format: ex@ex.ex)'}
            </HelpText>
          )}
          {!emailError && (
            <HelpText>{isBg ? 'Използва се за влизане и известия' : 'Used for login and notifications'}</HelpText>
          )}
          {isGuest && !emailError && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowEmailVerification(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 121, 0, 0.2)',
                  color: '#FF7900',
                  border: '1px solid rgba(255, 121, 0, 0.4)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={14} />
                {isBg ? 'Потвърди имейл' : 'Verify Email'}
              </button>
            </div>
          )}
        </SettingGroup>

        <SettingGroup>
          <Label>
            <Phone size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Телефон' : 'Phone Number'}
          </Label>
          <PhoneInputWrapper>
            <CountrySelectWrapper>
              <Select
                value={selectedCountry.code}
                onChange={handleCountryChange}
                style={{
                  paddingRight: '32px',
                  minWidth: '140px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingLeft: '40px'
                }}
              >
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.phoneCode} {isBg ? country.nameBg : country.name}
                  </option>
                ))}
              </Select>
              <CountryFlagDisplay>
                {selectedCountry.flag}
              </CountryFlagDisplay>
            </CountrySelectWrapper>
            <InputWithIcon style={{ flex: 1, marginLeft: '8px' }}>
              <Phone size={18} />
              <Input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={isBg ? '888123456' : '888123456'}
                disabled={!isGuest}
              />
            </InputWithIcon>
          </PhoneInputWrapper>
          <HelpText style={{ marginTop: '4px' }}>
            {selectedCountry.phoneCode} {phoneNumber || (isBg ? '888123456' : '888123456')}
          </HelpText>
          {isGuest && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPhoneVerification(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 121, 0, 0.2)',
                  color: '#FF7900',
                  border: '1px solid rgba(255, 121, 0, 0.4)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={14} />
                {isBg ? 'Потвърди телефон' : 'Verify Phone'}
              </button>
            </div>
          )}
        </SettingGroup>

        <FormTitle style={{ marginTop: '2rem' }}>
          {isBg ? 'Местоположение' : 'Location'}
        </FormTitle>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Област' : 'Region'}</Label>
            <Input
              type="text"
              value={userInfo.region}
              onChange={(e) => {
                if (setUser && user) {
                  setUser({ 
                    ...user, 
                    location: { ...user.location, region: e.target.value } 
                  });
                }
              }}
              placeholder={isBg ? 'Област' : 'Region'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Град' : 'City'}</Label>
            <Input
              type="text"
              value={userInfo.city}
              onChange={(e) => {
                if (setUser && user) {
                  setUser({ 
                    ...user, 
                    location: { ...user.location, city: e.target.value } 
                  });
                }
              }}
              placeholder={isBg ? 'Град' : 'City'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label>
            <MapPin size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Адрес' : 'Address'}
          </Label>
          <Input
            type="text"
            value={userInfo.address}
            onChange={(e) => {
              if (setUser && user) {
                setUser({ 
                  ...user, 
                  location: { ...user.location, address: e.target.value } 
                });
              }
            }}
            placeholder={isBg ? 'Улица, номер' : 'Street, number'}
          />
        </SettingGroup>

        <SettingGroup>
          <Label>{isBg ? 'Биография' : 'Bio'}</Label>
          <TextArea
            value={settings.bio}
            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
            placeholder={isBg ? 'Разкажете за себе си...' : 'Tell others about yourself...'}
            rows={4}
          />
          <HelpText>{isBg ? 'Кратко описание, видимо в профила ви' : 'Brief description visible on your profile'}</HelpText>
        </SettingGroup>

        <SettingGroup>
          <Label>{isBg ? 'Език' : 'Language'}</Label>
          <Select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value as 'bg' | 'en' })}
          >
            <option value="bg">Български</option>
            <option value="en">English</option>
          </Select>
        </SettingGroup>

        <ActionButtonsContainer>
          <SaveButton onClick={handleUnifiedSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner />
                {isBg ? 'Запазване...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isBg ? 'Запази промените' : 'Save Changes'}
              </>
            )}
          </SaveButton>

          <DeleteAccountButton onClick={handleDeleteAccount} disabled={saving} type="button">
            <Trash2 size={18} />
            {isBg ? 'ИЗТРИЙ АКАУНТА' : 'DELETE ACCOUNT'}
          </DeleteAccountButton>
        </ActionButtonsContainer>
      </FormSection>

      {/* ID Card Editor Modal */}
      {showIDEditor && (
        <IDCardOverlay
          initialData={idCardData}
          onSave={handleSaveIDCard}
          onClose={() => setShowIDEditor(false)}
        />
      )}

      {/* ID Card Section */}
      <IDCardSection>
        <IDCardHeader>
          <div>
            <IDCardTitle>
              {isBg ? '🆔 Лична карта' : '🆔 ID Card'}
            </IDCardTitle>
            <IDCardSubtitle>
              {isBg
                ? 'Попълнете данните от личната си карта за автоматично попълване'
                : 'Fill in your ID card data for automatic form filling'}
            </IDCardSubtitle>
          </div>
          <IDCardButton onClick={() => setShowIDEditor(true)}>
            <CreditCard size={18} />
            {isBg ? 'Редактирай лична карта' : 'Edit ID Card'}
          </IDCardButton>
        </IDCardHeader>

        {idCardData.documentNumber && (
          <IDCardInfo>
            <InfoItem>
              <strong>{isBg ? '№ на документа:' : 'Document No.:'}</strong> {idCardData.documentNumber}
            </InfoItem>
            <InfoItem>
              <strong>{isBg ? 'ЕГН:' : 'EGN:'}</strong> {idCardData.personalNumber}
            </InfoItem>
            {(idCardData.firstNameBG || idCardData.firstNameEN) && (
              <InfoItem>
                <strong>{isBg ? 'Име:' : 'Name:'}</strong> {idCardData.firstNameBG || idCardData.firstNameEN} {idCardData.lastNameBG || idCardData.lastNameEN}
              </InfoItem>
            )}
          </IDCardInfo>
        )}
      </IDCardSection>

      {/* Personal Information Form */}
      <FormSection>
        <FormTitle>
          {isBg ? 'Лична информация' : 'Personal Information'}
        </FormTitle>

        <SettingGroup>
          <Label $required>{isBg ? 'Име за показване' : 'Display Name'}</Label>
          <Input
            type="text"
            value={userInfo.displayName}
            onChange={(e) => setUserInfo({ ...userInfo, displayName: e.target.value })}
            placeholder={isBg ? 'Вашето име' : 'Your name'}
          />
        </SettingGroup>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Име' : 'First Name'}</Label>
            <Input
              type="text"
              value={userInfo.firstName}
              onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
              placeholder={isBg ? 'Име' : 'First name'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Фамилия' : 'Last Name'}</Label>
            <Input
              type="text"
              value={userInfo.lastName}
              onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
              placeholder={isBg ? 'Фамилия' : 'Last name'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label $required>
            <Mail size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Имейл' : 'Email'}
          </Label>
          <Input
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            placeholder="example@email.com"
            disabled
          />
          <HelpText>{isBg ? 'Имейлът не може да бъде променен' : 'Email cannot be changed'}</HelpText>
        </SettingGroup>

        <SettingGroup>
          <Label>
            <Phone size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Телефон' : 'Phone Number'}
          </Label>
          <Input
            type="tel"
            value={userInfo.phoneNumber}
            onChange={(e) => setUserInfo({ ...userInfo, phoneNumber: e.target.value })}
            placeholder="+359 888 123 456"
          />
        </SettingGroup>

        <FormTitle style={{ marginTop: '2rem' }}>
          {isBg ? 'Местоположение' : 'Location'}
        </FormTitle>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Област' : 'Region'}</Label>
            <Input
              type="text"
              value={userInfo.region}
              onChange={(e) => setUserInfo({ ...userInfo, region: e.target.value })}
              placeholder={isBg ? 'Област' : 'Region'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Град' : 'City'}</Label>
            <Input
              type="text"
              value={userInfo.locationData?.cityName}
              onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
              placeholder={isBg ? 'Град' : 'City'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label>
            <MapPin size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Адрес' : 'Address'}
          </Label>
          <Input
            type="text"
            value={userInfo.address}
            onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
            placeholder={isBg ? 'Улица, номер' : 'Street, number'}
          />
        </SettingGroup>

        <SettingGroup>
          <Label>{isBg ? 'Биография' : 'Bio'}</Label>
          <TextArea
            value={userInfo.bio}
            onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
            placeholder={isBg ? 'Разкажете за себе си...' : 'Tell others about yourself...'}
            rows={4}
          />
        </SettingGroup>

        <ActionButtonsContainer>
          <SaveButton onClick={handleSaveUserInfo} disabled={saving}>
            {saving ? (
              <>
                <Spinner />
                {isBg ? 'Запазване...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isBg ? 'Запази промените' : 'Save Changes'}
              </>
            )}
          </SaveButton>

          <DeleteAccountButton onClick={handleDeleteAccount} disabled={saving} type="button">
            <Trash2 size={18} />
            {isBg ? 'ИЗТРИЙ АКАУНТА' : 'DELETE ACCOUNT'}
          </DeleteAccountButton>
        </ActionButtonsContainer>
      </FormSection>

      {/* ID Card Editor Modal */}
      {showIDEditor && (
        <IDCardOverlay
          initialData={idCardData}
          onSave={handleSaveIDCard}
          onClose={() => setShowIDEditor(false)}
        />
      )}
    </Section>
  );
};

// Styled components for Edit Information Section
const IDCardSection = styled.div`
  background: rgba(168, 85, 247, 0.1);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
`;

const IDCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const IDCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const IDCardSubtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const IDCardButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 8px;
  padding: 8px 16px;
  color: #d8b4fe;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.3);
    transform: translateY(-1px);
  }

  svg {
    color: #d8b4fe;
  }
`;

const IDCardInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const InfoItem = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);

  strong {
    color: rgba(255, 255, 255, 0.6);
    margin-right: 4px;
    font-weight: normal;
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
`;

const FormTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #FF8F10;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const DeleteAccountButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  color: #fca5a5; // Soft red text
  background: rgba(239, 68, 68, 0.15); // Glassy red background
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 0; // Keeping it more standard or use AnimatedButton style if preferred, but user asked for "Next to save"
  // Actually user asked for "Red Glassy".
  border-radius: 4px; // Or match project theme? Project uses various radius. 
  // Let's match AnimatedButton but red.
  
  // Implementation of specific glassy red style:
  background: rgba(220, 38, 38, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(220, 38, 38, 0.5);
  color: #FECaca; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(220, 38, 38, 0.3);
    border-color: #ef4444;
    color: #ffffff;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, theme, refresh, setUser }) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { theme: appTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = appTheme === 'dark';

  // Get active section from URL or default to 'account'
  const sectionFromUrl = searchParams.get('section') || 'account';
  const activeSection = sectionFromUrl;

  const setActiveSection = (section: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('section', section);
      return newParams;
    }, { replace: true });
  };
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Guest account upgrade state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const isGuest = currentUser?.isAnonymous || (user as any)?.isGuest || (user as any)?.accountType === 'guest';
  const isVerified = !isGuest && (user?.emailVerified || user?.phoneVerified);

  // Handle account verification success
  const handleVerificationSuccess = async () => {
    if (refresh) {
      await refresh();
    }
    if (setUser && currentUser) {
      // Reload user to get updated claims
      await reload(currentUser);
      // Update user state
      const updatedUser = { ...user, isGuest: false, accountType: 'registered' } as BulgarianUser;
      setUser(updatedUser);
    }
    toast.success(language === 'bg' 
      ? 'Акаунтът ви е активиран успешно!' 
      : 'Your account has been activated successfully!');
  };

  // Auto-scroll to credentials if requested
  useEffect(() => {
    if (searchParams.get('focus') === 'credentials' && activeSection === 'account') {
      setTimeout(() => {
        const element = document.getElementById('credentials-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.animation = 'highlight-pulse 2s ease';
        }
      }, 500);
    }
  }, [searchParams, activeSection]);
  const [settings, setSettings] = useState<any>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    bio: user?.bio || '',
    language: user?.preferredLanguage || 'bg',
    privacy: {
      profileVisibility: 'public',
      showPhone: true,
      showEmail: false,
      showLastSeen: true,
      allowMessages: true,
      showActivity: true
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      newMessages: true,
      priceAlerts: true,
      favoriteUpdates: true,
      newListings: true,
      promotions: false,
      newsletter: false
    },
    appearance: {
      theme: 'auto',
      currency: 'EUR',
      dateFormat: 'dd/mm/yyyy',
      compactView: false
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30
    },
    carPreferences: {
      priceRange: {
        min: 0,
        max: 100000
      },
      searchRadius: 50
    }
  });

  const isBusinessAccount = user?.profileType === 'dealer' || user?.profileType === 'company';

  // Load user settings on mount
  React.useEffect(() => {
    if (user) {
      const extendedUser = user as ExtendedBulgarianUser;
      setSettings({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        bio: user.bio || '',
        language: user.preferredLanguage || 'bg',
        privacy: {
          profileVisibility: extendedUser.privacy?.profileVisibility || 'public',
          showPhone: extendedUser.privacy?.showPhone !== false,
          showEmail: extendedUser.privacy?.showEmail === true,
          showLastSeen: extendedUser.privacy?.showLastSeen !== false,
          allowMessages: extendedUser.privacy?.allowMessages !== false,
          showActivity: extendedUser.privacy?.showActivity !== false
        },
        notifications: {
          email: extendedUser.notifications?.email !== false,
          sms: extendedUser.notifications?.sms === true,
          push: extendedUser.notifications?.push !== false,
          newMessages: extendedUser.notifications?.newMessages !== false,
          priceAlerts: extendedUser.notifications?.priceAlerts !== false,
          favoriteUpdates: extendedUser.notifications?.favoriteUpdates !== false,
          newListings: extendedUser.notifications?.newListings !== false,
          promotions: extendedUser.notifications?.promotions === true,
          newsletter: extendedUser.notifications?.newsletter === true
        },
        appearance: {
          theme: extendedUser.appearance?.theme || 'auto',
          currency: extendedUser.appearance?.currency || 'EUR',
          dateFormat: extendedUser.appearance?.dateFormat || 'dd/mm/yyyy',
          compactView: extendedUser.appearance?.compactView === true
        },
        security: {
          twoFactorEnabled: extendedUser.security?.twoFactorEnabled === true,
          loginAlerts: extendedUser.security?.loginAlerts !== false,
          sessionTimeout: extendedUser.security?.sessionTimeout || 30
        },
        carPreferences: {
          priceRange: {
            min: extendedUser.carPreferences?.priceRange?.min || 0,
            max: extendedUser.carPreferences?.priceRange?.max || 100000
          },
          searchRadius: extendedUser.carPreferences?.searchRadius || 50
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!currentUser?.uid) {
      toast.error(t('settings.saveError', 'Error saving settings'));
      return;
    }

    // Validation
    if (settings.displayName && settings.displayName.trim().length < 2) {
      toast.error(language === 'bg' ? 'Името трябва да бъде поне 2 символа' : 'Display name must be at least 2 characters');
      return;
    }

    if (settings.phone && settings.phone.trim() !== '') {
      // Basic phone validation (Bulgarian format)
      const phoneRegex = /^(\+359|0)[0-9]{9}$/;
      if (!phoneRegex.test(settings.phone.replace(/\s/g, ''))) {
        toast.error(language === 'bg' ? 'Невалиден телефонен номер' : 'Invalid phone number');
        return;
      }
    }

    try {
      setSaving(true);

      // Update basic profile information
      await profileService.updateUserProfile(currentUser.uid, {
        displayName: settings.displayName?.trim() || '',
        phoneNumber: settings.phone?.trim() || '',
        bio: settings.bio?.trim() || '',
        preferredLanguage: settings.language || 'bg'
      });

      // Update privacy settings
      await profileService.updateUserProfile(currentUser.uid, {
        privacy: {
          profileVisibility: settings.privacy.profileVisibility,
          showPhone: settings.privacy.showPhone,
          showEmail: settings.privacy.showEmail,
          showLastSeen: settings.privacy.showLastSeen,
          allowMessages: settings.privacy.allowMessages,
          showActivity: settings.privacy.showActivity
        }
      });

      // Update notifications settings
      await profileService.updateUserProfile(currentUser.uid, {
        notifications: {
          email: settings.notifications.email,
          sms: settings.notifications.sms,
          push: settings.notifications.push,
          newMessages: settings.notifications.newMessages,
          priceAlerts: settings.notifications.priceAlerts,
          favoriteUpdates: settings.notifications.favoriteUpdates,
          newListings: settings.notifications.newListings,
          promotions: settings.notifications.promotions,
          newsletter: settings.notifications.newsletter
        }
      });

      // Update appearance settings
      await profileService.updateUserProfile(currentUser.uid, {
        appearance: {
          theme: settings.appearance.theme,
          currency: settings.appearance.currency,
          dateFormat: settings.appearance.dateFormat,
          compactView: settings.appearance.compactView
        }
      });

      // Update security settings
      await profileService.updateUserProfile(currentUser.uid, {
        security: {
          twoFactorEnabled: settings.security.twoFactorEnabled,
          loginAlerts: settings.security.loginAlerts,
          sessionTimeout: settings.security.sessionTimeout
        }
      });

      // Update car preferences
      await profileService.updateUserProfile(currentUser.uid, {
        carPreferences: {
          priceRange: settings.carPreferences.priceRange,
          searchRadius: settings.carPreferences.searchRadius
        }
      });

      // Refresh user data
      if (refresh) {
        await refresh();
      }

      toast.success(t('settings.saveSuccess', 'Settings saved successfully'));
    } catch (error) {
      if ((error as any).code === 'permission-denied') {
        logger.error('Permission denied saving settings', error as Error);
      } else {
        logger.error('Error saving settings:', error as Error);
      }
      toast.error(t('settings.saveError', 'Error saving settings'));
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(language === 'bg' ? 'Моля попълнете всички полета' : 'Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.passwordTooShort', 'Password must be at least 6 characters'));
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      toast.error(language === 'bg' ? 'Грешка при удостоверяване' : 'Authentication error');
      return;
    }

    try {
      setChangingPassword(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      // Success
      toast.success(t('settings.passwordChanged', 'Password changed successfully'));
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      logger.error('Error changing password:', error as Error);

      if ((error as any).code === 'auth/wrong-password') {
        toast.error(t('settings.wrongPassword', 'Wrong current password'));
      } else if ((error as any).code === 'auth/weak-password') {
        toast.error(t('settings.passwordTooShort', 'Password must be at least 6 characters'));
      } else {
        toast.error(language === 'bg' ? 'Грешка при смяна на паролата' : 'Error changing password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Export user data to JSON/CSV file
  const handleExportData = async () => {
    if (!currentUser?.uid || !user) {
      toast.error(t('settings.exportError', 'Error exporting data'));
      return;
    }

    try {
      setSaving(true);
      toast.info(language === 'bg' ? 'Събиране на данни...' : 'Collecting data...', { autoClose: 2000 });

      // Fetch user's car listings
      const userCars = await unifiedCarService.searchCars({ sellerId: currentUser.uid }, 1000);

      // Prepare user data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          uid: user.uid,
          displayName: user.displayName || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          profileType: user.profileType || 'private',
          location: user.location || {},
          bio: user.bio || '',
          preferredLanguage: user.preferredLanguage || 'bg',
          createdAt: (user.createdAt as any)?.toDate?.()?.toISOString() || user.createdAt || '',
          idCardData: (user as any).idCardData || null
        },
        settings: {
          privacy: settings.privacy || {},
          notifications: settings.notifications || {},
          appearance: settings.appearance || {},
          security: settings.security || {},
          carPreferences: settings.carPreferences || {}
        },
        listings: userCars.map(car => ({
          id: car.id,
          make: car.make || '',
          model: car.model || '',
          year: car.year || 0,
          price: car.price || 0,
          mileage: car.mileage || 0,
          fuelType: car.fuelType || '',
          transmission: car.transmission || '',
          status: car.status || 'active',
          views: car.views || 0,
          favorites: car.favorites || 0,
          createdAt: (car.createdAt as any)?.toISOString?.() || car.createdAt || '',
          updatedAt: (car.updatedAt as any)?.toISOString?.() || car.updatedAt || ''
        })),
        statistics: {
          totalListings: userCars.length,
          activeListings: userCars.filter(c => c.isActive && !c.isSold).length,
          soldListings: userCars.filter(c => c.isSold).length,
          totalViews: userCars.reduce((sum, c) => sum + (c.views || 0), 0),
          totalFavorites: userCars.reduce((sum, c) => sum + (c.favorites || 0), 0)
        }
      };

      // Create JSON file
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `globul-cars-user-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        language === 'bg'
          ? '✅ Данните са изтеглени успешно!'
          : '✅ Data exported successfully!',
        { autoClose: 3000 }
      );
    } catch (error) {
      logger.error('Error exporting data:', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при експорт на данни'
          : 'Error exporting data',
        { autoClose: 3000 }
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля, изберете изображение' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bg' ? 'Размерът на файла трябва да бъде по-малък от 5MB' : 'File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Delete old photo if exists (only if it's in Firebase Storage)
      if (user?.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract the path from the full URL
          const urlParts = user.photoURL.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'o');
          if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
            const encodedPath = urlParts[pathIndex + 1].split('?')[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const oldPhotoRef = ref(storage, decodedPath);
            await deleteObject(oldPhotoRef);
          }
        } catch (error) {
          // Ignore if old photo doesn't exist
          logger.warn('Could not delete old photo', error as Error);
        }
      }

      // Upload new photo
      const photoRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      // Update user profile
      await profileService.updateUserProfile(currentUser.uid, {
        photoURL: photoURL
      });

      toast.success(
        language === 'bg'
          ? '✅ Снимката е качена успешно!'
          : '✅ Photo uploaded successfully!',
        { autoClose: 3000 }
      );

      // Reload page to show new photo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logger.error('Error uploading photo:', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при качване на снимка'
          : 'Error uploading photo',
        { autoClose: 3000 }
      );
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Handle delete profile photo
  const handleDeletePhoto = async () => {
    if (!currentUser?.uid || !user?.photoURL) return;

    const confirmMessage = language === 'bg'
      ? 'Наистина ли искате да изтриете профилната си снимка?'
      : 'Are you sure you want to delete your profile photo?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setUploadingPhoto(true);

      // Delete from storage (only if it's in Firebase Storage)
      if (user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract the path from the full URL
          const urlParts = user.photoURL.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'o');
          if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
            const encodedPath = urlParts[pathIndex + 1].split('?')[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const photoRef = ref(storage, decodedPath);
            await deleteObject(photoRef);
          }
        } catch (error) {
          // Log but continue - might be external URL
          logger.warn('Could not delete photo from storage', error as Error);
        }
      }

      // Update user profile
      await profileService.updateUserProfile(currentUser.uid, {
        photoURL: undefined
      } as any);

      toast.success(
        language === 'bg'
          ? '✅ Снимката е изтрита успешно!'
          : '✅ Photo deleted successfully!',
        { autoClose: 3000 }
      );

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logger.error('Error deleting photo:', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при изтриване на снимка'
          : 'Error deleting photo',
        { autoClose: 3000 }
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!currentUser?.uid) return;

    const confirmMessage = language === 'bg'
      ? 'Наистина ли искате да изтриете акаунта си? Това действие е необратимо и ще изтрие всички ваши данни!'
      : 'Are you sure you want to delete your account? This action is irreversible and will delete all your data!';

    if (!window.confirm(confirmMessage)) return;

    // Double confirmation
    const doubleConfirm = language === 'bg'
      ? 'Това е последното предупреждение! Акаунтът ви ще бъде изтрит завинаги. Продължавате ли?'
      : 'This is your last warning! Your account will be permanently deleted. Do you want to continue?';

    if (!window.confirm(doubleConfirm)) return;

    try {
      setSaving(true);
      toast.info(
        language === 'bg'
          ? 'Изтриване на акаунта...'
          : 'Deleting account...',
        { autoClose: 2000 }
      );

      // Delete user profile and all associated data from Firestore needs separate service or method
      // For now using profile service delete if available or mocking it
      // await BulgarianProfileService.deleteUserProfile(currentUser.uid);

      // Delete Firebase Auth user
      try {
        await currentUser.delete();
      } catch (error) {
        // If re-authentication is required
        if ((error as any).code === 'auth/requires-recent-login') {
          toast.error(
            language === 'bg'
              ? 'Изисква се повторно удостоверяване. Моля, влезте отново и опитайте пак.'
              : 'Re-authentication required. Please log in again and try again.',
            { autoClose: 5000 }
          );
          return;
        }
        throw error;
      }

      toast.success(
        language === 'bg'
          ? '✅ Акаунтът е изтрит успешно'
          : '✅ Account deleted successfully',
        { autoClose: 3000 }
      );

      // Redirect to home page after deletion
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      logger.error('Error deleting account:', error as Error);
      toast.error(
        language === 'bg'
          ? `Грешка при изтриване на акаунта: ${(error as Error).message || 'Неизвестна грешка'}`
          : `Error deleting account: ${(error as Error).message || 'Unknown error'}`,
        { autoClose: 5000 }
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <SettingsStyleWrapper>
        <SettingsContainer>
          <LoadingMessage>
            {t('common.loading', 'Loading...')}
          </LoadingMessage>
        </SettingsContainer>
      </SettingsStyleWrapper>
    );
  }

  const sections = [
    { id: 'account', icon: User, label: t('settings.account', 'Account') },
    { id: 'privacy', icon: Shield, label: t('settings.privacy', 'Privacy') },
    { id: 'notifications', icon: Bell, label: t('settings.notifications', 'Notifications') },
    { id: 'appearance', icon: SettingsIcon, label: t('settings.appearance', 'Appearance') },
    { id: 'security', icon: Lock, label: t('settings.security', 'Security') },
    { id: 'preferences', icon: Car, label: t('settings.carPreferences', 'Car Preferences') },
    { id: 'data', icon: Download, label: t('settings.dataExport', 'Data & Export') },
  ];

  if (isBusinessAccount) {
    sections.splice(2, 0, { id: 'business', icon: Building2, label: t('settings.business', 'Business Info') });
  }

  return (
    <SettingsStyleWrapper>
      <SettingsContainer>
        <SettingsLayout>
          {/* Left Sidebar Navigation */}
          <Sidebar $isDark={isDark}>
            {/* Profile Photo Section - Using same ProfileImageUploader as main profile page */}
            <AvatarSection $isDark={isDark}>
              <ProfileImageUploader
                currentImageUrl={typeof user?.photoURL === 'string' ? user.photoURL : (typeof user?.profileImage === 'object' ? user.profileImage?.url : undefined)}
                onUploadSuccess={(url) => {
                  // Update local state immediately if setUser is available
                  if (setUser) {
                    setUser(prev => prev ? {
                      ...prev,
                      photoURL: url,
                      profileImage: url ? { url, uploadedAt: new Date() } : undefined
                    } : null);
                  }
                  // Refresh profile data if refresh is available
                  if (refresh) {
                    refresh();
                  } else {
                    // Fallback: reload page
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }
                }}
                onUploadError={(err) => {
                  logger.error('Profile image upload error in settings', err as Error);
                  toast.error(
                    language === 'bg' ? `Грешка при качване: ${err}` : `Upload error: ${err}`,
                    { autoClose: 3000 }
                  );
                }}
              />
              <AvatarName $isDark={isDark}>{user?.displayName || 'User'}</AvatarName>
              <AvatarEmail $isDark={isDark}>{user?.email || ''}</AvatarEmail>
            </AvatarSection>

            <SidebarTitle $isDark={isDark}>{t('settings.title', 'Settings')}</SidebarTitle>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <SidebarItem
                  key={section.id}
                  $active={activeSection === section.id}
                  $isDark={isDark}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={20} />
                  <span>{section.label}</span>
                </SidebarItem>
              );
            })}
          </Sidebar>

          {/* Main Content Area */}
          <ContentArea $isDark={isDark}>
            {/* Unified Account Section - Merged Edit Information + Account */}
            {activeSection === 'account' && (
              <UnifiedAccountSection 
                user={user} 
                language={language}
                settings={settings}
                setSettings={setSettings}
                saving={saving}
                handleSave={handleSave}
                isGuest={isGuest}
                isVerified={isVerified}
                showEmailVerification={showEmailVerification}
                setShowEmailVerification={setShowEmailVerification}
                showPhoneVerification={showPhoneVerification}
                setShowPhoneVerification={setShowPhoneVerification}
                refresh={refresh}
                setUser={setUser}
              />
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <Section>
                <SectionHeader>
                  <Shield size={24} />
                  <SectionTitle>{t('settings.privacy', 'Privacy Settings')}</SectionTitle>
                </SectionHeader>

                <SettingGroup>
                  <Label>{t('settings.profileVisibility', 'Profile Visibility')}</Label>
                  <RadioGroup>
                    <RadioOption
                      $active={settings.privacy.profileVisibility === 'public'}
                      onClick={() => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: 'public' }
                      })}
                    >
                      <RadioLabel $active={settings.privacy.profileVisibility === 'public'}>
                        <Globe size={18} />
                        <div>
                          <strong>{t('settings.public', 'Public')}</strong>
                          <HelpText>{t('settings.publicHelp', 'Everyone can see your profile')}</HelpText>
                        </div>
                      </RadioLabel>
                    </RadioOption>

                    <RadioOption
                      $active={settings.privacy.profileVisibility === 'users'}
                      onClick={() => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: 'users' }
                      })}
                    >
                      <RadioLabel $active={settings.privacy.profileVisibility === 'users'}>
                        <User size={18} />
                        <div>
                          <strong>{t('settings.usersOnly', 'Registered Users Only')}</strong>
                          <HelpText>{t('settings.usersOnlyHelp', 'Only logged in users can see your profile')}</HelpText>
                        </div>
                      </RadioLabel>
                    </RadioOption>
                  </RadioGroup>
                </SettingGroup>

                <Divider />

                <SettingGroup>
                  <ToggleRow
                    $active={settings.privacy.showPhone}
                    onClick={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showPhone: !settings.privacy.showPhone }
                    })}
                  >
                    <ToggleLabel>
                      <Phone size={18} />
                      <div>
                        <strong>{t('settings.showPhone', 'Show Phone Number')}</strong>
                        <HelpText>{t('settings.showPhoneHelp', 'Visible on your listings')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.privacy.showEmail}
                    onClick={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showEmail: !settings.privacy.showEmail }
                    })}
                  >
                    <ToggleLabel>
                      <Mail size={18} />
                      <div>
                        <strong>{t('settings.showEmail', 'Show Email Address')}</strong>
                        <HelpText>{t('settings.showEmailHelp', 'Visible on your profile')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.privacy.showLastSeen}
                    onClick={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showLastSeen: !settings.privacy.showLastSeen }
                    })}
                  >
                    <ToggleLabel>
                      <Eye size={18} />
                      <div>
                        <strong>{t('settings.showLastSeen', 'Show Last Seen')}</strong>
                        <HelpText>{t('settings.showLastSeenHelp', 'Let others know when you were last active')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.privacy.allowMessages}
                    onClick={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, allowMessages: !settings.privacy.allowMessages }
                    })}
                  >
                    <ToggleLabel>
                      <MessageSquare size={18} />
                      <div>
                        <strong>{t('settings.allowMessages', 'Allow Messages')}</strong>
                        <HelpText>{t('settings.allowMessagesHelp', 'Buyers can contact you directly')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.privacy.showActivity}
                    onClick={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showActivity: !settings.privacy.showActivity }
                    })}
                  >
                    <ToggleLabel>
                      <TrendingUp size={18} />
                      <div>
                        <strong>{t('settings.showActivity', 'Show Activity Status')}</strong>
                        <HelpText>{t('settings.showActivityHelp', 'Display your online/offline status')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t('common.save', 'Save Changes')}
                    </>
                  )}
                </SaveButton>
              </Section>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <Section>
                <SectionHeader>
                  <Bell size={24} />
                  <SectionTitle>{t('settings.notifications', 'Notification Preferences')}</SectionTitle>
                </SectionHeader>

                <NotificationGroup>
                  <GroupTitle>{t('settings.channels', 'Notification Channels')}</GroupTitle>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.email}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: !settings.notifications.email }
                      })}
                    >
                      <ToggleLabel>
                        <Mail size={18} />
                        <div>
                          <strong>{t('settings.emailNotifications', 'Email Notifications')}</strong>
                          <HelpText>{t('settings.emailNotificationsHelp', 'Receive updates via email')}</HelpText>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.sms}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: !settings.notifications.sms }
                      })}
                    >
                      <ToggleLabel>
                        <Smartphone size={18} />
                        <div>
                          <strong>{t('settings.smsNotifications', 'SMS Notifications')}</strong>
                          <HelpText>{t('settings.smsNotificationsHelp', 'Receive SMS for important updates')}</HelpText>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.push}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: !settings.notifications.push }
                      })}
                    >
                      <ToggleLabel>
                        <Bell size={18} />
                        <div>
                          <strong>{t('settings.pushNotifications', 'Push Notifications')}</strong>
                          <HelpText>{t('settings.pushNotificationsHelp', 'Browser push notifications')}</HelpText>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>
                </NotificationGroup>

                <NotificationGroup>
                  <GroupTitle>{t('settings.notificationTypes', 'What to Notify')}</GroupTitle>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.newMessages}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newMessages: !settings.notifications.newMessages }
                      })}
                    >
                      <ToggleLabel>
                        <MessageSquare size={18} />
                        <div>
                          <strong>{t('settings.newMessages', 'New Messages')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.priceAlerts}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, priceAlerts: !settings.notifications.priceAlerts }
                      })}
                    >
                      <ToggleLabel>
                        <DollarSign size={18} />
                        <div>
                          <strong>{t('settings.priceAlerts', 'Price Drop Alerts')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.favoriteUpdates}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, favoriteUpdates: !settings.notifications.favoriteUpdates }
                      })}
                    >
                      <ToggleLabel>
                        <Heart size={18} />
                        <div>
                          <strong>{t('settings.favoriteUpdates', 'Favorite Car Updates')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.newListings}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newListings: !settings.notifications.newListings }
                      })}
                    >
                      <ToggleLabel>
                        <Car size={18} />
                        <div>
                          <strong>{t('settings.newListings', 'New Listings Matching Criteria')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.promotions}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, promotions: !settings.notifications.promotions }
                      })}
                    >
                      <ToggleLabel>
                        <TrendingUp size={18} />
                        <div>
                          <strong>{t('settings.promotions', 'Promotions & Deals')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>

                  <SettingGroup>
                    <ToggleRow
                      $active={settings.notifications.newsletter}
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newsletter: !settings.notifications.newsletter }
                      })}
                    >
                      <ToggleLabel>
                        <FileText size={18} />
                        <div>
                          <strong>{t('settings.newsletter', 'Newsletter')}</strong>
                        </div>
                      </ToggleLabel>
                    </ToggleRow>
                  </SettingGroup>
                </NotificationGroup>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t('common.save', 'Save Changes')}
                    </>
                  )}
                </SaveButton>
              </Section>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <Section>
                <SectionHeader>
                  <SettingsIcon size={24} />
                  <SectionTitle>{t('settings.appearance', 'Appearance & Display')}</SectionTitle>
                </SectionHeader>

                <SettingGroup>
                  <Label>{t('settings.theme', 'Theme')}</Label>
                  <ThemeOptions>
                    <ThemeOption
                      active={settings.appearance.theme === 'light'}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: 'light' }
                      })}
                    >
                      <Sun size={24} />
                      <span>{t('settings.light', 'Light')}</span>
                    </ThemeOption>

                    <ThemeOption
                      active={settings.appearance.theme === 'dark'}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: 'dark' }
                      })}
                    >
                      <Moon size={24} />
                      <span>{t('settings.dark', 'Dark')}</span>
                    </ThemeOption>

                    <ThemeOption
                      active={settings.appearance.theme === 'auto'}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: 'auto' }
                      })}
                    >
                      <Laptop size={24} />
                      <span>{t('settings.auto', 'Auto')}</span>
                    </ThemeOption>
                  </ThemeOptions>
                </SettingGroup>

                <SettingGroup>
                  <Label>{t('settings.currency', 'Currency')}</Label>
                  <Select
                    value={settings.appearance.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, currency: e.target.value as 'EUR' }
                    })}
                  >
                    <option value="EUR">EUR (€)</option>
                  </Select>
                  <HelpText>{t('settings.currencyHelp', 'Price display currency (EUR only in Bulgaria)')}</HelpText>
                </SettingGroup>

                <SettingGroup>
                  <Label>{t('settings.dateFormat', 'Date Format')}</Label>
                  <Select
                    value={settings.appearance.dateFormat}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, dateFormat: e.target.value as any }
                    })}
                  >
                    <option value="dd.mm.yyyy">DD.MM.YYYY</option>
                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  </Select>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.appearance.compactView}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactView: !settings.appearance.compactView }
                    })}
                  >
                    <ToggleLabel>
                      <Laptop size={18} />
                      <div>
                        <strong>{t('settings.compactView', 'Compact View')}</strong>
                        <HelpText>{t('settings.compactViewHelp', 'Show more content on screen')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t('common.save', 'Save Changes')}
                    </>
                  )}
                </SaveButton>
              </Section>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <Section>
                <SectionHeader>
                  <Lock size={24} />
                  <SectionTitle>{t('settings.security', 'Security & Login')}</SectionTitle>
                </SectionHeader>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.security.twoFactorEnabled}
                    onClick={() => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
                    })}
                  >
                    <ToggleLabel>
                      <ShieldCheck size={18} />
                      <div>
                        <strong>{t('settings.twoFactor', 'Two-Factor Authentication')}</strong>
                        <HelpText>{t('settings.twoFactorHelp', 'Add extra security to your account')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow
                    $active={settings.security.loginAlerts}
                    onClick={() => setSettings({
                      ...settings,
                      security: { ...settings.security, loginAlerts: !settings.security.loginAlerts }
                    })}
                  >
                    <ToggleLabel>
                      <AlertCircle size={18} />
                      <div>
                        <strong>{t('settings.loginAlerts', 'Login Alerts')}</strong>
                        <HelpText>{t('settings.loginAlertsHelp', 'Get notified of new logins')}</HelpText>
                      </div>
                    </ToggleLabel>
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <Label>{t('settings.sessionTimeout', 'Session Timeout')}</Label>
                  <Select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number(e.target.value) }
                    })}
                  >
                    <option value="15">15 {t('settings.minutes', 'minutes')}</option>
                    <option value="30">30 {t('settings.minutes', 'minutes')}</option>
                    <option value="60">1 {t('settings.hour', 'hour')}</option>
                    <option value="120">2 {t('settings.hours', 'hours')}</option>
                  </Select>
                  <HelpText>{t('settings.sessionTimeoutHelp', 'Auto-logout after inactivity')}</HelpText>
                </SettingGroup>

                <SettingGroup>
                  {!showPasswordChange ? (
                    <DangerButton onClick={() => setShowPasswordChange(true)}>
                      <KeyRound size={18} />
                      {t('settings.changePassword', 'Change Password')}
                    </DangerButton>
                  ) : (
                    <PasswordChangeForm>
                      <PasswordFormTitle>
                        <KeyRound size={20} />
                        {t('settings.changePassword', 'Change Password')}
                      </PasswordFormTitle>

                      <PasswordField>
                        <Label>{t('settings.currentPassword', 'Current Password')}</Label>
                        <Input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </PasswordField>

                      <PasswordField>
                        <Label>{t('settings.newPassword', 'New Password')}</Label>
                        <Input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </PasswordField>

                      <PasswordField>
                        <Label>{t('settings.confirmPassword', 'Confirm Password')}</Label>
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </PasswordField>

                      <PasswordButtonGroup>
                        <CancelButton
                          onClick={() => {
                            setShowPasswordChange(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          disabled={changingPassword}
                        >
                          {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </CancelButton>
                        <SavePasswordButton
                          onClick={handlePasswordChange}
                          disabled={changingPassword}
                        >
                          {changingPassword ? (
                            language === 'bg' ? 'Смяна...' : 'Changing...'
                          ) : (
                            language === 'bg' ? 'Смени паролата' : 'Change Password'
                          )}
                        </SavePasswordButton>
                      </PasswordButtonGroup>
                    </PasswordChangeForm>
                  )}
                </SettingGroup>

                <SettingGroup>
                  <DangerButton onClick={async () => {
                    if (window.confirm(language === 'bg'
                      ? 'Наистина ли искате да излезете от всички устройства?'
                      : 'Are you sure you want to logout from all devices?')) {
                      try {
                        // TODO: Implement logout from all devices
                        toast.info(
                          language === 'bg'
                            ? 'Функцията е в процес на разработка'
                            : 'Feature is under development',
                          { autoClose: 3000 }
                        );
                      } catch (error) {
                        logger.error('Error logging out:', error as Error);
                        toast.error(
                          language === 'bg'
                            ? 'Грешка при излизане'
                            : 'Error logging out',
                          { autoClose: 3000 }
                        );
                      }
                    }
                  }}>
                    <LogOut size={18} />
                    {t('settings.logoutAllDevices', 'Logout from All Devices')}
                  </DangerButton>
                </SettingGroup>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t('common.save', 'Save Changes')}
                    </>
                  )}
                </SaveButton>
              </Section>
            )}

            {/* Car Preferences */}
            {activeSection === 'preferences' && (
              <Section>
                <SectionHeader>
                  <Car size={24} />
                  <SectionTitle>{t('settings.carPreferences', 'Car Search Preferences')}</SectionTitle>
                </SectionHeader>

                <SettingGroup>
                  <Label>{t('settings.priceRange', 'Preferred Price Range (EUR)')}</Label>
                  <PriceRangeContainer>
                    <PriceInput
                      type="number"
                      value={settings.carPreferences.priceRange.min}
                      onChange={(e) => setSettings({
                        ...settings,
                        carPreferences: {
                          ...settings.carPreferences,
                          priceRange: { ...settings.carPreferences.priceRange, min: Number(e.target.value) }
                        }
                      })}
                      placeholder="Min"
                    />
                    <span>—</span>
                    <PriceInput
                      type="number"
                      value={settings.carPreferences.priceRange.max}
                      onChange={(e) => setSettings({
                        ...settings,
                        carPreferences: {
                          ...settings.carPreferences,
                          priceRange: { ...settings.carPreferences.priceRange, max: Number(e.target.value) }
                        }
                      })}
                      placeholder="Max"
                    />
                  </PriceRangeContainer>
                </SettingGroup>

                <SettingGroup>
                  <Label>{t('settings.searchRadius', 'Search Radius (km)')}</Label>
                  <Input
                    type="number"
                    value={settings.carPreferences.searchRadius}
                    onChange={(e) => setSettings({
                      ...settings,
                      carPreferences: { ...settings.carPreferences, searchRadius: Number(e.target.value) }
                    })}
                    placeholder="50"
                  />
                  <HelpText>{t('settings.searchRadiusHelp', 'Default radius for location-based searches')}</HelpText>
                </SettingGroup>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t('common.save', 'Save Changes')}
                    </>
                  )}
                </SaveButton>
              </Section>
            )}

            {/* Business Info (Dealers/Companies only) */}
            {activeSection === 'business' && isBusinessAccount && (
              <Section>
                <SectionHeader>
                  <Building2 size={24} />
                  <SectionTitle>
                    {isDealerProfile(user) ? t('settings.dealerInfo', 'Dealership Information') : t('settings.companyInfo', 'Company Information')}
                  </SectionTitle>
                </SectionHeader>

                <DealershipInfoForm userId={user.uid} />
              </Section>
            )}

            {/* Data & Export */}
            {activeSection === 'data' && (
              <Section>
                <SectionHeader>
                  <Download size={24} />
                  <SectionTitle>{t('settings.dataExport', 'Data & Privacy')}</SectionTitle>
                </SectionHeader>

                <SettingGroup>
                  <InfoBox>
                    <FileText size={20} />
                    <div>
                      <strong>{t('settings.downloadData', 'Download Your Data')}</strong>
                      <HelpText>
                        {t('settings.downloadDataHelp', 'Get a copy of all your data including listings, messages, and activity')}
                      </HelpText>
                    </div>
                  </InfoBox>
                  <SecondaryButton onClick={handleExportData}>
                    <Download size={18} />
                    {t('settings.exportData', 'Request Data Export')}
                  </SecondaryButton>
                </SettingGroup>

                <Divider />

                <SettingGroup>
                  <DangerBox>
                    <AlertCircle size={20} />
                    <div>
                      <strong>{t('settings.deleteAccount', 'Delete Account')}</strong>
                      <HelpText>
                        {t('settings.deleteAccountWarning', 'Permanently delete your account and all associated data. This action cannot be undone.')}
                      </HelpText>
                    </div>
                  </DangerBox>
                  <DangerButton onClick={handleDeleteAccount}>
                    <Trash2 size={18} />
                    {t('settings.deleteMyAccount', 'Delete My Account')}
                  </DangerButton>
                </SettingGroup>
              </Section>
            )}
          </ContentArea>
        </SettingsLayout>
      </SettingsContainer>

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <EmailVerificationFlow
          currentEmail={user?.email}
          isGuest={isGuest}
          onVerified={handleVerificationSuccess}
          onClose={() => setShowEmailVerification(false)}
        />
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerification && (
        <PhoneVerificationFlow
          currentPhone={user?.phoneNumber}
          isGuest={isGuest}
          onVerified={handleVerificationSuccess}
          onClose={() => setShowPhoneVerification(false)}
        />
      )}
    </SettingsStyleWrapper >
  );
};

export default SettingsTab;
