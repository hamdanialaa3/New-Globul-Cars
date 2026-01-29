import styled, { css, keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Theme Colors by Profile Type
export const profileThemes = {
  company: {
    primary: '#1a365d',
    secondary: '#2d3748',
    accent: '#c0c0c0',
    background: '#ffffff',
    cardBg: '#f7fafc',
    text: '#1a202c',
    textSecondary: '#4a5568',
    border: '#e2e8f0',
    hover: '#edf2f7',
  },
  dealer: {
    primary: '#d97706',
    secondary: '#92400e',
    accent: '#3b82f6',
    background: '#fffbeb',
    cardBg: '#ffffff',
    text: '#78350f',
    textSecondary: '#92400e',
    border: '#fde68a',
    hover: '#fef3c7',
  },
  personal: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#0ea5e9',
    background: '#f3f4f6',
    cardBg: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    hover: '#e5e7eb',
  },
};

// Main Container
export const PublicProfileContainer = styled.div<{ $profileType: 'company' | 'dealer' | 'personal' }>`
  min-height: 100vh;
  background: ${props => profileThemes[props.$profileType].background};
  animation: ${fadeIn} 0.3s ease-out;
`;

// Cover Photo Section
export const CoverPhotoSection = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

export const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const CoverOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
`;

// Profile Picture
export const ProfilePictureWrapper = styled.div`
  position: absolute;
  bottom: -90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  @media (max-width: 768px) {
    bottom: -60px;
  }
`;

export const ProfilePicture = styled.img<{ $profileType: 'company' | 'dealer' | 'personal' }>`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 6px solid ${props => profileThemes[props.$profileType].background};
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: white;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    border-width: 4px;
  }
`;

// Content Container
export const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

// Header Info Section
export const HeaderInfoSection = styled.div`
  padding-top: 110px;
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    padding-top: 80px;
  }
`;

export const ProfileName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 16px 0 8px;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const ProfileBio = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto 16px;
  line-height: 1.6;
`;

// Action Buttons Row
export const ActionButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;

  ${props => {
    if (props.$variant === 'primary') {
      return css`
        background: #3b82f6;
        color: white;
        &:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return css`
        background: #10b981;
        color: white;
        &:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `;
    }
    return css`
      background: white;
      color: #374151;
      border: 1.5px solid #d1d5db;
      &:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    `;
  }}

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Stats Row
export const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  text-align: center;

  .stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 4px;
  }
`;

// Tab Navigation
export const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e5e7eb;
  margin: 24px 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

export const TabButton = styled.button<{ $active?: boolean; $profileType: 'company' | 'dealer' | 'personal' }>`
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.$active ? profileThemes[props.$profileType].primary : '#6b7280'};
  border-bottom: 3px solid ${props => props.$active ? profileThemes[props.$profileType].primary : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: ${props => profileThemes[props.$profileType].primary};
  }
`;

// Main Content Grid
export const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div`
  animation: ${slideUp} 0.4s ease-out;
`;

export const SidebarColumn = styled.div`
  animation: ${slideUp} 0.4s ease-out 0.1s both;
`;

// Section Card
export const SectionCard = styled.div<{ $profileType: 'company' | 'dealer' | 'personal' }>`
  background: ${props => profileThemes[props.$profileType].cardBg};
  border: 1px solid ${props => profileThemes[props.$profileType].border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SectionContent = styled.div`
  color: #374151;
  line-height: 1.6;
`;

// Info Row
export const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  .icon {
    color: #6b7280;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .content {
    flex: 1;
    font-size: 0.95rem;
    color: #374151;
  }

  .label {
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
`;

// Cars Grid
export const CarsGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: 20px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const CarCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

export const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const CarInfo = styled.div`
  padding: 16px;
`;

export const CarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

export const CarPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 12px;
`;

export const CarSpecs = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: #6b7280;
  flex-wrap: wrap;
`;

export const CarSpec = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;
