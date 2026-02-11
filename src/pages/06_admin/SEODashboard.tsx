/**
 * SEODashboard.tsx
 * 📊 Admin SEO Performance Dashboard
 * 
 * Displays:
 * - Search Console metrics
 * - IndexNow submission status
 * - Rich snippet validation
 * - Core Web Vitals
 * 
 * @author SEO Supremacy System
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/firebase-config';
import { useAuth } from '@/hooks/useAuth';
import {
    BarChart3,
    TrendingUp,
    Search,
    Globe,
    Smartphone,
    Monitor,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    Zap,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceData {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface TopQuery {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface TopPage {
    page: string;
    clicks: number;
    impressions: number;
}

interface DeviceData {
    device: string;
    clicks: number;
    impressions: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SEODashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('28');

    // Data states
    const [performance, setPerformance] = useState<PerformanceData[]>([]);
    const [topQueries, setTopQueries] = useState<TopQuery[]>([]);
    const [topPages, setTopPages] = useState<TopPage[]>([]);
    const [devices, setDevices] = useState<DeviceData[]>([]);

    // Totals
    const totalClicks = performance.reduce((sum, d) => sum + d.clicks, 0);
    const totalImpressions = performance.reduce((sum, d) => sum + d.impressions, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = performance.length > 0
        ? performance.reduce((sum, d) => sum + d.position, 0) / performance.length
        : 0;

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

            const getDashboard = httpsCallable(functions, 'getSearchPerformanceDashboard');
            const result = await getDashboard({ startDate, endDate });
            const data = result.data as any;

            setPerformance(data.performance || []);
            setTopQueries(data.topQueries || []);
            setTopPages(data.topPages || []);
            setDevices(data.devices || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load SEO data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user, dateRange]);

    const requestIndexing = async (url: string) => {
        try {
            const requestIdx = httpsCallable(functions, 'requestIndexing');
            await requestIdx({ url });
            toast.success(`Indexing requested for ${url}`);
        } catch (err: any) {
            toast.error(`Failed: ${err.message}`);
        }
    };

    return (
        <DashboardContainer>
            <Header>
                <Title>
                    <Search size={28} />
                    SEO Performance Dashboard
                </Title>
                <Controls>
                    <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="7">Last 7 days</option>
                        <option value="28">Last 28 days</option>
                        <option value="90">Last 90 days</option>
                    </Select>
                    <RefreshButton onClick={loadData} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        Refresh
                    </RefreshButton>
                </Controls>
            </Header>

            {error && (
                <ErrorBanner>
                    <AlertTriangle size={20} />
                    {error}
                </ErrorBanner>
            )}

            {/* Key Metrics */}
            <MetricsGrid>
                <MetricCard $color="#3b82f6">
                    <MetricIcon><TrendingUp size={24} /></MetricIcon>
                    <MetricContent>
                        <MetricValue>{totalClicks.toLocaleString()}</MetricValue>
                        <MetricLabel>Total Clicks</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color="#8b5cf6">
                    <MetricIcon><Globe size={24} /></MetricIcon>
                    <MetricContent>
                        <MetricValue>{totalImpressions.toLocaleString()}</MetricValue>
                        <MetricLabel>Impressions</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color="#10b981">
                    <MetricIcon><BarChart3 size={24} /></MetricIcon>
                    <MetricContent>
                        <MetricValue>{avgCTR.toFixed(2)}%</MetricValue>
                        <MetricLabel>Avg CTR</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color="#f59e0b">
                    <MetricIcon><Zap size={24} /></MetricIcon>
                    <MetricContent>
                        <MetricValue>{avgPosition.toFixed(1)}</MetricValue>
                        <MetricLabel>Avg Position</MetricLabel>
                    </MetricContent>
                </MetricCard>
            </MetricsGrid>

            {/* Device Distribution */}
            <Section>
                <SectionTitle>Device Performance</SectionTitle>
                <DeviceGrid>
                    {devices.map((d) => (
                        <DeviceCard key={d.device}>
                            {d.device === 'DESKTOP' && <Monitor size={32} />}
                            {d.device === 'MOBILE' && <Smartphone size={32} />}
                            {d.device === 'TABLET' && <Monitor size={32} />}
                            <DeviceLabel>{d.device}</DeviceLabel>
                            <DeviceClicks>{d.clicks.toLocaleString()} clicks</DeviceClicks>
                        </DeviceCard>
                    ))}
                </DeviceGrid>
            </Section>

            <Grid>
                {/* Top Queries */}
                <Section>
                    <SectionTitle>Top Search Queries</SectionTitle>
                    <Table>
                        <thead>
                            <tr>
                                <th>Query</th>
                                <th>Clicks</th>
                                <th>Impressions</th>
                                <th>CTR</th>
                                <th>Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topQueries.slice(0, 10).map((q, i) => (
                                <tr key={i}>
                                    <td>{q.query}</td>
                                    <td>{q.clicks}</td>
                                    <td>{q.impressions}</td>
                                    <td>{(q.ctr * 100).toFixed(1)}%</td>
                                    <td>{q.position.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Section>

                {/* Top Pages */}
                <Section>
                    <SectionTitle>Top Performing Pages</SectionTitle>
                    <Table>
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Clicks</th>
                                <th>Impressions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPages.slice(0, 10).map((p, i) => (
                                <tr key={i}>
                                    <td>{p.page.replace('https://koli.one', '')}</td>
                                    <td>{p.clicks}</td>
                                    <td>{p.impressions}</td>
                                    <td>
                                        <ActionButton onClick={() => requestIndexing(p.page)}>
                                            <RefreshCw size={14} />
                                        </ActionButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Section>
            </Grid>

            {/* Quick Actions */}
            <Section>
                <SectionTitle>Quick Actions</SectionTitle>
                <ActionsGrid>
                    <ActionCard href="https://search.google.com/search-console" target="_blank">
                        <ExternalLink size={20} />
                        Open Search Console
                    </ActionCard>
                    <ActionCard href="https://developers.google.com/search/docs/appearance/structured-data/testing" target="_blank">
                        <CheckCircle size={20} />
                        Test Rich Results
                    </ActionCard>
                    <ActionCard href="https://pagespeed.web.dev/?url=https://koli.one" target="_blank">
                        <Zap size={20} />
                        PageSpeed Insights
                    </ActionCard>
                </ActionsGrid>
            </Section>
        </DashboardContainer>
    );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border-left: 4px solid ${props => props.$color};
`;

const MetricIcon = styled.div`
  color: var(--text-tertiary);
`;

const MetricContent = styled.div``;

const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const Section = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const DeviceGrid = styled.div`
  display: flex;
  gap: 1rem;
`;

const DeviceCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-primary);
`;

const DeviceLabel = styled.div`
  font-weight: 600;
  margin-top: 0.5rem;
`;

const DeviceClicks = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  td {
    color: var(--text-primary);
  }
`;

const ActionButton = styled.button`
  padding: 0.25rem;
  background: var(--bg-secondary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

const ActionsGrid = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionCard = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

export default SEODashboard;
