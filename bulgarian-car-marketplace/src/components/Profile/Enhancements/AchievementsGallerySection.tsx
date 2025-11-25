/**
 * Achievements Gallery Section
 * Displays user achievements and certificates
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Award, Trophy, Star, Shield, Zap, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { achievementsGalleryService } from '@/services/profile/achievements-gallery.service';
import type { AchievementBadge } from '@/types/profile-enhancements.types';

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

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
`;

const BadgeCard = styled.div<{ $isDark: boolean; $rarity: AchievementBadge['rarity'] }>`
  position: relative;
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 2px solid ${props => {
    switch (props.$rarity) {
      case 'legendary': return '#fbbf24';
      case 'epic': return '#8b5cf6';
      case 'rare': return '#3b82f6';
      default: return props.$isDark ? '#1e293b' : '#e2e8f0';
    }
  }};
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$isDark 
      ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
      : '0 8px 16px rgba(0, 0, 0, 0.1)'};
  }
`;

const BadgeIcon = styled.div<{ $color: string; $isDark: boolean }>`
  width: 56px;
  height: 56px;
  margin: 0 auto 8px;
  border-radius: 50%;
  background: ${props => `${props.$color}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
`;

const BadgeTitle = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 4px;
  line-height: 1.2;
`;

const BadgeDate = styled.div<{ $isDark: boolean }>`
  font-size: 0.625rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const RarityLabel = styled.div<{ $rarity: AchievementBadge['rarity']; $isDark: boolean }>`
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$rarity) {
      case 'legendary': return '#fbbf24';
      case 'epic': return '#8b5cf6';
      case 'rare': return '#3b82f6';
      default: return props.$isDark ? '#334155' : '#e2e8f0';
    }
  }};
  color: ${props => props.$rarity === 'common' 
    ? (props.$isDark ? '#cbd5e1' : '#64748b')
    : '#ffffff'};
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const getIcon = (type: string) => {
  switch (type) {
    case 'first_sale':
    case 'top_seller':
      return Trophy;
    case 'verified_seller':
      return Shield;
    case 'hundred_listings':
      return Star;
    case 'community_contributor':
      return Award;
    case 'early_adopter':
      return Zap;
    default:
      return Crown;
  }
};

interface AchievementsGallerySectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const AchievementsGallerySection: React.FC<AchievementsGallerySectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadBadges = async () => {
      try {
        const achievementBadges = await achievementsGalleryService.getAchievementBadges(userId);
        setBadges(achievementBadges);
      } catch (error) {
        console.error('Error loading badges:', error);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [userId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : 'en-US',
      { month: 'short', year: 'numeric' }
    ).format(date);
  };

  if (loading) {
    return null;
  }

  if (badges.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Award size={20} />
          {language === 'bg' ? 'Постижения' : 'Achievements'}
        </SectionTitle>
      </SectionHeader>

      {badges.length === 0 ? (
        <EmptyState $isDark={isDark}>
          <Award size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            {language === 'bg' 
              ? 'Все още няма постижения'
              : 'No achievements yet'}
          </p>
        </EmptyState>
      ) : (
        <BadgesGrid>
          {badges.map(badge => {
            const IconComponent = getIcon(badge.type);
            return (
              <BadgeCard
                key={badge.id}
                $isDark={isDark}
                $rarity={badge.rarity}
                title={language === 'bg' ? badge.description : badge.descriptionEN}
              >
                <RarityLabel $rarity={badge.rarity} $isDark={isDark}>
                  {badge.rarity}
                </RarityLabel>
                <BadgeIcon $color={badge.color} $isDark={isDark}>
                  <IconComponent size={28} />
                </BadgeIcon>
                <BadgeTitle $isDark={isDark}>
                  {language === 'bg' ? badge.title : badge.titleEN}
                </BadgeTitle>
                <BadgeDate $isDark={isDark}>
                  {formatDate(badge.unlockedAt)}
                </BadgeDate>
              </BadgeCard>
            );
          })}
        </BadgesGrid>
      )}
    </SectionContainer>
  );
};

export default AchievementsGallerySection;

