import React, { memo } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const NavWrapper = styled.nav`
  position: fixed !important;
  bottom: 0 !important;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
  min-height: 56px;
  background: var(--bg-primary, #ffffff);
  border-top: 1px solid var(--border-primary, #e5e7eb);
  z-index: 9999;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  padding: 0;
  
  /* Hide on tablet+ (768px and up) */
  @media (min-width: 768px) {
    display: none !important;
  }
  
  /* Mobile safe area */
  @supports (padding: max(0px)) {
    padding-bottom: max(0px, env(safe-area-inset-bottom, 0px));
  }
`;

const NavContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 6px 8px;
  gap: 4px;
`;

const NavItem = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: ${props => props.$isActive ? 'rgba(168, 85, 247, 0.1)' : 'transparent'};
  border: none;
  padding: 6px 4px;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  color: ${props => props.$isActive ? 'var(--accent-primary, #a855f7)' : 'var(--text-secondary, #6b7280)'};
  flex: 1;
  min-height: 48px;
  max-width: 72px;
  transition: all 0.2s ease;
  border-radius: 10px;
  position: relative;
  
  &:active {
    transform: scale(0.92);
    background: ${props => props.$isActive ? 'rgba(168, 85, 247, 0.18)' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  svg {
    width: 22px;
    height: 22px;
    transition: all 0.2s ease;
    color: currentColor;
  }
  
  ${props => props.$isActive && `
    font-weight: 600;
    svg {
      transform: scale(1.1);
    }
  `}
`;

const NavLabel = styled.span<{ $isActive: boolean }>`
  font-size: 10px;
  font-weight: ${props => props.$isActive ? '700' : '500'};
  font-family: 'Martica', 'Arial', sans-serif;
  line-height: 1.2;
  color: currentColor;
  white-space: nowrap;
  letter-spacing: 0.2px;
`;

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 8px;
  background: var(--error);
  color: var(--text-inverse);
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

interface NavItemType {
  icon: (isActive: boolean) => React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

const HomeIcon = (isActive: boolean) => (
  <svg fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SearchIcon = (isActive: boolean) => (
  <svg fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = (isActive: boolean) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth={2} fill={isActive ? "currentColor" : "none"} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" stroke="currentColor" />
  </svg>
);

const HeartIcon = (isActive: boolean) => (
  <svg fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const UserIcon = (isActive: boolean) => (
  <svg fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

interface MobileBottomNavProps {
  messagesBadge?: number;
  favoritesBadge?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = memo(({
  messagesBadge,
  favoritesBadge
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems: NavItemType[] = [
    { icon: HomeIcon, label: 'Home', path: '/' },
    { icon: SearchIcon, label: 'Search', path: '/cars' },
    { icon: PlusIcon, label: 'Sell', path: '/sell' },
    { icon: HeartIcon, label: 'Favorites', path: '/favorites', badge: favoritesBadge },
    { icon: UserIcon, label: 'Profile', path: '/profile', badge: messagesBadge },
  ];
  
  const isPathActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <NavWrapper>
      <NavContent>
        {navItems.map((item: any) => {
          const isActive = isPathActive(item.path);
          
          return (
            <NavItem
              key={item.path}
              $isActive={isActive}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              style={{ position: 'relative' }}
            >
              {item.icon(isActive)}
              <NavLabel $isActive={isActive}>{item.label}</NavLabel>
              {item.badge && item.badge > 0 && (
                <Badge>{item.badge > 99 ? '99+' : item.badge}</Badge>
              )}
            </NavItem>
          );
        })}
      </NavContent>
    </NavWrapper>
  );
});
