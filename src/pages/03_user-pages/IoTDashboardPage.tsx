import React, { useState } from 'react';
import styled from 'styled-components';
import { Car, Wifi, WifiOff, Plus } from 'lucide-react';
import { CarIoTStatus } from '../../components/CarIoTStatus';
import { useLanguage } from '../../contexts/LanguageContext';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
  background: #0f1419;
  min-height: 100vh;
  color: #f8fafc;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 32px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: #1e2432;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #2d3748;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff8c61;
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #0f1419;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2d3748;
  
  svg {
    color: #ff8c61;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
`;

const DevicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
`;

const DeviceCard = styled.div`
  background: #1e2432;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #2d3748;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8c61;
  }
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DeviceTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ff8c61;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.$online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${p => p.$online ? '#10b981' : '#ef4444'};
  border: 1px solid ${p => p.$online ? '#10b981' : '#ef4444'};
`;

const AddDeviceCard = styled.div`
  background: #141a21;
  border: 2px dashed #2d3748;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff8c61;
    background: #1e2432;
    transform: translateY(-2px);
  }
`;

const AddDeviceIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #0f1419;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid #2d3748;
  
  svg {
    color: #ff8c61;
  }
`;

const AddDeviceText = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const IoTDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const [connectedDevices] = useState([
    { id: 'car-001', name: 'BMW X5 2023', online: true },
    { id: 'car-002', name: 'Mercedes C-Class', online: false }
  ]);

  const getText = () => {
    if (language === 'bg') {
      return {
        pageTitle: 'IoT Табло за управление',
        totalDevices: 'Общо устройства',
        onlineDevices: 'Онлайн устройства',
        online: 'Онлайн',
        offline: 'Офлайн',
        addDevice: 'Добави ново устройство'
      };
    } else {
      return {
        pageTitle: 'IoT Dashboard',
        totalDevices: 'Total Devices',
        onlineDevices: 'Online Devices',
        online: 'Online',
        offline: 'Offline',
        addDevice: 'Add New Device'
      };
    }
  };

  const text = getText();
  const onlineCount = connectedDevices.filter(d => d.online).length;

  return (
    <PageContainer>
      <PageTitle>{text.pageTitle}</PageTitle>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#007bff">
            <Car size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{connectedDevices.length}</StatValue>
            <StatLabel>{text.totalDevices}</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#28a745">
            <Wifi size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{onlineCount}</StatValue>
            <StatLabel>{text.onlineDevices}</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <DevicesGrid>
        {connectedDevices.map(device => (
          <DeviceCard key={device.id}>
            <DeviceHeader>
              <DeviceTitle>
                <Car size={20} />
                {device.name}
              </DeviceTitle>
              <StatusBadge $online={device.online}>
                {device.online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {device.online ? text.online : text.offline}
              </StatusBadge>
            </DeviceHeader>
            <CarIoTStatus carId={device.id} />
          </DeviceCard>
        ))}

        <AddDeviceCard>
          <AddDeviceIcon>
            <Plus size={32} />
          </AddDeviceIcon>
          <AddDeviceText>{text.addDevice}</AddDeviceText>
        </AddDeviceCard>
      </DevicesGrid>
    </PageContainer>
  );
};

export default IoTDashboardPage;