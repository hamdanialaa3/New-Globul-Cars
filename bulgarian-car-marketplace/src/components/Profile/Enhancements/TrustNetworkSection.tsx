/**
 * Trust Network Section
 * Displays user's trust connections and network
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, UserCheck, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { TrustConnection, TrustNetworkStats } from '@/types/profile-enhancements.types';
import { trustNetworkService } from '@/services/profile/trust-network.service';

const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  text-align: center;
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConnectionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ConnectionCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  }
`;

const ConnectionIcon = styled.div<{ $type: string; $isDark: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$type === 'partner') return props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)';
    if (props.$type === 'recommended') return props.$isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)';
    return props.$isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)';
  }};
  color: ${props => {
    if (props.$type === 'partner') return '#3b82f6';
    if (props.$type === 'recommended') return '#22c55e';
    return '#fbbf24';
  }};
`;

const ConnectionInfo = styled.div`
  flex: 1;
`;

const ConnectionName = styled.div<{ $isDark: boolean }>`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 4px;
`;

const ConnectionType = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const ViewAllButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  width: 100%;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
    border-color: ${props => props.$isDark ? '#64748b' : '#cbd5e1'};
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const EmptyIcon = styled.div<{ $isDark: boolean }>`
  margin-bottom: 16px;
  opacity: 0.5;
  color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0;
`;

interface TrustNetworkSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const TrustNetworkSection: React.FC<TrustNetworkSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [connections, setConnections] = useState<TrustConnection[]>([]);
  const [stats, setStats] = useState<TrustNetworkStats>({
    partners: 0,
    recommendedBy: 0,
    recommendedTo: 0,
    verifiedConnections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't load if userId is invalid
    if (!userId || typeof userId !== 'string') {
      setLoading(false);
      return;
    }

    const loadConnections = async () => {
      try {
        const loadedConnections = await trustNetworkService.getIncomingConnections(userId, 'active');
        setConnections((loadedConnections || []).slice(0, 6));

        // Get stats
        const networkStats = await trustNetworkService.getNetworkStats(userId);
        setStats(networkStats || {
          partners: 0,
          recommendedBy: 0,
          recommendedTo: 0,
          verifiedConnections: 0
        });
      } catch (error) {
        console.error('Error loading trust network:', error);
        setConnections([]);
        setStats({
          partners: 0,
          recommendedBy: 0,
          recommendedTo: 0,
          verifiedConnections: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, [userId]);

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'partner':
        return <Users size={20} />;
      case 'recommended':
        return <UserCheck size={20} />;
      case 'verified':
        return <Shield size={20} />;
      default:
        return <Users size={20} />;
    }
  };

  const getConnectionTypeLabel = (type: string) => {
    if (language === 'bg') {
      switch (type) {
        case 'partner':
          return 'Партньор';
        case 'recommended':
          return 'Препоръчан';
        case 'verified':
          return 'Верифициран';
        default:
          return 'Връзка';
      }
    } else {
      switch (type) {
        case 'partner':
          return 'Partner';
        case 'recommended':
          return 'Recommended';
        case 'verified':
          return 'Verified';
        default:
          return 'Connection';
      }
    }
  };

  if (loading) {
    return null;
  }

  if (stats.partners === 0 && stats.recommendedBy === 0 && stats.verifiedConnections === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Users size={20} />
          {language === 'bg' ? 'Мрежа на доверие' : 'Trust Network'}
        </SectionTitle>
      </SectionHeader>

      <StatsGrid>
        <StatCard $isDark={isDark}>
          <StatValue $isDark={isDark}>{stats.partners}</StatValue>
          <StatLabel $isDark={isDark}>
            {language === 'bg' ? 'Партньори' : 'Partners'}
          </StatLabel>
        </StatCard>
        <StatCard $isDark={isDark}>
          <StatValue $isDark={isDark}>{stats.recommendedBy}</StatValue>
          <StatLabel $isDark={isDark}>
            {language === 'bg' ? 'Препоръчани' : 'Recommended'}
          </StatLabel>
        </StatCard>
        <StatCard $isDark={isDark}>
          <StatValue $isDark={isDark}>{stats.verifiedConnections}</StatValue>
          <StatLabel $isDark={isDark}>
            {language === 'bg' ? 'Верифицирани' : 'Verified'}
          </StatLabel>
        </StatCard>
      </StatsGrid>

      {connections.length === 0 ? (
        <EmptyState $isDark={isDark}>
          <EmptyIcon $isDark={isDark}>
            <Users size={48} />
          </EmptyIcon>
          <EmptyText $isDark={isDark}>
            {language === 'bg' 
              ? 'Все още няма връзки в мрежата'
              : 'No connections in network yet'}
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <ConnectionsList>
            {connections.slice(0, 3).map(connection => (
              <ConnectionCard key={connection.id} $isDark={isDark}>
                <ConnectionIcon $type={connection.type} $isDark={isDark}>
                  {getConnectionIcon(connection.type)}
                </ConnectionIcon>
                <ConnectionInfo>
                  <ConnectionName $isDark={isDark}>
                    {connection.note || getConnectionTypeLabel(connection.type)}
                  </ConnectionName>
                  <ConnectionType $isDark={isDark}>
                    {getConnectionTypeLabel(connection.type)}
                  </ConnectionType>
                </ConnectionInfo>
              </ConnectionCard>
            ))}
          </ConnectionsList>
          {connections.length > 3 && (
            <ViewAllButton $isDark={isDark}>
              {language === 'bg' ? 'Виж всички' : 'View All'}
              <ArrowRight size={16} />
            </ViewAllButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default TrustNetworkSection;


