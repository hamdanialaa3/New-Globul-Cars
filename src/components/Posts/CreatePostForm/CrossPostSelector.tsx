// CrossPostSelector.tsx - Select platforms for cross-posting
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Inspired by: Buffer, Hootsuite UI

import React from 'react';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';
import { SocialPlatform } from '../../../types/social-media.types';

interface CrossPostSelectorProps {
  selectedPlatforms: SocialPlatform[];
  connectedAccounts: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
  language: 'bg' | 'en';
}

const CrossPostSelector: React.FC<CrossPostSelectorProps> = ({
  selectedPlatforms,
  connectedAccounts,
  onChange,
  language
}) => {
  const t = {
    bg: {
      title: 'Споделете също в',
      subtitle: 'Изберете къде да се публикува автоматично',
      notConnected: 'Не е свързан',
      goToSettings: 'Отидете в Настройки за да свържете акаунти'
    },
    en: {
      title: 'Also share on',
      subtitle: 'Select where to auto-post',
      notConnected: 'Not connected',
      goToSettings: 'Go to Settings to connect accounts'
    }
  };

  const text = t[language];

  const platforms: Array<{
    id: SocialPlatform;
    name: string;
    color: string;
  }> = [
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X', color: '#000000' },
    { id: 'tiktok', name: 'TikTok', color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' }
  ];

  const togglePlatform = (platform: SocialPlatform) => {
    if (!connectedAccounts.includes(platform)) return;

    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  const hasConnectedAccounts = connectedAccounts.length > 0;

  return (
    <Container>
      <Header>
        <Title>{text.title}:</Title>
      </Header>

      {!hasConnectedAccounts && (
        <NoAccountsMessage>
          {text.goToSettings}
        </NoAccountsMessage>
      )}

      <PlatformsGrid>
        {platforms.map(({ id, name, color }) => {
          const isConnected = connectedAccounts.includes(id);
          const isSelected = selectedPlatforms.includes(id);

          return (
            <PlatformButton
              key={id}
              $color={color}
              $connected={isConnected}
              $selected={isSelected}
              onClick={() => togglePlatform(id)}
              disabled={!isConnected}
              type="button"
            >
              {isSelected && <CheckCircle size={12} />}
              {name}
            </PlatformButton>
          );
        })}
      </PlatformsGrid>
    </Container>
  );
};

export default CrossPostSelector;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 12px 0 0 0;
`;

const Header = styled.div`
  margin-bottom: 8px;
`;

const Title = styled.h4`
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin: 0;
`;

const PlatformsGrid = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PlatformButton = styled.button<{ 
  $color: string; 
  $connected: boolean; 
  $selected: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$selected ? p.$color : '#e9ecef'};
  background: ${p => p.$selected ? `${p.$color}` : 'white'};
  color: ${p => p.$selected ? 'white' : '#666'};
  cursor: ${p => p.$connected ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  opacity: ${p => p.$connected ? 1 : 0.4};
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: ${p => p.$color};
    background: ${p => p.$selected ? p.$color : `${p.$color}15`};
    color: ${p => p.$selected ? 'white' : p.$color};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${p => p.$color}30;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const NoAccountsMessage = styled.div`
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 0.75rem;
  margin-bottom: 10px;
  text-align: center;
`;

