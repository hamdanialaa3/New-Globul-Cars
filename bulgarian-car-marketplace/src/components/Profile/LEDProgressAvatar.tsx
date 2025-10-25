// src/components/Profile/LEDProgressAvatar.tsx
// LED Progress Avatar - Shows profile completion ring around avatar

import React from 'react';
import styled from 'styled-components';
import { calculateProfileCompletion, getProgressColor, getProgressMessage } from '../../utils/profile-completion';
import { BulgarianUser } from '../../firebase/auth-service';
import { useLanguage } from '../../contexts/LanguageContext';

// Profile Type
type ProfileType = 'private' | 'dealer' | 'company';

// Props Interface
interface LEDProgressAvatarProps {
  user: BulgarianUser | null;
  profileType: ProfileType;
  size?: number;  // Optional: override default size
  shape?: 'circle' | 'square';  // Optional: override default shape
  ledColor?: string;  // Optional: override default LED color
  showProgress?: boolean;  // Optional: hide progress text
  onClick?: () => void;  // Optional: click handler (e.g., open upload modal)
}

// Styled Components
const AvatarContainer = styled.div<{ size: number }>`
  position: relative;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  margin: 0 auto;
  cursor: ${p => p.onClick ? 'pointer' : 'default'};
  transition: transform 0.3s ease;
  z-index: ${p => p.onClick ? '5' : '1'};
  pointer-events: ${p => p.onClick ? 'auto' : 'none'};
  touch-action: ${p => p.onClick ? 'manipulation' : 'auto'};
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    transform: ${p => p.onClick ? 'scale(1.05)' : 'none'};
  }

  &:active {
    transform: ${p => p.onClick ? 'scale(1.02)' : 'none'};
  }
`;

const LEDRing = styled.svg<{ progress: number; color: string; size: number }>`
  position: absolute;
  top: ${p => -(p.size * 0.29)}px;
  left: ${p => p.size * 0.083}px;
  width: ${p => p.size * 1.21}px;
  height: ${p => p.size * 1.21}px;
  transform: rotate(-90deg) translateZ(0);
  pointer-events: none;
  
  /* ⚡ FIXED: Prevent any rendering issues */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  circle {
    fill: none;
    
    &.background {
      stroke: rgba(0, 0, 0, 0.1);
      stroke-width: 4;
    }
    
    &.progress {
      stroke: ${p => p.color};
      stroke-width: 4.5;
      stroke-dasharray: ${p => {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const dashLength = (p.progress / 100) * circumference;
        return `${dashLength} ${circumference}`;
      }};
      stroke-linecap: round;
      transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.2s ease;
      /* ⚡ FIXED: Removed drop-shadow to prevent flickering */
    }
  }
  
  /* ⚡ Gentle hover effect - only stroke-width change */
  &:hover circle.progress {
    stroke-width: 5.5;
  }
`;

const AvatarImage = styled.img<{ shape: string }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${p => p.shape === 'circle' ? '50%' : '12px'};
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  transition: transform 0.3s ease;
  
  /* ⚡ FIXED: Prevent image flickering */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
