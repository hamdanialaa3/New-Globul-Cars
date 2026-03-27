import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Users,
  Car,
  MessageSquare,
  Eye,
  DollarSign,
  Database,
  HardDrive,
  Download,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Layers,
  Server
} from 'lucide-react';
import { liveFirebaseCountersService } from '../../services/live-firebase-counters-service';
import { logger } from '../../services/logger-service';
import { adminTheme } from './styles/admin-theme';
import { useAdminLang } from '../../contexts/AdminLanguageContext';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
`;

interface LiveCountersProps {
  stats: {
    totalCars: number;
    totalUsers: number;
    totalViews: number;
  };
  onAction?: (action: string) => void;
}

const CountersContainer = styled.div`
  margin-bottom: 40px;
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-left: 8px;
`;

const LivePulse = styled.div`
  width: 8px;
  height: 8px;
  background: ${adminTheme.colors.status.success};
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
`;

const SectionTitle = styled.h2`
  color: ${adminTheme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.5px;
  
  svg {
    color: ${adminTheme.colors.accent.tertiary};
  }
`;

const CountersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  perspective: 1000px;
`;

const CounterCard = styled.div<{ $interactive?: boolean }>`
  ${adminTheme.glass.card}
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  cursor: ${props => props.$interactive ? 'pointer' : 'default'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.1);
    background: rgba(30, 41, 59, 0.5);
    border-color: ${adminTheme.colors.accent.primary};

    .icon-bg {
      transform: scale(1.1);
      background: rgba(99, 102, 241, 0.2);
    }
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px solid ${adminTheme.colors.border.light};
  transition: all 0.3s ease;
  color: ${adminTheme.colors.accent.secondary};
  
  svg {
    filter: drop-shadow(0 0 3px rgba(37, 99, 235, 0.4));
  }
`;

const CounterValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  font-family: ${adminTheme.typography.fontFamily.mono};
  letter-spacing: -1px;
`;

const CounterLabel = styled.div`
  font-size: 0.75rem;
  color: ${adminTheme.colors.text.muted};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  background: ${adminTheme.colors.accent.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;

  ${CounterCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
  
  [dir="rtl"] & {
    right: auto;
    left: 12px;
    transform: translateX(-10px);
  }
`;

const LiveCounters: React.FC<LiveCountersProps> = ({ stats, onAction }) => {
  const [counters, setCounters] = useState<any>({});
  const { t } = useAdminLang();

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const data = await liveFirebaseCountersService.getLiveAnalytics();
        setCounters(data);
      } catch (error) {
        logger.error('Error fetching counters', error as Error);
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 5000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    // Interactive Metrics
    {
      id: 'users',
      label: t.dashboard.totalUsers,
      value: stats?.totalUsers || 0,
      icon: Users,
      action: t.dashboard.manage,
      interactive: true
    },
    {
      id: 'cars',
      label: t.dashboard.listings,
      value: stats?.totalCars || 0,
      icon: Car,
      action: t.dashboard.manage,
      interactive: true
    },
    {
      id: 'views',
      label: t.dashboard.views,
      value: stats?.totalViews || 0,
      icon: Eye,
      action: t.dashboard.analyze,
      interactive: true
    },
    {
      id: 'messages',
      label: t.dashboard.messages,
      value: counters?.totalMessages || 0,
      icon: MessageSquare,
      action: t.dashboard.inbox,
      interactive: true
    },
    {
      id: 'revenue',
      label: t.dashboard.revenue,
      value: `€${counters?.totalRevenue || 0}`,
      icon: DollarSign,
      action: t.dashboard.audit,
      interactive: true
    },
    // System Metrics
    {
      id: 'storage',
      label: t.dashboard.storage,
      value: `${counters?.storageUsage || 0} MB`,
      icon: HardDrive,
    },
    {
      id: 'reads',
      label: t.dashboard.dbReads,
      value: counters?.firestoreReads || 0,
      icon: Database,
    },
    {
      id: 'writes',
      label: t.dashboard.dbWrites,
      value: counters?.firestoreWrites || 0,
      icon: Server,
    },
    {
      id: 'functions',
      label: t.dashboard.functions,
      value: counters?.functionInvocations || 0,
      icon: Zap,
    },
    {
      id: 'health',
      label: t.dashboard.health,
      value: counters?.systemHealth || 'OK',
      icon: Activity,
    },
  ];

  return (
    <CountersContainer>
      <SectionHeader>
        <LivePulse />
        <SectionTitle>
          {t.dashboard.metrics}
        </SectionTitle>
      </SectionHeader>

      <CountersGrid>
        {items.map((item) => (
          <CounterCard
            key={item.id}
            $interactive={item.interactive}
            onClick={() => item.interactive && onAction?.(item.id)}
          >
            <IconWrapper className="icon-bg">
              <item.icon size={20} />
            </IconWrapper>

            {item.interactive && (
              <ActionBadge>{item.action}</ActionBadge>
            )}

            <CounterValue>
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </CounterValue>
            <CounterLabel>{item.label}</CounterLabel>
          </CounterCard>
        ))}
      </CountersGrid>
    </CountersContainer>
  );
};

export default LiveCounters;

