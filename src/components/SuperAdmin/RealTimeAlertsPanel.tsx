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
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 32px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #f8fafc;
`;

const SectionTitle = styled.h2`
  color: #ff8c61;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const RefreshButton = styled.button`
  background: #ff8c61;
  color: #0f1419;
  border: 1px solid #ff8c61;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #ffa885;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 140, 97, 0.3);
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 15px;
`;

const AlertCard = styled.div<{ $severity: string }>`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-left: 6px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#dc2626';
      case 'error': return '#ef4444';
      case 'warning': return '#fbbf24';
      case 'info': return '#3b82f6';
      default: return '#64748b';
    }
  }};
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8c61;
    background: #252b3a;
    transform: translateX(6px);
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
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
`;

const AlertBadge = styled.span<{ $severity: string }>`
  background: ${props => smartAlertsService.getSeverityColor(props.$severity)};
  color: #0f1419;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
`;

const AlertDescription = styled.p`
  color: #cbd5e1;
  font-size: 13px;
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const AlertAction = styled.div`
  color: #3b82f6;
  font-size: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  font-weight: 500;
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
  color: #94a3b8;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

const ResolveButton = styled.button`
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
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

