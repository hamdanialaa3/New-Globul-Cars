import React from 'react';
import styled from 'styled-components';
import { Wifi, WifiOff, Car, Activity } from 'lucide-react';

interface IoTStatusWidgetProps {
  isConnected: boolean;
  deviceCount: number;
  endpoint: string;
}

const Widget = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  margin: 16px 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Status = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: ${p => p.$connected ? '#4ade80' : '#f87171'};
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const Endpoint = styled.div`
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 8px;
  text-align: center;
`;

export const IoTStatusWidget: React.FC<IoTStatusWidgetProps> = ({ 
  isConnected, 
  deviceCount, 
  endpoint 
}) => {
  return (
    <Widget>
      <Header>
        <Title>
          <Activity size={20} />
          AWS IoT Core
        </Title>
        <Status $connected={isConnected}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'Connected' : 'Disconnected'}
        </Status>
      </Header>
      
      <Stats>
        <Stat>
          <StatValue>{deviceCount}</StatValue>
          <StatLabel>Devices</StatLabel>
        </Stat>
        <Stat>
          <StatValue>
            <Car size={24} />
          </StatValue>
          <StatLabel>Cars</StatLabel>
        </Stat>
        <Stat>
          <StatValue>100%</StatValue>
          <StatLabel>Uptime</StatLabel>
        </Stat>
      </Stats>
      
      <Endpoint>Endpoint: {endpoint}</Endpoint>
    </Widget>
  );
};