/**
 * HorizontalContactSection Component
 * قسم معلومات التواصل الأفقي - بديل للسايدبار
 * تصميم كروت ذكية أفقية تحت الخريطة
 */

import React from 'react';
import styled from 'styled-components';
import { Clock, Globe, Mail, MapPin, Phone, Building2 } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface HorizontalContactSectionProps {
  user: BulgarianUser;
}

export const HorizontalContactSection: React.FC<HorizontalContactSectionProps> = ({ user }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const profileType = user.profileType || 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  // Business info extraction (Same logic as ProfileBusinessContact)
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
    <Container $isDark={isDark}>
      <Title $isDark={isDark}>
        {language === 'bg' ? 'Контакти & Работно Време' : 'Contact & Business Hours'}
      </Title>
      
      <Grid>
        {/* Contact Info Column */}
        <InfoCard $isDark={isDark}>
            <CardHeader $isDark={isDark}>
                <Building2 size={20} />
                <span>{language === 'bg' ? 'Данни за контакт' : 'Contact Details'}</span>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </InfoCard>

        {/* Business Hours Column */}
        {(isDealer || isCompany) && (
            <InfoCard $isDark={isDark}>
                <CardHeader $isDark={isDark}>
                    <Clock size={20} />
                    <span>{language === 'bg' ? 'Работно Време' : 'Business Hours'}</span>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </InfoCard>
        )}
      </Grid>
    </Container>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div<{ $isDark: boolean }>`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  margin-bottom: 30px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
    margin-bottom: 16px;
    display: none; // Hidden for cleaner look, cards have headers
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const InfoCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  overflow: hidden;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const CardHeader = styled.div<{ $isDark: boolean }>`
  padding: 16px 20px;
  background: ${props => props.$isDark ? '#334155' : '#F8FAFC'};
  border-bottom: 1px solid ${props => props.$isDark ? '#475569' : '#E2E8F0'};
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  
  svg {
    color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

const InfoItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
  
  svg {
    flex-shrink: 0;
    color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
    margin-top: 2px;
  }
`;

const InfoText = styled.span<{ $isDark: boolean }>`
  font-size: 15px;
  line-height: 1.5;
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
`;

const WebsiteLink = styled.a<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const HoursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DayRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.$isDark ? '#334155' : '#F1F5F9'};
  padding-bottom: 8px;
  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const DayName = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#CBD5E1' : '#64748B'};
  font-weight: 500;
  font-size: 14px;
`;

const DayTime = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#94A3B8' : '#1E293B'};
  font-weight: 600;
  font-size: 14px;
`;
