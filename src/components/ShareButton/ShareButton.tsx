import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Share2, Copy, Check, Facebook, Linkedin, Mail, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../Toast';
import { logger } from '../../services/logger-service';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Share Button Component
 * احترافي و أنيق لمشاركة الروابط الفريدة
 * 
 * المميزات:
 * - نسخ الرابط إلى Clipboard
 * - مشاركة عبر Social Media
 * - تأثيرات بصرية احترافية
 * - دعم اللغات (AR/EN)
 */

const ShareContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ShareButtonStyled = styled.button<{ $variant: 'icon' | 'button'; $size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${(props) => {
    switch (props.$size) {
      case 'sm': return '0.5rem 0.75rem';
      case 'lg': return '1rem 1.5rem';
      default: return '0.75rem 1rem';
    }
  }};
  font-size: ${(props) => {
    switch (props.$size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1.125rem';
      default: return '1rem';
    }
  }};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  ${(props) => props.$variant === 'icon' && `
    padding: ${props.$size === 'sm' ? '0.5rem' : props.$size === 'lg' ? '0.875rem' : '0.75rem'};
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    svg {
      width: ${props.$size === 'sm' ? '18px' : props.$size === 'lg' ? '24px' : '20px'};
      height: ${props.$size === 'sm' ? '18px' : props.$size === 'lg' ? '24px' : '20px'};
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0px);
  }

  svg {
    transition: all 0.3s ease;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ShareMenu = styled.div<{ $isOpen: boolean; $position?: 'top' | 'bottom' }>`
  position: absolute;
  bottom: ${(props) => props.$position === 'top' ? 'auto' : 'calc(100% + 10px)'};
  top: ${(props) => props.$position === 'top' ? 'calc(100% + 10px)' : 'auto'};
  left: 50%;
  transform: translateX(-50%) scale(${(props) => props.$isOpen ? 1 : 0.95});
  opacity: ${(props) => props.$isOpen ? 1 : 0};
  visibility: ${(props) => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);

  &::before {
    content: '';
    position: absolute;
    ${(props) => props.$position === 'top' ? 'bottom: 100%' : 'top: 100%'};
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-${(props) => props.$position === 'top' ? 'bottom' : 'top'}: 8px solid white;
  }
`;

const ShareMenuHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
`;

const ShareMenuTitle = styled.h4`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShareOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ShareOption = styled.button<{ $isCopied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${(props) => props.$isCopied ? 'rgba(34, 197, 94, 0.05)' : 'transparent'};
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: ${(props) => props.$isCopied ? '#22c55e' : '#333'};
  font-size: 0.95rem;
  font-weight: 500;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(props) => props.$isCopied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(102, 126, 234, 0.08)'};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const URLInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-radius: 6px;
  margin: 1rem;
  margin-top: 0;

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.85rem;
    color: #666;
    font-family: 'Monaco', 'Courier', monospace;
    padding: 0;
    outline: none;

    &::selection {
      background: rgba(102, 126, 234, 0.3);
    }
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: #764ba2;
    transform: scale(1.1);
  }
`;

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = 'جديد Globul Cars',
  text,
  showLabel = true,
  variant = 'button',
  size = 'md'
}) => {
  const { language } = useLanguage();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const translations = {
    bg: {
      share: 'Сподели',
      shareProfile: 'Сподели профил',
      copyLink: 'Копирай линка',
      facebook: 'Фейсбук',
      linkedin: 'LinkedIn',
      email: 'Имейл',
      twitter: 'Twitter',
      copied: 'Линкът е копиран! ✓',
      shareTo: 'Сподели за'
    },
    en: {
      share: 'Share',
      shareProfile: 'Share Profile',
      copyLink: 'Copy Link',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      email: 'Email',
      twitter: 'Twitter',
      copied: 'Link copied! ✓',
      shareTo: 'Share to'
    }
  };

  const t = translations[language] || translations.en;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast?.success(t.copied);
      logger.info('Link copied to clipboard', { url });

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy link', error as Error);
      toast?.error('خطأ في نسخ الرابط');
    }
  };

  const shareVia = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text || title);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    };

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      logger.info('Share triggered', { platform, url });
    }

    setIsOpen(false);
  };

  return (
    <ShareContainer>
      <ShareButtonStyled
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        $variant={variant}
        $size={size}
        title={t.shareProfile}
        aria-label={t.shareProfile}
      >
        <Share2 />
        {showLabel && variant === 'button' && <span>{t.share}</span>}
      </ShareButtonStyled>

      <ShareMenu ref={menuRef} $isOpen={isOpen} $position="bottom">
        <ShareMenuHeader>
          <ShareMenuTitle>{t.shareTo}</ShareMenuTitle>
        </ShareMenuHeader>

        <URLInput>
          <input type="text" value={url} readOnly />
          <CopyButton
            onClick={copyToClipboard}
            title={t.copyLink}
            aria-label={t.copyLink}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </CopyButton>
        </URLInput>

        <ShareOptions>
          <ShareOption
            $isCopied={isCopied}
            onClick={copyToClipboard}
          >
            <Copy size={18} />
            <span>{t.copyLink}</span>
          </ShareOption>

          <ShareOption onClick={() => shareVia('facebook')}>
            <Facebook size={18} color="#1877F2" />
            <span>{t.facebook}</span>
          </ShareOption>

          <ShareOption onClick={() => shareVia('linkedin')}>
            <Linkedin size={18} color="#0077B5" />
            <span>{t.linkedin}</span>
          </ShareOption>

          <ShareOption onClick={() => shareVia('twitter')}>
            <X size={18} color="#1DA1F2" />
            <span>Twitter/X</span>
          </ShareOption>

          <ShareOption onClick={() => shareVia('email')}>
            <Mail size={18} color="#EA4335" />
            <span>{t.email}</span>
          </ShareOption>
        </ShareOptions>
      </ShareMenu>
    </ShareContainer>
  );
};

export default ShareButton;
