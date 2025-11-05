// Mobile Preview Page - Summary before submission
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { S } from './MobilePreviewPage.styles';
import WorkflowPersistenceService from '@/services/workflowPersistenceService';
import { useLanguage } from '@/contexts/LanguageContext';

const MobilePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { vehicleType } = useParams();

  const state = useMemo(() => WorkflowPersistenceService.loadState(), []);
  const data = state?.data || {};
  const images = state?.images || WorkflowPersistenceService.getImages();

  const goTo = (path: string) => navigate(path.replace(':vehicleType', String(vehicleType || 'auto')));

  const vehicleRows = [
    { label: t('sell.preview.make'), value: data.make },
    { label: t('sell.preview.model'), value: data.model },
    { label: t('sell.preview.year'), value: data.year },
    { label: t('sell.preview.mileage'), value: data.mileage },
    { label: t('sell.preview.fuel'), value: data.fuel },
    { label: t('sell.preview.transmission'), value: data.transmission }
  ];

  const pricingRows = [
    { label: t('sell.preview.price'), value: data.price ? `${data.price} ${data.currency || '€'}` : undefined },
    { label: t('sell.preview.negotiable'), value: data.negotiable ? t('sell.preview.yes') : t('sell.preview.no') },
    { label: t('sell.preview.vat'), value: data.vatIncluded ? t('sell.preview.included') : t('sell.preview.notIncluded') }
  ];

  const contactRows = [
    { label: t('sell.preview.sellerName'), value: data.sellerName },
    { label: t('sell.preview.phone'), value: data.sellerPhone },
    { label: t('sell.preview.email'), value: data.sellerEmail },
    { label: t('sell.preview.region'), value: data.region },
    { label: t('sell.preview.city'), value: data.city },
    { label: t('sell.preview.zip'), value: data.zip }
  ];

  const renderRows = (rows: {label: string; value: any}[]) => (
    <>
      {rows.filter(r => r.value !== undefined && r.value !== '').map((row, idx) => (
        <S.Row key={idx}>
          <S.Label>{row.label}</S.Label>
          <S.Value>{String(row.value)}</S.Value>
        </S.Row>
      ))}
    </>
  );

  return (
    <S.Container>
      <S.Header>
        <S.Title>{t('sell.preview.title')}</S.Title>
      </S.Header>

      <S.Card>
        <S.CardTitle>{t('sell.preview.sections.vehicle')}</S.CardTitle>
        {renderRows(vehicleRows)}
      </S.Card>

      <S.Card>
        <S.CardTitle>{t('sell.preview.sections.images')}</S.CardTitle>
        <S.ImagesGrid>
          {images && images.length > 0 ? (
            images.slice(0, 9).map((src, i) => (
              <S.Thumb key={i} src={src} alt={`image-${i}`} />
            ))
          ) : (
            <S.Label>{t('sell.preview.noImages')}</S.Label>
          )}
        </S.ImagesGrid>
      </S.Card>

      <S.Card>
        <S.CardTitle>{t('sell.preview.sections.pricing')}</S.CardTitle>
        {renderRows(pricingRows)}
      </S.Card>

      <S.Card>
        <S.CardTitle>{t('sell.preview.sections.contact')}</S.CardTitle>
        {renderRows(contactRows)}
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
  );
};

export default MobilePreviewPage;
