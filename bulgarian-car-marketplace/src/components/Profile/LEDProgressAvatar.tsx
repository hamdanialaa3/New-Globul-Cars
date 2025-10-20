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
  
  &:hover {
    transform: ${p => p.onClick ? 'scale(1.05)' : 'none'};
  }
`;

const LEDRing = styled.svg<{ progress: number; color: string }>`
  position: absolute;
  top: -35px;
  left: 10px;
  width: 145px;
  height: 145px;
  transform: rotate(-90deg);
  pointer-events: none;
  will-change: transform;  /* ⚡ GPU acceleration */
  
  circle {
    fill: none;
    
    &.background {
      stroke: rgba(0, 0, 0, 0.1);
      stroke-width: 4;
    }
    
    &.progress {
      stroke: ${p => p.color};
      stroke-width: 4.5;  /* ⚡ أعرض قليلاً للجمالية */
      stroke-dasharray: ${p => {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const dashLength = (p.progress / 100) * circumference;
        return `${dashLength} ${circumference}`;
      }};
      stroke-linecap: round;
      /* ⚡ OPTIMIZED: Static glow instead of animated pulse */
      filter: drop-shadow(0 0 6px ${p => p.color}40) drop-shadow(0 0 2px ${p => p.color});
      transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      /* ⚡ NO MORE INFINITE ANIMATION - only on hover */
    }
  }
  
  /* ⚡ Gentle hover effect instead of constant animation */
  &:hover circle.progress {
    filter: drop-shadow(0 0 8px ${p => p.color}60) drop-shadow(0 0 3px ${p => p.color});
    stroke-width: 5;
  }
`;

const AvatarImage = styled.img<{ shape: string }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${p => p.shape === 'circle' ? '50%' : '12px'};
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
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
  
  // Get photo URL or use default
  const photoURL = user?.photoURL || '/assets/images/default-avatar.png';
  
  // Get progress message
  const progressMessage = getProgressMessage(progress, language);
  
  return (
    <AvatarContainer 
      size={avatarSize} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Change profile picture' : 'Profile picture'}
    >
      {/* LED Progress Ring */}
      <LEDRing progress={progress} color={ringColor}>
        {/* Background circle (gray) */}
        <circle
          className="background"
          cx="50"
          cy="50"
          r="46"
          vectorEffect="non-scaling-stroke"
        />
        {/* Progress circle (colored) */}
        <circle
          className="progress"
          cx="50"
          cy="50"
          r="46"
          vectorEffect="non-scaling-stroke"
        />
      </LEDRing>
      
      {/* Avatar Image */}
      <AvatarImage 
        src={photoURL}
        alt={user?.displayName || 'Profile'}
        shape={avatarShape}
        onError={(e) => {
          // Fallback to default avatar on error
          (e.target as HTMLImageElement).src = '/assets/images/default-avatar.png';
        }}
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

