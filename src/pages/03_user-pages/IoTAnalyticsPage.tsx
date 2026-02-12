import React from 'react';
import styled from 'styled-components';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ChartIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${p => p.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${p => p.$color};
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.875rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const MetricChange = styled.div<{ $positive: boolean }>`
  font-size: 0.75rem;
  color: ${p => p.$positive ? '#28a745' : '#dc3545'};
  margin-top: 4px;
`;

const IoTAnalyticsPage: React.FC = () => {
  const { language } = useLanguage();

  const getText = () => {
    if (language === 'bg') {
      return {
        pageTitle: 'IoT Аналитика',
        fuelConsumption: 'Консумация на гориво',
        speedAnalysis: 'Анализ на скоростта',
        engineHealth: 'Здраве на двигателя',
        drivingPatterns: 'Модели на шофиране',
        avgSpeed: 'Средна скорост',
        totalDistance: 'Общо разстояние',
        fuelEfficiency: 'Ефективност на горивото',
        engineTemp: 'Температура на двигателя',
        chartPlaceholder: 'Графиката ще се зареди тук'
      };
    } else {
      return {
        pageTitle: 'IoT Analytics',
        fuelConsumption: 'Fuel Consumption',
        speedAnalysis: 'Speed Analysis',
        engineHealth: 'Engine Health',
        drivingPatterns: 'Driving Patterns',
        avgSpeed: 'Average Speed',
        totalDistance: 'Total Distance',
        fuelEfficiency: 'Fuel Efficiency',
        engineTemp: 'Engine Temperature',
        chartPlaceholder: 'Chart will load here'
      };
    }
  };

  const text = getText();

  return (
    <PageContainer>
      <PageTitle>{text.pageTitle}</PageTitle>

      <ChartsGrid>
        <ChartCard>
          <ChartHeader>
            <ChartIcon $color="#007bff">
              <BarChart3 size={20} />
            </ChartIcon>
            <ChartTitle>{text.fuelConsumption}</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            {text.chartPlaceholder}
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartIcon $color="#28a745">
              <TrendingUp size={20} />
            </ChartIcon>
            <ChartTitle>{text.speedAnalysis}</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            {text.chartPlaceholder}
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartIcon $color="#dc3545">
              <Activity size={20} />
            </ChartIcon>
            <ChartTitle>{text.engineHealth}</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            {text.chartPlaceholder}
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartIcon $color="#ffc107">
              <Zap size={20} />
            </ChartIcon>
            <ChartTitle>{text.drivingPatterns}</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            {text.chartPlaceholder}
          </ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>

      <MetricsGrid>
        <MetricCard>
          <MetricValue>65</MetricValue>
          <MetricLabel>{text.avgSpeed} (km/h)</MetricLabel>
          <MetricChange $positive={false}>-5% {language === 'bg' ? 'от миналата седмица' : 'from last week'}</MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricValue>1,247</MetricValue>
          <MetricLabel>{text.totalDistance} (km)</MetricLabel>
          <MetricChange $positive={true}>+12% {language === 'bg' ? 'от миналата седмица' : 'from last week'}</MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricValue>8.5</MetricValue>
          <MetricLabel>{text.fuelEfficiency} (L/100km)</MetricLabel>
          <MetricChange $positive={true}>+3% {language === 'bg' ? 'подобрение' : 'improvement'}</MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricValue>87°C</MetricValue>
          <MetricLabel>{text.engineTemp}</MetricLabel>
          <MetricChange $positive={true}>{language === 'bg' ? 'Нормално' : 'Normal'}</MetricChange>
        </MetricCard>
      </MetricsGrid>
    </PageContainer>
  );
};

export default IoTAnalyticsPage;