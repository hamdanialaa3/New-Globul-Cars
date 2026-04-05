/**
 * MarketingStatusPanel
 *
 * SuperAdmin panel showing real-time marketing pipeline health:
 * - XML Sitemap status + manual regeneration trigger
 * - Google Merchant Center feed status + manual cache trigger
 * - Image optimization pipeline stats
 * - IndexNow submission status
 * - Prerender / SEO crawl pipeline status
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Map,
  ShoppingBag,
  ImageIcon,
  Search,
  Globe,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  marketingStatusService,
  type MarketingStatusReport,
  type StatusLevel,
} from '@/services/marketing-status.service';
import { logger } from '@/services/logger-service';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  background: var(--admin-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--admin-border-subtle);
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin: 0;
`;

const RefreshButton = styled.button<{ loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--admin-bg-tertiary);
  border: 1px solid var(--admin-border-subtle);
  color: var(--admin-text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  opacity: ${({ loading }) => (loading ? 0.6 : 1)};
  transition: all 0.2s;

  svg {
    animation: ${({ loading }) => (loading ? 'spin 1s linear infinite' : 'none')};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover:not(:disabled) {
    background: var(--admin-bg-hover);
    border-color: #8B5CF6;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const Card = styled.div<{ level: StatusLevel }>`
  background: var(--admin-bg-primary);
  border: 1px solid ${({ level }) => statusBorderColor(level)};
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-primary);
`;

const Badge = styled.span<{ level: StatusLevel }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  background: ${({ level }) => statusBadgeBg(level)};
  color: ${({ level }) => statusBadgeColor(level)};
`;

const CardMessage = styled.p`
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MetaItem = styled.div`
  font-size: 12px;
  color: var(--admin-text-muted, #64748b);
  
  strong {
    color: var(--admin-text-secondary);
    font-weight: 600;
  }
`;

const ActionButton = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #8B5CF6;
  color: #8B5CF6;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 92, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FetchedAt = styled.p`
  font-size: 11px;
  color: var(--admin-text-muted, #64748b);
  margin: 12px 0 0;
  text-align: right;
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBorderColor(level: StatusLevel): string {
  switch (level) {
    case 'ok':      return 'rgba(34,197,94,0.35)';
    case 'warning': return 'rgba(234,179,8,0.45)';
    case 'error':   return 'rgba(239,68,68,0.45)';
    default:        return 'var(--admin-border-subtle)';
  }
}

function statusBadgeBg(level: StatusLevel): string {
  switch (level) {
    case 'ok':      return 'rgba(34,197,94,0.15)';
    case 'warning': return 'rgba(234,179,8,0.15)';
    case 'error':   return 'rgba(239,68,68,0.15)';
    default:        return 'rgba(148,163,184,0.15)';
  }
}

function statusBadgeColor(level: StatusLevel): string {
  switch (level) {
    case 'ok':      return '#22c55e';
    case 'warning': return '#eab308';
    case 'error':   return '#ef4444';
    default:        return '#94a3b8';
  }
}

function StatusIcon({ level }: { level: StatusLevel }) {
  const props = { size: 16 };
  switch (level) {
    case 'ok':      return <CheckCircle {...props} color="#22c55e" />;
    case 'warning': return <AlertTriangle {...props} color="#eab308" />;
    case 'error':   return <XCircle {...props} color="#ef4444" />;
    default:        return <HelpCircle {...props} color="#94a3b8" />;
  }
}

function formatDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

function formatAge(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  return `${Math.round(hours)}h ago`;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MarketingStatusPanel: React.FC = () => {
  const [report, setReport] = useState<MarketingStatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketingStatusService.getMarketingStatus();
      setReport(data);
    } catch (err) {
      logger.error('MarketingStatusPanel: fetch failed', err);
      toast.error('Failed to load marketing status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSitemapRegen = async () => {
    setActionLoading('sitemap');
    try {
      await marketingStatusService.triggerSitemapRegeneration();
      toast.success('Sitemap regeneration triggered');
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      logger.error('MarketingStatusPanel: sitemap regen failed', err);
      toast.error('Failed to trigger sitemap regeneration');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeedUpdate = async () => {
    setActionLoading('feed');
    try {
      await marketingStatusService.triggerMerchantFeedUpdate();
      toast.success('Merchant feed update triggered');
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      logger.error('MarketingStatusPanel: feed update failed', err);
      toast.error('Failed to trigger feed update');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>
            <Globe size={22} />
            Marketing Pipeline Status
          </Title>
          <Subtitle>Real-time health of SEO, feeds, and indexing infrastructure</Subtitle>
        </div>
        <RefreshButton onClick={fetchStatus} loading={loading}>
          <RefreshCw size={14} />
          {loading ? 'Loading…' : 'Refresh'}
        </RefreshButton>
      </Header>

      {!loading && report && (
        <>
          <Grid>
            {/* SITEMAP */}
            <Card level={report.sitemap.status}>
              <CardHeader>
                <CardTitleRow>
                  <Map size={16} />
                  XML Sitemap
                </CardTitleRow>
                <Badge level={report.sitemap.status}>
                  {report.sitemap.status}
                </Badge>
              </CardHeader>
              <StatusIcon level={report.sitemap.status} />
              <CardMessage>{report.sitemap.message}</CardMessage>
              <MetaRow>
                <MetaItem><strong>Cars:</strong> {report.sitemap.carCount.toLocaleString()}</MetaItem>
                <MetaItem><strong>Last generated:</strong> {formatDate(report.sitemap.lastGenerated)}</MetaItem>
                <MetaItem><strong>Age:</strong> {formatAge(report.sitemap.ageHours)}</MetaItem>
              </MetaRow>
              <ActionButton
                onClick={handleSitemapRegen}
                disabled={actionLoading === 'sitemap'}
              >
                <RefreshCw size={12} />
                {actionLoading === 'sitemap' ? 'Triggering…' : 'Regenerate Now'}
              </ActionButton>
            </Card>

            {/* MERCHANT FEED */}
            <Card level={report.merchantFeed.status}>
              <CardHeader>
                <CardTitleRow>
                  <ShoppingBag size={16} />
                  Merchant Center Feed
                </CardTitleRow>
                <Badge level={report.merchantFeed.status}>
                  {report.merchantFeed.status}
                </Badge>
              </CardHeader>
              <StatusIcon level={report.merchantFeed.status} />
              <CardMessage>{report.merchantFeed.message}</CardMessage>
              <MetaRow>
                <MetaItem><strong>Products:</strong> {report.merchantFeed.productCount.toLocaleString()}</MetaItem>
                <MetaItem><strong>Last cached:</strong> {formatDate(report.merchantFeed.lastCached)}</MetaItem>
                <MetaItem><strong>Age:</strong> {formatAge(report.merchantFeed.ageHours)}</MetaItem>
              </MetaRow>
              <ActionButton
                onClick={handleFeedUpdate}
                disabled={actionLoading === 'feed'}
              >
                <RefreshCw size={12} />
                {actionLoading === 'feed' ? 'Triggering…' : 'Update Feed Cache'}
              </ActionButton>
            </Card>

            {/* IMAGE OPTIMIZATION */}
            <Card level={report.imageOptimization.status}>
              <CardHeader>
                <CardTitleRow>
                  <ImageIcon size={16} />
                  Image Optimization
                </CardTitleRow>
                <Badge level={report.imageOptimization.status}>
                  {report.imageOptimization.status}
                </Badge>
              </CardHeader>
              <StatusIcon level={report.imageOptimization.status} />
              <CardMessage>{report.imageOptimization.message}</CardMessage>
              <MetaRow>
                <MetaItem><strong>Processed:</strong> {report.imageOptimization.totalProcessed.toLocaleString()}</MetaItem>
                <MetaItem><strong>Pending:</strong> {report.imageOptimization.pendingCount.toLocaleString()}</MetaItem>
                <MetaItem><strong>Failed:</strong> {report.imageOptimization.failedCount.toLocaleString()}</MetaItem>
              </MetaRow>
            </Card>

            {/* INDEXNOW */}
            <Card level={report.indexNow.status}>
              <CardHeader>
                <CardTitleRow>
                  <Search size={16} />
                  IndexNow Submissions
                </CardTitleRow>
                <Badge level={report.indexNow.status}>
                  {report.indexNow.status}
                </Badge>
              </CardHeader>
              <StatusIcon level={report.indexNow.status} />
              <CardMessage>{report.indexNow.message}</CardMessage>
              <MetaRow>
                <MetaItem><strong>URLs submitted:</strong> {report.indexNow.urlsSubmitted.toLocaleString()}</MetaItem>
                <MetaItem><strong>Last submission:</strong> {formatDate(report.indexNow.lastSubmission)}</MetaItem>
              </MetaRow>
            </Card>

            {/* PRERENDER */}
            <Card level={report.prerender.status}>
              <CardHeader>
                <CardTitleRow>
                  <Globe size={16} />
                  Prerender / SEO Crawl
                </CardTitleRow>
                <Badge level={report.prerender.status}>
                  {report.prerender.status}
                </Badge>
              </CardHeader>
              <StatusIcon level={report.prerender.status} />
              <CardMessage>{report.prerender.message}</CardMessage>
              <MetaRow>
                {report.prerender.cacheHitRate !== null && (
                  <MetaItem>
                    <strong>Cache hit rate:</strong> {(report.prerender.cacheHitRate * 100).toFixed(1)}%
                  </MetaItem>
                )}
                <MetaItem><strong>Last activity:</strong> {formatDate(report.prerender.lastActivity)}</MetaItem>
              </MetaRow>
            </Card>
          </Grid>

          <FetchedAt>Last fetched: {report.fetchedAt.toLocaleTimeString()}</FetchedAt>
        </>
      )}

      {loading && (
        <CardMessage style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-secondary)' }}>
          Loading marketing pipeline status…
        </CardMessage>
      )}
    </Container>
  );
};

export default MarketingStatusPanel;
