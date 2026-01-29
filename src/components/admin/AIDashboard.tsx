import React, { useState } from 'react';
import styled from 'styled-components';
import { Activity, Zap, Shield, DollarSign } from 'lucide-react';

const DashboardContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 20px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: #1e293b;
  font-size: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
`;

const StatusBadge = styled.span<{ status: 'active' | 'warning' | 'error' }>`
  padding: 4px 8px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  background: ${props =>
        props.status === 'active' ? '#dcfce7' :
            props.status === 'warning' ? '#fef9c3' : '#fee2e2'};
  color: ${props =>
        props.status === 'active' ? '#166534' :
            props.status === 'warning' ? '#854d0e' : '#991b1b'};
`;

export const AIDashboard: React.FC = () => {
    // Hardcoded for now, will connect to Analytics in next phase
    const [stats] = useState({
        totalRequests: 124,
        monthlyCost: 0.15,
        activeUsers: 45,
        quotaStatus: 'active' as const
    });

    return (
        <DashboardContainer>
            <Title>
                <Zap color="#8b5cf6" />
                DeepSeek AI Intelligence
            </Title>

            <Grid>
                <Card>
                    <CardHeader>
                        <span>Total Requests (Month)</span>
                        <Activity size={18} />
                    </CardHeader>
                    <CardValue>{stats.totalRequests.toLocaleString()}</CardValue>
                </Card>

                <Card>
                    <CardHeader>
                        <span>Estimated Cost</span>
                        <DollarSign size={18} />
                    </CardHeader>
                    <CardValue>€{stats.monthlyCost.toFixed(2)}</CardValue>
                </Card>

                <Card>
                    <CardHeader>
                        <span>System Status</span>
                        <Shield size={18} />
                    </CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusBadge status={stats.quotaStatus}>Operational</StatusBadge>
                    </div>
                </Card>
            </Grid>

            <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>Admin Controls</h4>
                <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>
                    Configure Quotas and API Keys in Firebase Console.
                </p>
            </div>
        </DashboardContainer>
    );
};
