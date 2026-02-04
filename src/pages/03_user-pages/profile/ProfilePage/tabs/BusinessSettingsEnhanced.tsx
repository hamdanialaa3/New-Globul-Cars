import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Building2, Check, AlertCircle } from 'lucide-react';
import { logger } from '../../../../../services/logger-service';

// 🎨 Styling Components
const BusinessSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-radius: 16px;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1.5rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;

  svg {
    width: 32px;
    height: 32px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
`;

// ✅ Enhanced Button with success checkmark animation
const SettingButton = styled.button<{ $isSelected?: boolean }>`
  position: relative;
  width: 100%;
  padding: 1.25rem;
  border: 2px solid ${props => props.$isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'};
  border-radius: 12px;
  background: ${props => props.$isSelected ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-card)'};
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  &:hover {
    border-color: var(--accent-primary);
    background: rgba(255, 143, 16, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  [data-theme="dark"] & {
    background: ${props => props.$isSelected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(50, 50, 60, 0.5)'};
  }
`;

// 🎉 Animated checkmark
const CheckmarkWrapper = styled.div<{ $isVisible?: boolean }>`
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)'};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);

  svg {
    width: 16px;
    height: 16px;
    color: white;
    animation: ${props => props.$isVisible ? 'checkmarkDraw' : 'none'} 0.5s ease forwards;
  }

  @keyframes checkmarkDraw {
    0% {
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
    }
    100% {
      stroke-dasharray: 20;
      stroke-dashoffset: 0;
    }
  }
`;

const ButtonLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  text-align: left;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 143, 16, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-primary);
    background: rgba(255, 143, 16, 0.05);
  }

  [data-theme="dark"] & {
    background: rgba(50, 50, 60, 0.3);
    border-color: rgba(255, 143, 16, 0.2);

    &:hover {
      background: rgba(255, 143, 16, 0.08);
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #22c55e;
  font-weight: 600;
  animation: slideDown 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const InfoBox = styled.div`
  background: rgba(255, 143, 16, 0.1);
  border: 1px solid rgba(255, 143, 16, 0.3);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  color: var(--accent-primary);
  font-size: 0.9rem;
  line-height: 1.5;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  [data-theme="dark"] & {
    background: rgba(255, 143, 16, 0.1);
    border-color: rgba(255, 143, 16, 0.4);
  }
`;

interface BusinessSetting {
  id: string;
  labelAr: string;
  labelEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: React.ReactNode;
}

const BusinessSettingsEnhanced: React.FC = () => {
  const { language } = useLanguage();
  const [selectedSettings, setSelectedSettings] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const translations = {
    bg: {
      title: 'Бизнес настройки',
      subtitle: 'Управляй своите бизнес параметри и опции',
      accountType: 'Тип акаунт',
      businessOptions: 'Бизнес опции',
      verificationStatus: 'Статус на проверка',
      success: 'Настройката беше успешно активирана!',
      businessHours: 'Работно време',
      serviceArea: 'Зона на обслужване',
      featured: 'Промотирани обяви',
      analytics: 'Аналитика и статистика',
      messaging: 'Приоритетни съобщения',
      customBranding: 'Персонализирана марка',
      legalNotice: 'Всички бизнес настройки подлежат на одобрение от администратора.'
    },
    en: {
      title: 'Business Settings',
      subtitle: 'Manage your business parameters and options',
      accountType: 'Account Type',
      businessOptions: 'Business Options',
      verificationStatus: 'Verification Status',
      success: 'Setting was successfully activated!',
      businessHours: 'Business Hours',
      serviceArea: 'Service Area',
      featured: 'Featured Listings',
      analytics: 'Analytics & Statistics',
      messaging: 'Priority Messaging',
      customBranding: 'Custom Branding',
      legalNotice: 'All business settings are subject to administrator approval.'
    },
    ar: {
      title: 'إعدادات الأعمال',
      subtitle: 'إدارة معاملات أعمالك والخيارات الخاصة بك',
      accountType: 'نوع الحساب',
      businessOptions: 'خيارات الأعمال',
      verificationStatus: 'حالة التحقق',
      success: 'تم تفعيل الإعداد بنجاح!',
      businessHours: 'ساعات العمل',
      serviceArea: 'منطقة الخدمة',
      featured: 'الإعلانات المميزة',
      analytics: 'التحليلات والإحصائيات',
      messaging: 'الرسائل ذات الأولوية',
      customBranding: 'العلامة التجارية المخصصة',
      legalNotice: 'جميع إعدادات الأعمال تخضع لموافقة المسؤول.'
    }
  };

  const businessSettings: BusinessSetting[] = [
    {
      id: 'businessHours',
      labelAr: 'ساعات العمل',
      labelEn: 'Business Hours'
    },
    {
      id: 'serviceArea',
      labelAr: 'منطقة الخدمة',
      labelEn: 'Service Area'
    },
    {
      id: 'featured',
      labelAr: 'الإعلانات المميزة',
      labelEn: 'Featured Listings'
    },
    {
      id: 'analytics',
      labelAr: 'التحليلات',
      labelEn: 'Analytics & Statistics'
    },
    {
      id: 'messaging',
      labelAr: 'الرسائل ذات الأولوية',
      labelEn: 'Priority Messaging'
    },
    {
      id: 'customBranding',
      labelAr: 'العلامة التجارية',
      labelEn: 'Custom Branding'
    }
  ];

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSettingClick = (settingId: string) => {
    setSelectedSettings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(settingId)) {
        newSet.delete(settingId);
      } else {
        newSet.add(settingId);
      }
      return newSet;
    });

    // Show success message
    setShowSuccess(settingId);
    setTimeout(() => setShowSuccess(null), 3000);

    logger.info(`Business setting toggled: ${settingId}`);
  };

  const getLabel = (setting: BusinessSetting) => {
    if (language === 'ar') return setting.labelAr;
    return setting.labelEn;
  };

  return (
    <BusinessSection>
      {showSuccess && (
        <SuccessMessage>
          <Check />
          {t.success}
        </SuccessMessage>
      )}

      <div>
        <Title>
          <Building2 />
          {t.title}
        </Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </div>

      <InfoBox>
        <AlertCircle />
        {t.legalNotice}
      </InfoBox>

      <Section>
        <SectionHeader>
          <SectionIcon>
            <Building2 />
          </SectionIcon>
          <div>
            <SectionTitle>{t.businessOptions}</SectionTitle>
            <SectionDescription>{t.subtitle}</SectionDescription>
          </div>
        </SectionHeader>

        <SettingsGrid>
          {businessSettings.map(setting => (
            <SettingButton
              key={setting.id}
              $isSelected={selectedSettings.has(setting.id)}
              onClick={() => handleSettingClick(setting.id)}
            >
              <ButtonLabel>
                {getLabel(setting)}
              </ButtonLabel>
              <CheckmarkWrapper $isVisible={selectedSettings.has(setting.id)}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </CheckmarkWrapper>
            </SettingButton>
          ))}
        </SettingsGrid>
      </Section>

      {selectedSettings.size > 0 && (
        <Section>
          <SectionTitle>
            مختار ({selectedSettings.size}) / Selected ({selectedSettings.size})
          </SectionTitle>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {Array.from(selectedSettings).map(id => {
              const setting = businessSettings.find(s => s.id === id);
              return setting ? (
                <div
                  key={id}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check size={16} />
                  {getLabel(setting)}
                </div>
              ) : null;
            })}
          </div>
        </Section>
      )}
    </BusinessSection>
  );
};

export default BusinessSettingsEnhanced;
