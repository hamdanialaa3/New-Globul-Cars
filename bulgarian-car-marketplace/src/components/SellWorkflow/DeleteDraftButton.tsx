// Delete Draft Button Component
// مكون زر حذف المسودة - يظهر في جميع صفحات workflow

import React, { useState } from 'react';
import styled from 'styled-components';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUnifiedWorkflow } from '../../hooks/useUnifiedWorkflow';
import { useAuth } from '../../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DraftsService from '../../services/drafts-service';
import { logger } from '../../services/logger-service';

const DeleteButton = styled.button<{ $isMobile?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => props.$isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem'};
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: ${props => props.$isMobile ? '12px' : '10px'};
  font-size: ${props => props.$isMobile ? '0.9rem' : '0.95rem'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: ${props => props.$isMobile ? '18px' : '20px'};
    height: ${props => props.$isMobile ? '18px' : '20px'};
  }
`;

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

const ModalContent = styled.div<{ $isMobile?: boolean }>`
  background: var(--bg-card);
  border-radius: ${props => props.$isMobile ? '16px' : '20px'};
  padding: ${props => props.$isMobile ? '1.5rem' : '2rem'};
  max-width: ${props => props.$isMobile ? '90%' : '400px'};
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

interface DeleteDraftButtonProps {
  currentStep?: number;
  isMobile?: boolean;
  onDeleted?: () => void;
}

export const DeleteDraftButton: React.FC<DeleteDraftButtonProps> = ({
  currentStep,
  isMobile = false,
  onDeleted
}) => {
  const { language, t } = useLanguage();
  const { clearWorkflow, workflowData } = useUnifiedWorkflow(currentStep || 1);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
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
          // Non-critical - continue with local cleanup
          logger.warn('Failed to delete Firestore draft (non-critical)', { error, draftId });
        }
      }

      // ✅ CRITICAL: clearWorkflow now clears images from IndexedDB automatically
      // Clear local workflow data (including images from IndexedDB)
      await clearWorkflow();
      
      // Clear any other related localStorage items
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

      // Navigate to start page
      setTimeout(() => {
        navigate('/sell/auto');
      }, 500);

      // Callback if provided
      if (onDeleted) {
        onDeleted();
      }
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
    }
  };

  return (
    <>
      <DeleteButton
        $isMobile={isMobile}
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        type="button"
        aria-label={language === 'bg' ? 'Изтрий чернова' : 'Delete draft'}
      >
        <Trash2 />
        {language === 'bg' ? 'Изтрий чернова' : 'Delete Draft'}
      </DeleteButton>

      <ConfirmModal $show={showConfirm} onClick={() => setShowConfirm(false)}>
        <ModalContent 
          $isMobile={isMobile}
          onClick={(e) => e.stopPropagation()}
        >
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
              onClick={handleDelete}
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

export default DeleteDraftButton;

