/**
 * AI Dashboard Page
 * AI Control Dashboard for Super Admins
 * 
 * @page AIDashboard
 * @description Comprehensive dashboard for managing the AI system
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { aiLearningSystem } from '../../services/ai/learning-system';
import { aiBillingSystem } from '../../services/ai/billing-system';
import { aiSecurityMonitor } from '../../services/ai/security-monitor';
import { aiQuotaService } from '../../services/ai/ai-quota.service';
import { logger } from '../../services/logger-service';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Shield, Users, Activity, 
  AlertTriangle, CheckCircle, XCircle, Settings 
} from 'lucide-react';

// ================ Interfaces ================

interface DashboardMetrics {
  totalRequests: number;
  dailyGrowth: number;
  monthlyCost: number;
  monthlyBudget: number;
  activeUsers: number;
  suspendedUsers: number;
  averageRating: number;
  topFeatures: string[];
}

interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

// ================ Styled Components ================

const Container = styled.div`
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.color || '#3498db'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const MetricIcon = styled.div<{ bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.bgColor || '#e3f2fd'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#2196f3'};
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const MetricTrend = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  color: ${props => props.positive ? '#27ae60' : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
`;

const AlertsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div<{ severity: string }>`
  padding: 16px;
  border-radius: 12px;
  background: ${props => {
    switch(props.severity) {
      case 'critical': return '#fee';
      case 'high': return '#fef3e2';
      case 'medium': return '#fff8e1';
      case 'low': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  }};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AlertIcon = styled.div`
  font-size: 24px;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertMessage = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const AlertTime = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const ActionsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionButton = styled.button<{ variant?: string }>`
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background: ${props => {
    switch(props.variant) {
      case 'primary': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'success': return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      case 'warning': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'danger': return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      default: return '#3498db';
    }
  }};
  
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  font-size: 18px;
  color: #7f8c8d;
`;

// ================ Component ================

const AIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load metrics
      const [learningStats, securityStats, billingRevenue] = await Promise.all([
        aiLearningSystem.getSystemStatistics(),
        aiSecurityMonitor.getSecurityStats(),
        aiBillingSystem.getMonthlyRevenue(new Date().toISOString().slice(0, 7))
      ]);

      setMetrics({
        totalRequests: learningStats.totalFeedback,
        dailyGrowth: 12.5,
        monthlyCost: billingRevenue.totalRevenue,
        monthlyBudget: 5000,
        activeUsers: 245,
        suspendedUsers: securityStats.suspendedUsers,
        averageRating: learningStats.averageRating,
        topFeatures: learningStats.topFeatures.map(f => f.feature)
      });

      // Load security alerts
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          severity: 'high',
          message: 'Unusual request rate from user #1234',
          timestamp: new Date()
        },
        {
          id: '2',
          severity: 'medium',
          message: 'Repeated failed attempts from IP 192.168.1.1',
          timestamp: new Date(Date.now() - 3600000)
        }
      ];
      setSecurityAlerts(mockAlerts);

      // Revenue data (simulated)
      setRevenueData([
        { month: 'January', revenue: 1200 },
        { month: 'February', revenue: 1450 },
        { month: 'March', revenue: 1800 },
        { month: 'April', revenue: 2100 },
        { month: 'May', revenue: 2400 },
        { month: 'June', revenue: 2800 }
      ]);

      // Usage data (simulated)
      setUsageData([
        { name: 'Car Descriptions', value: 450 },
        { name: 'Price Analysis', value: 320 },
        { name: 'Smart Replies', value: 280 },
        { name: 'Image Analysis', value: 150 }
      ]);

    } catch (error) {
      logger.error('Failed to load dashboard data', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutoLearning = async () => {
    try {
      await aiLearningSystem.runAutoLearning();
      toast.success('Auto-learning completed successfully');
      await loadDashboardData();
    } catch (error) {
      toast.error('Auto-learning failed');
    }
  };

  const handleGenerateBills = async () => {
    try {
      await aiBillingSystem.generateMonthlyBills();
      toast.success('Monthly bills generated successfully');
      await loadDashboardData();
    } catch (error) {
      toast.error('Failed to generate bills');
    }
  };

  const handleResetQuotas = async () => {
    if (confirm('Are you sure you want to reset all quotas?')) {
      try {
        await aiBillingSystem.resetMonthlyQuotas();
        toast.success('Quotas reset successfully');
        await loadDashboardData();
      } catch (error) {
        toast.error('Failed to reset quotas');
      }
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  if (loading || !metrics) {
    return (
      <Container>
        <LoadingSpinner>⏳ Loading AI Dashboard...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Activity size={36} />
          AI Control Dashboard
        </Title>
        <Subtitle>Comprehensive monitoring of AI system performance and security</Subtitle>
      </Header>

      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard color="#3498db">
          <MetricHeader>
            <MetricTitle>Total Requests</MetricTitle>
            <MetricIcon bgColor="#e3f2fd" color="#2196f3">
              <TrendingUp size={20} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{metrics.totalRequests.toLocaleString()}</MetricValue>
          <MetricTrend positive={metrics.dailyGrowth > 0}>
            ↑ {metrics.dailyGrowth}% daily growth
          </MetricTrend>
        </MetricCard>

        <MetricCard color="#27ae60">
          <MetricHeader>
            <MetricTitle>Monthly Cost</MetricTitle>
            <MetricIcon bgColor="#e8f5e9" color="#4caf50">
              <DollarSign size={20} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>${metrics.monthlyCost.toFixed(2)}</MetricValue>
          <MetricTrend positive={metrics.monthlyCost < metrics.monthlyBudget}>
            {((metrics.monthlyCost / metrics.monthlyBudget) * 100).toFixed(1)}% of budget
          </MetricTrend>
        </MetricCard>

        <MetricCard color="#9b59b6">
          <MetricHeader>
            <MetricTitle>Active Users</MetricTitle>
            <MetricIcon bgColor="#f3e5f5" color="#9c27b0">
              <Users size={20} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{metrics.activeUsers}</MetricValue>
          <MetricTrend positive={metrics.suspendedUsers === 0}>
            {metrics.suspendedUsers} suspended
          </MetricTrend>
        </MetricCard>

        <MetricCard color="#e67e22">
          <MetricHeader>
            <MetricTitle>Average Rating</MetricTitle>
            <MetricIcon bgColor="#fff3e0" color="#ff9800">
              <CheckCircle size={20} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{metrics.averageRating.toFixed(1)}/5</MetricValue>
          <MetricTrend positive={metrics.averageRating >= 4}>
            {metrics.averageRating >= 4 ? 'Excellent' : 'Good'}
          </MetricTrend>
        </MetricCard>
      </MetricsGrid>

      {/* Charts */}
      <ChartsSection>
        <ChartCard>
          <ChartTitle>📊 Monthly Revenue</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>📈 Usage by Feature</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {usageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsSection>

      {/* Security Alerts */}
      <AlertsSection>
        <ChartTitle>🛡️ Security Alerts</ChartTitle>
        <AlertsList>
          {securityAlerts.length === 0 ? (
            <AlertItem severity="low">
              <AlertIcon>✅</AlertIcon>
              <AlertContent>
                <AlertMessage>No security alerts</AlertMessage>
                <AlertTime>System running normally</AlertTime>
              </AlertContent>
            </AlertItem>
          ) : (
            securityAlerts.map(alert => (
              <AlertItem key={alert.id} severity={alert.severity}>
                <AlertIcon>
                  {alert.severity === 'critical' && '🚨'}
                  {alert.severity === 'high' && '⚠️'}
                  {alert.severity === 'medium' && '⚡'}
                  {alert.severity === 'low' && 'ℹ️'}
                </AlertIcon>
                <AlertContent>
                  <AlertMessage>{alert.message}</AlertMessage>
                  <AlertTime>{alert.timestamp.toLocaleString('bg-BG')}</AlertTime>
                </AlertContent>
              </AlertItem>
            ))
          )}
        </AlertsList>
      </AlertsSection>

      {/* Quick Actions */}
      <ChartTitle>⚡ Quick Actions</ChartTitle>
      <ActionsSection>
        <ActionButton variant="primary" onClick={handleRunAutoLearning}>
          <Activity size={18} />
          Run Auto-Learning
        </ActionButton>

        <ActionButton variant="success" onClick={handleGenerateBills}>
          <DollarSign size={18} />
          Generate Monthly Bills
        </ActionButton>

        <ActionButton variant="warning" onClick={handleResetQuotas}>
          <Settings size={18} />
          Reset Quotas
        </ActionButton>

        <ActionButton variant="danger" onClick={() => toast.info('Coming soon')}>
          <Shield size={18} />
          Full Security Report
        </ActionButton>
      </ActionsSection>
    </Container>
  );
};

export default AIDashboard;
