// Mobile Equipment Main Page
// Purpose: Equipment category selector for mobile/tablet portrait
// Mobile-first; no emojis; <300 lines

import React from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MobileContainer, MobileStack } from '@/components/ui/mobile-index';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { S } from './MobileEquipmentMain.styles';

const EquipmentMainPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();

  const categories = [
    {
      id: 'safety',
      icon: 'shield',
      title: t('sell.equipment.safety.title'),
      description: t('sell.equipment.safety.description'),
      features: [
        t('sell.equipment.safety.features.0'),
        t('sell.equipment.safety.features.1'),
        t('sell.equipment.safety.features.2')
      ]
    },
    {
      id: 'comfort',
      icon: 'seat',
      title: t('sell.equipment.comfort.title'),
      description: t('sell.equipment.comfort.description'),
      features: [
        t('sell.equipment.comfort.features.0'),
        t('sell.equipment.comfort.features.1'),
        t('sell.equipment.comfort.features.2')
      ]
    },
    {
      id: 'infotainment',
      icon: 'screen',
      title: t('sell.equipment.infotainment.title'),
      description: t('sell.equipment.infotainment.description'),
      features: [
        t('sell.equipment.infotainment.features.0'),
        t('sell.equipment.infotainment.features.1'),
        t('sell.equipment.infotainment.features.2')
      ]
    },
    {
      id: 'extras',
      icon: 'star',
      title: t('sell.equipment.extras.title'),
      description: t('sell.equipment.extras.description'),
      features: [
        t('sell.equipment.extras.features.0'),
        t('sell.equipment.extras.features.1'),
        t('sell.equipment.extras.features.2')
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    navigate(`/sell/inserat/${vehicleType}/equipment/${categoryId}?${params.toString()}`);
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchParams.toString());
     navigate(`/sell/inserat/${vehicleType}/details/bilder?${params.toString()}`);
  };

  return (
    <S.PageWrapper>
      <MobileHeader />

      <S.ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <S.HeaderSection>
              <S.PageTitle>{t('sell.equipment.title')}</S.PageTitle>
              <S.PageSubtitle>{t('sell.equipment.subtitle')}</S.PageSubtitle>
            </S.HeaderSection>

            <S.InfoCard>
              <S.InfoTitle>{t('sell.equipment.infoTitle')}</S.InfoTitle>
              <S.InfoText>{t('sell.equipment.infoText')}</S.InfoText>
            </S.InfoCard>

            <S.Grid>
              {categories.map((category) => (
                <S.CategoryCard
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <S.CategoryTitle>{category.title}</S.CategoryTitle>
                  <S.CategoryDescription>{category.description}</S.CategoryDescription>
                  <S.FeatureList>
                    {category.features.map((feature, idx) => (
                      <S.FeatureItem key={idx}>{feature}</S.FeatureItem>
                    ))}
                  </S.FeatureList>
                </S.CategoryCard>
              ))}
            </S.Grid>
          </MobileStack>
        </MobileContainer>
      </S.ContentWrapper>

      <S.StickyFooter>
        <S.SkipButton onClick={handleSkip}>
          {t('sell.equipment.skip')}
        </S.SkipButton>
      </S.StickyFooter>
    </S.PageWrapper>
  );
};

export default EquipmentMainPage;
