import { logger } from '../../../services/logger-service';
/**
 * Leaderboard Section
 * Displays leaderboard rankings
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { leaderboardService } from '../../../services/profile/leaderboard.service';
import type { Leaderboard, LeaderboardCategory, LeaderboardPeriod } from '../../../types/profile-enhancements.types';

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
  flex-wrap: wrap;
  gap: 12px;
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

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $isDark: boolean; $active: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$active
    ? (props.$isDark ? '#3b82f6' : '#3b82f6')
    : (props.$isDark ? '#334155' : '#f8fafc')};
  color: ${props => props.$active
    ? '#ffffff'
    : (props.$isDark ? '#cbd5e1' : '#64748b')};
  border: 1px solid ${props => props.$active
    ? '#3b82f6'
    : (props.$isDark ? '#475569' : '#e2e8f0')};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active
      ? '#2563eb'
      : (props.$isDark ? '#475569' : '#f1f5f9')};
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LeaderboardEntry = styled.div<{ $isDark: boolean; $rank: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 8px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  border-left: 3px solid ${props => {
    if (props.$rank === 1) return '#fbbf24'; // Gold
    if (props.$rank === 2) return '#94a3b8'; // Silver
    if (props.$rank === 3) return '#cd7f32'; // Bronze
    return props.$isDark ? '#1e293b' : '#e2e8f0';
  }};
`;

const RankBadge = styled.div<{ $rank: number; $isDark: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  background: ${props => {
    if (props.$rank === 1) return '#fbbf24';
    if (props.$rank === 2) return '#94a3b8';
    if (props.$rank === 3) return '#cd7f32';
    return props.$isDark ? '#334155' : '#e2e8f0';
  }};
  color: ${props => {
    if (props.$rank <= 3) return '#ffffff';
    return props.$isDark ? '#cbd5e1' : '#64748b';
  }};
`;

const EntryInfo = styled.div`
  flex: 1;
`;

const EntryName = styled.div<{ $isDark: boolean }>`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 2px;
`;

const EntryValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#22c55e' : '#16a34a'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChangeIndicator = styled.div<{ $change: number; $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$change > 0) return '#22c55e';
    if (props.$change < 0) return '#ef4444';
    return props.$isDark ? '#94a3b8' : '#64748b';
  }};
`;

interface LeaderboardSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [category, setCategory] = useState<LeaderboardCategory>('total_sales');
  const [period, setPeriod] = useState<LeaderboardPeriod>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardService.getLeaderboard(category, period, 10);
        setLeaderboard(data);
      } catch (error: any) {
        // Log error with more context
        logger.error('Error loading leaderboard:', error, {
          category,
          period,
          errorCode: error?.code,
          errorMessage: error?.message
        });
        
        // Set empty leaderboard instead of null to show UI gracefully
        setLeaderboard({
          category,
          period,
          entries: [],
          updatedAt: new Date() as any
        });
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [category, period]);

  const categories: Array<{ value: LeaderboardCategory; label: string; labelEN: string }> = [
    { value: 'total_sales', label: 'Продажби', labelEN: 'Sales' },
    { value: 'total_revenue', label: 'Приход', labelEN: 'Revenue' },
    { value: 'total_points', label: 'Точки', labelEN: 'Points' }
  ];

  const periods: Array<{ value: LeaderboardPeriod; label: string; labelEN: string }> = [
    { value: 'daily', label: 'Днес', labelEN: 'Today' },
    { value: 'weekly', label: 'Тази седмица', labelEN: 'This Week' },
    { value: 'monthly', label: 'Този месец', labelEN: 'This Month' },
    { value: 'all_time', label: 'Всички времена', labelEN: 'All Time' }
  ];

  const formatValue = (value: number, cat: LeaderboardCategory) => {
    if (cat === 'total_revenue') {
      return `€${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Trophy size={20} />
          {language === 'bg' ? 'Класация' : 'Leaderboard'}
        </SectionTitle>
        <FilterGroup>
          {categories.map(cat => (
            <FilterButton
              key={cat.value}
              $isDark={isDark}
              $active={category === cat.value}
              onClick={() => setCategory(cat.value)}
            >
              {language === 'bg' ? cat.label : cat.labelEN}
            </FilterButton>
          ))}
        </FilterGroup>
        <FilterGroup>
          {periods.map(p => (
            <FilterButton
              key={p.value}
              $isDark={isDark}
              $active={period === p.value}
              onClick={() => setPeriod(p.value)}
            >
              {language === 'bg' ? p.label : p.labelEN}
            </FilterButton>
          ))}
        </FilterGroup>
      </SectionHeader>

      {!leaderboard || leaderboard.entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: isDark ? '#94a3b8' : '#64748b' }}>
          <Trophy size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            {language === 'bg' 
              ? 'Все още няма данни'
              : 'No data available yet'}
          </p>
        </div>
      ) : (
        <LeaderboardList>
          {leaderboard.entries.map(entry => (
            <LeaderboardEntry key={entry.userId} $isDark={isDark} $rank={entry.rank}>
              <RankBadge $rank={entry.rank} $isDark={isDark}>
                {entry.rank}
              </RankBadge>
              <EntryInfo>
                <EntryName $isDark={isDark}>{entry.displayName}</EntryName>
                <EntryValue $isDark={isDark}>
                  {formatValue(entry.value, category)}
                  {entry.change !== 0 && (
                    <ChangeIndicator $change={entry.change} $isDark={isDark}>
                      {entry.change > 0 ? (
                        <TrendingUp size={12} />
                      ) : entry.change < 0 ? (
                        <TrendingDown size={12} />
                      ) : (
                        <Minus size={12} />
                      )}
                      {Math.abs(entry.change)}
                    </ChangeIndicator>
                  )}
                </EntryValue>
              </EntryInfo>
            </LeaderboardEntry>
          ))}
        </LeaderboardList>
      )}
    </SectionContainer>
  );
};

export default LeaderboardSection;

