import React, { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';

interface Alert {
  id: string;
  source: 'sentry' | 'uptimerobot' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  url?: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface MonitoringStats {
  totalAlerts: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  bySource: {
    sentry: number;
    uptimerobot: number;
    custom: number;
  };
  recentAlerts: Alert[];
}

export const MonitoringDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonitoringStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitoringStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringStats = async () => {
    try {
      const functions = getFunctions();
      const getStats = httpsCallable(functions, 'getMonitoringStats');
      
      const result = await getStats();
      setStats(result.data as MonitoringStats);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load monitoring stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const functions = getFunctions();
      const acknowledge = httpsCallable(functions, 'acknowledgeAlert');
      
      await acknowledge({ alertId });
      
      // Refresh stats
      loadMonitoringStats();
    } catch (err: any) {
      console.error('Failed to acknowledge alert:', err);
      alert('Failed to acknowledge alert: ' + err.message);
    }
  };

  if (loading) {
    return <Container>Loading monitoring data...</Container>;
  }

  if (error) {
    return <Container><ErrorMessage>{error}</ErrorMessage></Container>;
  }

  if (!stats) {
    return <Container>No data available</Container>;
  }

  const uptimePercentage = ((24 - stats.bySeverity.critical) / 24 * 100).toFixed(2);

  return (
    <Container>
      <Header>
        <h1>📊 Monitoring Dashboard</h1>
        <RefreshButton onClick={loadMonitoringStats}>
          🔄 Refresh
        </RefreshButton>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Alerts (24h)</StatLabel>
          <StatValue>{stats.totalAlerts}</StatValue>
        </StatCard>

        <StatCard severity="critical">
          <StatLabel>Critical</StatLabel>
          <StatValue>{stats.bySeverity.critical}</StatValue>
        </StatCard>

        <StatCard severity="high">
          <StatLabel>High</StatLabel>
          <StatValue>{stats.bySeverity.high}</StatValue>
        </StatCard>

        <StatCard severity="medium">
          <StatLabel>Medium</StatLabel>
          <StatValue>{stats.bySeverity.medium}</StatValue>
        </StatCard>

        <StatCard severity="low">
          <StatLabel>Low</StatLabel>
          <StatValue>{stats.bySeverity.low}</StatValue>
        </StatCard>

        <StatCard>
          <StatLabel>Uptime (24h)</StatLabel>
          <StatValue>{uptimePercentage}%</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Sources */}
      <Section>
        <SectionTitle>Alerts by Source</SectionTitle>
        <SourceGrid>
          <SourceCard>
            <SourceIcon>🔴</SourceIcon>
            <SourceLabel>Sentry Errors</SourceLabel>
            <SourceCount>{stats.bySource.sentry}</SourceCount>
          </SourceCard>

          <SourceCard>
            <SourceIcon>⏰</SourceIcon>
            <SourceLabel>UptimeRobot</SourceLabel>
            <SourceCount>{stats.bySource.uptimerobot}</SourceCount>
          </SourceCard>

          <SourceCard>
            <SourceIcon>⚙️</SourceIcon>
            <SourceLabel>Custom</SourceLabel>
            <SourceCount>{stats.bySource.custom}</SourceCount>
          </SourceCard>
        </SourceGrid>
      </Section>

      {/* Recent Alerts */}
      <Section>
        <SectionTitle>Recent Alerts</SectionTitle>
        <AlertsList>
          {stats.recentAlerts.length === 0 ? (
            <NoAlerts>✅ No recent alerts - system healthy!</NoAlerts>
          ) : (
            stats.recentAlerts.map(alert => (
              <AlertCard key={alert.id} severity={alert.severity} acknowledged={alert.acknowledged}>
                <AlertHeader>
                  <AlertSeverityBadge severity={alert.severity}>
                    {alert.severity.toUpperCase()}
                  </AlertSeverityBadge>
                  <AlertSource>{alert.source}</AlertSource>
                  <AlertTime>
                    {new Date(alert.timestamp).toLocaleString('bg-BG')}
                  </AlertTime>
                </AlertHeader>

                <AlertTitle>{alert.title}</AlertTitle>
                <AlertMessage>{alert.message}</AlertMessage>

                {alert.url && (
                  <AlertUrl href={alert.url} target="_blank" rel="noopener noreferrer">
                    View Details →
                  </AlertUrl>
                )}

                {!alert.acknowledged && (
                  <AcknowledgeButton onClick={() => acknowledgeAlert(alert.id)}>
                    ✓ Acknowledge
                  </AcknowledgeButton>
                )}

                {alert.acknowledged && (
                  <AcknowledgedBadge>✓ Acknowledged</AcknowledgedBadge>
                )}
              </AlertCard>
            ))
          )}
        </AlertsList>
      </Section>

      {/* External Links */}
      <Section>
        <SectionTitle>External Dashboards</SectionTitle>
        <ExternalLinks>
          <ExternalLink href="https://sentry.io/organizations/globul-cars/issues/" target="_blank">
            🔴 Sentry Dashboard
          </ExternalLink>
          <ExternalLink href="https://uptimerobot.com/dashboard" target="_blank">
            ⏰ UptimeRobot Dashboard
          </ExternalLink>
          <ExternalLink href="https://console.firebase.google.com" target="_blank">
            🔥 Firebase Console
          </ExternalLink>
        </ExternalLinks>
      </Section>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    font-size: 28px;
  }
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #FF8F10;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #E67E00;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ severity?: string }>`
  background: ${props => {
    if (!props.severity) return '#f5f5f5';
    const colors: Record<string, string> = {
      critical: '#ffebee',
      high: '#fff3e0',
      medium: '#e8f5e9',
      low: '#e3f2fd',
    };
    return colors[props.severity] || '#f5f5f5';
  }};
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #333;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
`;

const SourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const SourceCard = styled.div`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const SourceIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const SourceLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const SourceCount = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NoAlerts = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #4CAF50;
  background: #f5f5f5;
  border-radius: 10px;
`;

const AlertCard = styled.div<{ severity: string; acknowledged: boolean }>`
  background: white;
  border: 2px solid ${props => {
    const colors: Record<string, string> = {
      critical: '#F44336',
      high: '#FF5722',
      medium: '#FF9800',
      low: '#4CAF50',
    };
    return colors[props.severity];
  }};
  border-radius: 10px;
  padding: 20px;
  opacity: ${props => props.acknowledged ? 0.6 : 1};
`;

const AlertHeader = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const AlertSeverityBadge = styled.span<{ severity: string }>`
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background: ${props => {
    const colors: Record<string, string> = {
      critical: '#F44336',
      high: '#FF5722',
      medium: '#FF9800',
      low: '#4CAF50',
    };
    return colors[props.severity];
  }};
`;

const AlertSource = styled.span`
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 5px 10px;
  border-radius: 5px;
`;

const AlertTime = styled.span`
  font-size: 12px;
  color: #999;
  margin-left: auto;
`;

const AlertTitle = styled.h3`
  margin: 10px 0;
  font-size: 16px;
`;

const AlertMessage = styled.p`
  color: #666;
  margin: 10px 0;
`;

const AlertUrl = styled.a`
  color: #FF8F10;
  text-decoration: none;
  font-size: 14px;
  display: inline-block;
  margin-top: 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AcknowledgeButton = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  
  &:hover {
    background: #45A049;
  }
`;

const AcknowledgedBadge = styled.span`
  display: inline-block;
  padding: 8px 16px;
  background: #E8F5E9;
  color: #4CAF50;
  border-radius: 5px;
  font-size: 14px;
  margin-top: 10px;
`;

const ExternalLinks = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ExternalLink = styled.a`
  display: inline-block;
  padding: 12px 20px;
  background: #FF8F10;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 14px;
  
  &:hover {
    background: #E67E00;
  }
`;

const ErrorMessage = styled.div`
  color: #F44336;
  padding: 20px;
  background: #ffebee;
  border-radius: 10px;
  text-align: center;
`;

export default MonitoringDashboard;
