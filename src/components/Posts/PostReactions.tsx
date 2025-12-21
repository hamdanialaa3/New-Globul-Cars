// Post Reactions Component - 7 Types of Reactions
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ThumbsUp, 
  Heart, 
  Laugh, 
  Frown, 
  Angry as AngryIcon,
  HandHeart,
  type LucideIcon
} from 'lucide-react';

interface Reaction {
  type: string;
  icon: LucideIcon;
  label: { bg: string; en: string };
  color: string;
}

const REACTIONS: Reaction[] = [
  { 
    type: 'like', 
    icon: ThumbsUp, 
    label: { bg: 'Харесва', en: 'Like' }, 
    color: '#1877f2'
  },
  { 
    type: 'love', 
    icon: Heart, 
    label: { bg: 'Обичам', en: 'Love' }, 
    color: '#f33e58'
  },
  { 
    type: 'haha', 
    icon: Laugh, 
    label: { bg: 'Смешно', en: 'Haha' }, 
    color: '#f7b125'
  },
  { 
    type: 'wow', 
    icon: ThumbsUp, 
    label: { bg: 'Уау', en: 'Wow' }, 
    color: '#f7b125'
  },
  { 
    type: 'sad', 
    icon: Frown, 
    label: { bg: 'Тъжно', en: 'Sad' }, 
    color: '#f7b125'
  },
  { 
    type: 'angry', 
    icon: AngryIcon, 
    label: { bg: 'Ядосан', en: 'Angry' }, 
    color: '#e9710f'
  },
  { 
    type: 'support', 
    icon: HandHeart, 
    label: { bg: 'Подкрепа', en: 'Support' }, 
    color: '#16a34a'
  }
];

interface PostReactionsProps {
  currentReaction?: string;
  onReact: (type: string) => void;
  counts: Record<string, number>;
  showCount?: boolean;
}

const PostReactions: React.FC<PostReactionsProps> = ({
  currentReaction,
  onReact,
  counts,
  showCount = true
}) => {
  const { language } = useLanguage();
  const [showSelector, setShowSelector] = useState(false);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const handleReaction = (type: string) => {
    onReact(type);
    setShowSelector(false);
  };

  const currentReactionData = REACTIONS.find(r => r.type === currentReaction);

  return (
    <ReactionsContainer
      onMouseEnter={() => setShowSelector(true)}
      onMouseLeave={() => setShowSelector(false)}
    >
      <ReactionsSelector $show={showSelector}>
        {REACTIONS.map(reaction => {
          const Icon = reaction.icon;
          return (
            <ReactionButton
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              $color={reaction.color}
              title={reaction.label[language]}
            >
              <Icon size={24} />
            </ReactionButton>
          );
        })}
      </ReactionsSelector>

      <MainReactionButton 
        $active={!!currentReaction}
        $color={currentReactionData?.color || '#6c757d'}
      >
        {currentReactionData ? (
          <>
            <currentReactionData.icon size={20} />
            <span>{currentReactionData.label[language]}</span>
          </>
        ) : (
          <>
            <ThumbsUp size={20} />
            <span>{language === 'bg' ? 'Реакция' : 'React'}</span>
          </>
        )}
        {showCount && totalCount > 0 && (
          <ReactionCount>{totalCount}</ReactionCount>
        )}
      </MainReactionButton>
    </ReactionsContainer>
  );
};

// Styled Components
const ReactionsContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ReactionsSelector = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 50px;
  padding: 8px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: ${p => p.$show ? 1 : 0};
  visibility: ${p => p.$show ? 'visible' : 'hidden'};
  transform: ${p => p.$show ? 'translateY(-8px) scale(1)' : 'translateY(0) scale(0.9)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
`;

const ReactionButton = styled.button<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${p => p.$color}15;
  color: ${p => p.$color};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.3);
    background: ${p => p.$color}25;
  }
`;

const MainReactionButton = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: ${p => p.$active ? p.$color : '#6c757d'};
  font-size: 0.938rem;
  font-weight: ${p => p.$active ? 600 : 500};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 0.875rem;
    
    span {
      display: none;
    }
  }
`;

const ReactionCount = styled.span`
  font-size: 0.813rem;
  color: #6c757d;
  margin-left: 4px;
`;

export default PostReactions;

