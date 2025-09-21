// src/components/CustomIcons.tsx
// Ultra Professional Icons with Advanced Lighting and Shadow Effects

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaCar,
  FaCog,
  FaSearch,
  FaCheck,
  FaEuroSign,
  FaShieldAlt,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaFont,
  FaBell,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaComments,
  FaPaperPlane,
  FaInbox,
  FaEnvelope,
  FaMobileAlt,
  FaHeart,
  FaLock,
  FaUnlock,
  FaPlus,
  FaArrowLeft,
  FaKey,
  FaStar
} from 'react-icons/fa';

// Advanced Keyframe Animations
const fadeGlow = keyframes`
  0% { 
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba(59, 130, 246, 0.2),
      0 0 60px rgba(59, 130, 246, 0.1);
    transform: scale(1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(59, 130, 246, 0.6),
      0 0 60px rgba(59, 130, 246, 0.4),
      0 0 90px rgba(59, 130, 246, 0.2);
    transform: scale(1.02);
  }
  100% { 
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba(59, 130, 246, 0.2),
      0 0 60px rgba(59, 130, 246, 0.1);
    transform: scale(1);
  }
`;

const ghostShadow = keyframes`
  0% { 
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))
            drop-shadow(0 8px 16px rgba(0, 0, 0, 0.05));
  }
  50% { 
    filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))
            drop-shadow(0 16px 32px rgba(0, 0, 0, 0.1))
            drop-shadow(0 0 40px rgba(59, 130, 246, 0.3));
  }
  100% { 
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))
            drop-shadow(0 8px 16px rgba(0, 0, 0, 0.05));
  }
`;

const lightBeam = keyframes`
  0% { 
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
  }
  50% { 
    transform: translateX(0%);
  }
  100% { 
    transform: translateX(100%);
  }
`;

const floatingEffect = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
  }
  25% { 
    transform: translateY(-3px) rotate(1deg);
  }
  50% { 
    transform: translateY(-6px) rotate(0deg);
  }
  75% { 
    transform: translateY(-3px) rotate(-1deg);
  }
`;

// Ultra Professional Icon Wrapper with Ghost Effects
const UltraIconWrapper = styled.div<{
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  variant?: 'glow' | 'ghost' | 'beam' | 'float' | 'pulse' | 'luxury';
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || 24}px;
  height: ${({ size }) => size || 24}px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  overflow: visible;

  /* Base styling - removed circular background */
  background: transparent;

  /* Ghost shadow effect */
  ${({ variant }) => variant === 'ghost' && css`
    animation: ${ghostShadow} 3s ease-in-out infinite;
  `}

  /* Fade glow effect */
  ${({ variant, glowColor }) => variant === 'glow' && css`
    animation: ${fadeGlow} 2s ease-in-out infinite;
    box-shadow: 
      0 0 20px ${glowColor || 'rgba(59, 130, 246, 0.3)'},
      0 0 40px ${glowColor || 'rgba(59, 130, 246, 0.2)'};
  `}

  /* Floating effect */
  ${({ variant }) => variant === 'float' && css`
    animation: ${floatingEffect} 3s ease-in-out infinite;
  `}

  /* Light beam effect */
  ${({ variant }) => variant === 'beam' && css`
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: ${lightBeam} 3s linear infinite;
    }
  `}

  /* Removed pulse wave effect that creates circles */

  /* Removed luxury premium effect that creates circles */

  /* Advanced hover effects */
  &:hover {
    transform: translateY(-4px) scale(1.1);
    
    ${({ variant, glowColor }) => variant === 'glow' && css`
      box-shadow: 
        0 0 30px ${glowColor || 'rgba(59, 130, 246, 0.5)'},
        0 0 60px ${glowColor || 'rgba(59, 130, 246, 0.3)'},
        0 15px 35px rgba(0, 0, 0, 0.2);
    `}

    ${({ variant }) => variant === 'ghost' && css`
      filter: 
        drop-shadow(0 12px 30px rgba(0, 0, 0, 0.2))
        drop-shadow(0 0 50px rgba(59, 130, 246, 0.4));
    `}

    ${({ variant }) => variant === 'luxury' && css`
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(0, 0, 0, 0.3),
        0 8px 25px rgba(0, 0, 0, 0.3),
        0 16px 40px rgba(0, 0, 0, 0.2);
    `}
  }

  /* Icon styling with lighter colors */
  svg {
    z-index: 2;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    transition: all 0.3s ease;
    color: ${({ primaryColor }) => primaryColor || '#6366f1'};
    opacity: 0.9;
  }

  /* Removed reflection effect that creates circles */
`;

