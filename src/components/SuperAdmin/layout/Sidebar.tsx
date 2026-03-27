// src/components/SuperAdmin/layout/Sidebar.tsx
import React from 'react';
import styled, { css } from 'styled-components';
import { adminTheme } from '../styles/admin-theme';
import { useAdminLang } from '../../../contexts/AdminLanguageContext';
import {
  LayoutDashboard,
  Users,
  Car,
  BarChart2,
  Settings,
  FileText,
  Shield,
  DollarSign,
  Database,
  Globe,
  Cpu,
  LogOut
} from 'lucide-react';
import GlobulCarLogo from '../../../components/icons/GlobulCarLogo';

const SidebarContainer = styled.aside`
  width: ${adminTheme.layout.sidebarWidth};
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: ${adminTheme.colors.bg.secondary};
  border-right: 1px solid ${adminTheme.colors.border.subtle};
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: width 0.3s ease;
  
  [dir="rtl"] & {
    left: auto;
    right: 0;
    border-right: none;
    border-left: 1px solid ${adminTheme.colors.border.subtle};
  }
  
  /* Glassmorphism subtle effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    backdrop-filter: blur(10px);
    z-index: -1;
  }
`;

const LogoArea = styled.div`
  height: ${adminTheme.layout.headerHeight};
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid ${adminTheme.colors.border.subtle};
  gap: 12px;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
  }
`;

const LogoText = styled.h1`
  font-family: ${adminTheme.typography.fontFamily.sans};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${adminTheme.colors.text.primary};
  letter-spacing: -0.5px;
  
  span {
    color: ${adminTheme.colors.accent.primary};
  }
`;

const NavList = styled.nav`
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${adminTheme.colors.bg.tertiary};
    border-radius: 4px;
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${adminTheme.colors.text.muted};
  margin-bottom: 0.75rem;
  padding-left: 0.75rem;
  letter-spacing: 1px;
  font-weight: 600;
  
  [dir="rtl"] & {
    padding-left: 0;
    padding-right: 0.75rem;
  }
`;

const NavItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  color: ${p => p.$active ? '#fff' : adminTheme.colors.text.secondary};
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  border-left: 3px solid ${p => p.$active ? adminTheme.colors.accent.primary : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  [dir="rtl"] & {
    border-left: none;
    border-right: 3px solid ${p => p.$active ? adminTheme.colors.accent.primary : 'transparent'};
  }

  &:hover {
    background: ${p => p.$active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    color: ${p => !p.$active && adminTheme.colors.text.primary};
  }

  /* Active glow effect */
  ${p => p.$active && css`
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${adminTheme.colors.accent.primary};
      box-shadow: 0 0 10px ${adminTheme.colors.accent.primary};
      
      [dir="rtl"] & {
        left: auto;
        right: 0;
      }
    }
  `}

  svg {
    width: 18px;
    height: 18px;
    opacity: ${p => p.$active ? 1 : 0.7};
  }
`;

const NavLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;

const UserProfile = styled.div`
  padding: 1rem;
  border-top: 1px solid ${adminTheme.colors.border.subtle};
  background: rgba(15, 23, 42, 0.3);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${adminTheme.colors.accent.primary}, ${adminTheme.colors.accent.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  
  h4 {
    font-size: 0.85rem;
    color: ${adminTheme.colors.text.primary};
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    font-size: 0.75rem;
    color: ${adminTheme.colors.text.muted};
    margin: 0;
  }
`;

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const { t } = useAdminLang();

  const menuItems = [
    { id: 'overview', label: t.navigation.overview, icon: LayoutDashboard },
    { id: 'analytics', label: t.navigation.analytics, icon: BarChart2 },
  ];

  const managementItems = [
    { id: 'users', label: t.common.users, icon: Users },
    { id: 'dealers', label: t.navigation.dealers, icon: Shield },
    { id: 'cars', label: t.navigation.cars, icon: Car },
    { id: 'page-builder', label: 'Pages & Sections', icon: LayoutDashboard },
    { id: 'content', label: t.navigation.content, icon: FileText },
  ];

  const systemItems = [
    { id: 'finance', label: t.navigation.finance, icon: DollarSign },
    { id: 'ai', label: t.navigation.ai_tools, icon: Cpu },
    { id: 'iot', label: t.navigation.iot, icon: Globe },
    { id: 'audit', label: t.navigation.audit, icon: Database },
    { id: 'reports', label: t.navigation.reports, icon: FileText }, // Added missing reports
    { id: 'settings', label: t.navigation.system, icon: Settings },
  ];

  return (
    <SidebarContainer>
      <LogoArea>
        <GlobulCarLogo size={32} />
        <LogoText>KOLI<span>.ONE</span> Admin</LogoText>
      </LogoArea>

      <NavList>
        <NavSection>
          <SectionTitle>Main</SectionTitle>
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              $active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon />
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          ))}
        </NavSection>

        <NavSection>
          <SectionTitle>{t.navigation.management}</SectionTitle>
          {managementItems.map(item => (
            <NavItem
              key={item.id}
              $active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon />
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          ))}
        </NavSection>

        <NavSection>
          <SectionTitle>{t.navigation.system}</SectionTitle>
          {systemItems.map(item => (
            <NavItem
              key={item.id}
              $active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon />
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          ))}
        </NavSection>
      </NavList>

      <UserProfile>
        <UserCard onClick={onLogout}>
          <Avatar>SA</Avatar>
          <UserInfo>
            <h4>Super Admin</h4>
            <p>god_mode: {t.common.active}</p>
          </UserInfo>
          <LogOut size={16} color={adminTheme.colors.text.muted} />
        </UserCard>
      </UserProfile>
    </SidebarContainer>
  );
};

export default Sidebar;
