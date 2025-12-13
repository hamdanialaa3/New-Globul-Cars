// FloatingShareButton.tsx
// زر المشاركة العائم بتأثير القرص الدوار (Spinning Dial)
// يظهر في صفحة البروفايل فوق زر Sync

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Share2, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const spinCenter = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

// ==================== STYLED COMPONENTS ====================

const FloatingContainer = styled.div<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  margin-right: 8px;
`;

const ShareContainer = styled.div<{ $active: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Expand container when active to fit icons */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$active && css`
    width: 280px;
    height: 280px;
  `}
`;

// Backdrop - للإغلاق عند الضغط في الوسط
const Backdrop = styled.div<{ $active: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  opacity: ${props => props.$active ? 1 : 0};
  pointer-events: ${props => props.$active ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
`;

const ShareButton = styled.button<{ $spinning: boolean }>`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 1000;
  
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: white;
  font-size: 20px;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.$spinning && css`
    animation: ${spinCenter} 0.6s ease-in-out forwards;
  `}
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    
    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const IconContainer = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  pointer-events: ${props => props.$active ? 'auto' : 'none'};
`;

const SocialIcon = styled.a<{ $r: number; $a: number; $active: boolean; $accent: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  opacity: ${props => props.$active ? 1 : 0};
  pointer-events: ${props => props.$active ? 'auto' : 'none'};
  
  /* الحركة الأولية: جميع الأيقونات في المنتصف */
  transform: translate(-50%, -50%) 
             rotate(${props => props.$a}deg) 
             translate(0, 0) 
             rotate(${props => -props.$a}deg);
  
  /* الحركة النهائية: تنتشر في دائرة */
  ${props => props.$active && css`
    transform: translate(-50%, -50%) 
               rotate(${props.$a}deg) 
               translate(${props.$r}px, 0) 
               rotate(${-props.$a}deg);
  `}
  
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.4s ease-out,
              border-color 0.2s;
  
  border: 3px solid transparent;
  
  &:hover {
    border-color: ${props => props.$accent};
    transform: translate(-50%, -50%) 
               rotate(${props => props.$a}deg) 
               translate(${props => props.$r}px, 0) 
               rotate(${props => -props.$a}deg)
               scale(1.15);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  img {
    width: 60%;
    height: 60%;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
  }
`;

const CloseOverlay = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  opacity: ${props => props.$active ? 1 : 0};
  pointer-events: ${props => props.$active ? 'auto' : 'none'};
  z-index: 5;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(4px)'};
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 20;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 16px;
    border: 6px solid transparent;
    border-top-color: rgba(15, 23, 42, 0.95);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

// ==================== COMPONENT ====================

interface SocialLink {
  name: string;
  url: (currentUrl: string) => string;
  icon: string;
  accent: string;
  angle: number;
}

export const FloatingShareButton: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const profileUrl = user ? `${window.location.origin}/profile/${user.uid}` : currentUrl;
  
  const socialLinks: SocialLink[] = [
    {
      name: 'Profile',
      url: (url) => profileUrl,
      icon: 'https://cdn-icons-png.flaticon.com/512/747/747376.png',
      accent: '#8b5cf6',
      angle: 0
    },
    {
      name: 'Facebook',
      url: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174848.png',
      accent: '#1877F2',
      angle: 51.4
    },
    {
      name: 'Instagram',
      url: (url) => `https://www.instagram.com/`,
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
      accent: '#E1306C',
      angle: 102.8
    },
    {
      name: 'Twitter',
      url: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
      accent: '#1DA1F2',
      angle: 154.2
    },
    {
      name: 'LinkedIn',
      url: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
      accent: '#0A66C2',
      angle: 205.6
    },
    {
      name: 'WhatsApp',
      url: (url) => `https://wa.me/?text=${encodeURIComponent(profileUrl)}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      accent: '#25D366',
      angle: 257
    },
    {
      name: 'Telegram',
      url: (url) => `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
      accent: '#0088cc',
      angle: 308.4
    }
  ];
  
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // تشغيل الدوران
    setIsSpinning(true);
    
    // تبديل الحالة
    setIsActive(!isActive);
    
    // تتبع في Analytics
    logger.info('FloatingShareButton toggled', { isActive: !isActive });
  };
  
  const handleSocialClick = (platform: string, url: string) => {
    if (platform === 'Profile') {
      // نسخ رابط البروفايل
      navigator.clipboard.writeText(url);
      logger.info('Profile link copied', { url });
      setIsActive(false);
    } else {
      logger.info('Share clicked', { platform, url });
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
      setIsActive(false);
    }
  };
  
  const handleAnimationEnd = () => {
    setIsSpinning(false);
  };
  
  const handleBackdropClick = () => {
    setIsActive(false);
  };
  
  const tooltipText = {
    bg: isActive ? 'إغلاق المشاركة' : 'مشاركة البروفايل',
    en: isActive ? 'Close Share' : 'Share Profile'
  };
  
  return (
    <>
      <Backdrop $active={isActive} onClick={handleBackdropClick} />
      <FloatingContainer $active={isActive}>
        <ShareContainer $active={isActive}>
          <ShareButton
            $spinning={isSpinning}
            onClick={handleToggle}
            onAnimationEnd={handleAnimationEnd}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label={isActive ? 'Close share menu' : 'Open share menu'}
          >
            <Share2 size={20} />
          </ShareButton>
          
          <Tooltip $show={showTooltip && !isActive}>
            {tooltipText[language as keyof typeof tooltipText] || tooltipText.en}
          </Tooltip>
        
        <IconContainer $active={isActive}>
          {socialLinks.map((social) => (
            <SocialIcon
              key={social.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSocialClick(social.name, social.url(currentUrl));
              }}
              $r={120}
              $a={social.angle}
              $active={isActive}
              $accent={social.accent}
              title={social.name}
            >
              <img src={social.icon} alt={social.name} />
            </SocialIcon>
          ))}
          </IconContainer>
        </ShareContainer>
      </FloatingContainer>
    </>
  );
};

export default FloatingShareButton;
