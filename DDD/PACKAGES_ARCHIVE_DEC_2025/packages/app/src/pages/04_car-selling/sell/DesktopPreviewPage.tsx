// Desktop Preview Page - Summary before submission
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { SellProgressBar } from '@globul-cars/ui/componentsSellWorkflow';
import SellWorkflowStepStateService from '@globul-cars/services/sellWorkflowStepState';
import { usePreviewSummary } from './Preview/usePreviewSummary';

const ProgressWrapper = styled.div`
  padding: 1rem 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const Card = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent-primary);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 200px;
`;

const Value = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
`;

const EquipmentGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EquipmentHeading = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
`;

const EquipmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const EquipmentTag = styled.span`
  background: var(--accent-light);
  color: var(--accent-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  color: var(--text-muted);
  font-style: italic;
  padding: 1rem 0;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const Thumb = styled.img`
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const PublishTopButton = styled.button`
  position: fixed;
  top: 80px;
  right: 2rem;
  padding: 0.875rem 2rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-bottom: 1rem;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 2rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
`;

const DesktopPreviewPage: React.FC = () => {
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
      {rows.map((row, index) => (
        <Row key={`${row.label}-${index}`}>
          <Label>{row.label}</Label>
          <Value>{row.value || '—'}</Value>
        </Row>
      ))}
    </>
  );

  const renderEquipmentList = (items: string[], emptyLabel: string) => {
    if (!items.length) {
      return <EmptyState>{emptyLabel}</EmptyState>;
    }

    return (
      <EquipmentList>
        {items.map(item => (
          <EquipmentTag key={item}>{item}</EquipmentTag>
        ))}
      </EquipmentList>
    );
  };

  const handlePublish = () => {
    navigate(`/sell/inserat/${vehicleType || 'car'}/submission`);
  };

  return (
    <>
      <ProgressWrapper>
        <SellProgressBar currentStep="preview" />
      </ProgressWrapper>
      <PublishTopButton onClick={handlePublish}>
        {t('sell.preview.actions.publish') || 'Publish Online'}
      </PublishTopButton>
      <Container>
        <Header>
          <Title>{t('sell.preview.title')}</Title>
        </Header>

        <Card>
          <CardTitle>{summary.vehicle.title}</CardTitle>
          {renderRows(summary.vehicle.rows)}
        </Card>

        <Card>
          <CardTitle>{summary.pricing.title}</CardTitle>
          {renderRows(summary.pricing.rows)}
        </Card>

        <Card>
          <CardTitle>{summary.contact.title}</CardTitle>
          {renderRows(summary.contact.rows)}
        </Card>

        <Card>
          <CardTitle>{labels.sections.equipment}</CardTitle>
          <EquipmentGroup>
            <EquipmentHeading>{t('sell.equipment.safety.title')}</EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.safety,
              t('sell.preview.noEquipment')
            )}
          </EquipmentGroup>
          <EquipmentGroup>
            <EquipmentHeading>{t('sell.equipment.comfort.title')}</EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.comfort,
              t('sell.preview.noEquipment')
            )}
          </EquipmentGroup>
          <EquipmentGroup>
            <EquipmentHeading>{t('sell.equipment.infotainment.title')}</EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.infotainment,
              t('sell.preview.noEquipment')
            )}
          </EquipmentGroup>
          <EquipmentGroup>
            <EquipmentHeading>{t('sell.equipment.extras.title')}</EquipmentHeading>
            {renderEquipmentList(
              summary.equipment.extras,
              t('sell.preview.noEquipment')
            )}
          </EquipmentGroup>
        </Card>

        <Card>
          <CardTitle>{labels.sections.images}</CardTitle>
          {summary.images.length ? (
            <ImagesGrid>
              {summary.images.map((src, index) => (
                <Thumb key={`${src}-${index}`} src={src} alt={`Preview ${index + 1}`} />
              ))}
            </ImagesGrid>
          ) : (
            <EmptyState>{t('sell.preview.noImages')}</EmptyState>
          )}
        </Card>

        <Actions>
          <Button onClick={() => goTo('/sell/inserat/:vehicleType/details/bilder')}>
            {t('sell.preview.actions.editImages')}
          </Button>
          <PrimaryButton onClick={() => goTo('/sell/inserat/:vehicleType/submission')}>
            {t('sell.preview.actions.continue')}
          </PrimaryButton>
        </Actions>
      </Container>
    </>
  );
};

export default DesktopPreviewPage;