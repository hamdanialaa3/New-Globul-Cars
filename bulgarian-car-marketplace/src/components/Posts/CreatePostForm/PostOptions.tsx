// Post Options - Visibility & Location Settings
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Globe, Users, Lock, MapPin } from 'lucide-react';

type Visibility = 'public' | 'followers' | 'private';

interface PostOptionsProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  location: { city: string; region: string };
  onLocationChange: (l: { city: string; region: string }) => void;
}

const BULGARIAN_CITIES = [
  'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora',
  'Pleven', 'Sliven', 'Dobrich', 'Shumen', 'Pernik', 'Yambol',
  'Pazardzhik', 'Haskovo', 'Blagoevgrad', 'Veliko Tarnovo',
  'Vidin', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Kyustendil',
  'Kardzhali', 'Dupnitsa', 'Silistra', 'Samokov', 'Petrich',
  'Razgrad', 'Gorna Oryahovitsa'
];

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
          <MapPin size={16} />
          {language === 'bg' ? 'Местоположение (по избор):' : 'Location (optional):'}
        </SectionLabel>
        <LocationSelect
          value={location.city}
          onChange={(e) => onLocationChange({ ...location, city: e.target.value })}
        >
          <option value="">
            {language === 'bg' ? '-- Изберете град --' : '-- Select City --'}
          </option>
          {BULGARIAN_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </LocationSelect>
      </Section>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
`;

const VisibilityButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const VisibilityButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 10px;
  background: ${p => p.$active ? '#FF8F10' : '#f8f9fa'};
  color: ${p => p.$active ? 'white' : '#495057'};
  border: 1px solid ${p => p.$active ? '#FF7900' : '#e9ecef'};
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${p => p.$active ? '#FF7900' : '#e9ecef'};
  }
`;

const LocationSelect = styled.select`
  padding: 8px 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafafa;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: white;
  }
`;

export default PostOptions;

