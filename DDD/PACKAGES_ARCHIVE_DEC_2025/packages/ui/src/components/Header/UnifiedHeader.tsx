import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X, User, Settings, Heart, MessageCircle, Bell, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@globul-cars/coreuseAuth';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { media, spacing, colors, zIndex, shadows, borderRadius } from '../../styles/design-system';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import CyberToggle from '../CyberToggle/CyberToggle';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${colors.surface.border};
  z-index: ${zIndex.sticky};
  box-shadow: ${shadows.sticky};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md};
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;

  ${media.maxMobile} {
    height: 60px;
    padding: ${spacing.sm} ${spacing.md};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  color: ${colors.primary.main};

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }

  ${media.maxMobile} {
    font-size: 18px;
    img {
      width: 40px;
      height: 40px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${spacing.md};

  ${media.maxMobile} {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: ${colors.neutral.gray700};
  border-radius: ${borderRadius.md};
  transition: all 0.2s;

  &:hover {
    background: ${colors.neutral.gray100};
    color: ${colors.primary.main};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  color: ${colors.neutral.gray700};
  transition: all 0.2s;

  &:hover {
    background: ${colors.neutral.gray100};
  }

  ${media.maxMobile} {
    width: 36px;
    height: 36px;
  }
`;

const MenuButton = styled(IconButton)`
  display: none;

  ${media.maxMobile} {
    display: flex;
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: none;
  background: ${colors.primary.main};
  color: white;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primary.dark};
  }

  ${media.maxMobile} {
    padding: ${spacing.xs} ${spacing.sm};
    font-size: 14px;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: ${zIndex.modal};
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s;
  overflow-y: auto;
  padding: ${spacing.lg};
  display: none;

  ${media.maxMobile} {
    display: block;
  }
`;

const MobileMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  border: none;
  background: transparent;
  text-align: left;
  font-size: 16px;
  color: ${colors.neutral.gray900};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.neutral.gray100};
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.modalBackdrop};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s, visibility 0.3s;
`;

const UnifiedHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>
            <img src="/Logo1.png" alt="GLOBUL AUTO" />
            <span>GLOBUL AUTO</span>
          </Logo>

          <Nav>
            <NavLink onClick={() => navigate('/')}>{t('nav.home')}</NavLink>
            <NavLink onClick={() => navigate('/cars')}>{t('nav.cars')}</NavLink>
            <NavLink onClick={() => navigate('/sell')}>{t('home.hero.sellCar')}</NavLink>
            <NavLink onClick={() => navigate('/dealers')}>{t('nav.dealers')}</NavLink>
          </Nav>

          <Actions>
            <LanguageToggle size="small" showText={false} />
            <CyberToggle />
            <IconButton onClick={() => navigate('/favorites')} title={t('nav.favorites')}>
              <Heart size={20} />
            </IconButton>
            <IconButton onClick={() => navigate('/messages')} title={t('nav.messages')}>
              <MessageCircle size={20} />
            </IconButton>
            <IconButton onClick={() => navigate('/events')} title={t('nav.events')}>
              <Calendar size={20} />
            </IconButton>
            <IconButton>
              <Bell size={20} />
            </IconButton>

            {user ? (
              <UserButton onClick={() => navigate('/profile')}>
                <User size={18} />
                <span>{user.displayName || user.email?.split('@')[0]}</span>
              </UserButton>
            ) : (
              <UserButton onClick={() => navigate('/login')}>
                {t('nav.login')}
              </UserButton>
            )}

            <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MenuButton>
          </Actions>
        </HeaderContent>
      </HeaderContainer>

      <Overlay $isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

      <MobileMenu $isOpen={isMenuOpen}>
        <MobileMenuItem onClick={() => navigate('/')}>
          {t('nav.home')}
        </MobileMenuItem>
        <MobileMenuItem onClick={() => navigate('/cars')}>
          {t('nav.cars')}
        </MobileMenuItem>
        <MobileMenuItem onClick={() => navigate('/sell')}>
          {t('home.hero.sellCar')}
        </MobileMenuItem>
        <MobileMenuItem onClick={() => navigate('/dealers')}>
          {t('nav.dealers')}
        </MobileMenuItem>
        <MobileMenuItem onClick={() => navigate('/favorites')}>
          <Heart size={20} />
          {t('nav.favorites')}
        </MobileMenuItem>
        <MobileMenuItem onClick={() => navigate('/messages')}>
          <MessageCircle size={20} />
          {t('nav.messages')}
        </MobileMenuItem>
        {user && (
          <>
            <MobileMenuItem onClick={() => navigate('/profile')}>
              <User size={20} />
              {t('header.myProfile')}
            </MobileMenuItem>
            <MobileMenuItem onClick={() => navigate('/dashboard')}>
              <Settings size={20} />
              {t('header.overview')}
            </MobileMenuItem>
            <MobileMenuItem onClick={handleLogout}>
              <LogOut size={20} />
              {t('header.logout')}
            </MobileMenuItem>
          </>
        )}
      </MobileMenu>
    </>
  );
};

export default UnifiedHeader;
