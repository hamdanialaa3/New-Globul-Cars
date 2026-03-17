import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService, Subscriber } from '@/services/admin/admin-verification.service';
import { logger } from '@/services/logger-service';
import { SUBSCRIPTION_PLANS } from '../../../../config/billing-config';
import { CreditCard, TrendingUp, AlertCircle, RefreshCw, BarChart } from 'lucide-react';

const Container = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-secondary);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
`;

const KPIContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const KPICard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .subtext {
    font-size: 0.8rem;
    color: var(--success-main);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 1rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-primary);
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-primary);
    color: var(--text-primary);
    font-size: 0.9rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusPill = styled.span<{ status: Subscriber['status'] }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${props => {
        switch (props.status) {
            case 'active': return 'rgba(16, 185, 129, 0.1)';
            case 'past_due': return 'rgba(239, 68, 68, 0.1)';
            case 'canceled': return 'rgba(107, 114, 128, 0.1)';
            default: return 'var(--bg-secondary)';
        }
    }};
  
  color: ${props => {
        switch (props.status) {
            case 'active': return '#10b981';
            case 'past_due': return '#ef4444';
            case 'canceled': return '#6b7280';
            default: return 'var(--text-secondary)';
        }
    }};
`;

export const RevenueMonitor: React.FC = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate Estimated MRR
    const calculateMRR = (subs: Subscriber[]) => {
        return subs.reduce((total, sub) => {
            if (sub.status !== 'active') return total;
            if (sub.planTier === 'dealer') return total + SUBSCRIPTION_PLANS.dealer.price;
            if (sub.planTier === 'company') return total + SUBSCRIPTION_PLANS.company.price;
            return total;
        }, 0);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await adminService.getSubscribers();
            setSubscribers(data);
        } catch (err) {
            logger.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const mrr = calculateMRR(subscribers);
    const activeSubs = subscribers.filter(s => s.status === 'active').length;
    const churnRisks = subscribers.filter(s => s.status === 'past_due').length;

    if (loading) return <div>Scanining financial data...</div>;

    return (
        <Container>
            <Header>
                <Title>
                    <BarChart size={24} color="var(--primary-main)" />
                    Revenue Command
                </Title>
                <button onClick={loadData} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <RefreshCw size={20} color="var(--text-secondary)" />
                </button>
            </Header>

            <KPIContainer>
                <KPICard>
                    <h4>Estimated MRR</h4>
                    <div className="value">€{mrr.toLocaleString()}</div>
                    <div className="subtext"><TrendingUp size={14} /> +0% vs last month</div>
                </KPICard>
                <KPICard>
                    <h4>Active Subscribers</h4>
                    <div className="value">{activeSubs}</div>
                    <div className="subtext">
                        {subscribers.filter(s => s.planTier === 'company').length} Enterprise
                    </div>
                </KPICard>
                <KPICard style={{ borderColor: churnRisks > 0 ? 'var(--error-main)' : undefined }}>
                    <h4>Payment Issues</h4>
                    <div className="value" style={{ color: churnRisks > 0 ? 'var(--error-main)' : undefined }}>
                        {churnRisks}
                    </div>
                    {churnRisks > 0 && (
                        <div className="subtext" style={{ color: 'var(--error-main)' }}>
                            <AlertCircle size={14} /> Immediate action required
                        </div>
                    )}
                </KPICard>
            </KPIContainer>

            <div style={{ overflowX: 'auto' }}>
                <Table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Next Billing</th>
                            <th>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map(sub => (
                            <tr key={sub.uid}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{sub.displayName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.email}</div>
                                </td>
                                <td>{sub.planTier.toUpperCase()}</td>
                                <td><StatusPill status={sub.status}>{sub.status.replace('_', ' ')}</StatusPill></td>
                                <td>{sub.currentPeriodEnd ? sub.currentPeriodEnd.toLocaleDateString() : '-'}</td>
                                <td>
                                    <button style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-secondary)',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};
