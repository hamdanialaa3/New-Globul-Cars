// Mobile Preview Page - Summary before submission
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { S } from './MobilePreviewPage.styles';
import { useLanguage } from '@/contexts/LanguageContext';
import { SellProgressBar } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';
import { usePreviewSummary } from './Preview/usePreviewSummary';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const MobilePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { vehicleType } = useParams();

  const labels = useMemo(
    () => ({
      vehicle: {
        make: t('sell.preview.make'),
        model: t('sell.preview.model'),
        year: t('sell.preview.year'),
        mileage: t('sell.preview.mileage'),
        fuel: t('sell.preview.fuel'),
        transmission: t('sell.preview.transmission'),
        color: t('sell.vehicleData.color')
      },
      pricing: {
        price: t('sell.preview.price'),
        negotiable: t('sell.preview.negotiable'),
        vat: t('sell.preview.vat'),
        yes: t('sell.preview.yes'),
        no: t('sell.preview.no'),
        included: t('sell.preview.included'),
        notIncluded: t('sell.preview.notIncluded')
      },
      contact: {
        sellerName: t('sell.preview.sellerName'),
        phone: t('sell.preview.phone'),
        email: t('sell.preview.email'),
        region: t('sell.preview.region'),
        city: t('sell.preview.city'),
        zip: t('sell.preview.zip')
      },
      sections: {
        vehicle: t('sell.preview.sections.vehicle'),
        pricing: t('sell.preview.sections.pricing'),
        contact: t('sell.preview.sections.contact'),
        equipment: t('sell.preview.sections.equipment'),
        images: t('sell.preview.sections.images')
      }
    }),
    [t]
  );

  const summary = usePreviewSummary(labels);

  useEffect(() => {
    SellWorkflowStepStateService.markCompleted('preview');
  }, []);

  const goTo = (path: string) =>
    navigate(path.replace(':vehicleType', String(vehicleType || 'auto')));

  const renderRows = (rows: { label: string; value?: string }[]) => (
    <>
      {rows
        .filter(row => row.value)
        .map((row, index) => (
          <S.Row key={`${row.label}-${index}`}>
            <S.Label>{row.label}</S.Label>
            <S.Value>{row.value}</S.Value>
          </S.Row>
        ))}
    </>
  );

  const renderEquipmentList = (items: string[], emptyLabel: string) => {
    if (!items.length) {
      return <S.EmptyState>{emptyLabel}</S.EmptyState>;
    }

    return (
      <S.EquipmentList>
        {items.map(item => (
          <S.EquipmentTag key={item}>{item}</S.EquipmentTag>
        ))}
      </S.EquipmentList>
    );
  };

  return (
    <>
      <ProgressWrapper>
        <SellProgressBar currentStep="preview" />
      </ProgressWrapper>
      <S.Container>
        <S.Header>
          <S.Title>{t('sell.preview.title')}</S.Title>
        </S.Header>

        <S.Card>
          <S.CardTitle>{summary.vehicle.title}</S.CardTitle>
          {renderRows(summary.vehicle.rows)}
        </S.Card>

        <S.Card>
          <S.CardTitle>{summary.pricing.title}</S.CardTitle>
          {renderRows(summary.pricing.rows)}
        </S.Card>

        <S.Card>
          <S.CardTitle>{summary.contact.title}</S.CardTitle>
          {renderRows(summary.contact.rows)}
        </S.Card>

        <S.Card>
          <S.CardTitle>{labels.sections.equipment}</S.CardTitle>
          <S.EquipmentGroup>
            <S.EquipmentHeading>{t('sell.equipment.safety.title')}</S.EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.safety,
              t('sell.preview.noEquipment')
            )}
          </S.EquipmentGroup>
          <S.EquipmentGroup>
            <S.EquipmentHeading>{t('sell.equipment.comfort.title')}</S.EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.comfort,
              t('sell.preview.noEquipment')
            )}
          </S.EquipmentGroup>
          <S.EquipmentGroup>
            <S.EquipmentHeading>{t('sell.equipment.infotainment.title')}</S.EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.infotainment,
              t('sell.preview.noEquipment')
            )}
          </S.EquipmentGroup>
          <S.EquipmentGroup>
            <S.EquipmentHeading>{t('sell.equipment.extras.title')}</S.EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.extras,
              t('sell.preview.noEquipment')
            )}
          </S.EquipmentGroup>
        </S.Card>

        <S.Card>
          <S.CardTitle>{labels.sections.images}</S.CardTitle>
          {summary.images.length ? (
            <S.ImagesGrid>
              {summary.images.map((src, index) => (
                <S.Thumb key={`${src}-${index}`} src={src} alt={`Preview ${index + 1}`} />
              ))}
            </S.ImagesGrid>
          ) : (
            <S.EmptyState>{t('sell.preview.noImages')}</S.EmptyState>
          )}
        </S.Card>

        <S.Actions>
          <S.Button onClick={() => goTo('/sell/inserat/:vehicleType/details/bilder')}>
            {t('sell.preview.actions.editImages')}
          </S.Button>
          <S.PrimaryButton onClick={() => goTo('/sell/inserat/:vehicleType/submission')}>
            {t('sell.preview.actions.continue')}
          </S.PrimaryButton>
        </S.Actions>
      </S.Container>
    </>
  );
};

export default MobilePreviewPage;
