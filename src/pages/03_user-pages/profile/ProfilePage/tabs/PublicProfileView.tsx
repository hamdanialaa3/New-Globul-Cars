/**
 * PublicProfileView Component
 * المنسق الرئيسي لصفحة البروفايل العام - متوافق مع نسخة 0.4.0
 * صفحة عرض البروفايل العام للزوار فقط /profile/view/:id
 * 
 * @description تحفة فنية تتكيف تلقائياً مع نوع البائع (فرد، تاجر، شركة)
 * @see PROJECT_COMPLETE_INVENTORY.md
 * @author Senior System Architect
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { logger } from '../../../../../services/logger-service';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileCar } from '../types';
import { PublicProfileHero } from './components/PublicProfileHero';
import { ProfileInventoryGrid } from './components/ProfileInventoryGrid';
import { ProfileTrustSection } from './components/ProfileTrustSection';
import { ProfileLocationMap } from './components/ProfileLocationMap';
import { BusinessGreenHeader } from '../../../../../components/Profile/BusinessGreenHeader';
import FollowingTab from './FollowingTab';
import { HorizontalContactSection } from './components/HorizontalContactSection';

interface PublicProfileViewProps {
  user: BulgarianUser;
  userCars?: ProfileCar[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ 
  user, 
  userCars = [] 
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const outletContext = useOutletContext<any>();
  const viewer = outletContext?.viewer || null;
  const isFollowing = outletContext?.isFollowing || false;
  const followLoading = outletContext?.followLoading || false;
  const handleFollow = outletContext?.handleFollow || (() => {});
  const handleMessage = outletContext?.handleMessage || (() => {});
  const [activeTab, setActiveTab] = useState<'inventory' | 'about' | 'feed' | 'following'>('inventory');

  const profileType = user.profileType || 'private';
  const isPrivate = profileType === 'private';

  // Business description
  const businessDescription = user.dealerSnapshot?.description || 
                               user.companySnapshot?.description || 
                               user.bio;

  const isDark = theme === 'dark';

  return (
    <ViewContainer $isDark={isDark}>
      {/* Hero Section */}
      <PublicProfileHero user={user} />

      {/* Green Header Bar - Under Profile Image */}
      {viewer && (
        <BusinessGreenHeader
          user={user}
          viewer={viewer}
          isOwnProfile={false}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onBlockChanged={(isBlocked) => {
            logger.info('Block status changed', {
              targetUserId: user.uid,
              isBlocked,
              viewerId: viewer.uid
            });
          }}
        />
      )}

      {/* Location Map */}
      <ProfileLocationMap user={user} />

      {/* ✅ NEW: Horizontal Contact Section (Smart Layout) */}
      <HorizontalContactSection user={user} />
      
      {/* Content Grid - Single Column now */}
      <ContentWrapper $isDark={isDark}>
        <section style={{ width: '100%' }}>
          {/* Tab Navigation (Simple) */}
          <TabNavigation $isDark={isDark}>
            <TabButton 
              $active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')}
              $profileType={profileType}
              $isDark={isDark}
            >
              {language === 'bg' ? 'Обяви' : 'Inventory'}
            </TabButton>
            {businessDescription && (
              <TabButton 
                $active={activeTab === 'about'} 
                onClick={() => setActiveTab('about')}
                $profileType={profileType}
                $isDark={isDark}
              >
                {language === 'bg' ? 'За Нас' : 'About'}
              </TabButton>
            )}
            <TabButton 
              $active={activeTab === 'feed'} 
              onClick={() => setActiveTab('feed')}
              $profileType={profileType}
              $isDark={isDark}
            >
              {language === 'bg' ? 'Публикации' : 'Social Feed'}
            </TabButton>
            <TabButton 
              $active={activeTab === 'following'} 
              onClick={() => setActiveTab('following')}
              $profileType={profileType}
              $isDark={isDark}
            >
              {language === 'bg' ? 'Следвани' : 'Following'}
            </TabButton>
          </TabNavigation>

          {/* Tab Content */}
          {activeTab === 'inventory' && (
            <ProfileInventoryGrid
              userCars={userCars}
              profileType={profileType}
              ownerPlanTier={user.planTier}
              ownerIsVerified={!!user.verification?.id}
            />
          )}

          {activeTab === 'about' && businessDescription && (
            <AboutSection $isDark={isDark}>
              <AboutTitle $isDark={isDark}>
                {language === 'bg' ? 'За Нас' : 'About Us'}
              </AboutTitle>
              <AboutText $isDark={isDark}>{businessDescription}</AboutText>
              
              {/* Trust Section - Show in About tab */}
              {!isPrivate && <ProfileTrustSection user={user} />}
            </AboutSection>
          )}

          {activeTab === 'feed' && (
            <SocialFeedPlaceholder $isDark={isDark}>
              <p>{language === 'bg' ? 'Социална лента' : 'Social Feed'}</p>
            </SocialFeedPlaceholder>
          )}

          {activeTab === 'following' && (
            <div style={{ background: isDark ? '#1E293B' : 'white', borderRadius: '16px', padding: '20px' }}>
              <FollowingTab />
            </div>
          )}
        </section>
      </ContentWrapper>
    </ViewContainer>
  );
};

export default PublicProfileView;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const getThemeColor = (type: string) => {
  switch(type) {
    case 'company': return '#1E3A8A';
    case 'dealer': return '#059669';
    case 'private': return '#EA580C';
    default: return '#64748B';
  }
};

const ViewContainer = styled.div<{ $isDark: boolean }>`
  width: 100%;
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : '#F8FAFC'};
  transition: background 0.3s ease;
`;

const ContentWrapper = styled.main<{ $isDark: boolean }>`
  max-width: 1280px;
  margin: 0 auto;
  display: block; /* ✅ Changed from grid to block for horizontal layout */
  padding: 0 20px;
  margin-top: 10px;
  background: ${props => props.$isDark ? '#0F1419' : 'transparent'};
  transition: background 0.3s ease;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const TabNavigation = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  margin-bottom: 32px;
  padding-bottom: 0;
  transition: border-color 0.3s ease;

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button<{ $active: boolean; $profileType: string; $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? getThemeColor(props.$profileType) : 'transparent'};
  color: ${props => {
    if (props.$active) return getThemeColor(props.$profileType);
    return props.$isDark ? '#94A3B8' : '#64748B';
  }};
  font-size: 15px;
  font-weight: ${props => props.$active ? '700' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;

  &:hover {
    color: ${props => getThemeColor(props.$profileType)};
    background: ${props => props.$active ? 'transparent' : props.$isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const AboutSection = styled.section<{ $isDark: boolean }>`
  padding: 40px;
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const AboutTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  margin-bottom: 20px;
  transition: color 0.3s ease;
`;

const AboutText = styled.p<{ $isDark: boolean }>`
  font-size: 16px;
  line-height: 1.8;
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
  max-width: 900px;
  transition: color 0.3s ease;
`;

const SocialFeedPlaceholder = styled.div<{ $isDark: boolean }>`
  padding: 80px 20px;
  text-align: center;
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 16px;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  font-size: 16px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;
`;