// Ultra Professional Icon Components with Ghost Effects

export const UltraFacebookIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#1877f2" 
    secondaryColor="#166fe5"
    glowColor="rgba(24, 119, 242, 0.4)"
    variant="glow"
  >
    <FaFacebookF />
  </UltraIconWrapper>
);

export const UltraInstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#E4405F" 
    secondaryColor="#F56040"
    glowColor="rgba(228, 64, 95, 0.4)"
    variant="glow"
  >
    <FaInstagram />
  </UltraIconWrapper>
);

export const UltraTwitterIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#1da1f2" 
    secondaryColor="#0d95e8"
    glowColor="rgba(29, 161, 242, 0.4)"
    variant="float"
  >
    <FaTwitter />
  </UltraIconWrapper>
);

export const UltraLinkedInIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#0077b5" 
    secondaryColor="#005885"
    glowColor="rgba(0, 119, 181, 0.4)"
    variant="ghost"
  >
    <FaLinkedinIn />
  </UltraIconWrapper>
);

export const UltraCarIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="beam"
  >
    <FaCar />
  </UltraIconWrapper>
);

export const UltraSettingsIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#8b5cf6" 
    secondaryColor="#7c3aed"
    glowColor="rgba(139, 92, 246, 0.4)"
    variant="float"
  >
    <FaCog />
  </UltraIconWrapper>
);

export const UltraSearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="glow"
  >
    <FaSearch />
  </UltraIconWrapper>
);

export const UltraCheckIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="luxury"
  >
    <FaCheck />
  </UltraIconWrapper>
);

export const UltraMoneyIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#f59e0b" 
    secondaryColor="#d97706"
    glowColor="rgba(245, 158, 11, 0.4)"
    variant="beam"
  >
    <FaEuroSign />
  </UltraIconWrapper>
);

export const UltraShieldIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="ghost"
  >
    <FaShieldAlt />
  </UltraIconWrapper>
);

export const UltraUserIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#8b5cf6" 
    secondaryColor="#7c3aed"
    variant="float"
  >
    <FaUser />
  </UltraIconWrapper>
);

export const UltraLogoutIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#ef4444" 
    secondaryColor="#dc2626"
    glowColor="rgba(239, 68, 68, 0.4)"
    variant="glow"
  >
    <FaSignOutAlt />
  </UltraIconWrapper>
);

export const UltraLoginIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="ghost"
  >
    <FaSignInAlt />
  </UltraIconWrapper>
);

export const UltraUserPlusIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="glow"
  >
    <FaUserPlus />
  </UltraIconWrapper>
);

export const UltraFontIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#8b5cf6" 
    secondaryColor="#7c3aed"
    variant="beam"
  >
    <FaFont />
  </UltraIconWrapper>
);

export const UltraBellIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#f59e0b" 
    secondaryColor="#d97706"
    glowColor="rgba(245, 158, 11, 0.4)"
    variant="glow"
  >
    <FaBell />
  </UltraIconWrapper>
);

// Additional Premium Icons
export const UltraHomeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#06b6d4" secondaryColor="#0891b2" variant="float">
    <FaHome />
  </UltraIconWrapper>
);

export const UltraLocationIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" glowColor="rgba(239, 68, 68, 0.4)" variant="glow">
    <FaMapMarkerAlt />
  </UltraIconWrapper>
);

