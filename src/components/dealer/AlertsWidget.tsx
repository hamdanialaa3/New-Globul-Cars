// src/components/dealer/AlertsWidget.tsx
// Intelligent Alerts Widget - Widget التنبيهات الذكية

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DashboardAlert } from '../../services/dealer/dealer-dashboard.service';

interface AlertsWidgetProps {
  alerts: DashboardAlert[];
  onDismiss?: (alertId: string) => void;
}

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WidgetTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AlertItem = styled.div<{ severity: string }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${props => {
    switch (props.severity) {
      case 'high':
        return '#fef2f2';
      case 'medium':
        return '#fffbeb';
      default:
        return '#f0f9ff';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  }};
  border-radius: 8px;
  position: relative;
`;

const AlertIcon = styled.div<{ severity: string }>`
  color: ${props => {
    switch (props.severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  }};
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const AlertMessage = styled.div`
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const AlertCar = styled.div`
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 500;
`;

const AlertAction = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #2c3e50;
  }
`;

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, onDismiss }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle size={20} />;
      case 'medium':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    if (language === 'bg') {
      switch (severity) {
        case 'high':
          return 'Високо';
        case 'medium':
          return 'Средно';
        default:
          return 'Ниско';
      }
    } else {
      return severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  };

  if (alerts.length === 0) {
    return (
      <WidgetContainer>
        <WidgetTitle>
          <AlertCircle size={24} />
          {language === 'bg' ? 'Предупреждения' : 'Alerts'}
        </WidgetTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          {language === 'bg' ? 'Няма предупреждения' : 'No alerts'}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetTitle>
        <AlertCircle size={24} />
        {language === 'bg' ? 'Предупреждения' : 'Alerts'} ({alerts.length})
      </WidgetTitle>

      <AlertsList>
        {alerts.map((alert) => (
          <AlertItem key={alert.id} severity={alert.severity}>
            <AlertIcon severity={alert.severity}>
              {getIcon(alert.severity)}
            </AlertIcon>
            <AlertContent>
              <AlertTitle>
                [{getSeverityLabel(alert.severity)}] {alert.title}
              </AlertTitle>
              <AlertMessage>{alert.message}</AlertMessage>
              {alert.carTitle && (
                <AlertCar>{alert.carTitle}</AlertCar>
              )}
              {alert.actionUrl && (
                <AlertAction onClick={() => navigate(alert.actionUrl!)}>
                  {language === 'bg' ? 'Преглед' : 'View'}
                </AlertAction>
              )}
            </AlertContent>
            {onDismiss && (
              <DismissButton onClick={() => onDismiss(alert.id)}>
                <X size={16} />
              </DismissButton>
            )}
          </AlertItem>
        ))}
      </AlertsList>
    </WidgetContainer>
  );
};

export default AlertsWidget;

