import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Users,
  Car,
  MessageSquare,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { RealTimeAnalytics, UserActivity } from '../../services/super-admin-types';
import { adminTheme } from './styles/admin-theme';
import { useAdminLang } from '../../contexts/AdminLanguageContext';

interface AdminOverviewProps {
  analytics: RealTimeAnalytics | null;
  userActivity: UserActivity[];
  onUserClick: (user: any) => void;
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const OverviewContainer = styled.div`
  /* No background, let the shell's aurora show through */
  color: ${adminTheme.colors.text.primary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  ${adminTheme.glass.card}
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(15, 23, 42, 0.6);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${adminTheme.colors.accent.primary}, ${adminTheme.colors.accent.secondary});
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${adminTheme.shadows.glow};
    border-color: rgba(99, 102, 241, 0.3);

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      background: rgba(99, 102, 241, 0.2);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${adminTheme.colors.accent.secondary};
  transition: all 0.3s ease;
  border: 1px solid ${adminTheme.colors.border.light};

  svg {
    filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.5));
  }
`;

const TrendBadge = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${p => p.$positive ? adminTheme.colors.status.success : adminTheme.colors.status.error};
  border: 1px solid ${p => p.$positive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  margin-bottom: 4px;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  font-family: ${adminTheme.typography.fontFamily.mono};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${adminTheme.colors.text.secondary};
  font-weight: 500;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 40px 0 20px 0;
`;

const LiveIndicator = styled.div`
  width: 10px;
  height: 10px;
  background: ${adminTheme.colors.status.success};
  border-radius: 50%;
  box-shadow: 0 0 10px ${adminTheme.colors.status.success};
  animation: ${pulse} 2s infinite;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TableCard = styled.div`
  ${adminTheme.glass.card}
  border-radius: 16px;
  overflow: hidden;
  padding: 0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 2fr;
  padding: 16px 24px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid ${adminTheme.colors.border.subtle};
  color: ${adminTheme.colors.text.muted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 2fr;
  padding: 16px 24px;
  align-items: center;
  border-bottom: 1px solid ${adminTheme.colors.border.subtle};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(99, 102, 241, 0.05);

    ${IconWrapper} {
      background: ${adminTheme.colors.accent.primary};
      color: white;
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  [dir="rtl"] & {
    gap: 12px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${adminTheme.colors.bg.tertiary}, ${adminTheme.colors.bg.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${adminTheme.colors.text.accent};
  border: 1px solid ${adminTheme.colors.border.light};
  font-size: 1rem;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  
  strong {
    color: ${adminTheme.colors.text.primary};
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  span {
    color: ${adminTheme.colors.text.muted};
    font-size: 0.75rem;
  }
`;

const StatusChip = styled.span<{ $online: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)'};
  color: ${p => p.$online ? adminTheme.colors.status.success : adminTheme.colors.text.muted};
  border: 1px solid ${p => p.$online ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)'};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  color: ${adminTheme.colors.text.muted};
  font-family: ${adminTheme.typography.fontFamily.mono};
`;

const AdminOverview: React.FC<AdminOverviewProps> = ({
  analytics,
  userActivity,
  onUserClick
}) => {
  const { t } = useAdminLang();

  if (!analytics) {
    return (
      <OverviewContainer>
        <LoadingState>{t.common.initializing}</LoadingState>
      </OverviewContainer>
    );
  }

  const stats = [
    {
      label: t.dashboard.totalUsers,
      value: analytics.totalUsers,
      trend: `+${analytics.activeUsers} ${t.trends.active}`,
      positive: true,
      icon: Users,
    },
    {
      label: t.dashboard.listings,
      value: analytics.totalCars,
      trend: `+${analytics.activeCars} ${t.trends.active}`,
      positive: true,
      icon: Car,
    },
    {
      label: t.dashboard.messages,
      value: analytics.totalMessages,
      trend: t.trends.spike,
      positive: true,
      icon: Zap,
    },
    {
      label: t.dashboard.views,
      value: analytics.totalViews,
      trend: t.trends.growing,
      positive: true,
      icon: Eye,
    },
    {
      label: t.dashboard.revenue,
      value: `€${analytics.revenue.toFixed(2)}`,
      trend: `+12% ${t.trends.growth}`,
      positive: true,
      icon: DollarSign,
    },
    {
      label: t.dashboard.uptime,
      value: '99.9%',
      trend: t.trends.optimal,
      positive: true,
      icon: Activity,
    },
  ];

  return (
    <OverviewContainer>
      <StatsGrid>
        {stats.map((stat, i) => (
          <StatCard key={i}>
            <CardHeader>
              <IconWrapper className="icon-wrapper">
                <stat.icon size={22} />
              </IconWrapper>
              <TrendBadge $positive={stat.positive}>
                <TrendingUp size={12} />
                {stat.trend}
              </TrendBadge>
            </CardHeader>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <SectionHeader>
        <LiveIndicator />
        <SectionTitle>{t.dashboard.recentActivity}</SectionTitle>
      </SectionHeader>

      <TableCard>
        <TableHeader>
          <div>{t.table.identity}</div>
          <div>{t.common.status}</div>
          <div>{t.table.coordinates}</div>
          <div>{t.table.lastUplink}</div>
          <div>{t.table.clientVector}</div>
        </TableHeader>

        {userActivity.slice(0, 5).map((user, index) => (
          <TableRow key={index} onClick={() => onUserClick(user)}>
            <UserInfo>
              <Avatar>
                {user.displayName?.charAt(0) || 'U'}
              </Avatar>
              <InfoText>
                <strong>{user.displayName || t.common.unknown}</strong>
                <span>{user.email || t.table.noSignature}</span>
              </InfoText>
            </UserInfo>

            <div>
              <StatusChip $online={user.isOnline || false}>
                {user.isOnline ? t.common.online : t.common.offline}
              </StatusChip>
            </div>

            <InfoText>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {user.location || t.common.unknown}
              </span>
            </InfoText>

            <InfoText>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </span>
            </InfoText>

            <InfoText>
              <span>{user.browser?.split(' ')[0] || t.common.unknown}</span>
            </InfoText>
          </TableRow>
        ))}
      </TableCard>
    </OverviewContainer>
  );
};

export default AdminOverview;
