import React, { useState } from 'react';
import styled from 'styled-components';
import { Car, Wifi, WifiOff, Plus } from 'lucide-react';
import { CarIoTStatus } from '@globul-cars/ui/components/CarIoTStatus';
import { useLanguage } from '@globul-cars/core';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
  background: #f7f7f7;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 32px 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${p => p.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${p => p.$color};
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const DevicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
`;

const DeviceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DeviceTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$online ? '#e8f5e9' : '#ffebee'};
  color: ${p => p.$online ? '#2e7d32' : '#c62828'};
`;

const AddDeviceCard = styled.div`
  background: white;
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff7900;
    background: #fff8f0;
  }
`;

const AddDeviceIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  
  svg {
    color: #999;
  }
`;

const AddDeviceText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
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
