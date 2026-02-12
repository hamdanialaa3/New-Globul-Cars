// Post Options - Visibility & Location Settings
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Globe, Users, Lock } from 'lucide-react';
import LocationPicker, { DetailedLocation } from './LocationPicker';

type Visibility = 'public' | 'followers' | 'private';

interface PostOptionsProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  location: DetailedLocation | null;
  onLocationChange: (l: DetailedLocation | null) => void;
}

const PostOptions: React.FC<PostOptionsProps> = ({
  visibility,
  onVisibilityChange,
  location,
  onLocationChange
}) => {
  const { language } = useLanguage();

  const visibilityOptions = [
    { value: 'public' as const, icon: Globe, labelBg: 'Публично', labelEn: 'Public' },
    { value: 'followers' as const, icon: Users, labelBg: 'Последователи', labelEn: 'Followers' },
    { value: 'private' as const, icon: Lock, labelBg: 'Лично', labelEn: 'Private' }
  ];

  return (
    <Container>
      <Section>
        <SectionLabel>
          {language === 'bg' ? 'Видимост:' : 'Visibility:'}
        </SectionLabel>
        <VisibilityButtons>
          {visibilityOptions.map(({ value, icon: Icon, labelBg, labelEn }) => (
            <VisibilityButton
              key={value}
              $active={visibility === value}
              onClick={() => onVisibilityChange(value)}
            >
              <Icon size={16} />
              <span>{language === 'bg' ? labelBg : labelEn}</span>
            </VisibilityButton>
          ))}
        </VisibilityButtons>
      </Section>

      <Section>
        <SectionLabel>
          {language === 'bg' ? 'Местоположение (по избор):' : 'Location (optional):'}
        </SectionLabel>
        <LocationPicker
          value={location}
          onChange={onLocationChange}
        />
      </Section>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
`;

const VisibilityButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const VisibilityButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: ${p => p.$active ? 'linear-gradient(135deg, #FF7900, #FF8F10)' : 'white'};
  color: ${p => p.$active ? 'white' : '#495057'};
  border: 2px solid ${p => p.$active ? '#FF7900' : '#e9ecef'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: ${p => p.$active ? 600 : 500};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${p => p.$active ? '0 2px 8px rgba(255, 121, 0, 0.2)' : 'none'};
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${p => p.$active ? 'linear-gradient(135deg, #FF6800, #FF7900)' : '#f8f9fa'};
    border-color: ${p => p.$active ? '#FF6800' : '#FF8F10'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default PostOptions;

