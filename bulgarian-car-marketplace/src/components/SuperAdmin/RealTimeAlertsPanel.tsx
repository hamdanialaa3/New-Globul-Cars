import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { smartAlertsService, Alert } from '../../services/smart-alerts-service';
import { logger } from '../../services/logger-service';

const PanelContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color: #ffd700;
`;

const SectionTitle = styled.h2`
  color: #ffd700;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 25px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 15px;
`;

const AlertCard = styled.div<{ $severity: string }>`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#dc2626';
      case 'error': return '#f87171';
      case 'warning': return '#fbbf24';
      case 'info': return '#60a5fa';
      default: return '#6b7280';
    }
  }};
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2);
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const AlertTitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlertTitle = styled.h3`
  color: #ffd700;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const AlertBadge = styled.span<{ $severity: string }>`
  background: ${props => smartAlertsService.getSeverityColor(props.$severity)};
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
`;

const AlertDescription = styled.p`
  color: #ffd700;
  font-size: 13px;
  margin: 0 0 12px 0;
  opacity: 0.9;
`;

const AlertAction = styled.div`
  color: #60a5fa;
  font-size: 12px;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 6px;
  border-left: 3px solid #60a5fa;
`;

const AlertFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const AlertTimestamp = styled.div`
  color: #ffd700;
  font-size: 11px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ResolveButton = styled.button`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #000000;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 3px 10px rgba(74, 222, 128, 0.4);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #4ade80;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ffd700;
  font-size: 16px;
`;

const RealTimeAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const systemAlerts = await smartAlertsService.checkSystemHealth();
      const firestoreAlerts = await smartAlertsService.getActiveAlerts();
      
      const combinedAlerts = [...systemAlerts, ...firestoreAlerts];
      const uniqueAlerts = Array.from(
        new Map(combinedAlerts.map(alert => [alert.title, alert])).values()
      );
      
      setAlerts(uniqueAlerts);
    } catch (error) {
      logger.error('Failed to load alerts', error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (alertId?: string) => {
    if (!alertId) return;
    
    try {
      await smartAlertsService.resolveAlert(alertId);
      await loadAlerts();
    } catch (error) {
      logger.error('Failed to resolve alert', error as Error, { alertId });
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <PanelContainer>
        <LoadingState>Loading alerts...</LoadingState>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle />
          Real-Time System Alerts
        </div>
        <RefreshButton onClick={loadAlerts}>
          <RefreshCw size={14} />
          Refresh
        </RefreshButton>
      </SectionTitle>

      {alerts.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <CheckCircle size={64} color="#4ade80" />
          </EmptyStateIcon>
          <EmptyStateText>No active alerts - All systems operational!</EmptyStateText>
        </EmptyState>
      ) : (
        <AlertsGrid>
          {alerts.map((alert, index) => (
            <AlertCard key={alert.id || index} $severity={alert.severity}>
              <AlertHeader>
                <AlertTitleSection>
                  {alert.severity === 'critical' && <XCircle size={18} color="#dc2626" />}
                  {alert.severity === 'error' && <AlertCircle size={18} color="#f87171" />}
                  {alert.severity === 'warning' && <AlertTriangle size={18} color="#fbbf24" />}
                  {alert.severity === 'info' && <Info size={18} color="#60a5fa" />}
                  <AlertTitle>{alert.title}</AlertTitle>
                </AlertTitleSection>
                <AlertBadge $severity={alert.severity}>{alert.severity}</AlertBadge>
              </AlertHeader>

              <AlertDescription>{alert.description}</AlertDescription>

              {alert.actionRequired && (
                <AlertAction>
                  <strong>Action Required:</strong> {alert.actionRequired}
                </AlertAction>
              )}

              <AlertFooter>
                <AlertTimestamp>
                  <Clock size={12} />
                  {formatTimestamp(alert.timestamp)}
                </AlertTimestamp>
                {alert.id && (
                  <ResolveButton onClick={() => handleResolve(alert.id)}>
                    <CheckCircle size={12} />
                    Resolve
                  </ResolveButton>
                )}
              </AlertFooter>
            </AlertCard>
          ))}
        </AlertsGrid>
      )}
    </PanelContainer>
  );
};

export default RealTimeAlertsPanel;

