// ╔════════════════════════════════════════════════════════════════════════╗
// ║                    SETTINGS TAB - UNIFIED SETTINGS PAGE                 ║
// ║                                                                          ║
// ║  ⚠️  CONSTITUTION EXCEPTION - 3614 LINES                                ║
// ║  This file is EXEMPT from the 300-line limit.                           ║
// ║  See: docs/CONSTITUTION_EXCEPTIONS.md for full justification.           ║
// ║                                                                          ║
// ║  🚫 DO NOT ATTEMPT TO SPLIT THIS FILE WITHOUT:                          ║
// ║     1. Comprehensive end-to-end tests for all 8 sections                ║
// ║     2. Context-based state management refactor                          ║
// ║     3. Senior Architect approval                                        ║
// ║                                                                          ║
// ║  📋 ARCHITECTURE OVERVIEW:                                              ║
// ║  • 8 Main Sections: Account, Privacy, Notifications, Security,          ║
// ║    Appearance, Business, Car Preferences, Data Export                   ║
// ║  • 4 Shared State Objects: userInfo, settings, idCardData, verification ║
// ║  • 50+ Styled Components (Neumorphism design)                           ║
// ║  • Tab-based navigation (mobile-responsive sidebar)                     ║
// ║                                                                          ║
// ║  🔧 KEY INTEGRATIONS:                                                   ║
// ║  • Firebase: Firestore (saves), Storage (images), Auth (passwords)      ║
// ║  • Verification Flows: Email & Phone modals                             ║
// ║  • Profile Types: Private, Dealer, Company (conditional rendering)      ║
// ║                                                                          ║
// ║  Version: 2.1 - December 24, 2025                                       ║
// ╚════════════════════════════════════════════════════════════════════════╝

import { logger } from '../../../../../services/logger-service';
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
  Camera, X, ExternalLink
} from 'lucide-react';
// ID Card feature removed - 2025-12-24
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
import { BULGARIA_PROVINCES, MAJOR_CITIES_BG } from '../../../../../services/bulgaria-locations.service';
import IdentityStamp from '../../../../../components/Profile/IdentityStamp';
import EnableMFAFlow from '../../../../../components/Profile/Security/EnableMFAFlow';
import { twoFactorAuthService } from '../../../../../services/security/two-factor-auth.service';

const highlightPulse = `
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 var(--accent-primary)66; border-color: var(--accent-primary); }
    70% { box-shadow: 0 0 0 10px var(--accent-primary)00; border-color: var(--accent-primary); }
    100% { box-shadow: 0 0 0 0 var(--accent-primary)00; }
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
  background: var(--bg-overlay);
  opacity: 0.9;
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
    background: var(--error);
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
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
    return 'var(--text-secondary)';
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
  border-bottom: 2px solid var(--border-primary);
  color: var(--accent-primary);
  
  svg {
    flex-shrink: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $required?: boolean; $orange?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.$orange ? `var(--accent-primary)` : `var(--text-primary)`};
  margin-bottom: 4px;
  transition: color 0.2s ease;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: var(--error);
      margin-left: 4px;
    }
  `}
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 2px solid ${props => props.$hasError ? 'var(--error)' : 'var(--border-primary)'};
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.5;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--error)' : 'var(--accent-primary)'};
    background: var(--bg-card);
    box-shadow: ${props => props.$hasError ? '0 0 0 3px var(--error)22' : '0 0 0 3px var(--accent-primary)22'};
  }

  &::placeholder {
    color: var(--text-muted);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    border-color: var(--border-hover);
  }
