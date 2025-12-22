import React from 'react';
import styled from 'styled-components';
import { Settings, Database, LogOut } from 'lucide-react';
import { firebaseRealDataService } from '../../services/firebase-real-data-service';
import { realDataInitializer } from '../../services/real-data-initializer';
import { logger } from '../../services/logger-service';

interface AdminHeaderProps {
  session: any;
  onLogout: () => void;
}

const AdminToolbar = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const SessionInfo = styled.div`
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d0d0d0;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const DashboardHeader = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin: 20px;
  margin-bottom: 20px;
  text-align: center;
  color: #1a1a1a;
`;

const ControlButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  
  ${props => props.$variant === 'primary' ? `
    background: #1a1a1a;
    color: #ffffff;
    &:hover { 
      background: #333333;
    }
  ` : `
    background: #1a1a1a;
    color: #ffffff;
    &:hover { 
      background: #333333;
    }
  `}
`;

const HeaderTitle = styled.h1`
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
  color: #666666;
  font-size: 12px;
  margin: 0;
`;

const AdminHeader: React.FC<AdminHeaderProps> = ({ session, onLogout }) => {
  const handleInitializeData = async () => {
    try {
      await realDataInitializer.initializeAllRealData();
      window.location.reload();
    } catch (error) {
      logger.error('Error initializing real data', error as Error);
    }
  };

  return (
    <>
      <AdminToolbar>
        <SessionInfo>
          Unique Owner Session
        </SessionInfo>
        
        <HeaderControls>
          <ControlButton $variant="primary" onClick={handleInitializeData}>
            <Settings size={12} />
            Initialize Data
          </ControlButton>
          <ControlButton $variant="primary" onClick={() => window.open(firebaseRealDataService.getFirebaseConsoleUrl(), '_blank')}>
            <Database size={12} />
            Firebase
          </ControlButton>
          <ControlButton $variant="primary" onClick={() => window.open(firebaseRealDataService.getFirestoreConsoleUrl(), '_blank')}>
            <Database size={12} />
            Firestore
          </ControlButton>
          <ControlButton $variant="primary" onClick={() => window.location.reload()}>
            <Settings size={12} />
            Refresh
          </ControlButton>
          <ControlButton $variant="danger" onClick={onLogout}>
            <LogOut size={12} />
            Logout
          </ControlButton>
        </HeaderControls>
      </AdminToolbar>
      
      <DashboardHeader>
        <HeaderTitle>SUPER ADMIN DASHBOARD</HeaderTitle>
        <HeaderSubtitle>Welcome, {session?.name || 'Admin'}! Real-time Firebase data monitoring and control center</HeaderSubtitle>
      </DashboardHeader>
    </>
  );
};

export default AdminHeader;
