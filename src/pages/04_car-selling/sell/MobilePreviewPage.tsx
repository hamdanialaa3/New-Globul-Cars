// Mobile Preview Page - Summary before submission
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { MoreVertical, Trash2, AlertTriangle } from 'lucide-react';
import { S } from './MobilePreviewPage.styles';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { usePreviewSummary } from './Preview/usePreviewSummary';
import CarBrandLogo from '../../../components/CarBrandLogo';
import useSellWorkflow from '../../../hooks/useSellWorkflow';
import { useUnifiedWorkflow } from '../../../hooks/useUnifiedWorkflow';
import { useAuth } from '../../../contexts/AuthProvider';
import DraftsService from '../../../services/drafts-service';
import { toast } from 'react-toastify';
import { logger } from '../../../services/logger-service';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

// Watermark for brand logo
const BrandWatermark = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  opacity: ${props => props.$isVisible ? 0.08 : 0};
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.5s ease;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Ensure logo is visible but very subtle */
  & > div {
    width: 100% !important;
    height: 100% !important;
    
    & > div:first-child {
      width: 400px !important;
      height: 400px !important;
      background: transparent !important;
      box-shadow: none !important;
      
      img {
        width: 400px !important;
        height: 400px !important;
        object-fit: contain;
        filter: grayscale(100%) opacity(0.15);
      }
    }
  }
`;

// Dropdown Menu Styles
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-secondary);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const DropdownMenu = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  padding: 0.5rem;
  min-width: 200px;
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 1000;
  animation: slideDown 0.2s ease;
  
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

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ef4444;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: left;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Confirm Modal
const ConfirmModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 90%;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
`;

const ModalIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 50%;
  color: #f59e0b;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 0.75rem 0;
`;

const ModalMessage = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ModalButton = styled.button<{ $variant?: 'danger' | 'cancel' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'danger' ? `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }
  ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    
    &:hover {
      background: var(--bg-accent);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const MobilePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { vehicleType } = useParams();
  const { workflowData } = useSellWorkflow();
  const { clearWorkflow } = useUnifiedWorkflow(5);
  const { currentUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        city: t('sell.preview.locationData?.cityName'),
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

  const handleDeleteDraft = async () => {
    if (!workflowData) {
      toast.info(
        language === 'bg' ? 'Няма данни за изтриване' : 'No data to delete',
        { position: 'bottom-right', autoClose: 2000 }
      );
      return;
    }

    setIsDeleting(true);

    try {
      // Delete from Firestore drafts if draftId exists
      const draftId = localStorage.getItem('current_draft_id');
      if (draftId && currentUser) {
        try {
          await DraftsService.deleteDraft(draftId);
          localStorage.removeItem('current_draft_id');
          logger.info('Draft deleted from Firestore', { draftId });
        } catch (error) {
          logger.warn('Failed to delete Firestore draft (non-critical)', { error, draftId });
        }
      }

      // Clear workflow
      await clearWorkflow();

      // Clear localStorage
      localStorage.removeItem('globul_sell_workflow_state');
      localStorage.removeItem('globul_unified_workflow');

      toast.success(
        language === 'bg'
          ? 'Черновата е изтрита успешно'
          : 'Draft deleted successfully',
        {
          position: 'bottom-right',
          autoClose: 2000
        }
      );

      // Navigate to start
      setTimeout(() => {
        navigate('/sell/auto');
      }, 500);
    } catch (error) {
      logger.error('Error deleting draft', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при изтриване на черновата'
          : 'Error deleting draft',
        {
          position: 'bottom-right',
          autoClose: 3000
        }
      );
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setShowMenu(false);
    }
  };

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
        {items.map((item: any) => (
          <S.EquipmentTag key={item}>{item}</S.EquipmentTag>
        ))}
      </S.EquipmentList>
    );
  };

  return (
    <>
      {/* Brand Logo Watermark */}
      {workflowData.make && (
        <BrandWatermark $isVisible={!!workflowData.make}>
          <CarBrandLogo make={workflowData.make} size={400} showName={false} />
        </BrandWatermark>
      )}

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
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {/* Dropdown Menu with Delete Draft Option */}
              <DropdownContainer>
                <MenuButton onClick={() => setShowMenu(!showMenu)}>
                  <MoreVertical />
                </MenuButton>
                <DropdownMenu $show={showMenu}>
                  <MenuItem onClick={() => { setShowMenu(false); setShowConfirm(true); }}>
                    <Trash2 />
                    {language === 'bg' ? 'Изтрий чернова' : 'Delete Draft'}
                  </MenuItem>
                </DropdownMenu>
              </DropdownContainer>

              <S.Button onClick={() => goTo('/sell/inserat/:vehicleType/images')} style={{ flex: 1 }}>
                {t('sell.preview.actions.editImages')}
              </S.Button>
            </div>
            <S.PrimaryButton onClick={() => goTo('/sell/inserat/:vehicleType/submission')}>
              {t('sell.preview.actions.continue')}
            </S.PrimaryButton>
          </div>
        </S.Actions>
      </S.Container>

      {/* Confirmation Modal */}
      <ConfirmModal $show={showConfirm} onClick={() => setShowConfirm(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalIcon>
            <AlertTriangle size={32} />
          </ModalIcon>
          <ModalTitle>
            {language === 'bg' ? 'Изтриване на чернова' : 'Delete Draft'}
          </ModalTitle>
          <ModalMessage>
            {language === 'bg'
              ? 'Сигурни ли сте, че искате да изтриете тази чернова? Всички незаписани промени ще бъдат загубени.'
              : 'Are you sure you want to delete this draft? All unsaved changes will be lost.'}
          </ModalMessage>
          <ModalActions>
            <ModalButton
              $variant="cancel"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </ModalButton>
            <ModalButton
              $variant="danger"
              onClick={handleDeleteDraft}
              disabled={isDeleting}
            >
              {isDeleting
                ? (language === 'bg' ? 'Изтриване...' : 'Deleting...')
                : (language === 'bg' ? 'Изтрий' : 'Delete')}
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </ConfirmModal>
    </>
  );
};

export default MobilePreviewPage;
