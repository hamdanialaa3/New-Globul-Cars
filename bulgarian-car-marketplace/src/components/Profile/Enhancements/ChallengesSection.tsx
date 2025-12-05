import { logger } from '../../../services/logger-service';
/**
 * Monthly Challenges Section
 * Displays active monthly challenges and user progress
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Target, Trophy, CheckCircle, Award } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { challengesService } from '../../../services/profile/challenges.service';
import type { MonthlyChallenge, UserChallengeProgress } from '../../../types/profile-enhancements.types';

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

const ChallengesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChallengeCard = styled.div<{ $isDark: boolean; $completed: boolean }>`
  padding: 20px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 2px solid ${props => 
    props.$completed 
      ? '#22c55e' 
      : props.$isDark ? '#1e293b' : '#e2e8f0'};
  transition: all 0.2s ease;
`;

const ChallengeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ChallengeIcon = styled.div<{ $isDark: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$completed 
      ? 'rgba(34, 197, 94, 0.2)' 
      : props.$isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)'};
  color: ${props => props.$completed ? '#22c55e' : '#fbbf24'};
`;

const ChallengeInfo = styled.div`
  flex: 1;
`;

const ChallengeTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin: 0 0 4px 0;
`;

const ChallengeDescription = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0;
`;

const ProgressBar = styled.div<{ $isDark: boolean }>`
  width: 100%;
  height: 8px;
  background: ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled.div<{ $percentage: number; $completed: boolean }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$completed ? '#22c55e' : '#fbbf24'};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-align: center;
  margin-top: 8px;
`;

const RewardInfo = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

interface ChallengesSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [challenges, setChallenges] = useState<Array<{
    challenge: MonthlyChallenge;
    progress: UserChallengeProgress | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isOwnProfile) {
      setLoading(false);
      return;
    }

    const loadChallenges = async () => {
      try {
        const userChallenges = await challengesService.getUserActiveChallenges(userId);
        setChallenges(userChallenges);
      } catch (error) {
        logger.error('Error loading challenges:', error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [userId, isOwnProfile]);

  if (loading) {
    return null;
  }

  if (challenges.length === 0) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Target size={20} />
          {language === 'bg' ? 'Месечни предизвикателства' : 'Monthly Challenges'}
        </SectionTitle>
      </SectionHeader>

      <ChallengesList>
        {challenges.map(({ challenge, progress }) => {
          const currentProgress = progress?.currentProgress || 0;
          const isCompleted = progress?.isCompleted || false;
          const percentage = Math.min(100, (currentProgress / challenge.target) * 100);

          return (
            <ChallengeCard 
              key={challenge.id} 
              $isDark={isDark} 
              $completed={isCompleted}
            >
              <ChallengeHeader>
                <ChallengeIcon $isDark={isDark} $completed={isCompleted}>
                  {isCompleted ? <CheckCircle size={20} /> : <Target size={20} />}
                </ChallengeIcon>
                <ChallengeInfo>
                  <ChallengeTitle $isDark={isDark}>
                    {language === 'bg' ? challenge.title : challenge.titleEN}
                  </ChallengeTitle>
                  <ChallengeDescription $isDark={isDark}>
                    {language === 'bg' ? challenge.description : challenge.descriptionEN}
                  </ChallengeDescription>
                </ChallengeInfo>
              </ChallengeHeader>

              <ProgressBar $isDark={isDark}>
                <ProgressFill $percentage={percentage} $completed={isCompleted} />
              </ProgressBar>
              <ProgressText $isDark={isDark}>
                {currentProgress} / {challenge.target} {language === 'bg' ? 'завършени' : 'completed'}
              </ProgressText>

              <RewardInfo $isDark={isDark}>
                <Award size={16} />
                {language === 'bg' ? 'Награда' : 'Reward'}: {challenge.reward.points} {language === 'bg' ? 'точки' : 'points'}
                {challenge.reward.badge && ` + ${challenge.reward.badge}`}
              </RewardInfo>
            </ChallengeCard>
          );
        })}
      </ChallengesList>
    </SectionContainer>
  );
};

export default ChallengesSection;

