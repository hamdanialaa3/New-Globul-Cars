import { logger } from '../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Eye, Car, MessageSquare, AlertCircle, Plus, Edit, Settings as SettingsIcon, RefreshCw, MapPin, Mail, Phone as PhoneIcon, Users } from 'lucide-react';
import { useProfileType, type ProfileTheme } from '../../contexts/ProfileTypeContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ProfileType } from '../../contexts/ProfileTypeContext';
import { SimpleProfileAvatar } from './index';
import { googleProfileSyncService } from '../../services/google/google-profile-sync.service';

// ==================== TYPES ====================

interface UserData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  location?: { city: string };
  postalCode?: string;
  address?: string;
  profileViews?: number;
  activeListings?: number;
  messages?: number;
}

// ==================== STYLED COMPONENTS ====================

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
`;

const CompletionCard = styled.div<{ $theme: ProfileTheme }>`
  background: #3e3e3e;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.08);
  
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  border-left: 4px solid ${props => props.$theme.colors.primary.main};
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      8px 8px 16px rgba(0, 0, 0, 0.5),
      -8px -8px 16px rgba(255, 255, 255, 0.1);
  }
`;

const ProfileHeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const CompletionBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 121, 0, 0.15) 0%, rgba(255, 143, 16, 0.15) 100%);
  border: 2px solid rgba(255, 143, 16, 0.4);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 121, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 121, 0, 0.3);
    border-color: rgba(255, 143, 16, 0.6);
  }
`;

const CompletionPercentage = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF7900;
  line-height: 1;
  margin-bottom: 2px;
`;

const CompletionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProfileInfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProfileName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
`;

const ProfileEmail = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.3;
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  
  svg {
    color: #FF7900;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatNumber = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF7900;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #FF7900 0%, #FF8F10 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: ${props => props.$variant === 'primary' 
    ? 'none' 
    : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
    background: ${props => props.$variant === 'primary' 
      ? 'linear-gradient(135deg, #e66d00 0%, #e67f00 100%)' 
      : 'rgba(255, 255, 255, 0.15)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg.spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CompletionDetailsSection = styled.div`
  padding-top: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
`;

const ProgressRingContainer = styled.div`
  flex-shrink: 0;
`;

const CompletionDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MissingFieldChip = styled.div<{ $theme: ProfileTheme }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid ${props => props.$theme.colors.primary.main}40;
  
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: ${props => props.$theme.colors.primary.main};
  }
`;

const StatsGrid = styled.div`
  display: flex; /* 🎯 Changed from grid to flex for single row */
  gap: 12px; /* 🎯 Reduced gap */
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-wrap: wrap; /* Wrap on mobile */
  }
`;

const StatCard = styled.div<{ $theme: ProfileTheme }>`
  background: #3e3e3e;
  border-radius: 10px; /* 🎯 Smaller radius */
  padding: 12px 16px; /* 🎯 Reduced padding: 20px → 12px/16px */
  flex: 1; /* 🎯 Equal width for all cards */
  min-width: 120px; /* 🎯 Minimum width */
  
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.3), /* 🎯 Smaller shadows */
    -4px -4px 8px rgba(255, 255, 255, 0.06);
  
  display: flex;
  flex-direction: row; /* 🎯 Changed to row for horizontal layout */
  align-items: center; /* 🎯 Center vertically */
  gap: 10px; /* 🎯 Reduced gap */
  
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.$theme.gradient};
  }
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px); /* 🎯 Subtle lift */
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.4),
      -5px -5px 10px rgba(255, 255, 255, 0.08);
  }
`;

const StatIcon = styled.div`
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0; /* 🎯 Don't shrink icon */
  display: flex;
  align-items: center;
  
  svg {
    width: 20px; /* 🎯 Smaller icon size */
    height: 20px;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem; /* 🎯 Reduced from 2rem */
  font-weight: 700;
  color: #ffffff;
  line-height: 1; /* 🎯 Tight line height */
  
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const QuickActionsBar = styled.div<{ $theme: ProfileTheme }>`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const QuickAction = styled.button<{ $theme: ProfileTheme }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  
  background: ${props => props.$theme.gradient};
  color: #ffffff;
  border: none;
  border-radius: 12px;
  
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.3),
    -2px -2px 6px rgba(255, 255, 255, 0.1);
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.4),
      -3px -3px 8px rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ==================== PROGRESS RING ====================

interface ProgressRingProps {
  percentage: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, color }) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width="120" height="120">
      {/* Background circle */}
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke="#2a2a2a"
        strokeWidth="8"
        fill="none"
      />
      {/* Progress circle */}
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{
          transition: 'stroke-dashoffset 1s ease-in-out'
        }}
      />
      {/* Percentage text */}
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dy="7"
        fontSize="24"
        fontWeight="bold"
        fill={color}
      >
        {percentage}%
      </text>
    </svg>
  );
};

// ==================== HELPER FUNCTIONS ====================

const calculateCompletion = (user: UserData | null, profileType: ProfileType): number => {
  if (!user) return 0;
  
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'dateOfBirth',
    'location',
    'postalCode'
  ];
  
  const filledFields = requiredFields.filter(field => {
    if (field === 'location') return user.location?.city;
    return user[field as keyof UserData];
  });
  
  return Math.round((filledFields.length / requiredFields.length) * 100);
};

const getMissingFields = (user: UserData | null, profileType: ProfileType): string[] => {
  if (!user) return [];
  
  const missingFields: string[] = [];
  
  if (!user.firstName) missingFields.push('First Name');
  if (!user.lastName) missingFields.push('Last Name');
  if (!user.phoneNumber) missingFields.push('Phone');
  if (!user.dateOfBirth) missingFields.push('Date of Birth');
  if (!user.location?.city) missingFields.push('City');
  if (!user.postalCode) missingFields.push('Postal Code');
  
  return missingFields;
};

// ==================== MAIN COMPONENT ====================

interface ProfileDashboardProps {
  user?: any;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user: propUser }) => {
  const { profileType, theme } = useProfileType();
  const { user: authUser } = useAuth();
  const { language } = useLanguage();
  const user = propUser || authUser;
  const navigate = useNavigate();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Convert User to UserData with type assertion
      const userData = user as any as UserData;
      setCompletionPercentage(calculateCompletion(userData, profileType));
    }
  }, [user, profileType]);
  
  // Convert user for display with type assertion
  const userData: UserData | null = user ? (user as any as UserData) : null;
  
  // Google Sync Handler
  const handleGoogleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const updated = await googleProfileSyncService.syncProfileData(user.uid);
      if (updated) {
        alert(language === 'bg' ? 'Профилът е синхронизиран!' : 'Profile synced!');
      }
    } catch (error) {
      logger.error('Sync error:', error);
      alert(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <DashboardContainer>
      {/* ✅ Profile Completion Card Removed */}
      
      {/* ✅ Activity Stats Removed */}
    </DashboardContainer>
  );
};

export default ProfileDashboard;