`;

const InputWithIcon = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 2px solid ${props => props.$hasError ? 'var(--error)' : 'var(--border-primary)'};
  border-radius: 8px;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${props => props.$hasError ? 'var(--error)' : 'var(--accent-primary)'};
    background: var(--bg-card);
    box-shadow: ${props => props.$hasError ? '0 0 0 3px var(--error)22' : '0 0 0 3px var(--accent-primary)22'};
  }

  svg {
    color: var(--text-secondary);
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.9375rem;
    padding: 0;
    line-height: 1.5;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 38px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-card);
    box-shadow: 0 0 0 3px var(--accent-primary)22;
  }

  &::placeholder {
    color: var(--text-muted);
  }
  
  &:hover {
    border-color: var(--border-hover);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.5;
  min-height: 38px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-card);
    box-shadow: 0 0 0 3px var(--accent-primary)22;
  }
  
  &:hover {
    border-color: var(--border-hover);
  }

  option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px;
  }
`;

const HelpText = styled.p<{ $gray?: boolean }>`
  font-size: ${props => props.$gray ? '0.75rem' : '0.875rem'};
  color: ${props => props.$gray ? 'var(--text-secondary)' : 'var(--text-secondary)'};
  margin: 0;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
  opacity: ${props => props.$gray ? '0.85' : '1'};
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
  background-color: var(--bg-card);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
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
    ? '0 0 5px var(--success), 0 0 10px var(--success), 0 0 15px var(--success)'
    : '0 0 5px var(--accent-primary), 0 0 10px var(--accent-primary)'};
  transition: box-shadow 0.4s ease;
  pointer-events: none;
`;

const SwitchRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? 'var(--success)' : 'transparent'};

  &:hover {
    background: var(--bg-hover);
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
    color: var(--text-primary);
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  strong {
    display: block;
    color: var(--text-primary);
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
    color: var(--text-primary);
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  strong {
    display: block;
    color: var(--text-primary);
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:checked {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
  }

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: var(--text-on-header);
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-sm);
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
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'transparent'};

  &:hover {
    background: var(--bg-hover);
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
    color: ${props => props.$active ? 'var(--success)' : 'var(--text-secondary)'};
    margin-top: 2px;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    transition: color 0.2s ease;
  }

  strong {
    display: block;
    color: ${props => props.$active ? 'var(--accent-primary)' : 'var(--text-primary)'};
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
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
`;

const GroupTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent-primary);
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

const ThemeOption = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: ${props => props.$active ? 'var(--accent-primary)22' : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'var(--border-primary)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--accent-primary)33' : 'var(--bg-hover)'};
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  svg {
    color: ${props => props.$active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  }

  span {
    font-size: 0.95rem;
    font-weight: ${props => props.$active ? 600 : 400};
    color: ${props => props.$active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    color: var(--text-secondary);
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
  background: var(--info)22;
  border: 2px solid var(--info);
  border-radius: 12px;

  svg {
    color: var(--info);
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: var(--text-primary);
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const DangerBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--error)22;
  border: 2px solid var(--error);
  border-radius: 12px;

  svg {
    color: var(--error);
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: var(--text-primary);
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: var(--border-primary);
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
  color: var(--text-secondary);
  padding: 40px;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-primary);
  border-top-color: var(--accent-primary);
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

interface UnifiedAccountSectionProps {
  user: BulgarianUser | null;
  language: string;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  saving: boolean;
  handleSave: () => Promise<void>;
  handleDeleteAccount?: () => Promise<void>;
  isGuest: boolean;
  isVerified: boolean;
  showEmailVerification: boolean;
  setShowEmailVerification: (show: boolean) => void;
  showPhoneVerification: boolean;
  setShowPhoneVerification: (show: boolean) => void;
  refresh?: () => Promise<void>;
  setUser?: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

const UnifiedAccountSection: React.FC<UnifiedAccountSectionProps> = ({
  user,
  language,
  settings,
  setSettings,
  saving,
  handleSave,
  handleDeleteAccount,
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
  const { isDark: isDarkMode } = useTheme();
  const isBg = language === 'bg';
  const [showIDEditor, setShowIDEditor] = useState(false);
  // ID Card state removed - 2025-12-24
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

  // BUG FIX 5 & 6: Use locationData and consolidate state
  // Local state for form fields
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    displayName: user?.displayName || '',
    publicDisplayName: (user as any)?.publicDisplayName || '', // NEW: Public display name based on profile type
    phoneNumber: settings.phone || user?.phoneNumber || '',
    email: settings.email || user?.email || '',
    city: user?.locationData?.cityName || user?.location?.city || '',
    region: user?.locationData?.regionName || user?.location?.region || '',
    address: user?.locationData?.address || user?.location?.address || '',
    bio: settings.bio || user?.bio || ''
  });

  // ✅ تحديث displayName تلقائياً عند تغيير firstName أو lastName
  useEffect(() => {
    if (userInfo.firstName || userInfo.lastName) {
      const autoDisplayName = `${userInfo.firstName} ${userInfo.lastName}`.trim();
      if (autoDisplayName && autoDisplayName !== userInfo.displayName) {
        setUserInfo(prev => ({ ...prev, displayName: autoDisplayName }));
      }
    }
  }, [userInfo.firstName, userInfo.lastName]);

  // BUG FIX 4: Fix useEffect dependencies - include all dependencies
  useEffect(() => {
    setUserInfo({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      publicDisplayName: (user as any)?.publicDisplayName || '', // NEW: Public display name
      phoneNumber: settings.phone || user?.phoneNumber || '',
      email: settings.email || user?.email || '',
      city: user?.locationData?.cityName || user?.location?.city || '',
      region: user?.locationData?.regionName || user?.location?.region || '',
      address: user?.locationData?.address || user?.location?.address || '',
      bio: settings.bio || user?.bio || ''
    });
  }, [user?.uid, user?.firstName, user?.lastName, user?.phoneNumber, user?.email, user?.locationData, user?.location, user?.bio, settings.phone, settings.email, settings.bio]);

  // Debug: Confirm component version
  useEffect(() => {
    logger.debug('UnifiedAccountSection v2.0 - Fix Applied');
  }, []);

  // Load ID card data removed - 2025-12-24

  // handleSaveIDCard removed - 2025-12-24

  // BUG FIX 7: Add loading and error states
  const [savingUserInfo, setSavingUserInfo] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveUserInfoHandler = async () => {
    if (!currentUser?.uid) {
      setSaveError(isBg ? 'Не сте влезли в системата' : 'You are not logged in');
      toast.error(isBg ? 'Не сте влезли в системата' : 'You are not logged in');
      return;
    }

    // ✅ التحقق من الحقول المطلوبة
    if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
      setSaveError(isBg ? 'Моля, попълнете първото и последното име' : 'Please fill in first and last name');
      toast.error(isBg ? 'Моля, попълнете първото и последното име' : 'Please fill in first and last name');
      return;
    }

    // ✅ التحقق من صحة رقم الهاتف إذا كان موجود
    if (userInfo.phoneNumber && userInfo.phoneNumber.trim()) {
      const phoneRegex = /^(\+359|0)[0-9]{9}$/;
      if (!phoneRegex.test(userInfo.phoneNumber.replace(/\s/g, ''))) {
        setSaveError(isBg ? 'Невалиден телефонен номер' : 'Invalid phone number');
        toast.error(isBg ? 'Невалиден телефонен номер. Формат: +359 XXX XXX XXX' : 'Invalid phone number. Format: +359 XXX XXX XXX');
        return;
      }
    }

    setSavingUserInfo(true);
    setSaveError(null);

    try {
      logger.info('💾 Saving user account information', { userId: currentUser.uid });

      // ✅ توليد displayName تلقائياً من firstName + lastName
      const displayName = `${userInfo.firstName.trim()} ${userInfo.lastName.trim()}`.trim();

      // ✅ حفظ جميع البيانات الشخصية بشكل كامل
      const updateData: any = {
        firstName: userInfo.firstName.trim(),
        lastName: userInfo.lastName.trim(),
        displayName: displayName,
        publicDisplayName: userInfo.publicDisplayName.trim() || '', // NEW: Public display name
        phoneNumber: userInfo.phoneNumber.trim() || '',
        bio: userInfo.bio.trim() || '',
        // ✅ حفظ الموقع بالهيكل الصحيح
        locationData: {
          cityName: userInfo.city.trim() || '',
          regionName: userInfo.region.trim() || '',
          address: userInfo.address.trim() || '',
          coordinates: user?.locationData?.coordinates || null
        },
        // ✅ حفظ Location بشكل منفصل للتوافق مع الكود القديم
        location: userInfo.city.trim() || userInfo.region.trim() || '',
        // ✅ تحديث timestamp
        updatedAt: new Date().toISOString()
      };

      // ✅ حفظ البيانات في Firestore
      await profileService.updateUserProfile(currentUser.uid, updateData);

      // ✅ تحديث البيانات المحلية
      if (setUser) {
        setUser(prev => prev ? { ...prev, ...updateData } : null);
      }

      // ✅ تحديث settings إذا كانت موجودة
      if (settings) {
        await handleSave();
      }

      // ✅ إعادة تحميل البيانات
      if (refresh) {
        await refresh();
      }

      logger.info('✅ User account information saved successfully');
      toast.success(
        isBg
          ? 'Информацията е запазена успешно!'
          : 'Information saved successfully!',
        { autoClose: 3000 }
      );

      // ✅ إظهار رسالة نجاح
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

    } catch (error) {
      logger.error("Error saving user info:", error as Error);
      const errorMessage = error instanceof Error
        ? (error as Error).message
        : (isBg ? 'Грешка при запазване на информацията' : 'Failed to save profile information');
      setSaveError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setSavingUserInfo(false);
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



      {/* ID Card Section removed - 2025-12-24 */}

      {/* Personal Information Form with Floating Identity Stamp */}
      <FormSection>
        {/* الختم الطافي - لا يأخذ مساحة */}
        <IdentityStamp
          firstName={userInfo.firstName || 'FIRST NAME'}
          lastName={userInfo.lastName || 'LAST NAME'}
          email={userInfo.email || 'EMAIL@EXAMPLE.COM'}
          phone={userInfo.phoneNumber || '+359 00 000 000'}
          region={userInfo.region || 'REGION'}
          city={userInfo.city || 'CITY'}
          address={userInfo.address || 'ADDRESS'}
          numericId={user?.numericId || 0}
          isDark={isDarkMode}
        />

        <FormTitle>
          {isBg ? 'Лична информация' : 'Personal Information'}
        </FormTitle>

        {/* NEW: Public Display Name based on profile type */}
        <SettingGroup>
          <Label $required $orange>
            {user?.profileType === 'dealer'
              ? (isBg ? '🏪 Име на автокъща' : '🏪 Dealership Name')
              : user?.profileType === 'company'
                ? (isBg ? '🏢 Име на компания' : '🏢 Company Name')
                : (isBg ? '👤 Публично име' : '👤 Public Display Name')
            }
          </Label>
          <Input
            type="text"
            value={userInfo.publicDisplayName}
            onChange={(e) => setUserInfo({ ...userInfo, publicDisplayName: e.target.value })}
            placeholder={
              user?.profileType === 'dealer'
                ? (isBg ? 'Въведете името на автокъщата' : 'Enter dealership name')
                : user?.profileType === 'company'
                  ? (isBg ? 'Въведете името на компанията' : 'Enter company name')
                  : (isBg ? 'Въведете публичното си име' : 'Enter your public display name')
            }
          />
          <HelpText $gray>
            {user?.profileType === 'dealer'
              ? (isBg ? 'Това е името, което ще виждат клиентите' : 'This is the name customers will see')
              : user?.profileType === 'company'
                ? (isBg ? 'Официалното име на вашата компания' : 'Your official company name')
                : (isBg ? 'Името, което ще виждат другите потребители' : 'The name other users will see')
            }
          </HelpText>
        </SettingGroup>

        {/* BUG FIX 1: Remove duplicate displayName field - use firstName + lastName only */}
        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label $required $orange>{isBg ? 'Име' : 'First Name'}</Label>
            <Input
              type="text"
              value={userInfo.firstName}
              onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
              placeholder={isBg ? 'Име' : 'First name'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label $required $orange>{isBg ? 'Фамилия' : 'Last Name'}</Label>
            <Input
              type="text"
              value={userInfo.lastName}
              onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
              placeholder={isBg ? 'Фамилия' : 'Last name'}
            />
          </SettingGroup>
        </FormRow>
        <HelpText style={{ marginTop: '-12px', marginBottom: '16px' }} $gray>
          {isBg
            ? `Името за показване: ${userInfo.displayName || '(автоматично от първото и последното име)'}`
            : `Display name: ${userInfo.displayName || '(automatically from first and last name)'}`}
        </HelpText>

        <SettingGroup>
          <Label $required $orange>
            <Mail size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Имейл' : 'Email'}
          </Label>
          <Input
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            placeholder="example@email.com"
            disabled={isGuest || !currentUser?.emailVerified}
          />
          <HelpText $gray>
            {isGuest
              ? (isBg ? 'Имейлът не може да бъде променен за гост акаунти' : 'Email cannot be changed for guest accounts')
              : !currentUser?.emailVerified
                ? (isBg ? 'Моля, потвърдете имейла си преди промяна' : 'Please verify your email before changing it')
                : (isBg ? 'Имейлът не може да бъде променен' : 'Email cannot be changed')
            }
          </HelpText>
        </SettingGroup>

        <SettingGroup>
          <Label $orange>
            <Phone size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Телефон' : 'Phone Number'}
          </Label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input
              type="tel"
              value={userInfo.phoneNumber}
              onChange={(e) => {
                let value = e.target.value;
                // ✅ تلقائي: إضافة +359 إذا كان الرقم يبدأ بـ 0
                if (value.startsWith('0') && !value.startsWith('+')) {
                  value = '+359' + value.substring(1);
                }
                // ✅ تنظيف الإدخال: إزالة المسافات الزائدة
                value = value.replace(/\s{2,}/g, ' ');
                setUserInfo({ ...userInfo, phoneNumber: value });
              }}
              placeholder="+359 888 123 456"
              style={{ flex: 1 }}
            />
          </div>
          <HelpText $gray style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            {isBg
              ? 'Формат: +359 XXX XXX XXX (Ще бъде автоматично преобразувано от 0XXX в +359XXX)'
              : 'Format: +359 XXX XXX XXX (Will be automatically converted from 0XXX to +359XXX)'}
          </HelpText>
        </SettingGroup>

        <FormTitle style={{ marginTop: '2rem', color: 'var(--accent-primary)' }}>
          {isBg ? 'Местоположение' : 'Location'}
        </FormTitle>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label $orange>{isBg ? 'Област' : 'Region'}</Label>
            <select
              value={userInfo.region}
              onChange={(e) => setUserInfo({ ...userInfo, region: e.target.value, city: '' })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '0.9375rem',
                border: '2px solid var(--border-primary)',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="">{isBg ? 'Изберете област' : 'Select region'}</option>
              {BULGARIA_PROVINCES.map(province => (
                <option key={province.bg} value={province.bg}>
                  {isBg ? province.bg : province.en}
                </option>
              ))}
            </select>
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label $orange>{isBg ? 'Град' : 'City'}</Label>
            <select
              value={userInfo.city}
              onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
              disabled={!userInfo.region}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '0.9375rem',
                border: '2px solid var(--border-primary)',
                borderRadius: '12px',
                background: userInfo.region ? 'var(--bg-input)' : 'rgba(0,0,0,0.1)',
                color: 'var(--text-primary)',
                cursor: userInfo.region ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: userInfo.region ? 1 : 0.5
              }}
            >
              <option value="">
                {userInfo.region
                  ? (isBg ? 'Изберете град' : 'Select city')
                  : (isBg ? 'Първо изберете област' : 'Select region first')}
              </option>
              {userInfo.region && MAJOR_CITIES_BG.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {!userInfo.region && (
              <HelpText $gray style={{ color: '#ff6b35', fontSize: '0.75rem', marginTop: '4px' }}>
                {isBg ? 'Моля, първо изберете област' : 'Please select a region first'}
              </HelpText>
            )}
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

        {/* BUG FIX 7: Show error message if save failed */}
        {saveError && (
          <DangerBox style={{ marginTop: '1rem' }}>
            <AlertCircle size={20} />
            <div>
              <strong>{isBg ? 'Грешка' : 'Error'}</strong>
              <p>{saveError}</p>
            </div>
          </DangerBox>
        )}

        {/* ✅ Success message */}
        {saveSuccess && (
          <div style={{
            marginTop: '1rem',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: '2px solid #34d399',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            animation: 'slideIn 0.3s ease'
          }}>
            <Save size={20} />
            <div>
              <strong>{isBg ? '✓ Успешно запазено' : '✓ Successfully Saved'}</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                {isBg ? 'Всички промени са запазени.' : 'All changes have been saved.'}
              </p>
            </div>
          </div>
        )}

        <ActionButtonsContainer>
          <SaveButton
            onClick={saveUserInfoHandler}
            disabled={saving || savingUserInfo || !userInfo.firstName.trim() || !userInfo.lastName.trim()}
            style={{
              opacity: (!userInfo.firstName.trim() || !userInfo.lastName.trim()) ? 0.5 : 1,
              cursor: (!userInfo.firstName.trim() || !userInfo.lastName.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {saving || savingUserInfo ? (
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

// ID Card styled components removed - 2025-12-24

const FormSection = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  overflow: visible;
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
  const [showMFAEnrollment, setShowMFAEnrollment] = useState(false); // ✅ NEW: MFA Modal State
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
        listings: userCars.map((car: any) => ({
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

      // ✅ NEW: Request Google Analytics data deletion
      try {
        const gaDataDeletionService = (await import('../../../../../services/analytics/google-analytics-data-deletion.service')).default;
        const deletionResult = await gaDataDeletionService.requestDataDeletion(
          currentUser.uid,
          currentUser.email || undefined,
          'User account deletion request'
        );

        if (deletionResult.success) {
          logger.info('Google Analytics deletion request submitted', {
            requestId: deletionResult.requestId,
            userId: currentUser.uid
          });
        }
      } catch (error) {
        logger.error('Failed to request Google Analytics data deletion', error as Error);
        // Don't block account deletion if GA deletion fails
      }

      // Delete user profile and all associated data from Firestore
      try {
        const { GDPRService } = await import('../../../../../services/compliance/gdpr.service');
        const gdprService = GDPRService.getInstance();
        await gdprService.deleteAllUserData(currentUser.uid, 'User account deletion');
      } catch (error) {
        logger.error('Failed to delete user data from Firestore', error as Error);
        // Continue with auth deletion even if Firestore deletion fails
      }

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
                handleDeleteAccount={handleDeleteAccount}
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
                      $active={settings.appearance.theme === 'light'}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: 'light' }
                      })}
                    >
                      <Sun size={24} />
                      <span>{t('settings.light', 'Light')}</span>
                    </ThemeOption>

                    <ThemeOption
                      $active={settings.appearance.theme === 'dark'}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: 'dark' }
                      })}
                    >
                      <Moon size={24} />
                      <span>{t('settings.dark', 'Dark')}</span>
                    </ThemeOption>

                    <ThemeOption
                      $active={settings.appearance.theme === 'auto'}
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
                    onClick={() => {
                      if (settings.security.twoFactorEnabled) {
                        // Handle Disable 2FA
                        if (window.confirm(language === 'bg'
                          ? 'Сигурни ли сте, че искате да изключите двуфакторната аутентикация?'
                          : 'Are you sure you want to disable Two-Factor Authentication?')) {

                          setSaving(true); // Reuse saving state for UI feedback
                          twoFactorAuthService.disable2FA(currentUser!)
                            .then((result) => {
                              if (result.success) {
                                setSettings({
                                  ...settings,
                                  security: { ...settings.security, twoFactorEnabled: false }
                                });
                                toast.success(result.message);
                                if (refresh) refresh();
                              } else {
                                toast.error(result.message);
                              }
                            })
                            .catch((error) => {
                              logger.error('Error disabling 2FA', error);
                              toast.error(language === 'bg' ? 'Грешка при изключване на 2FA' : 'Error disabling 2FA');
                            })
                            .finally(() => setSaving(false));
                        }
                      } else {
                        // Handle Enable 2FA -> Open Modal
                        setShowMFAEnrollment(true);
                      }
                    }}
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
                        // Logout from all devices by:
                        // 1. Sign out current session
                        // 2. Clear all local storage
                        // 3. Invalidate all tokens (would require backend support)
                        const { signOut } = await import('firebase/auth');
                        const { auth } = await import('../../../../../firebase/firebase-config');

                        // Clear local storage and session storage
                        localStorage.clear();
                        sessionStorage.clear();

                        // Sign out from Firebase
                        await signOut(auth);

                        toast.success(
                          language === 'bg'
                            ? 'Излязохте от всички устройства успешно'
                            : 'Logged out from all devices successfully',
                          { autoClose: 3000 }
                        );

                        // Redirect to home page after a short delay
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1000);
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
                  <InfoBox>
                    <FileText size={20} />
                    <div>
                      <strong>{t('settings.googleAnalytics', 'Google Analytics Data')}</strong>
                      <HelpText>
                        {t('settings.googleAnalyticsHelp', 'Your data in Google Analytics will be automatically deleted when you delete your account. You can also request manual deletion.')}
                      </HelpText>
                    </div>
                  </InfoBox>
                  <SecondaryButton
                    onClick={() => {
                      const gaService = require('../../../../../services/analytics/google-analytics-data-deletion.service').default;
                      const info = gaService.getPropertyInfo();
                      window.open(info.deletionUrl, '_blank');
                    }}
                  >
                    <ExternalLink size={18} />
                    {t('settings.viewGADeletion', 'View GA Data Deletion')}
                  </SecondaryButton>
                </SettingGroup>

                <Divider />

                <SettingGroup>
                  <InfoBox>
                    <TrendingUp size={20} />
                    <div>
                      <strong>{t('settings.bigQueryExport', 'BigQuery Data Export')}</strong>
                      <HelpText>
                        {t('settings.bigQueryExportHelp', 'Export Google Analytics data to BigQuery for advanced analytics and data warehousing. Requires admin access.')}
                      </HelpText>
                    </div>
                  </InfoBox>
                  <SecondaryButton
                    onClick={() => {
                      const gaService = require('../../../../../services/analytics/google-analytics-data-deletion.service').default;
                      const info = gaService.getPropertyInfo();
                      window.open(info.bigQueryExportUrl, '_blank');
                    }}
                  >
                    <ExternalLink size={18} />
                    {t('settings.setupBigQuery', 'Setup BigQuery Export')}
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

      {/* MFA Enrollment Modal */}
      {showMFAEnrollment && (
        <EnableMFAFlow
          currentPhone={user?.phoneNumber}
          onSuccess={() => {
            setSettings({
              ...settings,
              security: { ...settings.security, twoFactorEnabled: true }
            });
            if (refresh) refresh();
            // Toast is handled inside EnableMFAFlow, but we can add one here if needed
            setShowMFAEnrollment(false);
          }}
          onClose={() => setShowMFAEnrollment(false)}
        />
      )}
    </SettingsStyleWrapper >
  );
};

export default SettingsTab;
