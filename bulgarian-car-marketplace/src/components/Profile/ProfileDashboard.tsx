import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Eye, Car, MessageSquare, AlertCircle, Plus, Edit, Settings as SettingsIcon } from 'lucide-react';
import { useProfileType, type ProfileTheme } from '../../contexts/ProfileTypeContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import type { ProfileType } from '../../contexts/ProfileTypeContext';

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
  align-items: center;
  gap: 24px;
  
  border-left: 4px solid ${props => props.$theme.primary};
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      8px 8px 16px rgba(0, 0, 0, 0.5),
      -8px -8px 16px rgba(255, 255, 255, 0.1);
  }
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
  border: 1px solid ${props => props.$theme.primary}40;
  
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: ${props => props.$theme.primary};
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

const StatLabel = styled.div`
  font-size: 0.7rem; /* 🎯 Reduced from 0.85rem */
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const ProfileDashboard: React.FC = () => {
  const { profileType, theme } = useProfileType();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  useEffect(() => {
    if (user) {
      // Convert User to UserData with type assertion
      const userData = user as any as UserData;
      setCompletionPercentage(calculateCompletion(userData, profileType));
    }
  }, [user, profileType]);
  
  // Convert user for display with type assertion
  const userData: UserData | null = user ? (user as any as UserData) : null;
  
  return (
    <DashboardContainer>
      {/* Profile Completion Progress */}
      <CompletionCard $theme={theme}>
        <ProgressRingContainer>
          <ProgressRing
            percentage={completionPercentage}
            color={theme.primary}
          />
        </ProgressRingContainer>
        
        <CompletionDetails>
          <CardHeader>
            <TrendingUp size={24} />
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          
          {getMissingFields(userData, profileType).length > 0 ? (
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '8px' }}>
                Missing fields:
              </p>
              {getMissingFields(userData, profileType).map(field => (
                <MissingFieldChip key={field} $theme={theme}>
                  <AlertCircle size={12} />
                  {field}
                </MissingFieldChip>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
              Profile Complete!
            </p>
          )}
        </CompletionDetails>
      </CompletionCard>
      
      {/* Activity Stats - 🎯 COMPACT: Single Row */}
      <StatsGrid>
        <StatCard $theme={theme}>
          <StatIcon><Eye size={20} /></StatIcon>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <StatValue>{userData?.profileViews || 0}</StatValue>
            <StatLabel>Profile Views</StatLabel>
          </div>
        </StatCard>
        
        <StatCard $theme={theme}>
          <StatIcon><Car size={20} /></StatIcon>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <StatValue>{userData?.activeListings || 0}</StatValue>
            <StatLabel>Active Listings</StatLabel>
          </div>
        </StatCard>
        
        <StatCard $theme={theme}>
          <StatIcon><MessageSquare size={20} /></StatIcon>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <StatValue>{userData?.messages || 0}</StatValue>
            <StatLabel>Messages</StatLabel>
          </div>
        </StatCard>
      </StatsGrid>
      
      {/* Quick Actions - 🎯 NOW LINKED! */}
      <QuickActionsBar $theme={theme}>
        <QuickAction 
          $theme={theme}
          onClick={() => navigate('/sell')}
          title="Add a new car listing"
        >
          <Plus size={18} />
          Add Listing
        </QuickAction>
        
        <QuickAction 
          $theme={theme}
          onClick={() => {
            const editButton = document.querySelector('[data-action="edit-profile"]') as HTMLButtonElement;
            if (editButton) editButton.click();
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Edit your profile information"
        >
          <Edit size={18} />
          Edit Profile
        </QuickAction>
        
        <QuickAction 
          $theme={theme}
          onClick={() => navigate('/settings')}
          title="Manage account settings"
        >
          <SettingsIcon size={18} />
          Settings
        </QuickAction>
      </QuickActionsBar>
    </DashboardContainer>
  );
};

export default ProfileDashboard;
