/**
 * HomeSocialExperience.tsx
 * Социален опит и AI - Social Experience and AI Component
 * 
 * Unified component for social content and AI / Обединен компонент за социално съдържание и AI
 * Combines / Комбинира:
 * - CommunityFeedSection
 * - CollapsibleSocialFeed
 * - SocialMediaSection
 * - SmartFeedSection
 * - AIAnalyticsTeaser
 * 
 * @benefit توحيد 5 مكونات اجتماعية
 * @feature lazy loading و teaser صغير للـ AI
 */

import React, { Suspense, memo, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import GridSectionWrapper from './GridSectionWrapper';

// Lazy imports
const SmartFeedSection = React.lazy(() => import('./SmartFeedSection'));
const AIAnalyticsTeaser = React.lazy(() => import('./AIAnalyticsTeaser'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SocialContainer = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const AITeaserWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
`;

const LoadingFallback = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HomeSocialExperience
 * 
 * يجمع المحتوى الاجتماعي والـ AI:
 * 1. Smart Feed - محتوى ذكي
 * 2. وسائل التواصل - روابط خارجية
 * 3. AI Teaser - معاينة الذكاء الاصطناعي
 * 
 * الفوائد:
 * - واجهة موحدة للمحتوى الاجتماعي
 * - Lazy loading محسّن الأداء
 * - الـ AI تظهر كـ accent وليس عنصر ثقيل
 * - تقليل تضخم الملف الرئيسي
 */
const HomeSocialExperience: React.FC = memo(() => {
  const { t } = useLanguage();
  const [showAITeaser, setShowAITeaser] = useState(true);

  return (
    <SocialContainer>
      {/* 1. Smart Feed - Modern Social Experience */}
      <GridSectionWrapper intensity="medium" variant="modern">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <SmartFeedSection />
        </Suspense>
      </GridSectionWrapper>

      {/* 2. AI Analytics Teaser - Accent Section */}
      {showAITeaser && (
        <AITeaserWrapper>
          <Suspense fallback={null}>
            <AIAnalyticsTeaser />
          </Suspense>
        </AITeaserWrapper>
      )}

      {/* 3. Social Media Links - Connected Experience */}
      <GridSectionWrapper intensity="light" variant="modern">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </GridSectionWrapper>
    </SocialContainer>
  );
});

HomeSocialExperience.displayName = 'HomeSocialExperience';

export default HomeSocialExperience;
