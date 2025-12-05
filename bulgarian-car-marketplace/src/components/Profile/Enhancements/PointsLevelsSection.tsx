import { logger } from '../../../services/logger-service';
/**
 * Points & Levels System Section
 * Displays user's points, level, and achievements
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Award, TrendingUp, Star, Target, Zap } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import type { UserPoints, UserLevel, LevelConfig } from '../../../types/profile-enhancements.types';
import { pointsLevelsService } from '../../../services/profile/points-levels.service';

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
  margin-bottom: 24px;
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

const LevelCard = styled.div<{ $isDark: boolean; $levelColor: string }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 2px solid ${props => props.$levelColor};
  margin-bottom: 24px;
  text-align: center;
`;

const LevelBadge = styled.div<{ $levelColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$levelColor};
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 16px;
`;

const PointsDisplay = styled.div<{ $isDark: boolean }>`
  font-size: 2.5rem;
  font-weight: 900;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 8px;
`;

const PointsLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin-bottom: 16px;
`;

const ProgressBar = styled.div<{ $isDark: boolean }>`
  width: 100%;
  height: 8px;
  background: ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number; $levelColor: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$levelColor};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-align: center;
`;

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ActivityCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActivityIcon = styled.div<{ $isDark: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'};
  color: #3b82f6;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityPoints = styled.div<{ $isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#22c55e' : '#16a34a'};
  margin-bottom: 2px;
`;

const ActivityLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const LEVEL_CONFIGS: Record<UserLevel, LevelConfig> = {
  beginner: {
    level: 'beginner',
    minPoints: 0,
    maxPoints: 100,
    labelBG: 'Начинаещ',
    labelEN: 'Beginner',
    badgeColor: '#94a3b8',
    benefits: []
  },
  intermediate: {
    level: 'intermediate',
    minPoints: 100,
    maxPoints: 500,
    labelBG: 'Среден',
    labelEN: 'Intermediate',
    badgeColor: '#3b82f6',
    benefits: []
  },
  advanced: {
    level: 'advanced',
    minPoints: 500,
    maxPoints: 1500,
    labelBG: 'Напреднал',
    labelEN: 'Advanced',
    badgeColor: '#8b5cf6',
    benefits: []
  },
  expert: {
    level: 'expert',
    minPoints: 1500,
    maxPoints: 5000,
    labelBG: 'Експерт',
    labelEN: 'Expert',
    badgeColor: '#f59e0b',
    benefits: []
  },
  maestro: {
    level: 'maestro',
    minPoints: 5000,
    maxPoints: Infinity,
    labelBG: 'Маестро',
    labelEN: 'Maestro',
    badgeColor: '#ef4444',
    benefits: []
  }
};

const ACTIVITY_POINTS = {
  listing_created: 10,
  listing_sold: 50,
  positive_review: 20,
  profile_completed: 15,
  verification_completed: 25,
  first_sale: 100,
  milestone_100_listings: 200,
  daily_login: 5,
  referral: 30,
  social_share: 10
};

interface PointsLevelsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const PointsLevelsSection: React.FC<PointsLevelsSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't load if userId is invalid
    if (!userId || typeof userId !== 'string') {
      setLoading(false);
      return;
    }

    const loadUserPoints = async () => {
      try {
        const points = await pointsLevelsService.getUserPoints(userId);
        if (points) {
          setUserPoints(points);
        } else {
          // Initialize if doesn't exist
          const initialized = await pointsLevelsService.initializeUserPoints(userId);
          if (initialized) {
            setUserPoints(initialized);
          }
        }
      } catch (error) {
        logger.error('Error loading user points:', error);
        setUserPoints(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserPoints();
  }, [userId]);

  const getCurrentLevelConfig = (): LevelConfig => {
    if (!userPoints) return LEVEL_CONFIGS.beginner;
    return LEVEL_CONFIGS[userPoints.currentLevel] || LEVEL_CONFIGS.beginner;
  };

  const calculateProgress = (): number => {
    if (!userPoints) return 0;
    const config = getCurrentLevelConfig();
    const range = config.maxPoints - config.minPoints;
    const current = userPoints.totalPoints - config.minPoints;
    return Math.min(100, Math.max(0, (current / range) * 100));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing_created':
        return <Target size={20} />;
      case 'listing_sold':
        return <TrendingUp size={20} />;
      case 'positive_review':
        return <Star size={20} />;
      default:
        return <Zap size={20} />;
    }
  };

  const getActivityLabel = (type: string): string => {
    if (language === 'bg') {
      switch (type) {
        case 'listing_created':
          return 'Създадена обява';
        case 'listing_sold':
          return 'Продадена кола';
        case 'positive_review':
          return 'Положителна рецензия';
        case 'profile_completed':
          return 'Завършен профил';
        case 'verification_completed':
          return 'Завършена верификация';
        case 'first_sale':
          return 'Първа продажба';
        case 'milestone_100_listings':
          return '100 обяви';
        case 'daily_login':
          return 'Дневен вход';
        case 'referral':
          return 'Препоръка';
        case 'social_share':
          return 'Споделяне';
        default:
          return 'Дейност';
      }
    } else {
      switch (type) {
        case 'listing_created':
          return 'Listing Created';
        case 'listing_sold':
          return 'Car Sold';
        case 'positive_review':
          return 'Positive Review';
        case 'profile_completed':
          return 'Profile Completed';
        case 'verification_completed':
          return 'Verification Completed';
        case 'first_sale':
          return 'First Sale';
        case 'milestone_100_listings':
          return '100 Listings';
        case 'daily_login':
          return 'Daily Login';
        case 'referral':
          return 'Referral';
        case 'social_share':
          return 'Social Share';
        default:
          return 'Activity';
      }
    }
  };

  if (loading) {
    return null;
  }

  if (!userPoints) {
    return null;
  }

  const levelConfig = getCurrentLevelConfig();
  const progress = calculateProgress();

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Award size={20} />
          {language === 'bg' ? 'Точки и нива' : 'Points & Levels'}
        </SectionTitle>
      </SectionHeader>

      <LevelCard $isDark={isDark} $levelColor={levelConfig.badgeColor}>
        <LevelBadge $levelColor={levelConfig.badgeColor}>
          <Star size={16} />
          {language === 'bg' ? levelConfig.labelBG : levelConfig.labelEN}
        </LevelBadge>
        <PointsDisplay $isDark={isDark}>
          {userPoints.totalPoints.toLocaleString()}
        </PointsDisplay>
        <PointsLabel $isDark={isDark}>
          {language === 'bg' ? 'Общо точки' : 'Total Points'}
        </PointsLabel>
        <ProgressBar $isDark={isDark}>
          <ProgressFill $percentage={progress} $levelColor={levelConfig.badgeColor} />
        </ProgressBar>
        <ProgressText $isDark={isDark}>
          {userPoints.pointsToNextLevel} {language === 'bg' ? 'точки до следващото ниво' : 'points to next level'}
        </ProgressText>
      </LevelCard>

      {userPoints.activities.length > 0 && (
        <>
          <SectionTitle $isDark={isDark} style={{ marginBottom: '16px', fontSize: '1rem' }}>
            {language === 'bg' ? 'Последни дейности' : 'Recent Activities'}
          </SectionTitle>
          <ActivitiesGrid>
            {userPoints.activities.slice(0, 6).map((activity, index) => (
              <ActivityCard key={index} $isDark={isDark}>
                <ActivityIcon $isDark={isDark}>
                  {getActivityIcon(activity.activityType)}
                </ActivityIcon>
                <ActivityInfo>
                  <ActivityPoints $isDark={isDark}>+{activity.points}</ActivityPoints>
                  <ActivityLabel $isDark={isDark}>
                    {getActivityLabel(activity.activityType)}
                  </ActivityLabel>
                </ActivityInfo>
              </ActivityCard>
            ))}
          </ActivitiesGrid>
        </>
      )}
    </SectionContainer>
  );
};

export default PointsLevelsSection;


