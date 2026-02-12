/**
 * BusinessSidebar Component
 * شريط معلومات جانبي مستوحى من B-K-HAMBURG
 * يحتوي على ساعات العمل والروابط ومعلومات التواصل
 * متوافق مع الدستور: لا emojis، استخدام أيقونات Lucide-React
 */

import React from 'react';
import styled from 'styled-components';
import { Clock, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface BusinessSidebarProps {
  user: BulgarianUser;
}

export const BusinessSidebar: React.FC<BusinessSidebarProps> = ({ user }) => {
  const { language } = useLanguage();

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
    <SidebarCard>
      <SidebarTitle>
        {language === 'bg' ? 'Информация за Контакт' : 'Contact Information'}
      </SidebarTitle>

      {businessAddress && (
        <InfoItem>
          <MapPin size={18} />
          <InfoText>{businessAddress}</InfoText>
        </InfoItem>
      )}

      {user.phoneNumber && (
        <InfoItem>
          <Phone size={18} />
          <InfoText>{user.phoneNumber}</InfoText>
        </InfoItem>
      )}

      {user.email && (
        <InfoItem>
          <Mail size={18} />
          <InfoText>{user.email}</InfoText>
        </InfoItem>
      )}

      {businessWebsite && (
        <InfoItem>
          <Globe size={18} />
          <WebsiteLink href={businessWebsite} target="_blank" rel="noopener noreferrer">
            {language === 'bg' ? 'Уебсайт' : 'Website'}
          </WebsiteLink>
        </InfoItem>
      )}

      {(isDealer || isCompany) && (
        <BusinessHoursSection>
          <BusinessHoursTitle>
            <Clock size={18} />
            {language === 'bg' ? 'Работно Време' : 'Business Hours'}
          </BusinessHoursTitle>
          
          {businessHours ? (
            <HoursList>
              {Object.entries(businessHours).map(([day, hours]) => (
                <DayRow key={day}>
                  <DayName>{day}</DayName>
                  <DayTime>{hours as string}</DayTime>
                </DayRow>
              ))}
            </HoursList>
          ) : (
            <HoursList>
              <DayRow>
                <DayName>{defaultHours.weekdays}</DayName>
                <DayTime>{defaultHours.weekdaysTime}</DayTime>
              </DayRow>
              <DayRow>
                <DayName>{defaultHours.saturday}</DayName>
                <DayTime>{defaultHours.saturdayTime}</DayTime>
              </DayRow>
              <DayRow>
                <DayName>{defaultHours.sunday}</DayName>
                <DayTime>{defaultHours.sundayTime}</DayTime>
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

const SidebarCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 100px;
  border: 1px solid #E2E8F0;

  @media (max-width: 992px) {
    position: relative;
    top: 0;
    margin-top: 24px;
  }
`;

const SidebarTitle = styled.h4`
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #E2E8F0;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  color: #475569;

  svg {
    flex-shrink: 0;
    color: #64748B;
    margin-top: 2px;
  }
`;

const InfoText = styled.span`
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
`;

const WebsiteLink = styled.a`
  font-size: 14px;
  color: #3B82F6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-bottom-color: #3B82F6;
    color: #2563EB;
  }
`;

const BusinessHoursSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #E2E8F0;
`;

const BusinessHoursTitle = styled.h5`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 16px 0;

  svg {
    color: #64748B;
  }
`;

const HoursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
`;

const DayName = styled.span`
  color: #475569;
  font-weight: 500;
`;

const DayTime = styled.span`
  color: #64748B;
  font-weight: 400;
`;
