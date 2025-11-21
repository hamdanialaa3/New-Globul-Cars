import React from 'react';
import styled from 'styled-components';
import { Wifi, WifiOff, MapPin, Fuel, Thermometer, Gauge } from 'lucide-react';
import { useCarIoT } from '@globul-cars/coreuseCarIoT';

interface CarIoTStatusProps {
  carId: string;
}

const IoTContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatusTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${p => p.$connected ? '#28a745' : '#dc3545'};
  font-size: 0.875rem;
  font-weight: 500;
`;

const TelemetryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const TelemetryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const TelemetryValue = styled.span`
  font-weight: 600;
  color: #333;
`;

const LastUpdate = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 8px;
  text-align: center;
`;

export const CarIoTStatus: React.FC<CarIoTStatusProps> = ({ carId }) => {
  const { telemetryData, isConnected, lastUpdate } = useCarIoT(carId);

  if (!telemetryData) {
    return (
      <IoTContainer>
        <StatusHeader>
          <StatusTitle>حالة السيارة</StatusTitle>
          <ConnectionStatus $connected={false}>
            <WifiOff size={16} />
            غير متصل
          </ConnectionStatus>
        </StatusHeader>
      </IoTContainer>
    );
  }

  return (
    <IoTContainer>
      <StatusHeader>
        <StatusTitle>حالة السيارة المباشرة</StatusTitle>
        <ConnectionStatus $connected={isConnected}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'متصل' : 'غير متصل'}
        </ConnectionStatus>
      </StatusHeader>

      <TelemetryGrid>
        <TelemetryItem>
          <MapPin size={16} color="#007bff" />
          <div>
            <div>الموقع</div>
            <TelemetryValue>
              {telemetryData.location.latitude.toFixed(4)}, {telemetryData.location.longitude.toFixed(4)}
            </TelemetryValue>
          </div>
        </TelemetryItem>

        <TelemetryItem>
          <Fuel size={16} color="#28a745" />
          <div>
            <div>الوقود</div>
            <TelemetryValue>{telemetryData.fuelLevel}%</TelemetryValue>
          </div>
        </TelemetryItem>

        <TelemetryItem>
          <Gauge size={16} color="#ffc107" />
          <div>
            <div>السرعة</div>
            <TelemetryValue>{telemetryData.speed} كم/س</TelemetryValue>
          </div>
        </TelemetryItem>

        <TelemetryItem>
          <Thermometer size={16} color="#dc3545" />
          <div>
            <div>الحرارة</div>
            <TelemetryValue>{telemetryData.temperature}°C</TelemetryValue>
          </div>
        </TelemetryItem>
      </TelemetryGrid>

      {lastUpdate && (
        <LastUpdate>
          آخر تحديث: {lastUpdate.toLocaleString('ar-EG')}
        </LastUpdate>
      )}
    </IoTContainer>
  );
};