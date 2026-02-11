/**
 * Referral Program Dashboard
 * Invite friends and earn rewards
 * 
 * File: src/components/subscription/ReferralDashboard.tsx
 * Created: January 8, 2026
 * Based on: Cars.com, Dropbox referral best practices
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Gift, Users, Copy, Share2, Check, Trophy,
  Star, Crown, Zap, ChevronRight, ExternalLink,
  Twitter, Facebook, Linkedin, Mail, MessageCircle,
  Award, TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// ==================== STYLED COMPONENTS ====================

const DashboardContainer = styled.div`
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--border-primary);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
`;

// ==================== STATS CARDS ====================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${p => p.$color};
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

// ==================== REFERRAL LINK ====================

const ReferralLinkSection = styled.div`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    rgba(118, 75, 162, 0.1) 100%
  );
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border-secondary);
`;

const LinkLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LinkInput = styled.div`
  flex: 1;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  ${p => p.$copied ? css`
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  ` : css`
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  `}
`;

// ==================== SHARE BUTTONS ====================

const ShareSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ShareGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ShareButton = styled.button<{ $bg: string; $hoverBg: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${p => p.$bg};
  color: white;
  
  &:hover {
    background: ${p => p.$hoverBg};
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// ==================== REWARDS SECTION ====================

const RewardsSection = styled.div`
  margin-bottom: 2rem;
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RewardCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid var(--border-secondary);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const RewardIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const RewardContent = styled.div`
  flex: 1;
`;

const RewardTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const RewardDesc = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

// ==================== TIERS SECTION ====================

const TiersSection = styled.div`
  margin-bottom: 2rem;
`;

const TiersContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 3px;
  }
`;

const TierCard = styled.div<{ $active?: boolean; $color: string }>`
  min-width: 180px;
  background: ${p => p.$active 
    ? `linear-gradient(135deg, ${p.$color}20 0%, ${p.$color}10 100%)`
    : 'var(--bg-secondary)'
  };
  border: 2px solid ${p => p.$active ? p.$color : 'var(--border-secondary)'};
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  
  ${p => p.$active && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${p => p.$color}30;
  }
`;

const TierBadge = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const TierName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const TierRequirement = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
`;

const TierReward = styled.div<{ $color: string }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.$color};
  padding: 0.5rem;
  background: ${p => p.$color}15;
  border-radius: 8px;
`;

const CurrentTierBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
`;

// ==================== LEADERBOARD ====================

const LeaderboardSection = styled.div``;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LeaderboardItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${p => p.$rank === 1 
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)'
    : p.$rank === 2
    ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(169, 169, 169, 0.1) 100%)'
    : p.$rank === 3
    ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(184, 115, 51, 0.1) 100%)'
    : 'var(--bg-secondary)'
  };
  border-radius: 12px;
  border: 2px solid ${p => p.$rank <= 3 
    ? p.$rank === 1 ? '#FFD700' : p.$rank === 2 ? '#C0C0C0' : '#CD7F32'
    : 'var(--border-secondary)'
  };
`;

const LeaderboardRank = styled.div<{ $rank: number }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  background: ${p => p.$rank === 1 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    : p.$rank === 2
    ? 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)'
    : p.$rank === 3
    ? 'linear-gradient(135deg, #CD7F32 0%, #B8733C 100%)'
    : 'var(--bg-tertiary)'
  };
  color: ${p => p.$rank <= 3 ? '#1a1a1a' : 'var(--text-secondary)'};
`;

const LeaderboardAvatar = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
`;

const LeaderboardInfo = styled.div`
  flex: 1;
`;

const LeaderboardName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const LeaderboardPrize = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const LeaderboardScore = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// ==================== TYPES ====================

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number; // in months or credits
}

interface Tier {
  id: string;
  name: { bg: string; en: string };
  minReferrals: number;
  reward: { bg: string; en: string };
  color: string;
  icon: React.ReactNode;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  referrals: number;
  prize: { bg: string; en: string };
  avatarColor: string;
}

// ==================== MAIN COMPONENT ====================

interface ReferralDashboardProps {
  referralCode?: string;
  stats?: ReferralStats;
  onShare?: (platform: string) => void;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  referralCode = 'USER2026',
  stats = { totalReferrals: 5, successfulReferrals: 2, pendingReferrals: 3, totalEarnings: 2 },
  onShare
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://koli.one/ref/${referralCode}`;

  const t = {
    bg: {
      title: '🎁 Покани Приятел',
      subtitle: 'Спечели безплатни месеци за всеки успешен абонат',
      totalReferrals: 'Общо поканени',
      successfulReferrals: 'Успешни',
      pendingReferrals: 'Чакащи',
      earnedMonths: 'Спечелени месеци',
      yourLink: 'Твоят линк за покана:',
      copy: 'Копирай',
      copied: 'Копирано!',
      shareOn: 'Сподели в:',
      rewards: '🏆 Награди',
      youGet: 'Ти получаваш:',
      friendGets: 'Приятелят получава:',
      freeMonth: '1 безплатен месец',
      freeHalfMonth: '2 седмици безплатно',
      credits: '25 кредита',
      friendCredits: '10 кредита',
      tiers: '🎖️ Нива на Посланик',
      bronze: 'Бронз',
      silver: 'Сребро',
      gold: 'Злато',
      platinum: 'Платина',
      referrals: 'покани',
      discount10: '10% отстъпка',
      discount25: '25% отстъпка',
      freeForever: 'Безплатен завинаги',
      exclusiveGifts: 'Ексклузивни подаръци',
      currentTier: 'Текущо ниво',
      leaderboard: '🏅 Топ Посланици',
      wonIphone: 'Спечели iPhone 15 Pro',
      wonMonths: 'Спечели 6 месеца',
      wonCredits: 'Спечели 500 кредита'
    },
    en: {
      title: '🎁 Invite a Friend',
      subtitle: 'Earn free months for every successful subscriber',
      totalReferrals: 'Total Invited',
      successfulReferrals: 'Successful',
      pendingReferrals: 'Pending',
      earnedMonths: 'Earned Months',
      yourLink: 'Your referral link:',
      copy: 'Copy',
      copied: 'Copied!',
      shareOn: 'Share on:',
      rewards: '🏆 Rewards',
      youGet: 'You get:',
      friendGets: 'Your friend gets:',
      freeMonth: '1 free month',
      freeHalfMonth: '2 free weeks',
      credits: '25 credits',
      friendCredits: '10 credits',
      tiers: '🎖️ Ambassador Tiers',
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      referrals: 'referrals',
      discount10: '10% discount',
      discount25: '25% discount',
      freeForever: 'Free forever',
      exclusiveGifts: 'Exclusive gifts',
      currentTier: 'Current tier',
      leaderboard: '🏅 Top Ambassadors',
      wonIphone: 'Won iPhone 15 Pro',
      wonMonths: 'Won 6 months',
      wonCredits: 'Won 500 credits'
    }
  };
  
  const text = t[language] || t.en;

  const tiers: Tier[] = [
    { 
      id: 'bronze', 
      name: { bg: 'Бронз', en: 'Bronze' },
      minReferrals: 3, 
      reward: { bg: '10% отстъпка', en: '10% discount' },
      color: '#CD7F32',
      icon: <Award />
    },
    { 
      id: 'silver', 
      name: { bg: 'Сребро', en: 'Silver' },
      minReferrals: 10, 
      reward: { bg: '25% отстъпка', en: '25% discount' },
      color: '#C0C0C0',
      icon: <Star />
    },
    { 
      id: 'gold', 
      name: { bg: 'Злато', en: 'Gold' },
      minReferrals: 25, 
      reward: { bg: 'Безплатен завинаги', en: 'Free forever' },
      color: '#FFD700',
      icon: <Crown />
    },
    { 
      id: 'platinum', 
      name: { bg: 'Платина', en: 'Platinum' },
      minReferrals: 50, 
      reward: { bg: 'Ексклузивни подаръци', en: 'Exclusive gifts' },
      color: '#E5E4E2',
      icon: <Trophy />
    }
  ];

  const getCurrentTier = () => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (stats.successfulReferrals >= tiers[i].minReferrals) {
        return tiers[i].id;
      }
    }
    return null;
  };

  const currentTier = getCurrentTier();

  const leaderboard: LeaderboardEntry[] = [
    { id: '1', name: 'Ivan P.', referrals: 47, prize: { bg: 'Спечели iPhone 15 Pro', en: 'Won iPhone 15 Pro' }, avatarColor: '#667eea' },
    { id: '2', name: 'Maria S.', referrals: 32, prize: { bg: 'Спечели 6 месеца', en: 'Won 6 months' }, avatarColor: '#10b981' },
    { id: '3', name: 'Stefan D.', referrals: 28, prize: { bg: 'Спечели 500 кредита', en: 'Won 500 credits' }, avatarColor: '#f59e0b' },
    { id: '4', name: 'Elena K.', referrals: 21, prize: { bg: '3 месеца', en: '3 months' }, avatarColor: '#8b5cf6' },
    { id: '5', name: 'Georgi T.', referrals: 18, prize: { bg: '2 месеца', en: '2 months' }, avatarColor: '#ec4899' }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      logger.info('Referral link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy referral link', { error: err });
    }
  };

  const handleShare = (platform: string) => {
    const shareText = language === 'bg' 
      ? 'Присъедини се към Globul Cars и получи 2 седмици безплатно!'
      : 'Join Globul Cars and get 2 free weeks!';
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(referralLink)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    logger.info('Referral shared', { platform });
    onShare?.(platform);
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <Title>
          <Gift size={28} />
          {text.title}
        </Title>
        <Subtitle>{text.subtitle}</Subtitle>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard $color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatValue>{stats.totalReferrals}</StatValue>
          <StatLabel>{text.totalReferrals}</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
          <StatValue>{stats.successfulReferrals}</StatValue>
          <StatLabel>{text.successfulReferrals}</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
          <StatValue>{stats.pendingReferrals}</StatValue>
          <StatLabel>{text.pendingReferrals}</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #ec4899 0%, #db2777 100%)">
          <StatValue>{stats.totalEarnings}</StatValue>
          <StatLabel>{text.earnedMonths}</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Referral Link */}
      <ReferralLinkSection>
        <LinkLabel>{text.yourLink}</LinkLabel>
        <LinkContainer>
          <LinkInput>{referralLink}</LinkInput>
          <CopyButton $copied={copied} onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? text.copied : text.copy}
          </CopyButton>
        </LinkContainer>
      </ReferralLinkSection>

      {/* Share Buttons */}
      <ShareSection>
        <SectionTitle>
          <Share2 size={20} />
          {text.shareOn}
        </SectionTitle>
        <ShareGrid>
          <ShareButton 
            $bg="#1DA1F2" 
            $hoverBg="#1a8cd8"
            onClick={() => handleShare('twitter')}
          >
            <Twitter /> Twitter
          </ShareButton>
          <ShareButton 
            $bg="#4267B2" 
            $hoverBg="#365899"
            onClick={() => handleShare('facebook')}
          >
            <Facebook /> Facebook
          </ShareButton>
          <ShareButton 
            $bg="#25D366" 
            $hoverBg="#20bd5a"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle /> WhatsApp
          </ShareButton>
          <ShareButton 
            $bg="#0A66C2" 
            $hoverBg="#084d94"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin /> LinkedIn
          </ShareButton>
          <ShareButton 
            $bg="#6b7280" 
            $hoverBg="#4b5563"
            onClick={() => handleShare('email')}
          >
            <Mail /> Email
          </ShareButton>
        </ShareGrid>
      </ShareSection>

      {/* Rewards Section */}
      <RewardsSection>
        <SectionTitle>
          <Gift size={20} />
          {text.rewards}
        </SectionTitle>
        <RewardsGrid>
          <RewardCard>
            <RewardIcon $color="linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)">
              <Crown />
            </RewardIcon>
            <RewardContent>
              <RewardTitle>{text.youGet}</RewardTitle>
              <RewardDesc>
                🎁 {text.freeMonth}<br />
                💎 {text.credits}
              </RewardDesc>
            </RewardContent>
          </RewardCard>
          <RewardCard>
            <RewardIcon $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <Users />
            </RewardIcon>
            <RewardContent>
              <RewardTitle>{text.friendGets}</RewardTitle>
              <RewardDesc>
                🎁 {text.freeHalfMonth}<br />
                💎 {text.friendCredits}
              </RewardDesc>
            </RewardContent>
          </RewardCard>
        </RewardsGrid>
      </RewardsSection>

      {/* Tiers Section */}
      <TiersSection>
        <SectionTitle>
          <Trophy size={20} />
          {text.tiers}
        </SectionTitle>
        <TiersContainer>
          {tiers.map(tier => (
            <TierCard 
              key={tier.id}
              $active={currentTier === tier.id}
              $color={tier.color}
            >
              {currentTier === tier.id && (
                <CurrentTierBadge>{text.currentTier}</CurrentTierBadge>
              )}
              <TierBadge $color={tier.color}>
                {tier.icon}
              </TierBadge>
              <TierName>{tier.name[language]}</TierName>
              <TierRequirement>
                {tier.minReferrals}+ {text.referrals}
              </TierRequirement>
              <TierReward $color={tier.color}>
                {tier.reward[language]}
              </TierReward>
            </TierCard>
          ))}
        </TiersContainer>
      </TiersSection>

      {/* Leaderboard */}
      <LeaderboardSection>
        <SectionTitle>
          <TrendingUp size={20} />
          {text.leaderboard}
        </SectionTitle>
        <LeaderboardList>
          {leaderboard.map((entry, index) => (
            <LeaderboardItem key={entry.id} $rank={index + 1}>
              <LeaderboardRank $rank={index + 1}>
                {index + 1}
              </LeaderboardRank>
              <LeaderboardAvatar $color={entry.avatarColor}>
                {entry.name[0]}
              </LeaderboardAvatar>
              <LeaderboardInfo>
                <LeaderboardName>{entry.name}</LeaderboardName>
                <LeaderboardPrize>{entry.prize[language]}</LeaderboardPrize>
              </LeaderboardInfo>
              <LeaderboardScore>
                <Users size={16} />
                {entry.referrals}
              </LeaderboardScore>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      </LeaderboardSection>
    </DashboardContainer>
  );
};

export default ReferralDashboard;
