// ProfileLoader - Animated loading indicator with contextual messages
// Shows profile loading progress from 0-100% with Bulgarian/English messages

import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import type { ProfileLoaderProps } from '@/types/profile.types';

/**
 * Loading stages and their messages
 */
const LOADING_STAGES = {
  0: { labelBg: 'Начало...', labelEn: 'Starting...', icon: '⏳' },
  15: { labelBg: 'Свързване с базата...', labelEn: 'Connecting to database...', icon: '🔗' },
  30: { labelBg: 'Зареждане на профила...', labelEn: 'Loading profile...', icon: '👤' },
  45: { labelBg: 'Зареждане на обяви...', labelEn: 'Loading listings...', icon: '🚗' },
  60: { labelBg: 'Калкулиране на рейтинг...', labelEn: 'Calculating rating...', icon: '⭐' },
  75: { labelBg: 'Зареждане на изображения...', labelEn: 'Loading images...', icon: '🖼️' },
  90: { labelBg: 'Финализирам...', labelEn: 'Finalizing...', icon: '✨' },
  100: { labelBg: 'Готово!', labelEn: 'Done!', icon: '✅' },
};

/**
 * Get stage message by progress percentage
 */
const getStageByCurrent = (current: number) => {
  const stages = Object.keys(LOADING_STAGES)
    .map(Number)
    .sort((a, b) => a - b)
    .reverse();

  for (const stage of stages) {
    if (current >= stage) {
      return LOADING_STAGES[stage as keyof typeof LOADING_STAGES];
    }
  }
  return LOADING_STAGES[0];
};

/**
 * Root container
 */
const LoaderContainer = styled.div<{ isFullScreen?: boolean }>`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 2rem;
  padding: 2rem;
  z-index: 99999;
  box-sizing: border-box;

  ${(props) =>
    props.isFullScreen
      ? `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      `
      : `
        width: 100%;
        min-height: 300px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
      `}
`;

/**
 * Animated progress circle
 */
const ProgressCircle = styled.div<{ progress: number }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #2B7BFF 0deg,
    #2B7BFF ${(props) => (props.progress / 100) * 360}deg,
    #e0e0e0 ${(props) => (props.progress / 100) * 360}deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(43, 123, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 8px 24px rgba(43, 123, 255, 0.2);
    }
    50% {
      box-shadow: 0 8px 32px rgba(43, 123, 255, 0.4);
    }
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

/**
 * Inner circle content
 */
const ProgressInner = styled.div`
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

/**
 * Percentage text
 */
const ProgressText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B7BFF;
  line-height: 1;
`;

/**
 * Percent sign
 */
const ProgressPercent = styled.span`
  font-size: 0.75rem;
  color: #999;
  font-weight: 600;
`;

/**
 * Stage message section
 */
const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
`;

/**
 * Stage icon with animation
 */
const StageIcon = styled.span`
  font-size: 2.5rem;
  display: inline-block;
  animation: bounce 1.5s ease-in-out infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;

/**
 * Stage message text
 */
const StageMessage = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
  min-height: 1.5rem;
`;

/**
 * Sub-message or tip text
 */
const TipText = styled.p`
  font-size: 0.875rem;
  color: #999;
  margin: 0;
  max-width: 400px;
`;

/**
 * Loading bar (alternative simple display)
 */
const LoadingBar = styled.div`
  width: 100%;
  max-width: 300px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

/**
 * Loading bar fill
 */
const LoadingBarFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2B7BFF, #2EB872);
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(43, 123, 255, 0.5);
`;

/**
 * ProfileLoader Component
 * Displays animated loading state with progress and contextual messages
 * 
 * Features:
 * - Smooth progress animation (0-100%)
 * - Contextual messages per stage
 * - i18n support (BG/EN)
 * - Customizable appearance
 * - Optional tips/help text
 */
const ProfileLoader: React.FC<ProfileLoaderProps> = ({
  progress = 0,
  isFullScreen = false,
  showTip = true,
  customMessage,
  showBar = false,
  onComplete,
}) => {
  const { language } = useLanguage();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = Math.min(Math.max(progress, 0), 100);
    
    if (displayProgress < targetProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress((prev) => Math.min(prev + 1, targetProgress));
      }, 30);
      return () => clearTimeout(timer);
    }

    if (displayProgress === 100 && !hasCompleted) {
      setHasCompleted(true);
      onComplete?.();
    }
  }, [progress, displayProgress, hasCompleted, onComplete]);

  const stage = useMemo(() => getStageByCurrent(displayProgress), [displayProgress]);

  const tips = useMemo(() => ({
    bg: [
      'Тази информация беше изпратена с безопасна връзка',
      'Вашите данни са защитени с шифроване',
      'Кауто: никога не делете личните данни на продавача',
      'Проверете репутацията преди контакт',
    ],
    en: [
      'This information was sent through a secure connection',
      'Your data is protected with encryption',
      'Caution: never share seller personal information',
      'Check reputation before contacting',
    ],
  }), []);

  const randomTip = useMemo(() => {
    const tipsList = language === 'bg' ? tips.bg : tips.en;
    return tipsList[Math.floor(Math.random() * tipsList.length)];
  }, [language, tips]);

  const stageLabel = useMemo(() => {
    if (customMessage) return customMessage;
    return language === 'bg' ? stage.labelBg : stage.labelEn;
  }, [customMessage, language, stage]);

  return (
    <LoaderContainer isFullScreen={isFullScreen}>
      {showBar ? (
        <LoadingBar>
          <LoadingBarFill progress={displayProgress} />
        </LoadingBar>
      ) : (
        <ProgressCircle progress={displayProgress}>
          <ProgressInner>
            <ProgressText>{displayProgress}</ProgressText>
            <ProgressPercent>%</ProgressPercent>
          </ProgressInner>
        </ProgressCircle>
      )}

      <MessageSection>
        <StageIcon>{stage.icon}</StageIcon>
        <StageMessage>{stageLabel}</StageMessage>
        {showTip && <TipText>💡 {randomTip}</TipText>}
      </MessageSection>

      {/* Hidden screen reader announcement for accessibility */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-9999px' }}>
        {language === 'bg'
          ? `Зареждане на профил ${displayProgress}%`
          : `Loading profile ${displayProgress}%`}
      </div>
    </LoaderContainer>
  );
};

ProfileLoader.displayName = 'ProfileLoader';

export default ProfileLoader;
