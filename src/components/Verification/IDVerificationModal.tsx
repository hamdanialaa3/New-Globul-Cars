// src/components/Verification/IDVerificationModal.tsx
// ID Verification Modal - نافذة التحقق من الهوية
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, FileText, Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { VerificationService } from '../../services/verification';
import DocumentUpload from './DocumentUpload';

// ==================== STYLED COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow-y: auto;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  width: ${props => props.$active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => 
    props.$completed ? '#4caf50' : 
    props.$active ? '#FF7900' : '#e0e0e0'};
  transition: all 0.3s ease;
`;

const InfoBox = styled.div<{ $type: 'info' | 'warning' | 'success' | 'error' }>`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  
  ${props => {
    switch (props.$type) {
      case 'info':
        return `background: #e3f2fd; color: #1565c0;`;
      case 'warning':
        return `background: #fff3e0; color: #e65100;`;
      case 'success':
        return `background: #e8f5e9; color: #2e7d32;`;
      case 'error':
        return `background: #ffebee; color: #c62828;`;
    }
  }}
  
  svg {
    flex-shrink: 0;
  }
`;

const DocumentSection = styled.div`
  margin-bottom: 24px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  p {
    margin: 0 0 16px 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'secondary' ? `
    background: #f0f0f0;
    color: #666;
    &:hover { background: #e0e0e0; }
  ` : `
    background: #FF7900;
    color: white;
    &:hover { 
      background: #ff8c1a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const RequirementsList = styled.ul`
  margin: 16px 0;
  padding-left: 20px;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.8;
`;

// ==================== COMPONENT ====================

interface IDVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IDVerificationModal: React.FC<IDVerificationModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'info' | 'upload' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  // Handle submit
  const handleSubmit = async () => {
    if (!currentUser || !frontImage || !backImage) {
      setError(language === 'bg' 
        ? 'Моля, качете предна и задна страна' 
        : 'Please upload front and back'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await VerificationService.id.submitIDVerification(
        currentUser.uid,
        frontImage,
        backImage,
        selfieImage || undefined
      );

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Грешка / Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <FileText size={24} />
            {language === 'bg' ? 'Потвърди самоличност' : 'Verify Identity'}
          </h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <StepIndicator>
          <Step $active={step === 'info'} $completed={step !== 'info'} />
          <Step $active={step === 'upload'} $completed={step === 'success'} />
          <Step $active={step === 'success'} $completed={false} />
        </StepIndicator>

        {step === 'info' && (
          <>
            <InfoBox $type="info">
              <FileText size={20} />
              <div>
                {language === 'bg' ? (
                  <p>
                    Необходимо е да качите снимки на вашата лична карта за потвърждение.
                    Процесът е сигурен и вашите данни са криптирани.
                  </p>
                ) : (
                  <p>
                    You need to upload photos of your ID card for verification.
                    The process is secure and your data is encrypted.
                  </p>
                )}
              </div>
            </InfoBox>

            <DocumentSection>
              <h4>
                {language === 'bg' ? 'Изисквания:' : 'Requirements:'}
              </h4>
              <RequirementsList>
                <li>{language === 'bg' ? 'Валидна българска лична карта' : 'Valid Bulgarian ID card'}</li>
                <li>{language === 'bg' ? 'Ясни снимки (предна и задна страна)' : 'Clear photos (front and back)'}</li>
                <li>{language === 'bg' ? 'Всички данни да се виждат' : 'All data visible'}</li>
                <li>{language === 'bg' ? 'Формат: JPG, PNG (макс 5MB)' : 'Format: JPG, PNG (max 5MB)'}</li>
                <li>{language === 'bg' ? 'Документът трябва да е валиден' : 'Document must be valid'}</li>
              </RequirementsList>
            </DocumentSection>

            <InfoBox $type="warning">
              <AlertCircle size={20} />
              <div>
                {language === 'bg' ? (
                  <p>
                    <strong>Време за проверка:</strong> 1-3 работни дни.
                    Ще получите известие когато акаунтът ви бъде потвърден.
                  </p>
                ) : (
                  <p>
                    <strong>Review time:</strong> 1-3 business days.
                    You'll receive a notification when verified.
                  </p>
                )}
              </div>
            </InfoBox>

            <ActionButton onClick={() => setStep('upload')}>
              <Upload size={20} />
              {language === 'bg' ? 'Започни проверка' : 'Start Verification'}
            </ActionButton>
          </>
        )}

        {step === 'upload' && (
          <>
            <DocumentSection>
              <h4>
                {language === 'bg' ? '1. Предна страна на лична карта' : '1. Front of ID Card'}
              </h4>
              <DocumentUpload
                label={language === 'bg' ? 'Предна страна' : 'Front Side'}
                icon={<FileText size={24} />}
                onFileSelect={setFrontImage}
                accept="image/*"
              />
            </DocumentSection>

            <DocumentSection>
              <h4>
                {language === 'bg' ? '2. Задна страна на лична карта' : '2. Back of ID Card'}
              </h4>
              <DocumentUpload
                label={language === 'bg' ? 'Задна страна' : 'Back Side'}
                icon={<FileText size={24} />}
                onFileSelect={setBackImage}
                accept="image/*"
              />
            </DocumentSection>

            <DocumentSection>
              <h4>
                {language === 'bg' ? '3. Селфи със лична карта (по избор)' : '3. Selfie with ID (optional)'}
              </h4>
              <DocumentUpload
                label={language === 'bg' ? 'Селфи' : 'Selfie'}
                icon={<Camera size={24} />}
                onFileSelect={setSelfieImage}
                accept="image/*"
                optional
              />
            </DocumentSection>

            {error && (
              <InfoBox $type="error">
                <AlertCircle size={20} />
                <div>{error}</div>
              </InfoBox>
            )}

            <ButtonGroup>
              <ActionButton 
                $variant="secondary" 
                onClick={() => setStep('info')}
                disabled={loading}
              >
                {language === 'bg' ? 'Назад' : 'Back'}
              </ActionButton>
              <ActionButton 
                onClick={handleSubmit}
                disabled={loading || !frontImage || !backImage}
              >
                <Upload size={20} />
                {loading 
                  ? (language === 'bg' ? 'Изпращане...' : 'Submitting...') 
                  : (language === 'bg' ? 'Изпрати' : 'Submit')
                }
              </ActionButton>
            </ButtonGroup>
          </>
        )}

        {step === 'success' && (
          <>
            <InfoBox $type="success">
              <CheckCircle size={32} />
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  {language === 'bg' ? 'Изпратено успешно!' : 'Submitted Successfully!'}
                </h4>
                <p style={{ margin: 0 }}>
                  {language === 'bg' 
                    ? 'Документите ви са изпратени за проверка. Ще получите известие до 1-3 работни дни.'
                    : 'Your documents have been submitted for review. You will receive a notification within 1-3 business days.'}
                </p>
              </div>
            </InfoBox>
          </>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default IDVerificationModal;
