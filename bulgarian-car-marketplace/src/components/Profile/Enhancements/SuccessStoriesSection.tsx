/**
 * Success Stories Section
 * Displays user's success stories and achievements
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, TrendingUp, Calendar, Plus, Edit2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import type { SuccessStory } from '../../../types/profile-enhancements.types';
import { successStoriesService } from '../../../services/profile/success-stories.service';
import { logger } from '../../../services/logger-service';

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

const AddButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
    border-color: ${props => props.$isDark ? '#64748b' : '#cbd5e1'};
  }
`;

const StoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StoryCard = styled.div<{ $isDark: boolean }>`
  padding: 20px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const StoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const StoryIcon = styled.div<{ $type: string; $isDark: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$type === 'sale') return props.$isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)';
    if (props.$type === 'achievement') return props.$isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)';
    return props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)';
  }};
  color: ${props => {
    if (props.$type === 'sale') return '#22c55e';
    if (props.$type === 'achievement') return '#fbbf24';
    return '#3b82f6';
  }};
`;

const StoryTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin: 0;
  flex: 1;
`;

const StoryDescription = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const StoryFooter = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
`;

const StoryValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#22c55e' : '#16a34a'};
`;

const StoryDate = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#94a3b8'};
  display: flex;
  align-items: center;
  gap: 4px;
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

interface SuccessStoriesSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't load if userId is invalid
    if (!userId || typeof userId !== 'string') {
      setLoading(false);
      return;
    }

    const loadStories = async () => {
      try {
        const loadedStories = await successStoriesService.getPublicStories(userId, 6);
        setStories(loadedStories || []);
      } catch (error) {
        logger.error('Error loading success stories:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [userId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : 'en-US',
      { month: 'short', year: 'numeric' }
    ).format(date);
  };

  const getStoryIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp size={20} />;
      case 'achievement':
        return <Trophy size={20} />;
      default:
        return <Trophy size={20} />;
    }
  };

  if (loading) {
    return null;
  }

  if (stories.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Trophy size={20} />
          {language === 'bg' ? 'Истории на успех' : 'Success Stories'}
        </SectionTitle>
        {isOwnProfile && (
          <AddButton $isDark={isDark}>
            <Plus size={16} />
            {language === 'bg' ? 'Добави' : 'Add'}
          </AddButton>
        )}
      </SectionHeader>

      {stories.length === 0 ? (
        <EmptyState $isDark={isDark}>
          <EmptyIcon $isDark={isDark}>
            <Trophy size={48} />
          </EmptyIcon>
          <EmptyText $isDark={isDark}>
            {language === 'bg' 
              ? 'Все още няма истории на успех'
              : 'No success stories yet'}
          </EmptyText>
        </EmptyState>
      ) : (
        <StoriesGrid>
          {stories.map(story => (
            <StoryCard key={story.id} $isDark={isDark}>
              <StoryHeader>
                <StoryIcon $type={story.type} $isDark={isDark}>
                  {getStoryIcon(story.type)}
                </StoryIcon>
                <StoryTitle $isDark={isDark}>{story.title}</StoryTitle>
              </StoryHeader>
              <StoryDescription $isDark={isDark}>
                {story.description}
              </StoryDescription>
              <StoryFooter $isDark={isDark}>
                {story.value && (
                  <StoryValue $isDark={isDark}>
                    {story.value} {language === 'bg' ? 'коли' : 'cars'}
                  </StoryValue>
                )}
                <StoryDate $isDark={isDark}>
                  <Calendar size={12} />
                  {formatDate(story.date)}
                </StoryDate>
              </StoryFooter>
            </StoryCard>
          ))}
        </StoriesGrid>
      )}
    </SectionContainer>
  );
};

export default SuccessStoriesSection;

