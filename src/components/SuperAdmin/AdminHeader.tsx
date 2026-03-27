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
  background: #0a0d14; /* Deep dark */
  border-bottom: 1px solid #2d3748;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const SessionInfo = styled.div`
  background: #1e2432;
  color: #8B5CF6;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #2d3748;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const DashboardHeader = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 24px;
  margin: 20px;
  margin-bottom: 24px;
  text-align: center;
  color: #f8fafc;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const ControlButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  padding: 6px 14px;
  border: 1px solid ${props => props.$variant === 'danger' ? '#ef4444' : '#8B5CF6'};
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  background: ${props => props.$variant === 'danger' ? '#ef4444' : '#8B5CF6'};
  color: ${props => props.$variant === 'danger' ? '#ffffff' : '#0f1419'};

  &:hover { 
    background: ${props => props.$variant === 'danger' ? '#dc2626' : '#ffa885'};
    border-color: ${props => props.$variant === 'danger' ? '#dc2626' : '#ffa885'};
    transform: translateY(-1px);
  }
`;

const HeaderTitle = styled.h1`
  color: #8B5CF6; /* Accent Color */
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  letter-spacing: 1px;
`;

const HeaderSubtitle = styled.p`
  color: #cbd5e1;
  font-size: 12px;
  margin: 0;
  font-weight: 500;
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

