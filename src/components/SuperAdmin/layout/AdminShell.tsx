// src/components/SuperAdmin/layout/AdminShell.tsx
import React from 'react';
import styled from 'styled-components';
import { adminTheme } from '../styles/admin-theme';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${adminTheme.colors.bg.primary};
  color: ${adminTheme.colors.text.primary};
  font-family: ${adminTheme.typography.fontFamily.sans};
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${adminTheme.layout.sidebarWidth};
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent overflow issues */
  
  [dir="rtl"] & {
    margin-left: 0;
    margin-right: ${adminTheme.layout.sidebarWidth};
  }
`;

const PageContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  
  /* Aurora background effect */
  &::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const AdminShell: React.FC<AdminShellProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout
}) => {
  return (
    <AppContainer>
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />
      <MainContent>
        <TopBar />
        <PageContent>
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </PageContent>
      </MainContent>
    </AppContainer>
  );
};

export default AdminShell;