export const UltraClockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#8b5cf6" secondaryColor="#7c3aed" variant="ghost">
    <FaClock />
  </UltraIconWrapper>
);

export const UltraChatIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#3b82f6" secondaryColor="#2563eb" glowColor="rgba(59, 130, 246, 0.4)" variant="beam">
    <FaComments />
  </UltraIconWrapper>
);

export const UltraSendIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" variant="beam">
    <FaPaperPlane />
  </UltraIconWrapper>
);

export const UltraInboxIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#06b6d4" secondaryColor="#0891b2" variant="float">
    <FaInbox />
  </UltraIconWrapper>
);

export const UltraEmailIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#3b82f6" secondaryColor="#2563eb" variant="ghost">
    <FaEnvelope />
  </UltraIconWrapper>
);

export const UltraMobileIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#22c55e" secondaryColor="#16a34a" variant="beam">
    <FaMobileAlt />
  </UltraIconWrapper>
);

export const UltraHeartIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" glowColor="rgba(239, 68, 68, 0.4)" variant="glow">
    <FaHeart />
  </UltraIconWrapper>
);

export const UltraLockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" variant="ghost">
    <FaLock />
  </UltraIconWrapper>
);

export const UltraUnlockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" variant="glow">
    <FaUnlock />
  </UltraIconWrapper>
);

export const UltraPlusIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" glowColor="rgba(16, 185, 129, 0.4)" variant="glow">
    <FaPlus />
  </UltraIconWrapper>
);

export const UltraArrowLeftIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#3b82f6" secondaryColor="#2563eb" variant="float">
    <FaArrowLeft />
  </UltraIconWrapper>
);

export const UltraKeyIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#f59e0b" secondaryColor="#d97706" variant="beam">
    <FaKey />
  </UltraIconWrapper>
);

export const UltraStarIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#f59e0b" secondaryColor="#d97706" glowColor="rgba(245, 158, 11, 0.4)" variant="glow">
    <FaStar />
  </UltraIconWrapper>
);

// Professional Icon Components
export const ProfessionalFacebookIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#1877f2" 
    secondaryColor="#166fe5"
    glowColor="rgba(24, 119, 242, 0.4)"
    variant="glow"
  >
    <FaFacebookF />
  </UltraIconWrapper>
);

export const ProfessionalInstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#E4405F" 
    secondaryColor="#F56040"
    glowColor="rgba(228, 64, 95, 0.4)"
    variant="luxury"
  >
    <FaInstagram />
  </UltraIconWrapper>
);

export const ProfessionalTwitterIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#1da1f2" 
    secondaryColor="#0d95e8"
    glowColor="rgba(29, 161, 242, 0.4)"
    variant="pulse"
  >
    <FaTwitter />
  </UltraIconWrapper>
);

export const ProfessionalLinkedInIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#0077b5" 
    secondaryColor="#005885"
    glowColor="rgba(0, 119, 181, 0.4)"
    variant="ghost"
  >
    <FaLinkedinIn />
  </UltraIconWrapper>
);

export const ProfessionalCarIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="beam"
  >
    <FaCar />
  </UltraIconWrapper>
);

export const ProfessionalSettingsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#6b7280" 
    secondaryColor="#374151"
    glowColor="rgba(107, 114, 128, 0.4)"
    variant="float"
  >
    <FaCog />
  </UltraIconWrapper>
);

export const ProfessionalSearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="glow"
  >
    <FaSearch />
  </UltraIconWrapper>
);

export const ProfessionalCheckIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="luxury"
  >
    <FaCheck />
  </UltraIconWrapper>
);

export const ProfessionalMoneyIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#f59e0b" 
    secondaryColor="#d97706"
    glowColor="rgba(245, 158, 11, 0.4)"
    variant="beam"
  >
    <FaEuroSign />
  </UltraIconWrapper>
);

export const ProfessionalShieldIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="ghost"
  >
    <FaShieldAlt />
  </UltraIconWrapper>
);

