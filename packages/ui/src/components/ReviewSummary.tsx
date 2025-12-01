// Review Summary Component - Show all data before publishing
// مكون ملخص المراجعة - عرض جميع البيانات قبل النشر

import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { Car, DollarSign, MapPin, Phone, Shield, Star, Image as ImageIcon, Edit } from 'lucide-react';

interface ReviewSummaryProps {
  workflowData: Record<string, any>;
  imagesCount: number;
  language: 'bg' | 'en';
  onEdit?: () => void;
}

const Container = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const Title = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#2c3e50')};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EditButton = styled.button<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : '#f8fafc')};
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e2e8f0')};
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#475569')};
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
`;

const Section = styled.div<{ $isDark?: boolean }>`
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: ${({ $isDark }) => ($isDark ? '#071025' : '#f8fafc')};
  border-radius: 12px;
  border-left: 4px solid #ff8f10;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h4<{ $isDark?: boolean }>`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#1e293b')};
  margin: 0;
`;

const DetailRow = styled.div<{ $isDark?: boolean }>`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e2e8f0')};

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#64748b')};
  font-weight: 500;
`;

const DetailValue = styled.div<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#1e293b')};
  font-weight: 600;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Tag = styled.span<{ $isDark?: boolean }>`
  background: linear-gradient(135deg, #10b981, #059669);
  color: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const PriceDisplay = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Badge = styled.span`
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const ImageCount = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#475569')};
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e2e8f0')};
`;

const Warning = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#2a2a1e' : '#fef3c7')};
  border: 2px solid ${({ $isDark }) => ($isDark ? '#fbbf24' : '#fbbf24')};
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: ${({ $isDark }) => ($isDark ? '#ffefc1' : '#92400e')};
  line-height: 1.5;
`;

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  workflowData,
  imagesCount,
  language,
  onEdit
}) => {
  const t = (bg: string, en: string) => language === 'bg' ? bg : en;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatEquipment = (equipment: string) => {
    if (!equipment) return [];
    return equipment.split(',').map(item => item.trim()).filter(Boolean);
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          📋 {t('Преглед на обявата', 'Review Your Listing')}
        </Title>
        {onEdit && (
          <EditButton $isDark={isDark} onClick={onEdit}>
            <Edit size={16} />
            {t('Редактирай', 'Edit')}
          </EditButton>
        )}
      </Header>

      <Warning $isDark={isDark}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
          {t(
            'Моля, прегледайте внимателно всички данни преди публикуване. След публикуване можете да редактирате обявата от "Моите обяви".',
            'Please review all information carefully before publishing. After publishing, you can edit the listing from "My Listings".'
          )}
        </div>
      </Warning>

      {/* Vehicle Information */}
      <Section $isDark={isDark}>
        <SectionHeader>
          <Car size={24} color="#ff8f10" />
          <SectionTitle $isDark={isDark}>{t('Автомобил', 'Vehicle')}</SectionTitle>
        </SectionHeader>
        
        <DetailRow $isDark={isDark}>
          <DetailLabel $isDark={isDark}>{t('Марка и модел', 'Make & Model')}:</DetailLabel>
          <DetailValue $isDark={isDark}>
            {workflowData.mk} {workflowData.md || t('(Неуточнен)', '(Unspecified)')}
          </DetailValue>
        </DetailRow>
        
        <DetailRow $isDark={isDark}>
          <DetailLabel $isDark={isDark}>{t('Година', 'Year')}:</DetailLabel>
          <DetailValue $isDark={isDark}>{workflowData.fy}</DetailValue>
        </DetailRow>
        
        {workflowData.mi && (
          <DetailRow $isDark={isDark}>
            <DetailLabel $isDark={isDark}>{t('Пробег', 'Mileage')}:</DetailLabel>
            <DetailValue $isDark={isDark}>{workflowData.mi.toLocaleString()} {t('км', 'km')}</DetailValue>
          </DetailRow>
        )}
        
        {workflowData.fm && (
          <DetailRow $isDark={isDark}>
            <DetailLabel $isDark={isDark}>{t('Гориво', 'Fuel Type')}:</DetailLabel>
            <DetailValue $isDark={isDark}>{workflowData.fm}</DetailValue>
          </DetailRow>
        )}
        
        {workflowData.tr && (
          <DetailRow $isDark={isDark}>
            <DetailLabel $isDark={isDark}>{t('Скоростна кутия', 'Transmission')}:</DetailLabel>
            <DetailValue $isDark={isDark}>{workflowData.tr}</DetailValue>
          </DetailRow>
        )}
        
        {workflowData.cl && (
          <DetailRow $isDark={isDark}>
            <DetailLabel $isDark={isDark}>{t('Цвят', 'Color')}:</DetailLabel>
            <DetailValue $isDark={isDark}>{workflowData.cl}</DetailValue>
          </DetailRow>
        )}
      </Section>

      {/* Equipment */}
      {(workflowData.safety || workflowData.comfort || workflowData.infotainment || workflowData.extras) && (
        <Section $isDark={isDark}>
          <SectionHeader>
            <Shield size={24} color="#10b981" />
            <SectionTitle $isDark={isDark}>{t('Оборудване', 'Equipment')}</SectionTitle>
          </SectionHeader>
          
          {workflowData.safety && (
            <div style={{ marginBottom: '1rem' }}>
              <DetailLabel $isDark={isDark} style={{ marginBottom: '0.5rem' }}>
                {t('Безопасност', 'Safety')}:
              </DetailLabel>
              <TagsList>
                {formatEquipment(workflowData.safety).map((item, idx) => (
                  <Tag key={idx} $isDark={isDark}>✓ {item}</Tag>
                ))}
              </TagsList>
            </div>
          )}
          
          {workflowData.comfort && (
            <div style={{ marginBottom: '1rem' }}>
              <DetailLabel $isDark={isDark} style={{ marginBottom: '0.5rem' }}>
                {t('Комфорт', 'Comfort')}:
              </DetailLabel>
              <TagsList>
                {formatEquipment(workflowData.comfort).map((item, idx) => (
                  <Tag key={idx} $isDark={isDark}>✓ {item}</Tag>
                ))}
              </TagsList>
            </div>
          )}
          
          {workflowData.infotainment && (
            <div style={{ marginBottom: '1rem' }}>
              <DetailLabel $isDark={isDark} style={{ marginBottom: '0.5rem' }}>
                {t('Инфотейнмънт', 'Infotainment')}:
              </DetailLabel>
              <TagsList>
                {formatEquipment(workflowData.infotainment).map((item, idx) => (
                  <Tag key={idx} $isDark={isDark}>✓ {item}</Tag>
                ))}
              </TagsList>
            </div>
          )}
          
          {workflowData.extras && (
            <div>
              <DetailLabel $isDark={isDark} style={{ marginBottom: '0.5rem' }}>
                {t('Екстри', 'Extras')}:
              </DetailLabel>
              <TagsList>
                {formatEquipment(workflowData.extras).map((item, idx) => (
                  <Tag key={idx} $isDark={isDark}>✓ {item}</Tag>
                ))}
              </TagsList>
            </div>
          )}
        </Section>
      )}

      {/* Pricing */}
      <Section $isDark={isDark}>
        <SectionHeader>
          <DollarSign size={24} color="#f59e0b" />
          <SectionTitle $isDark={isDark}>{t('Цена', 'Price')}</SectionTitle>
        </SectionHeader>
        
        <PriceDisplay>
          {parseFloat(workflowData.price).toLocaleString()} {workflowData.currency || 'EUR'}
          {workflowData.negotiable === 'true' && (
            <Badge>{t('Договаряне', 'Negotiable')}</Badge>
          )}
        </PriceDisplay>
      </Section>

      {/* Images */}
      <Section $isDark={isDark}>
        <SectionHeader>
          <ImageIcon size={24} color="#8b5cf6" />
          <SectionTitle $isDark={isDark}>{t('Снимки', 'Images')}</SectionTitle>
        </SectionHeader>
        
        <ImageCount $isDark={isDark}>
          <ImageIcon size={20} />
          {imagesCount} {t('снимки', 'images')}
          {imagesCount < 3 && (
            <Badge>{t('Препоръчва се минимум 5', 'Min 5 recommended')}</Badge>
          )}
        </ImageCount>
      </Section>

      {/* Location */}
      {(workflowData.region || workflowData.city) && (
        <Section $isDark={isDark}>
          <SectionHeader>
            <MapPin size={24} color="#3b82f6" />
            <SectionTitle $isDark={isDark}>{t('Местоположение', 'Location')}</SectionTitle>
          </SectionHeader>
          
          <DetailRow $isDark={isDark}>
            <DetailLabel $isDark={isDark}>{t('Област', 'Region')}:</DetailLabel>
            <DetailValue $isDark={isDark}>{workflowData.region}</DetailValue>
          </DetailRow>
          
          {workflowData.city && (
            <DetailRow $isDark={isDark}>
              <DetailLabel $isDark={isDark}>{t('Град', 'City')}:</DetailLabel>
              <DetailValue $isDark={isDark}>{workflowData.city}</DetailValue>
            </DetailRow>
          )}
        </Section>
      )}

      {/* Contact */}
      {(workflowData.sellerName || workflowData.sellerPhone) && (
        <Section $isDark={isDark}>
          <SectionHeader>
            <Phone size={24} color="#06b6d4" />
            <SectionTitle $isDark={isDark}>{t('Контакт', 'Contact')}</SectionTitle>
          </SectionHeader>
          
          {workflowData.sellerName && (
            <DetailRow $isDark={isDark}>
              <DetailLabel $isDark={isDark}>{t('Име', 'Name')}:</DetailLabel>
              <DetailValue $isDark={isDark}>{workflowData.sellerName}</DetailValue>
            </DetailRow>
          )}
          
          {workflowData.sellerPhone && (
            <DetailRow $isDark={isDark}>
              <DetailLabel $isDark={isDark}>{t('Телефон', 'Phone')}:</DetailLabel>
              <DetailValue $isDark={isDark}>{workflowData.sellerPhone}</DetailValue>
            </DetailRow>
          )}
        </Section>
      )}
    </Container>
  );
};

export default ReviewSummary;

