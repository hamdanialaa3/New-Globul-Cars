// Wizard Navigation Component
// مكون التنقل بين الخطوات
import React from 'react';
import { ArrowLeft, ArrowRight, X, Loader } from 'lucide-react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onCancel?: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isSubmitting?: boolean;
  isLastStep?: boolean;
}

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: 1.5rem;
    
    & > div {
      width: 100%;
      justify-content: center;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' | 'danger'; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: none;
  
  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: ${props.$disabled ? 'var(--bg-secondary)' : 'var(--accent-primary)'};
        color: white;
        &:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: var(--bg-card);
        color: var(--text-primary);
        border: 2px solid var(--border);
        &:hover:not(:disabled) {
          border-color: var(--accent-primary);
          background: var(--bg-hover);
        }
      `;
    }
    if (props.$variant === 'danger') {
      return `
        background: transparent;
        color: var(--text-secondary);
        &:hover {
          color: var(--error);
        }
      `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  svg.animate-spin {
    animation: spin 1s linear infinite;
  }
`;

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isSubmitting = false,
  isLastStep = false,
}) => {
  const { language } = useLanguage();
  const t = (key: string, fallback: string) => language === 'bg' ? key : fallback;

  return (
    <NavigationContainer>
      <ButtonGroup>
        {onCancel && (
          <Button $variant="danger" onClick={onCancel}>
            <X size={18} />
            {t('Отказ', 'Cancel')}
          </Button>
        )}
      </ButtonGroup>

      <ButtonGroup>
        {canGoBack && (
          <Button $variant="secondary" onClick={onBack} $disabled={isSubmitting}>
            <ArrowLeft size={18} />
            {t('Назад', 'Back')}
          </Button>
        )}
        
        <Button
          $variant="primary"
          onClick={onNext}
          $disabled={!canGoNext || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size={18} className="animate-spin" />
              {t('Публикуване...', 'Publishing...')}
            </>
          ) : (
            <>
              {isLastStep ? (
                t('Публикувай', 'Publish')
              ) : (
                t('Продължи', 'Continue')
              )}
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </ButtonGroup>
    </NavigationContainer>
  );
};

