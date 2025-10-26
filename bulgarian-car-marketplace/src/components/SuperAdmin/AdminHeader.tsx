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
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-bottom: 2px solid #ffd700;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const SessionInfo = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid #ffd700;
  box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 20px;
  margin: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
  text-align: center;
  color: #ffd700;
`;

const ControlButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  padding: 6px 12px;
  border: 1px solid #ffd700;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #000000;
    &:hover { 
      background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
    }
  ` : `
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: #ffffff;
    &:hover { 
      background: linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
    }
  `}
`;

const HeaderTitle = styled.h1`
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 5px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HeaderSubtitle = styled.p`
  color: #ffd700;
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
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
