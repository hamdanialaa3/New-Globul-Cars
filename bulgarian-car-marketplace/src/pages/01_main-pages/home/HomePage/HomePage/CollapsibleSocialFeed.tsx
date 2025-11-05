// Collapsible Social Feed Component
// Wraps SmartFeedSection + CommunityFeedSection in a collapsible panel
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, Suspense } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { ChevronDown, ChevronUp, Users, MessageCircle } from 'lucide-react';

// Lazy load the feed sections
const SmartFeedSection = React.lazy(() => import('./SmartFeedSection'));
const CommunityFeedSection = React.lazy(() => import('./CommunityFeedSection'));

const CollapsibleSocialFeed: React.FC = () => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const t = {
    bg: {
      title: 'Социални Медии',
      subtitle: 'Споделете истории, открийте нови коли и се свържете с ентусиасти',
      expand: 'Покажи Feed',
      collapse: 'Скрий Feed',
      posts: 'публикации',
      members: 'членове'
    },
    en: {
      title: 'Social Media',
      subtitle: 'Share stories, discover cars, and connect with enthusiasts',
      expand: 'Show Feed',
      collapse: 'Hide Feed',
      posts: 'posts',
      members: 'members'
    }
  }[language];

  return (
    <Container>
      <Header onClick={toggleExpand} $isExpanded={isExpanded}>
        <HeaderContent>
          <IconWrapper>
            <Users size={28} />
          </IconWrapper>
          <TitleSection>
            <Title>{t.title}</Title>
            <Subtitle>{t.subtitle}</Subtitle>
          </TitleSection>
        </HeaderContent>
        
        <RightSection>
          <Stats>
            <StatItem>
              <MessageCircle size={16} />
              <span>150+ {t.posts}</span>
            </StatItem>
            <StatItem>
              <Users size={16} />
              <span>1.2K {t.members}</span>
            </StatItem>
          </Stats>
          
          <ExpandButton $isExpanded={isExpanded}>
            {isExpanded ? (
              <>
                <span>{t.collapse}</span>
                <ChevronUp size={20} />
              </>
            ) : (
              <>
                <span>{t.expand}</span>
                <ChevronDown size={20} />
              </>
            )}
          </ExpandButton>
        </RightSection>
      </Header>

      <CollapsibleContent $isExpanded={isExpanded}>
        {isExpanded && (
          <ContentWrapper>
            <Suspense fallback={<LoadingFallback>Loading feed...</LoadingFallback>}>
              <SmartFeedSection />
            </Suspense>

            <SectionSpacer />

            <Suspense fallback={<LoadingFallback>Loading posts...</LoadingFallback>}>
              <CommunityFeedSection />
            </Suspense>
          </ContentWrapper>
        )}
      </CollapsibleContent>
    </Container>
  );
};

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  margin: 20px auto;
  max-width: 1400px;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 12px auto;
    padding: 0 12px;
  }
`;

const Header = styled.div<{ $isExpanded: boolean }>`
  position: relative;
  background: ${p => p.$isExpanded 
    ? 'linear-gradient(135deg, #FF8F10 0%, #FF7900 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
  };
  border: 2px solid ${p => p.$isExpanded ? '#FF7900' : '#e9ecef'};
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${p => p.$isExpanded 
    ? '0 8px 24px rgba(255, 143, 16, 0.25)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };
  overflow: hidden;

  /* LED Light Effect - Bright glowing dot that travels around the border */
  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 
      0 0 30px 10px currentColor,
      0 0 60px 20px currentColor,
      0 0 90px 30px rgba(255, 255, 255, 0.3);
    animation: 
      bulgariaBorderLED 9s linear infinite,
      bulgariaColorChange 9s step-end infinite;
    z-index: 10;
    filter: brightness(2);
    color: #FFFFFF;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$isExpanded 
      ? '0 12px 32px rgba(255, 143, 16, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)'
    };
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  /* LED Light Path Animation - Simple circular motion around border */
  @keyframes bulgariaBorderLED {
    /* Top edge - White LED */
    0%, 25% {
      top: -8px;
      left: calc(-8px + (100% + 16px) * ((min(max((100 * var(--t, 0) / 25), 0), 1))));
      bottom: auto;
      right: auto;
    }
    /* Right edge - Green LED */
    25.01%, 50% {
      top: calc(-8px + (100% + 16px) * ((min(max(((100 * var(--t, 25) - 25) / 25), 0), 1))));
      left: auto;
      right: -8px;
      bottom: auto;
    }
    /* Bottom edge - Red LED */
    50.01%, 75% {
      top: auto;
      left: auto;
      right: calc(-8px + (100% + 16px) * ((min(max(((100 * var(--t, 50) - 50) / 25), 0), 1))));
      bottom: -8px;
    }
    /* Left edge - Back to White */
    75.01%, 100% {
      top: auto;
      left: -8px;
      right: auto;
      bottom: calc(-8px + (100% + 16px) * ((min(max(((100 * var(--t, 75) - 75) / 25), 0), 1))));
    }
  }

  /* LED Color Change - Bulgarian Flag Colors (White → Green → Red) */
  @keyframes bulgariaColorChange {
    /* White LED (Бяло) - Top edge */
    0%, 33.33% {
      background: #FFFFFF;
      color: #FFFFFF;
      box-shadow: 
        0 0 30px 10px rgba(255, 255, 255, 1),
        0 0 60px 20px rgba(255, 255, 255, 0.7),
        0 0 90px 30px rgba(255, 255, 255, 0.4);
    }
    /* Green LED (Зелено) - Right edge */
    33.34%, 66.66% {
      background: #00966E;
      color: #00966E;
      box-shadow: 
        0 0 30px 10px rgba(0, 255, 136, 1),
        0 0 60px 20px rgba(0, 255, 136, 0.7),
        0 0 90px 30px rgba(0, 255, 136, 0.4);
    }
    /* Red LED (Червено) - Bottom edge */
    66.67%, 100% {
      background: #D62612;
      color: #D62612;
      box-shadow: 
        0 0 30px 10px rgba(255, 60, 40, 1),
        0 0 60px 20px rgba(255, 60, 40, 0.7),
        0 0 90px 30px rgba(255, 60, 40, 0.4);
    }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${p => p.theme?.primary || '#FF8F10'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: inherit;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: inherit;
  opacity: 0.85;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.813rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.9;

  svg {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    font-size: 0.813rem;
  }
`;

const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${p => p.$isExpanded 
    ? 'rgba(255, 255, 255, 0.25)'
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'
  };
  color: ${p => p.$isExpanded ? 'white' : 'white'};
  border: ${p => p.$isExpanded ? '2px solid rgba(255, 255, 255, 0.4)' : 'none'};
  border-radius: 10px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background: ${p => p.$isExpanded 
      ? 'rgba(255, 255, 255, 0.35)'
      : 'linear-gradient(135deg, #FF7900, #FF6800)'
    };
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    font-size: 0.875rem;
    padding: 10px 16px;
  }
`;

const CollapsibleContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${p => p.$isExpanded ? '10000px' : '0'};
  opacity: ${p => p.$isExpanded ? '1' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.3s ease;
`;

const ContentWrapper = styled.div`
  padding-top: 20px;
`;

const SectionSpacer = styled.div`
  height: 20px;

  @media (max-width: 768px) {
    height: 12px;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1rem;
  color: #6c757d;

  @media (max-width: 768px) {
    min-height: 120px;
    font-size: 0.875rem;
  }
`;

export default CollapsibleSocialFeed;

