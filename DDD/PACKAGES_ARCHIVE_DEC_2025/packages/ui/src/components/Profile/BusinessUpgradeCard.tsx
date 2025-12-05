// src/components/Profile/BusinessUpgradeCard.tsx
// Business Upgrade Promotion Card - Modern 3D Design
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import { Building2, ArrowRight, Check, TrendingUp, Users, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import * as S from './business-upgrade/styles';

// ==================== COMPONENT ====================

interface BusinessUpgradeCardProps {
  onUpgrade: () => void;
}

const BusinessUpgradeCard: React.FC<BusinessUpgradeCardProps> = ({ 
  onUpgrade 
}) => {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: <Shield size={15} />,
      text: language === 'bg' ? 'Търговска значка' : 'Business Badge'
    },
    {
      icon: <TrendingUp size={15} />,
      text: language === 'bg' ? 'Повече видимост' : 'More Visibility'
    },
    {
      icon: <Users size={15} />,
      text: language === 'bg' ? 'Множество обяви' : 'Multiple Listings'
    },
    {
      icon: <Check size={15} />,
      text: language === 'bg' ? 'Приоритетна поддръжка' : 'Priority Support'
    }
  ];

  return (
    <S.UpgradeCard>
      <S.CardInner>
        <S.CardHeader>
          <S.IconCircle>
            <Building2 size={20} color="white" />
          </S.IconCircle>
        </S.CardHeader>

        <S.CardTitle>
          {language === 'bg' ? 'Бизнес Профил' : 'Business Profile'}
        </S.CardTitle>

        <S.PremiumBadge>
          <Sparkles size={10} />
          {language === 'bg' ? 'Премиум' : 'Premium'}
        </S.PremiumBadge>

        <S.CardDescription>
          {language === 'bg'
            ? 'Професионален акаунт с разширени функции за дилъри'
            : 'Professional account with advanced features for dealers'}
        </S.CardDescription>

        <S.BenefitsList>
          {benefits.map((benefit, index) => (
            <S.BenefitItem key={index}>
              {benefit.icon}
              <span>{benefit.text}</span>
            </S.BenefitItem>
          ))}
        </S.BenefitsList>

        <S.UpgradeButton onClick={onUpgrade}>
          <Building2 size={16} />
          {language === 'bg' ? 'Активирай сега' : 'Activate Now'}
          <ArrowRight size={16} />
        </S.UpgradeButton>
      </S.CardInner>
    </S.UpgradeCard>
  );
};

export default BusinessUpgradeCard;

