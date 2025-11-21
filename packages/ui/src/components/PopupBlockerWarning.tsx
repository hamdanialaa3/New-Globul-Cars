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
        return 'تأكد من السماح للنوافذ المنبثقة من accounts.google.com';
      case 'Facebook':
        return 'تأكد من السماح للنوافذ المنبثقة من facebook.com';
      case 'Apple':
        return 'تأكد من السماح للنوافذ المنبثقة من appleid.apple.com';
      default:
        return 'تأكد من السماح للنوافذ المنبثقة من الموقع';
    }
  };

  return (
    <WarningContainer>
      <WarningIcon>⚠️</WarningIcon>
      <WarningContent>
        <WarningTitle>تم حظر النافذة المنبثقة</WarningTitle>
        <WarningText>
          المتصفح منع فتح نافذة تسجيل الدخول مع {provider}.
          هذا أمر شائع ويمكن إصلاحه بسهولة.
        </WarningText>

        <InstructionsList>
          <InstructionItem>
            انقر على أيقونة الدرع/القفل في شريط العنوان
          </InstructionItem>
          <InstructionItem>
            ابحث عن "Pop-up blocker" أو "حظر النوافذ المنبثقة"
          </InstructionItem>
          <InstructionItem>
            قم بتعطيل حظر النوافذ المنبثقة لهذا الموقع
          </InstructionItem>
          <InstructionItem>
            {getProviderInstructions(provider)}
          </InstructionItem>
          <InstructionItem>
            أعد المحاولة مرة أخرى
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
            إعادة المحاولة
          </button>
        )}
      </WarningContent>
    </WarningContainer>
  );
};

export default PopupBlockerWarning;