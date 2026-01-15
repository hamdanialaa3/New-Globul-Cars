/**
 * ProfileTrustSection Component
 * شارات الثقة والتحقق البلغارية
 * متوافق مع الدستور: لا emojis، استخدام أيقونات Lucide-React
 */

import React from 'react';
import styled from 'styled-components';
import { Shield, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface ProfileTrustSectionProps {
  user: BulgarianUser;
}

export const ProfileTrustSection: React.FC<ProfileTrustSectionProps> = ({ user }) => {
  const { language } = useLanguage();

  const profileType = user.profileType || 'private';
  const isPrivate = profileType === 'private';

  // Don't show trust section for private profiles
  if (isPrivate) return null;

  const trustScore = user.stats?.trustScore || 0;
  const isVerified = user.verification?.id || false;

  return (
    <TrustSectionContainer $isDark={isDark}>
      <TrustGrid>
        <TrustBadge $isDark={isDark}>
          <Shield size={32} color="#10B981" />
          <TrustTitle $isDark={isDark}>
            {language === 'bg' ? 'Надежден Продавач' : 'Trusted Seller'}
          </TrustTitle>
          <TrustDesc $isDark={isDark}>
            {isVerified 
              ? (language === 'bg' ? 'Потвърден и Проверен' : 'Verified & Authenticated')
              : (language === 'bg' ? 'В процес на потвърждение' : 'Verification in Progress')
            }
          </TrustDesc>
          {isVerified && (
            <VerifiedIndicator>
              <CheckCircle size={16} color="#10B981" />
              {language === 'bg' ? 'Потвърден' : 'Verified'}
            </VerifiedIndicator>
          )}
        </TrustBadge>

        <TrustBadge $isDark={isDark}>
          <Award size={32} color="#3B82F6" />
          <TrustTitle $isDark={isDark}>
            {language === 'bg' ? 'Гаранция за Качество' : 'Quality Guarantee'}
          </TrustTitle>
          <TrustDesc $isDark={isDark}>
            {language === 'bg' ? 'Висококачествени Превозни Средства' : 'High-Quality Vehicles'}
          </TrustDesc>
        </TrustBadge>

        <TrustBadge $isDark={isDark}>
          <TrendingUp size={32} color="#F59E0B" />
          <TrustTitle $isDark={isDark}>
            {language === 'bg' ? 'Опит' : 'Experience'}
          </TrustTitle>
          <TrustDesc $isDark={isDark}>
            {language === 'bg' ? 'Години Опит' : 'Years of Expertise'}
          </TrustDesc>
          {trustScore > 0 && (
            <TrustScore>
              {trustScore}% {language === 'bg' ? 'Доверие' : 'Trust'}
            </TrustScore>
          )}
        </TrustBadge>
      </TrustGrid>
    </TrustSectionContainer>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const TrustSectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 40px;
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  margin-top: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const TrustBadge = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 32px;
  background: ${props => props.$isDark ? '#0F172A' : '#F8FAFC'};
  border-radius: 16px;
  border: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$isDark 
      ? '0 12px 24px rgba(0, 0, 0, 0.4)' 
      : '0 12px 24px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.$isDark ? '#475569' : '#CBD5E1'};
  }
`;

const TrustTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  margin: 16px 0 8px;
  transition: color 0.3s ease;
`;

const TrustDesc = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  margin: 0 0 12px;
  transition: color 0.3s ease;
`;

const VerifiedIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ECFDF5;
  color: #10B981;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
`;

const TrustScore = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background: #FEF3C7;
  color: #F59E0B;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  margin-top: 8px;
`;