export const ProfessionalUserIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#6b7280" 
    secondaryColor="#374151"
    variant="float"
  >
    <FaUser />
  </UltraIconWrapper>
);

export const ProfessionalLogoutIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#ef4444" 
    secondaryColor="#dc2626"
    glowColor="rgba(239, 68, 68, 0.4)"
    variant="glow"
  >
    <FaSignOutAlt />
  </UltraIconWrapper>
);

export const ProfessionalLoginIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#10b981" 
    secondaryColor="#059669"
    glowColor="rgba(16, 185, 129, 0.4)"
    variant="ghost"
  >
    <FaSignInAlt />
  </UltraIconWrapper>
);

export const ProfessionalUserPlusIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#3b82f6" 
    secondaryColor="#2563eb"
    glowColor="rgba(59, 130, 246, 0.4)"
    variant="pulse"
  >
    <FaUserPlus />
  </UltraIconWrapper>
);

export const ProfessionalFontIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#6b7280" 
    secondaryColor="#374151"
    variant="beam"
  >
    <FaFont />
  </UltraIconWrapper>
);

export const ProfessionalBellIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper 
    size={size} 
    primaryColor="#f59e0b" 
    secondaryColor="#d97706"
    glowColor="rgba(245, 158, 11, 0.4)"
    variant="pulse"
  >
    <FaBell />
  </UltraIconWrapper>
);

export const ProfessionalHomeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#6b7280" secondaryColor="#374151" variant="float">
    <FaHome />
  </UltraIconWrapper>
);

export const ProfessionalLocationIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" glowColor="rgba(239, 68, 68, 0.4)" variant="glow">
    <FaMapMarkerAlt />
  </UltraIconWrapper>
);

export const ProfessionalClockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#6b7280" secondaryColor="#374151" variant="ghost">
    <FaClock />
  </UltraIconWrapper>
);

export const ProfessionalChatIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#3b82f6" secondaryColor="#2563eb" glowColor="rgba(59, 130, 246, 0.4)" variant="beam">
    <FaComments />
  </UltraIconWrapper>
);

export const ProfessionalSendIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" variant="luxury">
    <FaPaperPlane />
  </UltraIconWrapper>
);

export const ProfessionalInboxIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#6b7280" secondaryColor="#374151" variant="float">
    <FaInbox />
  </UltraIconWrapper>
);

export const ProfessionalEmailIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#3b82f6" secondaryColor="#2563eb" variant="ghost">
    <FaEnvelope />
  </UltraIconWrapper>
);

export const ProfessionalMobileIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#6b7280" secondaryColor="#374151" variant="beam">
    <FaMobileAlt />
  </UltraIconWrapper>
);

export const ProfessionalHeartIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" glowColor="rgba(239, 68, 68, 0.4)" variant="pulse">
    <FaHeart />
  </UltraIconWrapper>
);

export const ProfessionalLockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#ef4444" secondaryColor="#dc2626" variant="luxury">
    <FaLock />
  </UltraIconWrapper>
);

export const ProfessionalUnlockIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" variant="glow">
    <FaUnlock />
  </UltraIconWrapper>
);

export const ProfessionalPlusIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#10b981" secondaryColor="#059669" glowColor="rgba(16, 185, 129, 0.4)" variant="pulse">
    <FaPlus />
  </UltraIconWrapper>
);

export const ProfessionalArrowLeftIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#6b7280" secondaryColor="#374151" variant="float">
    <FaArrowLeft />
  </UltraIconWrapper>
);

export const ProfessionalKeyIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#f59e0b" secondaryColor="#d97706" variant="beam">
    <FaKey />
  </UltraIconWrapper>
);

export const ProfessionalStarIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <UltraIconWrapper size={size} primaryColor="#f59e0b" secondaryColor="#d97706" glowColor="rgba(245, 158, 11, 0.4)" variant="luxury">
    <FaStar />
  </UltraIconWrapper>
);