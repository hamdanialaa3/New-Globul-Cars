/**
 * ProfileBusinessContact Component
 * معلومات التواصل وساعات العمل (مستوحى من B-K-HAMBURG)
 * متوافق مع الدستور: لا emojis، استخدام أيقونات Lucide-React
 */

import React from 'react';
import styled from 'styled-components';
import { Clock, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface ProfileBusinessContactProps {
  user: BulgarianUser;
}

export const ProfileBusinessContact: React.FC<ProfileBusinessContactProps> = ({ user }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const profileType = user.profileType || 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  // Business info extraction
  const businessAddress = isDealer 
    ? user.dealerSnapshot?.address 
    : isCompany 
      ? user.companySnapshot?.address 
      : user.locationData?.cityName;

  const businessWebsite = isDealer 
    ? user.dealerSnapshot?.website 
    : isCompany 
      ? user.companySnapshot?.website 
      : null;

  const businessHours = isDealer 
    ? user.dealerSnapshot?.businessHours 
    : isCompany 
      ? user.companySnapshot?.businessHours 
      : null;

  // Default business hours if not provided
  const defaultHours = {
    weekdays: language === 'bg' ? 'Понеделник - Петък' : 'Monday - Friday',
    weekdaysTime: '09:00 - 18:00',
    saturday: language === 'bg' ? 'Събота' : 'Saturday',
    saturdayTime: '10:00 - 14:00',
    sunday: language === 'bg' ? 'Неделя' : 'Sunday',
    sundayTime: language === 'bg' ? 'Затворено' : 'Closed'
  };

  return (
    <SidebarCard $isDark={isDark}>
      <SidebarTitle>
        {language === 'bg' ? 'Информация за Контакт' : 'Contact Information'}
      </SidebarTitle>

      {businessAddress && (
        <InfoItem $isDark={isDark}>
          <MapPin size={18} />
          <InfoText $isDark={isDark}>{businessAddress}</InfoText>
        </InfoItem>
      )}

      {user.phoneNumber && (
        <InfoItem $isDark={isDark}>
          <Phone size={18} />
          <InfoText $isDark={isDark}>{user.phoneNumber}</InfoText>
        </InfoItem>
      )}

      {user.email && (
        <InfoItem $isDark={isDark}>
          <Mail size={18} />
          <InfoText $isDark={isDark}>{user.email}</InfoText>
        </InfoItem>
      )}

      {businessWebsite && (
        <InfoItem $isDark={isDark}>
          <Globe size={18} />
          <WebsiteLink $isDark={isDark} href={businessWebsite} target="_blank" rel="noopener noreferrer">
            {language === 'bg' ? 'Уебсайт' : 'Website'}
          </WebsiteLink>
        </InfoItem>
      )}

      {(isDealer || isCompany) && (
        <BusinessHoursSection $isDark={isDark}>
          <BusinessHoursTitle $isDark={isDark}>
            <Clock size={18} />
            {language === 'bg' ? 'Работно Време' : 'Business Hours'}
          </BusinessHoursTitle>
          
          {businessHours ? (
            <HoursList>
              {Object.entries(businessHours).map(([day, hours]) => (
                <DayRow key={day} $isDark={isDark}>
                  <DayName $isDark={isDark}>{day}</DayName>
                  <DayTime $isDark={isDark}>{hours as string}</DayTime>
                </DayRow>
              ))}
            </HoursList>
          ) : (
            <HoursList>
              <DayRow $isDark={isDark}>
                <DayName $isDark={isDark}>{defaultHours.weekdays}</DayName>
                <DayTime $isDark={isDark}>{defaultHours.weekdaysTime}</DayTime>
              </DayRow>
              <DayRow $isDark={isDark}>
                <DayName $isDark={isDark}>{defaultHours.saturday}</DayName>
                <DayTime $isDark={isDark}>{defaultHours.saturdayTime}</DayTime>
              </DayRow>
              <DayRow $isDark={isDark}>
                <DayName $isDark={isDark}>{defaultHours.sunday}</DayName>
                <DayTime $isDark={isDark}>{defaultHours.sundayTime}</DayTime>
              </DayRow>
            </HoursList>
          )}
        </BusinessHoursSection>
      )}
    </SidebarCard>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SidebarCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.$isDark 
    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  position: sticky;
  top: 100px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    position: relative;
    top: 0;
    margin-top: 24px;
  }
`;

const SidebarTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;
`;

const InfoItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
  transition: color 0.3s ease;

  svg {
    flex-shrink: 0;
    color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
    margin-top: 2px;
    transition: color 0.3s ease;
  }
`;

const InfoText = styled.span<{ $isDark: boolean }>`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
  transition: color 0.3s ease;
`;

const WebsiteLink = styled.a<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-bottom-color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
    color: ${props => props.$isDark ? '#93C5FD' : '#2563EB'};
  }
`;

const BusinessHoursSection = styled.div<{ $isDark: boolean }>`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: border-color 0.3s ease;
`;

const BusinessHoursTitle = styled.h5<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  margin: 0 0 16px 0;
  transition: color 0.3s ease;

  svg {
    color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
    transition: color 0.3s ease;
  }
`;

const HoursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
`;

const DayName = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const DayTime = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  font-weight: 400;
  transition: color 0.3s ease;
`;