`;

const ProgressText = styled.div<{ progress: number }>`
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${p => getProgressColor(p.progress)};
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  text-align: center;
  min-width: 120px;
  
  /* ⚡ FIXED: Prevent text flickering */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const HelperText = styled.div`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #9ca3af;
  white-space: nowrap;
  text-align: center;
  
  /* ⚡ FIXED: Prevent text flickering */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const CompletionBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #16a34a;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.4);
  animation: completionPop 0.5s ease;
  
  @keyframes completionPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

// Default Sizes by Profile Type
const DEFAULT_SIZES: Record<ProfileType, number> = {
  private: 120,
  dealer: 216,
  company: 240
};

// Default Shapes by Profile Type
const DEFAULT_SHAPES: Record<ProfileType, 'circle' | 'square'> = {
  private: 'circle',
  dealer: 'circle',
  company: 'square'
};

// Default LED Colors by Profile Type
const DEFAULT_LED_COLORS: Record<ProfileType, string> = {
  private: '#FF8F10',   // Orange
  dealer: '#16a34a',    // Green
  company: '#1d4ed8'    // Blue
};

/**
 * LED Progress Avatar Component
 * Shows profile picture with animated LED ring indicating completion
 */
export const LEDProgressAvatar: React.FC<LEDProgressAvatarProps> = ({
  user,
  profileType,
  size,
  shape,
  ledColor,
  showProgress = true,
  onClick
}) => {
  const { language } = useLanguage();
  
  // Calculate completion percentage
  const progress = calculateProfileCompletion(user, profileType);
  
  // Use defaults if not provided
  const avatarSize = size || DEFAULT_SIZES[profileType];
  const avatarShape = shape || DEFAULT_SHAPES[profileType];
  const ringColor = ledColor || DEFAULT_LED_COLORS[profileType];
  
  // ⚡ FIXED: Better default avatar handling
  const getPhotoURL = (): string => {
    if (typeof user?.photoURL === 'string') {
      return user.photoURL;
    }
    if (typeof user?.profileImage === 'string') {
      return user.profileImage;
    }
    if (user?.profileImage && typeof user.profileImage === 'object' && 'url' in user.profileImage) {
      return user.profileImage.url;
    }
    // Generate default SVG avatar
    const initial = user?.firstName?.[0] || user?.businessName?.[0] || '?';
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect fill="%23f0f0f0" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Martica" font-size="48" fill="%23999"%3E${initial}%3C/text%3E%3C/svg%3E`;
  };

  const photoURL = getPhotoURL();
  
  // Get progress message
  const progressMessage = getProgressMessage(progress, language);
  
  return (
    <AvatarContainer 
      size={avatarSize} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Change profile picture' : 'Profile picture'}
    >
      {/* LED Progress Ring - Only show when showProgress is true */}
      {showProgress && (
        <LEDRing progress={progress} color={ringColor} size={avatarSize}>
          {/* Background circle (gray) */}
          <circle
            className="background"
            cx="50%"
            cy="50%"
            r="46"
            vectorEffect="non-scaling-stroke"
          />
          {/* Progress circle (colored) */}
          <circle
            className="progress"
            cx="50%"
            cy="50%"
            r="46"
            vectorEffect="non-scaling-stroke"
          />
        </LEDRing>
      )}
      
      {/* Avatar Image */}
      <AvatarImage 
        src={photoURL}
        alt={user?.displayName || user?.businessName || 'Profile'}
        shape={avatarShape}
        onError={(e) => {
          // ⚡ FIXED: Generate SVG placeholder with initials
          const initial = user?.firstName?.[0] || user?.businessName?.[0] || '?';
          (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect fill="%23${profileType === 'dealer' ? '16a34a' : profileType === 'company' ? '1d4ed8' : 'FF8F10'}" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Martica" font-size="56" font-weight="bold" fill="white"%3E${initial}%3C/text%3E%3C/svg%3E`;
        }}
        loading="eager"
      />
      
      {/* Completion Badge (100% only) */}
      {progress === 100 && (
        <CompletionBadge title="Profile Complete">
          ✓
        </CompletionBadge>
      )}
      
      {/* Progress Text */}
      {showProgress && (
        <>
          <ProgressText progress={progress}>
            {progressMessage}
          </ProgressText>
          
          {/* Helper Text (Company only, when not complete) */}
          {profileType === 'company' && progress < 100 && (
            <HelperText>
              {language === 'bg' 
                ? 'Завършете профила за достъп до всички функции'
                : 'Complete profile to unlock all enterprise features'}
            </HelperText>
          )}
        </>
      )}
    </AvatarContainer>
  );
};

// Export default
export default LEDProgressAvatar;

