// Post Type Selector - Select type of post
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FileText, Car, Lightbulb, HelpCircle, Star } from 'lucide-react';

type PostType = 'text' | 'car_showcase' | 'tip' | 'question' | 'review';

interface PostTypeSelectorProps {
  selected: PostType;
  onChange: (type: PostType) => void;
}

const POST_TYPES = [
  { type: 'text' as const, icon: FileText, labelBg: 'Текст', labelEn: 'Text' },
  { type: 'car_showcase' as const, icon: Car, labelBg: 'Автомобил', labelEn: 'Car Showcase' },
  { type: 'tip' as const, icon: Lightbulb, labelBg: 'Съвет', labelEn: 'Tip' },
  { type: 'question' as const, icon: HelpCircle, labelBg: 'Въпрос', labelEn: 'Question' },
  { type: 'review' as const, icon: Star, labelBg: 'Ревю', labelEn: 'Review' }
];

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({ selected, onChange }) => {
  const { language } = useLanguage();

  return (
    <Container>
      {POST_TYPES.map(({ type, icon: Icon, labelBg, labelEn }) => (
        <TypeButton
          key={type}
          $active={selected === type}
          onClick={() => onChange(type)}
        >
          <Icon size={14} />
          <span>{language === 'bg' ? labelBg : labelEn}</span>
        </TypeButton>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 2px;
  }
`;

const TypeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: ${p => p.$active ? '#FF8F10' : '#f8f9fa'};
  color: ${p => p.$active ? 'white' : '#495057'};
  border: 1px solid ${p => p.$active ? '#FF7900' : '#e9ecef'};
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: ${p => p.$active ? 600 : 500};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${p => p.$active ? '#FF7900' : '#e9ecef'};
  }
`;

export default PostTypeSelector;

