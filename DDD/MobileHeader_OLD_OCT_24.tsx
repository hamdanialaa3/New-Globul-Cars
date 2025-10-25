import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.grey?.[200] || '#e5e7eb'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  /* Hide on desktop - desktop header will handle that */
  @media (min-width: 768px) {
    display: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120px; /* ✅ MOBILE: Increased from 60px to 120px (200%) for better visibility */
  padding: 0 16px;
  max-width: 100%;
`;

const Logo = styled.img`
  height: 64px; /* ✅ MOBILE: Increased from 32px to 64px (200%) to match header size */
  width: auto;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.7;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px; /* ✅ MOBILE: Increased from 44px to 64px for better touch targets */
  height: 64px; /* ✅ MOBILE: Increased from 44px to 64px for better touch targets */
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.text || '#333'};
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  border-radius: 12px; /* ✅ Increased border-radius proportionally */
  transition: background 0.2s;
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
  
  svg {
    width: 36px; /* ✅ MOBILE: Increased from 24px to 36px (150%) */
    height: 36px; /* ✅ MOBILE: Increased from 24px to 36px (150%) */
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 120px; /* ✅ MOBILE: Updated from 60px to match new header height */
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  padding: 0;
  z-index: 49;
  
  /* Smooth scroll */
  -webkit-overflow-scrolling: touch;
`;

const MenuSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.grey?.[200] || '#e5e7eb'};
`;

const MenuLink = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Martica', 'Arial', sans-serif;
  color: ${props => props.theme.colors.text || '#333'};
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.text?.secondary || '#666'};
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 120px; /* ✅ MOBILE: Updated from 60px to match new header height */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 48;
`;

interface MobileHeaderProps {
  logoSrc?: string;
  onLogoClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  logoSrc = '/logo.png',
  onLogoClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const handleNavigation = (path: string) => {
    navigate(path);
    closeMenu();
  };
  
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
    closeMenu();
  };
  
  return (
    <>
      <HeaderWrapper>
        <HeaderContent>
          <IconButton onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </IconButton>
          
          <Logo src={logoSrc} alt="Logo" onClick={handleLogoClick} />
          
          <ButtonGroup>
            <IconButton onClick={() => handleNavigation('/cars')} aria-label="Search">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </IconButton>
            <IconButton onClick={() => handleNavigation('/profile')} aria-label="Profile">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </IconButton>
          </ButtonGroup>
        </HeaderContent>
      </HeaderWrapper>
      
      <Overlay $isOpen={isMenuOpen} onClick={closeMenu} />
      
      <MobileMenu $isOpen={isMenuOpen}>
        <MenuSection>
          <MenuLink onClick={() => handleNavigation('/')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </MenuLink>
          <MenuLink onClick={() => handleNavigation('/cars')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Browse Cars
          </MenuLink>
          <MenuLink onClick={() => handleNavigation('/sell')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Sell a Car
          </MenuLink>
        </MenuSection>
        
        <MenuSection>
          <MenuLink onClick={() => handleNavigation('/favorites')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Favorites
          </MenuLink>
          <MenuLink onClick={() => handleNavigation('/messages')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </MenuLink>
          <MenuLink onClick={() => handleNavigation('/my-listings')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Listings
          </MenuLink>
        </MenuSection>
        
        <MenuSection>
          <MenuLink onClick={() => handleNavigation('/profile')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </MenuLink>
          <MenuLink onClick={() => handleNavigation('/help')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </MenuLink>
        </MenuSection>
      </MobileMenu>
    </>
  );
};
