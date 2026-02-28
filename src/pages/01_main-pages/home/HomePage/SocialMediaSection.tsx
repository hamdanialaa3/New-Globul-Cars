// Social Media Section - Collapsible Social Feed
// قسم التواصل الاجتماعي - القابل للطي
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, Suspense } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ChevronDown, ChevronUp, MessageSquare, Users, TrendingUp } from 'lucide-react';

// Lazy load the feed sections
const SmartFeedSection = React.lazy(() => import('./SmartFeedSection'));

const SocialMediaSection: React.FC = () => {
  const { language, t: translate } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // ⚡ OPTIMIZED: Auto-expand on first visit (after 10 seconds for better performance)
  // Reduced from 2s to 10s to avoid loading 20 posts immediately on page load
  useEffect(() => {
    const hasVisited = localStorage.getItem('socialMediaSectionVisited');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
        localStorage.setItem('socialMediaSectionVisited', 'true');
      }, 10000); // ⚡ Changed from 2000ms to 10000ms
      return () => clearTimeout(timer);
    }
  }, []);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    setHasInteracted(true);
  };

  const t = {
    bg: {
      title: 'Социални Мрежи & Общност',
      subtitle: 'Споделете, открийте и се свържете с автомобилната общност',
      expandText: 'Покажи социалните публикации',
      collapseText: 'Скрий социалните публикации',
      stats: {
        posts: 'Публикации',
        members: 'Членове',
        active: 'Активни сега'
      }
    },
    en: {
      title: 'Social Media & Community',
      subtitle: 'Share, discover, and connect with the car community',
      expandText: 'Show social posts',
      collapseText: 'Hide social posts',
      stats: {
        posts: 'Posts',
        members: 'Members',
        active: 'Active Now'
      }
    }
  };

  const text = t[language];

  return (
    <SectionContainer>
      <CollapsibleHeader onClick={handleToggle} $isExpanded={isExpanded}>
        {/* Animated border light effect */}
        <AnimatedBorder $isExpanded={isExpanded} />
        
        <HeaderContent>
          <HeaderLeft>
            <IconGroup>
              <MessageSquare size={28} />
              <Users size={28} />
              <TrendingUp size={28} />
            </IconGroup>
            <HeaderText>
              <Title>{text.title}</Title>
              <Subtitle>{text.subtitle}</Subtitle>
            </HeaderText>
          </HeaderLeft>
          
          <HeaderRight>
            <ToggleButton>
              {isExpanded ? (
                <>
                  <ChevronUp size={24} />
                  <span>{text.collapseText}</span>
                </>
              ) : (
                <>
                  <ChevronDown size={24} />
                  <span>{text.expandText}</span>
                </>
              )}
            </ToggleButton>
          </HeaderRight>
        </HeaderContent>
      </CollapsibleHeader>

      <CollapsibleContent $isExpanded={isExpanded}>
        <ContentInner>
          {isExpanded && (
            <Suspense fallback={<LoadingState>{translate('common.loading')}</LoadingState>}>
              {/* Smart Feed Section with create post */}
              <SmartFeedSection />
            </Suspense>
          )}
        </ContentInner>
      </CollapsibleContent>
    </SectionContainer>
  );
};

// Keyframe animations
const rotateBorder = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// Styled Components
const SectionContainer = styled.div`
  margin: 40px 20px;
  position: relative;
  
  @media (max-width: 768px) {
    margin: 20px 10px;
  }
`;

const CollapsibleHeader = styled.div<{ $isExpanded: boolean }>`
  position: relative;
  background: ${p => p.$isExpanded 
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
    : 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)'};
  border-radius: 20px;
  padding: 24px 32px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 20px 20px;
    border-radius: 16px;
  }
`;

const AnimatedBorder = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: conic-gradient(
    from 0deg,
    #4F46E5,
    #6366F1,
    #818CF8,
    #A5B4FC,
    #4F46E5
  );
  border-radius: 24px;
  z-index: -1;
  animation: ${rotateBorder} 4s linear infinite;
  opacity: ${p => p.$isExpanded ? 0.9 : 1};
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: inherit;
    border-radius: 20px;
    filter: blur(8px);
  }
  
  @media (max-width: 768px) {
    border-radius: 20px;
    
    &::before {
      border-radius: 16px;
    }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const IconGroup = styled.div`
  display: flex;
  gap: 8px;
  color: #FFD700;
  animation: ${pulse} 2s ease-in-out infinite;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
  }
  
  @media (max-width: 768px) {
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  background: linear-gradient(90deg, #818CF8, #6366F1, #4F46E5);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #B8C5D0;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const HeaderRight = styled.div`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ToggleButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: none;

  /* Light mode: Indigo gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }
  
  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 10px 20px;
    font-size: 0.875rem;
  }
`;

const CollapsibleContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${p => p.$isExpanded ? '10000px' : '0'};
  overflow: hidden;
  transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ContentInner = styled.div`
  padding-top: 20px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #6c757d;
  font-size: 1.1rem;
`;

export default SocialMediaSection;

