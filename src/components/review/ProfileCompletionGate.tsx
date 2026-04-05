// src/components/review/ProfileCompletionGate.tsx
// Gates review UI behind profile completeness requirements

import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';

interface ProfileCompletionGateProps {
  children: React.ReactNode;
  user?: BulgarianUser | null;
}

const GateContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

const Overlay = styled.div`
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  text-align: center;
`;

const WarningIcon = styled.div`
  margin-bottom: 12px;
  color: #f59e0b;
`;

const Title = styled.h4`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Description = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const MissingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const MissingBadge = styled.li`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  font-weight: 500;
`;

const CTAButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
`;

const FIELD_LABELS: Record<string, { bg: string; en: string }> = {
  displayName: { bg: 'Име', en: 'Display name' },
  emailVerified: { bg: 'Потвърден имейл', en: 'Email verification' },
  phoneVerified: { bg: 'Потвърден телефон', en: 'Phone verification' },
  location: { bg: 'Локация', en: 'Location' },
};

export const ProfileCompletionGate: React.FC<ProfileCompletionGateProps> = ({
  children,
  user: propUser,
}) => {
  const { user: authUser } = useAuth();
  const currentUser = (propUser || authUser) as BulgarianUser | null;
  const { canReview, missingFields } = useProfileCompleteness(currentUser);
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (canReview) {
    return <>{children}</>;
  }

  const numericId = currentUser?.numericId;

  return (
    <GateContainer>
      <Overlay>
        <WarningIcon>
          <AlertTriangle size={32} />
        </WarningIcon>
        <Title>
          {language === 'bg'
            ? 'Завършете профила си'
            : 'Complete Your Profile'}
        </Title>
        <Description>
          {language === 'bg'
            ? 'Трябва да завършите профила си, за да можете да оставяте отзиви.'
            : 'You need to complete your profile before you can leave reviews.'}
        </Description>
        <MissingList>
          {missingFields.map((field) => (
            <MissingBadge key={field}>
              {FIELD_LABELS[field]?.[language] || field}
            </MissingBadge>
          ))}
        </MissingList>
        {numericId && (
          <CTAButton onClick={() => navigate(`/profile/${numericId}/settings`)}>
            {language === 'bg' ? 'Настройки на профила' : 'Profile Settings'}
          </CTAButton>
        )}
      </Overlay>
    </GateContainer>
  );
};

export default ProfileCompletionGate;
