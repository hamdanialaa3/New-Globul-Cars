// src/components/PopupBlockerWarning.tsx
// Component to warn users about popup blockers

import React from 'react';
import styled from 'styled-components';

const WarningContainer = styled.div`
  background: #fef5e7;
  border: 1px solid #f6ad55;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WarningIcon = styled.div`
  color: #f6ad55;
  font-size: 24px;
`;

const WarningContent = styled.div`
  flex: 1;
`;

const WarningTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #c05621;
  font-size: 16px;
  font-weight: 600;
`;

const WarningText = styled.p`
  margin: 0 0 8px 0;
  color: #744210;
  font-size: 14px;
  line-height: 1.5;
`;

const InstructionsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #744210;
  font-size: 14px;
  line-height: 1.4;
`;

const InstructionItem = styled.li`
  margin-bottom: 4px;
`;

interface PopupBlockerWarningProps {
  provider: 'Google' | 'Facebook' | 'Apple';
  onRetry?: () => void;
}

export const PopupBlockerWarning: React.FC<PopupBlockerWarningProps> = ({
  provider,
  onRetry
}) => {
  const getProviderInstructions = (provider: string) => {
    switch (provider) {
      case 'Google':
        return 'Make sure to allow popups from accounts.google.com';
      case 'Facebook':
        return 'Make sure to allow popups from facebook.com';
      case 'Apple':
        return 'Make sure to allow popups from appleid.apple.com';
      default:
        return 'Make sure to allow popups from this site';
    }
  };

  return (
    <WarningContainer>
      <WarningIcon>⚠️</WarningIcon>
      <WarningContent>
        <WarningTitle>Popup Blocked</WarningTitle>
        <WarningText>
          The browser blocked the {provider} sign-in popup.
          This is common and can be easily fixed.
        </WarningText>

        <InstructionsList>
          <InstructionItem>
            Click the shield/lock icon in the address bar
          </InstructionItem>
          <InstructionItem>
            Look for &quot;Pop-up blocker&quot;
          </InstructionItem>
          <InstructionItem>
            Disable the popup blocker for this site
          </InstructionItem>
          <InstructionItem>
            {getProviderInstructions(provider)}
          </InstructionItem>
          <InstructionItem>
            Try again
          </InstructionItem>
        </InstructionsList>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        )}
      </WarningContent>
    </WarningContainer>
  );
};

export default PopupBlockerWarning;